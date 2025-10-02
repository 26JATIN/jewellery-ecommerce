import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import paymentConfig from '@/lib/payment-config';
import { orderAutomationService } from '@/lib/orderAutomationService';

export async function POST(req) {
    try {
        const { 
            orderId, 
            razorpay_payment_id, 
            razorpay_order_id, 
            razorpay_signature 
        } = await req.json();

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", paymentConfig.razorpay.keySecret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Update order status
        await connectDB();
        const order = await Order.findByIdAndUpdate(
            orderId,
            { 
                status: 'processing',
                'payment.id': razorpay_payment_id,
                'payment.orderId': razorpay_order_id,
                'payment.signature': razorpay_signature,
                'payment.status': 'completed',
                'payment.paidAt': new Date()
            },
            { new: true }
        );

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Trigger automatic shipping process
        try {
            await orderAutomationService.processNewOrder(orderId);
            console.log(`Automatic shipping initiated for order: ${orderId}`);
        } catch (automationError) {
            console.error(`Automation failed for order ${orderId}:`, automationError);
            // Don't fail the payment verification if automation fails
        }

        return NextResponse.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: error.message || 'Payment verification failed' },
            { status: 500 }
        );
    }
}