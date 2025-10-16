import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch specific return details
export async function GET(req, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
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

        const returnRequest = await Return.findOne({
            _id: returnId,
            user: decoded.userId
        })
        .populate('order', 'totalAmount createdAt items shippingAddress')
        .populate('user', 'name email')
        .populate('items.product', 'name images');

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

// PUT: Update return request (customer can only cancel)
export async function PUT(req, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const { returnId } = await params;
        const { action, message } = await req.json();

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const returnRequest = await Return.findOne({
            _id: returnId,
            user: decoded.userId
        });

        if (!returnRequest) {
            return NextResponse.json(
                { error: 'Return request not found' },
                { status: 404 }
            );
        }

        // Customer can only cancel returns that are not yet processed
        if (action === 'cancel') {
            if (!['requested', 'pending_approval', 'approved'].includes(returnRequest.status)) {
                return NextResponse.json(
                    { error: 'Cannot cancel return at this stage' },
                    { status: 400 }
                );
            }

            await returnRequest.updateStatus('cancelled', decoded.userId, 'Cancelled by customer');
            
            // Add customer message
            returnRequest.customerMessages.push({
                message: message || 'Return cancelled by customer',
                timestamp: new Date(),
                isFromCustomer: true
            });

            await returnRequest.save();

            return NextResponse.json({
                success: true,
                message: 'Return request cancelled successfully',
                data: returnRequest
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error updating return request:', error);
        return NextResponse.json(
            { error: 'Failed to update return request' },
            { status: 500 }
        );
    }
}