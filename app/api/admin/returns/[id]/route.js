import connectDB from '@/lib/mongodb';
import ReturnModel from '@/models/Return';
import Order from '@/models/Order';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const returnDoc = await ReturnModel.findById(params.id).populate('orderId').populate('userId');
        if (!returnDoc) return NextResponse.json({ error: 'Return not found' }, { status: 404 });

        return NextResponse.json({ success: true, return: returnDoc });
    } catch (error) {
        console.error('Get return error:', error);
        return NextResponse.json({ error: 'Failed to get return', details: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { action } = body;

        await connectDB();
        const returnDoc = await ReturnModel.findById(params.id);
        if (!returnDoc) return NextResponse.json({ error: 'Return not found' }, { status: 404 });

        if (action === 'markRefundComplete') {
            // Mark refund as processed
            returnDoc.refundSucceeded = true;
            returnDoc.refundProcessedAt = new Date();
            returnDoc.status = 'completed';
            await returnDoc.save();

            // Update related order payment status
            try {
                const order = await Order.findById(returnDoc.orderId);
                if (order) {
                    order.paymentStatus = 'refunded';
                    order.status = 'returned';
                    await order.save();
                }
            } catch (orderError) {
                console.error('Failed to update order for refund:', orderError);
            }

            return NextResponse.json({ success: true, message: 'Refund marked complete', returnId: returnDoc._id });
        }

        // Other admin actions (e.g., update status)
        if (body.status) {
            returnDoc.status = body.status;
            await returnDoc.save();
            return NextResponse.json({ success: true, message: 'Return status updated', returnId: returnDoc._id });
        }

        return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
    } catch (error) {
        console.error('Update return error:', error);
        return NextResponse.json({ error: 'Failed to update return', details: error.message }, { status: 500 });
    }
}
