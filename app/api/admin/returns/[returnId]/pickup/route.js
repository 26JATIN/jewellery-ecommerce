import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { reversePickupService } from '@/lib/reversePickupService';

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

// POST: Schedule pickup for return
export async function POST(req, { params }) {
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

        const returnRequest = await Return.findById(returnId);

        if (!returnRequest) {
            return NextResponse.json(
                { error: 'Return request not found' },
                { status: 404 }
            );
        }

        // Check if return is in approved status
        if (returnRequest.status !== 'approved') {
            return NextResponse.json(
                { error: 'Pickup can only be scheduled for approved returns' },
                { status: 400 }
            );
        }

        // Check if state machine allows this transition
        if (!returnRequest.canTransitionTo('pickup_scheduled')) {
            return NextResponse.json(
                { 
                    error: `Cannot schedule pickup from status "${returnRequest.status}". Valid transitions: ${returnRequest.getValidNextStatuses().join(', ')}` 
                },
                { status: 400 }
            );
        }

        try {
            // Try to create reverse pickup with Shiprocket
            const pickupResult = await reversePickupService.automateReversePickup(returnId);
            
            // Update return status to pickup_scheduled
            await returnRequest.updateStatus(
                'pickup_scheduled', 
                authResult.userId, 
                `Pickup scheduled with Shiprocket. AWB: ${pickupResult.awbCode || 'Pending'}`
            );

            return NextResponse.json({
                success: true,
                message: 'Pickup scheduled successfully via Shiprocket',
                data: {
                    returnId: returnRequest._id,
                    returnNumber: returnRequest.returnNumber,
                    status: returnRequest.status,
                    pickup: pickupResult
                }
            });

        } catch (shiprocketError) {
            console.error('Shiprocket pickup scheduling failed:', shiprocketError);
            
            // Fallback: Schedule pickup manually without Shiprocket
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 2); // Schedule 2 days from now
            
            returnRequest.pickup.scheduledDate = scheduledDate;
            returnRequest.pickup.scheduledTimeSlot = '10:00 AM - 6:00 PM';
            returnRequest.pickup.pickupStatus = 'scheduled';
            
            await returnRequest.updateStatus(
                'pickup_scheduled', 
                authResult.userId, 
                'Pickup scheduled manually (Shiprocket unavailable)'
            );

            return NextResponse.json({
                success: true,
                message: 'Pickup scheduled manually (Shiprocket integration unavailable)',
                warning: 'Please coordinate pickup manually with courier',
                data: {
                    returnId: returnRequest._id,
                    returnNumber: returnRequest.returnNumber,
                    status: returnRequest.status,
                    pickup: {
                        scheduledDate: returnRequest.pickup.scheduledDate,
                        timeSlot: returnRequest.pickup.scheduledTimeSlot
                    }
                }
            });
        }

    } catch (error) {
        console.error('Schedule pickup error:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to schedule pickup',
                details: error.stack 
            },
            { status: 500 }
        );
    }
}
