import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import ReturnModel from '@/models/Return';
import { NextResponse } from 'next/server';

/**
 * Shiprocket Webhook Handler
 * Receives updates from Shiprocket about shipment status
 */

// Add CORS headers for webhook
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request) {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
    const startTime = Date.now();
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    
    try {
        // Log all headers for debugging
        const headers = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        console.log('Headers:', JSON.stringify(headers, null, 2));

        // Optional: Verify security token if configured in Shiprocket
        // const apiKey = request.headers.get('anx-api-key');
        // if (apiKey && apiKey !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
        //     console.log('Invalid webhook security token');
        //     return new Response(null, { status: 200, headers: corsHeaders });
        // }

        const body = await request.json();
        
        console.log('=== WEBHOOK BODY ===');
        console.log(JSON.stringify(body, null, 2));
        console.log('=== END BODY ===');

        const {
            order_id,
            sr_order_id,
            shipment_id,
            awb,
            courier_name,
            current_status,
            shipment_status,
            current_status_id,
            shipment_status_id,
            etd,
            scans,
            is_return,
            pod,
            pod_status
        } = body;

        if (!order_id && !sr_order_id) {
            console.log('Webhook received but no order ID provided');
            // Still return 200 to acknowledge receipt
            return new Response(null, { 
                status: 200,
                headers: corsHeaders 
            });
        }

        await connectDB();

        // Find order by Shiprocket order ID or order number
        const order = await Order.findOne({
            $or: [
                { shiprocketOrderId: sr_order_id },
                { shiprocketOrderId: order_id },
                { orderNumber: order_id }
            ]
        });

        if (!order) {
            console.log('Order not found for Shiprocket webhook. Tried order_id:', order_id, 'sr_order_id:', sr_order_id);
            // Still return 200 to acknowledge receipt even if order not found
            return new Response(null, { 
                status: 200,
                headers: corsHeaders 
            });
        }

        // Update order with Shiprocket details
        if (shipment_id) order.shiprocketShipmentId = shipment_id;
        if (awb) order.awbCode = awb;
        if (courier_name) order.courierName = courier_name;
        if (etd) order.estimatedDeliveryDate = etd;

        // Map Shiprocket status to our order status
        // Using sr-status-label from scans or shipment_status
        const statusMapping = {
            'MANIFEST GENERATED': 'confirmed',
            'PENDING PICKUP': 'confirmed',
            'PICKED UP': 'processing',
            'SHIPPED': 'shipped',
            'IN TRANSIT': 'shipped',
            'OUT FOR DELIVERY': 'shipped',
            'DELIVERED': 'delivered',
            'CANCELED': 'cancelled',
            'CANCELLED': 'cancelled',
            'RTO': 'cancelled',
            'RTO DELIVERED': 'cancelled',
            'RETURNED': 'returned',
            'RETURNED TO SENDER': 'returned',
            'RETURN TO ORIGIN': 'returned'
        };

        // Use shipment_status or current_status
        const status = shipment_status || current_status;
        if (status && statusMapping[status.toUpperCase()]) {
            order.status = statusMapping[status.toUpperCase()];
            
            // Auto-mark COD orders as paid when delivered
            if (order.status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                console.log(`COD order ${order.orderNumber} marked as paid upon delivery`);
            }
        }

        // Handle return shipments
        if (is_return === 1) {
            try {
                let returnDoc = await ReturnModel.findOne({ orderId: order._id });

                if (!returnDoc && awb) {
                    returnDoc = await ReturnModel.findOne({ shiprocketReturnAwb: awb });
                }

                if (returnDoc) {
                    if (shipment_id) returnDoc.shiprocketReturnShipmentId = shipment_id;
                    if (awb) returnDoc.shiprocketReturnAwb = awb;
                    if (courier_name) returnDoc.courierName = courier_name;
                    if (etd) returnDoc.estimatedPickupDate = etd;

                    // Map return status from Shiprocket to our return statuses
                    const returnStatusMapping = {
                        'MANIFEST GENERATED': 'requested',
                        'PENDING PICKUP': 'pickup_scheduled',
                        'PICKED UP': 'in_transit',
                        'SHIPPED': 'in_transit',
                        'IN TRANSIT': 'in_transit',
                        'OUT FOR DELIVERY': 'in_transit',
                        'DELIVERED': 'returned_to_seller',
                        'CANCELED': 'cancelled',
                        'CANCELLED': 'cancelled',
                        'RTO': 'cancelled',
                        'RTO DELIVERED': 'cancelled'
                    };

                    // Update return status based on Shiprocket status
                    const returnStatus = shipment_status || current_status;
                    if (returnStatus) {
                        const normalizedStatus = returnStatus.toUpperCase().trim();
                        
                        if (returnStatusMapping[normalizedStatus]) {
                            returnDoc.status = returnStatusMapping[normalizedStatus];
                            console.log(`Return ${returnDoc.returnNumber} status updated to: ${returnDoc.status}`);
                            
                            // Set refund requested time when delivered back to seller
                            if (returnDoc.status === 'returned_to_seller' && !returnDoc.refundRequestedAt) {
                                returnDoc.refundRequestedAt = new Date();
                                console.log(`Return ${returnDoc.returnNumber} delivered back to seller`);
                            }
                        }
                    }

                    await returnDoc.save();
                    console.log(`Return ${returnDoc.returnNumber} updated via Shiprocket webhook`);
                }
            } catch (retErr) {
                console.error('Error handling return in Shiprocket webhook:', retErr);
            }
        }

        await order.save();

        console.log(`Order ${order.orderNumber} updated via Shiprocket webhook`);

        // Shiprocket requires ONLY status 200 response with no body
        return new Response(null, { 
            status: 200,
            headers: corsHeaders 
        });
    } catch (error) {
        console.error('Shiprocket webhook error:', error);
        
        // Even on error, return 200 to prevent Shiprocket from retrying
        // Log the error for debugging but acknowledge receipt
        return new Response(null, { 
            status: 200,
            headers: corsHeaders 
        });
    }
}

// Handle GET request (for webhook verification/testing)
export async function GET(request) {
    return NextResponse.json({ 
        message: 'Webhook endpoint is active',
        status: 'ready',
        endpoint: '/api/webhooks/tracking-updates',
        timestamp: new Date().toISOString()
    }, { headers: corsHeaders });
}
