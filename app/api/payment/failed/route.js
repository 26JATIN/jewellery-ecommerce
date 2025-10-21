import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { inventoryService } from '@/lib/inventoryService';

/**
 * Handle payment failures and restore inventory
 * POST /api/payment/failed
 */
export async function POST(req) {
    try {
        const { orderId, error, razorpay_payment_id } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        await connectDB();
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order is already processed or failed
        if (order.payment?.status === 'completed') {
            return NextResponse.json(
                { message: 'Payment already completed for this order' },
                { status: 200 }
            );
        }

        if (order.payment?.status === 'failed') {
            return NextResponse.json(
                { message: 'Payment failure already recorded' },
                { status: 200 }
            );
        }

        console.log(`💳 Payment failed for order ${order.orderNumber || orderId}`);
        console.log(`   Razorpay Payment ID: ${razorpay_payment_id || 'N/A'}`);
        console.log(`   Error: ${error || 'Unknown error'}`);

        // Update order status to failed
        order.status = 'payment_failed';
        order.payment = {
            ...order.payment,
            status: 'failed',
            failedAt: new Date(),
            failureReason: error || 'Payment failed',
            razorpayPaymentId: razorpay_payment_id
        };
        
        await order.save();

        // Restore inventory - payment failed, release reserved items
        let inventoryRestored = false;
        try {
            console.log(`📦 Restoring inventory for failed payment...`);
            const inventoryResult = await inventoryService.restoreInventory(
                order._id, 
                'payment_failed'
            );
            
            inventoryRestored = true;
            console.log(`✅ Inventory restored: ${inventoryResult.totalItemsRestored} items returned to stock`);
            
            // Add success note to order
            order.notes = order.notes || [];
            order.notes.push({
                note: `Inventory automatically restored - ${inventoryResult.totalItemsRestored} items returned to stock after payment failure`,
                addedAt: new Date(),
                addedBy: 'system'
            });
            await order.save();

        } catch (inventoryError) {
            console.error('⚠️  Failed to restore inventory after payment failure:', inventoryError);
            
            // Log error but don't fail the request
            order.notes = order.notes || [];
            order.notes.push({
                note: `Warning: Automatic inventory restoration failed - ${inventoryError.message}. Manual stock adjustment required.`,
                addedAt: new Date(),
                addedBy: 'system'
            });
            await order.save();
        }

        console.log(`✅ Payment failure recorded for order ${order.orderNumber || orderId}`);

        return NextResponse.json({
            message: 'Payment failure recorded',
            orderId: order._id,
            orderNumber: order.orderNumber,
            inventoryRestored,
            status: 'payment_failed'
        }, { status: 200 });

    } catch (error) {
        console.error('Error handling payment failure:', error);
        return NextResponse.json(
            { error: 'Failed to process payment failure', details: error.message },
            { status: 500 }
        );
    }
}
