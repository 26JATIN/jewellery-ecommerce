import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Shiprocket webhook handler for automatic tracking updates
export async function POST(req) {
    try {
        const webhookData = await req.json();
        console.log('Shiprocket webhook received:', JSON.stringify(webhookData, null, 2));

        // Verify webhook authenticity (optional - add webhook secret verification)
        const signature = req.headers.get('x-shiprocket-signature');
        
        // Extract relevant data from webhook
        const {
            awb,
            current_status,
            current_status_code,
            shipment_id,
            order_id,
            courier_name,
            pickup_scheduled_date,
            delivered_date,
            rto_delivered_date,
            current_timestamp,
            location,
            consignee_name,
            origin,
            destination,
            pickup_token_number,
            pod_available,
            tracking_data
        } = webhookData;

        if (!awb && !shipment_id) {
            return NextResponse.json(
                { error: 'AWB or Shipment ID required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find order by AWB code or shipment ID
        let order;
        if (awb) {
            order = await Order.findOne({ 'shipping.awbCode': awb });
        } else if (shipment_id) {
            order = await Order.findOne({ 'shipping.shipmentId': shipment_id });
        }

        if (!order) {
            console.log(`Order not found for AWB: ${awb}, Shipment ID: ${shipment_id}`);
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        // Status mapping for order updates
        const statusMapping = {
            1: { shipping: 'processing', order: 'processing' }, // Order Confirmed
            2: { shipping: 'processing', order: 'processing' }, // Pickup Scheduled
            3: { shipping: 'shipped', order: 'shipped' },       // Picked Up
            4: { shipping: 'shipped', order: 'shipped' },       // In Transit
            5: { shipping: 'shipped', order: 'shipped' },       // Out for Delivery
            6: { shipping: 'delivered', order: 'delivered' },   // Delivered
            7: { shipping: 'cancelled', order: 'cancelled' },   // RTO Initiated
            8: { shipping: 'cancelled', order: 'cancelled' },   // RTO Delivered
            9: { shipping: 'cancelled', order: 'cancelled' },   // Lost
            10: { shipping: 'cancelled', order: 'cancelled' },  // Damaged
            11: { shipping: 'cancelled', order: 'cancelled' },  // Cancelled
            38: { shipping: 'shipped', order: 'shipped' },      // Reached Destination Hub
            13: { shipping: 'shipped', order: 'shipped' },      // Pickup Rescheduled
            25: { shipping: 'shipped', order: 'shipped' },      // Reached Origin Hub
        };

        // Prepare update data
        const updateData = {
            'shipping.currentLocation': current_status || location,
            'shipping.lastUpdateAt': new Date(current_timestamp || Date.now())
        };

        // Update status based on status code
        if (current_status_code && statusMapping[current_status_code]) {
            updateData['shipping.status'] = statusMapping[current_status_code].shipping;
            updateData['status'] = statusMapping[current_status_code].order;
        }

        // Add courier name if provided
        if (courier_name) {
            updateData['shipping.courier'] = courier_name;
        }

        // Add delivery date if delivered
        if (delivered_date && current_status_code === 6) {
            updateData['shipping.deliveredAt'] = new Date(delivered_date);
        }

        // Add pickup date if picked up
        if (pickup_scheduled_date && [2, 3].includes(current_status_code)) {
            updateData['shipping.pickedUpAt'] = new Date(pickup_scheduled_date);
        }

        // Add tracking history entry
        const trackingEntry = {
            activity: current_status,
            location: location || origin || destination,
            timestamp: new Date(current_timestamp || Date.now()),
            statusCode: current_status_code?.toString()
        };

        // Add to tracking history if not already present
        const existingEntry = order.shipping.trackingHistory?.find(
            entry => entry.timestamp.getTime() === trackingEntry.timestamp.getTime() &&
                    entry.statusCode === trackingEntry.statusCode
        );

        if (!existingEntry) {
            updateData['$push'] = {
                'shipping.trackingHistory': trackingEntry
            };
        }

        // Update the order
        await Order.findByIdAndUpdate(order._id, updateData);

        console.log(`Order ${order._id} updated with tracking status: ${current_status}`);

        // Send notification to user (implement as needed)
        // await sendTrackingNotification(order, current_status);

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Verify webhook is from Shiprocket (optional security measure)
function verifyWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
    
    return signature === expectedSignature;
}