import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import config from '@/lib/config';
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
            .createHmac("sha256", config.razorpay.keySecret)
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
        
        // Get the order first to check for coupon
        const existingOrder = await Order.findById(orderId);
        
        if (!existingOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Update order with payment details
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

        // If coupon was used, increment usage and add to history
        if (order.coupon && order.coupon.code) {
            try {
                const coupon = await Coupon.findOne({ code: order.coupon.code.toUpperCase() });
                
                if (coupon) {
                    // Increment usage count and add to history
                    await Coupon.findByIdAndUpdate(
                        coupon._id,
                        {
                            $inc: { usedCount: 1 },
                            $push: {
                                usageHistory: {
                                    userId: order.user,
                                    orderId: order._id,
                                    usedAt: new Date(),
                                    discountApplied: order.coupon.discountAmount
                                }
                            }
                        }
                    );
                    console.log(`✅ Coupon ${order.coupon.code} usage incremented for order ${orderId}`);
                } else {
                    console.warn(`⚠️  Coupon ${order.coupon.code} not found for order ${orderId}`);
                }
            } catch (couponError) {
                console.error('Error updating coupon usage:', couponError);
                // Don't fail the payment if coupon update fails
            }
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