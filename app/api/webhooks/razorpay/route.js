import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        // Verify webhook signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        if (webhookSecret && webhookSecret !== 'your-razorpay-webhook-secret-here') {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const event = JSON.parse(body);
        
        await connectDB();

        // Handle different webhook events
        switch (event.event) {
            case 'payment.authorized':
            case 'payment.captured':
                await handlePaymentSuccess(event.payload.payment.entity);
                break;
                
            case 'payment.failed':
                await handlePaymentFailed(event.payload.payment.entity);
                break;
                
            case 'refund.created':
            case 'refund.processed':
                await handleRefund(event.payload.refund.entity);
                break;
                
            default:
                console.log('Unhandled webhook event:', event.event);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handlePaymentSuccess(payment) {
    try {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        
        if (order) {
            order.paymentStatus = 'paid';
            order.razorpayPaymentId = payment.id;
            order.paidAt = new Date(payment.created_at * 1000);
            
            // If order was pending, confirm it
            if (order.status === 'pending') {
                order.status = 'confirmed';
            }
            
            await order.save();
            console.log(`Payment successful for order ${order.orderNumber}`);
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

async function handlePaymentFailed(payment) {
    try {
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        
        if (order) {
            order.paymentStatus = 'failed';
            order.razorpayPaymentId = payment.id;
            await order.save();
            console.log(`Payment failed for order ${order.orderNumber}`);
        }
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

async function handleRefund(refund) {
    try {
        const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
        
        if (order) {
            order.paymentStatus = 'refunded';
            await order.save();
            console.log(`Refund processed for order ${order.orderNumber}`);
        }
    } catch (error) {
        console.error('Error handling refund:', error);
    }
}

// Disable body parsing to get raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};
