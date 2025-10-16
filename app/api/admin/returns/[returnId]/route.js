import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Middleware to check admin authentication
async function checkAdminAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return { error: 'Unauthorized', status: 401 };
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return { error: 'Invalid token', status: 401 };
        }

        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return { error: 'Admin access required', status: 403 };
        }

        return { userId: decoded.userId };
    } catch (error) {
        console.error('Admin auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// GET: Fetch specific return details for admin
export async function GET(req, { params }) {
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { returnId } = await params;

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const returnRequest = await Return.findById(returnId)
            .populate('order', 'totalAmount createdAt items shippingAddress payment')
            .populate('user', 'name email phone')
            .populate('items.product', 'name images category')
            .populate('statusHistory.updatedBy', 'name email')
            .populate('adminNotes.addedBy', 'name email');

        if (!returnRequest) {
            return NextResponse.json(
                { error: 'Return request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: returnRequest
        });

    } catch (error) {
        console.error('Error fetching return details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch return details' },
            { status: 500 }
        );
    }
}

// PUT: Update return status (admin only)
export async function PUT(req, { params }) {
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { returnId } = await params;
        const { 
            action, 
            status, 
            note, 
            inspectionData,
            refundDetails,
            pickupSchedule 
        } = await req.json();

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const returnRequest = await Return.findById(returnId);

        if (!returnRequest) {
            return NextResponse.json(
                { error: 'Return request not found' },
                { status: 404 }
            );
        }

        let updateData = {};
        let responseMessage = '';

        switch (action) {
            case 'approve':
                if (returnRequest.status !== 'requested') {
                    return NextResponse.json(
                        { error: 'Return can only be approved from requested status' },
                        { status: 400 }
                    );
                }
                await returnRequest.updateStatus('approved', authResult.userId, note);
                responseMessage = 'Return request approved';
                break;

            case 'reject':
                if (!['requested', 'pending_approval'].includes(returnRequest.status)) {
                    return NextResponse.json(
                        { error: 'Return can only be rejected from requested or pending approval status' },
                        { status: 400 }
                    );
                }
                await returnRequest.updateStatus('rejected', authResult.userId, note);
                responseMessage = 'Return request rejected';
                break;

            case 'schedule_pickup':
                if (returnRequest.status !== 'approved') {
                    return NextResponse.json(
                        { error: 'Pickup can only be scheduled for approved returns' },
                        { status: 400 }
                    );
                }

                if (pickupSchedule) {
                    returnRequest.pickup.scheduledDate = new Date(pickupSchedule.date);
                    returnRequest.pickup.scheduledTimeSlot = pickupSchedule.timeSlot;
                    returnRequest.pickup.pickupStatus = 'scheduled';
                }

                await returnRequest.updateStatus('pickup_scheduled', authResult.userId, note);
                responseMessage = 'Pickup scheduled successfully';
                break;

            case 'mark_picked':
                if (returnRequest.status !== 'pickup_scheduled') {
                    return NextResponse.json(
                        { error: 'Can only mark as picked from pickup scheduled status' },
                        { status: 400 }
                    );
                }

                returnRequest.pickup.actualPickupDate = new Date();
                returnRequest.pickup.pickupStatus = 'completed';
                await returnRequest.updateStatus('picked_up', authResult.userId, note);
                responseMessage = 'Return marked as picked up';
                break;

            case 'mark_received':
                if (returnRequest.status !== 'in_transit') {
                    return NextResponse.json(
                        { error: 'Can only mark as received from in transit status' },
                        { status: 400 }
                    );
                }

                await returnRequest.updateStatus('received', authResult.userId, note);
                responseMessage = 'Return marked as received';
                break;

            case 'inspect':
                if (returnRequest.status !== 'received') {
                    return NextResponse.json(
                        { error: 'Can only inspect items from received status' },
                        { status: 400 }
                    );
                }

                if (inspectionData) {
                    returnRequest.inspection = {
                        inspectedBy: authResult.userId,
                        inspectedAt: new Date(),
                        condition: inspectionData.condition,
                        notes: inspectionData.notes,
                        photos: inspectionData.photos || [],
                        approved: inspectionData.approved,
                        rejectionReason: inspectionData.rejectionReason
                    };
                }

                const nextStatus = inspectionData?.approved ? 'approved_refund' : 'rejected_refund';
                await returnRequest.updateStatus(nextStatus, authResult.userId, note);
                responseMessage = `Inspection completed - ${inspectionData?.approved ? 'approved' : 'rejected'}`;
                break;

            case 'process_refund':
                if (returnRequest.status !== 'approved_refund') {
                    return NextResponse.json(
                        { error: 'Can only process refund from approved refund status' },
                        { status: 400 }
                    );
                }

                if (refundDetails) {
                    returnRequest.refundDetails.refundProcessedAt = new Date();
                    returnRequest.refundDetails.refundTransactionId = refundDetails.transactionId;
                    returnRequest.refundDetails.refundAmount = refundDetails.amount;
                }

                await returnRequest.updateStatus('refund_processed', authResult.userId, note);
                responseMessage = 'Refund processed successfully';
                break;

            case 'complete':
                if (!['refund_processed', 'rejected_refund'].includes(returnRequest.status)) {
                    return NextResponse.json(
                        { error: 'Invalid status for completion' },
                        { status: 400 }
                    );
                }

                returnRequest.completedAt = new Date();
                returnRequest.completionNotes = note;
                await returnRequest.updateStatus('completed', authResult.userId, note);
                responseMessage = 'Return completed';
                break;

            case 'update_status':
                if (status) {
                    await returnRequest.updateStatus(status, authResult.userId, note);
                    responseMessage = `Status updated to ${status}`;
                }
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        // Add admin note if provided
        if (note && action !== 'update_status') {
            returnRequest.adminNotes.push({
                note,
                addedBy: authResult.userId,
                addedAt: new Date()
            });
        }

        await returnRequest.save();

        // Re-fetch with populated data for response
        const updatedReturn = await Return.findById(returnId)
            .populate('order', 'totalAmount createdAt')
            .populate('user', 'name email')
            .populate('items.product', 'name images');

        return NextResponse.json({
            success: true,
            message: responseMessage,
            data: updatedReturn
        });

    } catch (error) {
        console.error('Error updating return:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update return' },
            { status: 500 }
        );
    }
}