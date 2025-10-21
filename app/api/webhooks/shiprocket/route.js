import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Handle GET requests for webhook verification
export async function GET(req) {
    return NextResponse.json({
        status: 'active',
        endpoint: 'shiprocket-forward-webhook',
        message: 'Webhook endpoint is ready to receive POST requests'
    }, { status: 200 });
}

// Verify webhook signature for security
function verifyWebhookSignature(payload, signature, secret) {
    if (!secret) {
        console.warn('⚠️  SHIPROCKET_WEBHOOK_SECRET not configured - skipping verification');
        return true; // Allow in development
    }
    
    if (!signature) {
        return false;
    }
    
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Shiprocket webhook handler for automatic tracking updates
export async function POST(req) {
    try {
        const webhookData = await req.json();
        console.log('Shiprocket webhook received:', JSON.stringify(webhookData, null, 2));

        // Verify webhook authenticity
        const signature = req.headers.get('x-shiprocket-signature');
        const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
        
        if (!verifyWebhookSignature(webhookData, signature, webhookSecret)) {
            console.error('❌ Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }
        
        console.log('✅ Webhook signature verified');
        
        // Extract relevant data from webhook (Shiprocket format)
        const {
            awb,
            current_status,
            current_status_id,      // This is what Shiprocket sends
            shipment_status,
            shipment_status_id,     // This is what Shiprocket sends
            sr_order_id,            // Shiprocket's internal order ID
            order_id,               // Your order reference
            courier_name,
            pickup_scheduled_date,
            awb_assigned_date,
            delivered_date,
            rto_delivered_date,
            current_timestamp,
            scans,                  // Array of tracking scans
            etd,                    // Expected delivery date
            pod_status,             // Proof of delivery status
            pod                     // Proof of delivery
        } = webhookData;
        
        // Use current_status_id as the status code (Shiprocket's format)
        const current_status_code = current_status_id || shipment_status_id;

        if (!awb && !sr_order_id) {
            return NextResponse.json(
                { error: 'AWB or Order ID required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find order by AWB code or Shiprocket order ID
        let order;
        if (awb) {
            order = await Order.findOne({ 'shipping.awbCode': awb });
        }
        
        // Fallback: Try to find by Shiprocket order ID
        if (!order && sr_order_id) {
            order = await Order.findOne({ 'shipping.shipmentId': sr_order_id.toString() });
        }

        if (!order) {
            console.log(`Order not found for AWB: ${awb}, SR Order ID: ${sr_order_id}`);
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        // Status mapping for order updates (based on Shiprocket status IDs)
        const statusMapping = {
            5: { shipping: 'processing', order: 'processing' },  // Manifest Generated
            42: { shipping: 'shipped', order: 'shipped' },       // Picked Up
            6: { shipping: 'shipped', order: 'shipped' },        // Shipped
            18: { shipping: 'shipped', order: 'shipped' },       // In Transit
            17: { shipping: 'shipped', order: 'shipped' },       // Out for Delivery
            7: { shipping: 'delivered', order: 'delivered' },    // Delivered
            8: { shipping: 'cancelled', order: 'cancelled' },    // Cancelled
            9: { shipping: 'cancelled', order: 'cancelled' },    // RTO Initiated
            10: { shipping: 'cancelled', order: 'cancelled' },   // RTO Delivered
            11: { shipping: 'cancelled', order: 'cancelled' },   // Lost
            12: { shipping: 'cancelled', order: 'cancelled' },   // Damaged
        };

        // Get latest location from scans array
        const latestScan = scans && scans.length > 0 ? scans[scans.length - 1] : null;
        const location = latestScan?.location || current_status;

        // Prepare update data
        const updateData = {
            'shipping.currentLocation': location,
            'shipping.lastUpdateAt': new Date(current_timestamp ? 
                current_timestamp.split(' ').reverse().join('-').replace(/\s/g, 'T') : 
                Date.now())
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
        if (delivered_date && current_status_code === 7) {
            updateData['shipping.deliveredAt'] = new Date(delivered_date);
        }

        // Add pickup date if picked up
        if (pickup_scheduled_date && [5, 42].includes(current_status_code)) {
            updateData['shipping.pickedUpAt'] = new Date(pickup_scheduled_date);
        }

        if (awb_assigned_date && !order.shipping.awbCode) {
            updateData['shipping.awbAssignedAt'] = new Date(awb_assigned_date);
        }

        if (etd) {
            updateData['shipping.estimatedDelivery'] = new Date(etd);
        }

        // Add proof of delivery if available
        if (pod && pod !== 'Not Available') {
            updateData['shipping.podUrl'] = pod;
        }

        // Add tracking history from scans array
        if (scans && scans.length > 0) {
            const newScans = scans.map(scan => ({
                activity: scan.activity || scan.status,
                location: scan.location,
                timestamp: new Date(scan.date.split(' ').reverse().join('-').replace(/\s/g, 'T')),
                statusCode: scan['sr-status'] || scan.status,
                statusLabel: scan['sr-status-label']
            }));

            // Only add new scans that don't exist
            const existingTimestamps = new Set(
                order.shipping.trackingHistory?.map(t => t.timestamp.getTime()) || []
            );

            const uniqueNewScans = newScans.filter(scan => 
                !existingTimestamps.has(scan.timestamp.getTime())
            );

            if (uniqueNewScans.length > 0) {
                updateData['$push'] = {
                    'shipping.trackingHistory': { $each: uniqueNewScans }
                };
            }
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