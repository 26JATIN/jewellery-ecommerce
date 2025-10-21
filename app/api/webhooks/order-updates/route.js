import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Route segment config - make webhook publicly accessible
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// CORS headers for webhook accessibility
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, anx-api-key, Authorization',
    'Content-Type': 'application/json',
};

/**
 * SHIPMENT TRACKING WEBHOOK
 * 
 * ⚠️ IMPORTANT: Shiprocket Webhook Requirements
 * - URL must NOT contain: "shiprocket", "kartrocket", "sr", "kr", "return", "tracking"
 * - Content-Type header: application/json
 * - Security token header: anx-api-key
 * - Must always return HTTP 200 (even for errors)
 * 
 * Webhook URL: https://www.nandikajewellers.in/api/webhooks/order-updates
 * 
 * This webhook receives automatic tracking updates from Shiprocket for order shipments.
 */

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

/**
 * OPTIONS endpoint for CORS preflight
 */
export async function OPTIONS(req) {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders
    });
}

// Shiprocket webhook handler for automatic tracking updates
export async function POST(req) {
    try {
        // Log incoming request details for debugging
        console.log('📦 Tracking Webhook - Request URL:', req.url);
        console.log('📦 Tracking Webhook - Method:', req.method);
        console.log('📦 Tracking Webhook - Headers:', Object.fromEntries(req.headers.entries()));
        
        const webhookData = await req.json();
        console.log('📦 Tracking webhook received:', JSON.stringify(webhookData, null, 2));

        // Verify webhook authenticity using anx-api-key
        const apiKey = req.headers.get('anx-api-key');
        const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
        
        if (!verifyWebhookSignature(webhookData, apiKey, webhookSecret)) {
            console.error('❌ Invalid webhook API key');
            // Still return 200 as per Shiprocket requirement
            return NextResponse.json(
                { success: false, message: 'Invalid API key' },
                { status: 200, headers: corsHeaders }
            );
        }
        
        console.log('✅ Webhook API key verified');
        
        // Extract relevant data from webhook (matching Shiprocket's actual format)
        const {
            awb,
            courier_name,
            current_status,
            current_status_id,
            shipment_status,
            shipment_status_id,
            current_timestamp,
            order_id,
            sr_order_id,
            awb_assigned_date,
            pickup_scheduled_date,
            etd,
            scans = [],
            is_return,
            channel_id,
            pod_status,
            pod
        } = webhookData;

        // Use shipment_status_id as the primary status indicator
        const statusCode = shipment_status_id || current_status_id;
        const statusLabel = shipment_status || current_status;

        if (!awb && !sr_order_id) {
            // Return 200 as per Shiprocket requirement
            return NextResponse.json(
                { success: false, message: 'AWB or SR Order ID required' },
                { status: 200, headers: corsHeaders }
            );
        }

        await connectDB();

        // Find order by AWB code or Shiprocket order ID
        let order;
        if (awb) {
            order = await Order.findOne({ 'shipping.awbCode': awb });
        }
        if (!order && sr_order_id) {
            order = await Order.findOne({ 'shipping.shiprocketOrderId': sr_order_id });
        }
        if (!order && order_id) {
            // Try to extract our order ID from the order_id field (format: "orderId_srOrderId")
            const ourOrderId = order_id.split('_')[0];
            order = await Order.findOne({ orderNumber: ourOrderId });
        }

        if (!order) {
            console.log(`Order not found for AWB: ${awb}, Shipment ID: ${shipment_id}`);
            // Return 200 as per Shiprocket requirement
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 200, headers: corsHeaders }
            );
        }

        // Status mapping for order updates (Shiprocket's actual status IDs)
        const statusMapping = {
            1: { shipping: 'processing', order: 'processing' },     // New
            2: { shipping: 'processing', order: 'processing' },     // Pickup Scheduled
            3: { shipping: 'processing', order: 'processing' },     // AWB Assigned
            4: { shipping: 'processing', order: 'processing' },     // Pickup Generated
            5: { shipping: 'processing', order: 'processing' },     // Manifest Generated
            6: { shipping: 'shipped', order: 'shipped' },           // Shipped
            7: { shipping: 'delivered', order: 'delivered' },       // Delivered
            8: { shipping: 'cancelled', order: 'cancelled' },       // Cancelled
            9: { shipping: 'cancelled', order: 'cancelled' },       // RTO Initiated
            10: { shipping: 'cancelled', order: 'cancelled' },      // RTO Delivered
            11: { shipping: 'cancelled', order: 'cancelled' },      // Lost
            12: { shipping: 'cancelled', order: 'cancelled' },      // Damaged
            13: { shipping: 'shipped', order: 'shipped' },          // Out For Pickup
            14: { shipping: 'shipped', order: 'shipped' },          // Pickup Exception
            15: { shipping: 'shipped', order: 'shipped' },          // Undelivered
            16: { shipping: 'pending', order: 'pending' },          // Pending
            17: { shipping: 'shipped', order: 'shipped' },          // Connected
            18: { shipping: 'shipped', order: 'shipped' },          // In Transit
            19: { shipping: 'shipped', order: 'shipped' },          // Out For Delivery
            20: { shipping: 'shipped', order: 'shipped' },          // Delivery Scheduled
            21: { shipping: 'cancelled', order: 'cancelled' },      // Unsuccessfully Delivered
            38: { shipping: 'shipped', order: 'shipped' },          // Reached Destination Hub
            42: { shipping: 'shipped', order: 'shipped' },          // Picked Up
            43: { shipping: 'cancelled', order: 'cancelled' },      // Shipment Delayed
            44: { shipping: 'cancelled', order: 'cancelled' },      // Contact Customer Care
            45: { shipping: 'cancelled', order: 'cancelled' },      // RTO-OFD
            46: { shipping: 'cancelled', order: 'cancelled' },      // RTO In Transit
        };

        // Parse Shiprocket's date format: "DD MM YYYY HH:mm:ss"
        const parseShiprocketDate = (dateStr) => {
            if (!dateStr) return new Date();
            try {
                const parts = dateStr.split(' ');
                if (parts.length >= 3) {
                    // Format: DD MM YYYY HH:mm:ss
                    const [day, month, year, time] = parts;
                    return new Date(`${year}-${month}-${day}${time ? ' ' + time : ''}`);
                }
                return new Date(dateStr);
            } catch (e) {
                return new Date();
            }
        };

        // Get the latest scan for current location
        const latestScan = scans && scans.length > 0 ? scans[scans.length - 1] : null;
        const currentLocation = latestScan?.location || statusLabel;

        // Prepare update data
        const updateData = {
            'shipping.currentLocation': currentLocation,
            'shipping.lastUpdateAt': parseShiprocketDate(current_timestamp),
            'shipping.shiprocketOrderId': sr_order_id,
            'shipping.awbCode': awb
        };

        // Update status based on status code
        if (statusCode && statusMapping[statusCode]) {
            updateData['shipping.status'] = statusMapping[statusCode].shipping;
            updateData['status'] = statusMapping[statusCode].order;
        }

        // Add courier name if provided
        if (courier_name) {
            updateData['shipping.courier'] = courier_name;
        }

        // Add delivery date if delivered
        if (statusCode === 7) {
            const deliveredScan = scans.find(s => s['sr-status'] === '7');
            if (deliveredScan) {
                updateData['shipping.deliveredAt'] = parseShiprocketDate(deliveredScan.date);
            }
        }

        // Add pickup date if picked up
        if (pickup_scheduled_date) {
            updateData['shipping.scheduledPickupDate'] = parseShiprocketDate(pickup_scheduled_date);
        }

        // Add AWB assigned date
        if (awb_assigned_date) {
            updateData['shipping.awbAssignedDate'] = parseShiprocketDate(awb_assigned_date);
        }

        // Add ETD (Estimated Time of Delivery)
        if (etd) {
            updateData['shipping.estimatedDelivery'] = parseShiprocketDate(etd);
        }

        // Add all scans to tracking history
        if (scans && scans.length > 0) {
            const trackingEntries = scans.map(scan => ({
                activity: scan.activity,
                location: scan.location,
                timestamp: parseShiprocketDate(scan.date),
                statusCode: scan['sr-status'],
                statusLabel: scan['sr-status-label'],
                scanStatus: scan.status
            }));

            // Only add new entries that don't already exist
            const existingTimestamps = new Set(
                order.shipping.trackingHistory?.map(t => t.timestamp.getTime()) || []
            );

            const newEntries = trackingEntries.filter(
                entry => !existingTimestamps.has(entry.timestamp.getTime())
            );

            if (newEntries.length > 0) {
                updateData['$push'] = {
                    'shipping.trackingHistory': { $each: newEntries }
                };
            }
        }

        // Update the order
        await Order.findByIdAndUpdate(order._id, updateData);

        console.log(`✅ Order ${order.orderNumber} updated - Status: ${statusLabel} (${statusCode})`);

        // Send notification to user (implement as needed)
        // await sendTrackingNotification(order, current_status);

        // Always return 200 as per Shiprocket requirement
        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully'
        }, {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Return 200 even on error as per Shiprocket requirement
        return NextResponse.json(
            { success: false, message: 'Webhook processing failed', error: error.message },
            { status: 200, headers: corsHeaders }
        );
    }
}

/**
 * GET endpoint for webhook health check and verification
 */
export async function GET() {
    return NextResponse.json({
        status: 'active',
        webhook: 'order-tracking',
        description: 'Handles shipment tracking updates for orders',
        timestamp: new Date().toISOString(),
        endpoint: '/api/webhooks/order-updates',
        methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
        requirements: {
            contentType: 'application/json',
            securityHeader: 'anx-api-key',
            responseCode: 'Always returns 200',
            restrictedKeywords: ['shiprocket', 'kartrocket', 'sr', 'kr', 'return', 'tracking']
        }
    }, {
        status: 200,
        headers: corsHeaders
    });
}

/**
 * HEAD endpoint for webhook verification
 */
export async function HEAD() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders
    });
}