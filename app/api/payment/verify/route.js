import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        await connectDB();

        // Update order with payment details
        const order = await Order.findOne({ orderNumber, userId: user.userId });
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        order.paymentStatus = 'paid';
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paidAt = new Date();
        
        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            order: {
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
