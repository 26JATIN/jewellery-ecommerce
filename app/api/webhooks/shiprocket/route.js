import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import ReturnModel from '@/models/Return';
import { NextResponse } from 'next/server';

/**
 * Shiprocket Webhook Handler
 * Receives updates from Shiprocket about shipment status
 */
export async function POST(request) {
    try {
        const body = await request.json();
        
        console.log('Shiprocket webhook received:', body);

        // Verify webhook authenticity (optional but recommended)
        // You can add HMAC verification here if Shiprocket provides it

        const {
            order_id,
            shipment_id,
            awb,
            courier_name,
            current_status,
            tracking_url,
        } = body;

        if (!order_id) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        await connectDB();

        // Find order by Shiprocket order ID or order number
        const order = await Order.findOne({
            $or: [
                { shiprocketOrderId: order_id },
                { orderNumber: order_id }
            ]
        });

        if (!order) {
            console.log('Order not found for Shiprocket webhook:', order_id);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order with Shiprocket details
        if (shipment_id) order.shiprocketShipmentId = shipment_id;
        if (awb) order.awbCode = awb;
        if (courier_name) order.courierName = courier_name;
        if (tracking_url) order.trackingUrl = tracking_url;

        // Map Shiprocket status to our order status
        const statusMapping = {
            'NEW': 'confirmed',
            'PENDING PICKUP': 'confirmed',
            'PICKED UP': 'processing',
            'IN TRANSIT': 'shipped',
            'OUT FOR DELIVERY': 'shipped',
            'DELIVERED': 'delivered',
            'CANCELED': 'cancelled',
            'RTO': 'cancelled',
            'RTO DELIVERED': 'cancelled',
            // Return related statuses (map to order returned/received as appropriate)
            'RETURNED': 'returned',
            'RETURNED TO SENDER': 'returned',
            'RETURN TO ORIGIN': 'returned'
        };

        if (current_status && statusMapping[current_status.toUpperCase()]) {
            order.status = statusMapping[current_status.toUpperCase()];
            
            // Auto-mark COD orders as paid when delivered
            if (order.status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
                order.paymentStatus = 'paid';
                console.log(`COD order ${order.orderNumber} marked as paid upon delivery`);
            }
        }

        // Handle return-specific payloads or statuses
        // Shiprocket may include return_awb, return_shipment_id or use statuses containing RETURN
        try {
            // Determine if this webhook concerns a return
            const returnAwb = body.return_awb || body.return_awb_code || body.return_awb_code || body.return_awb || awb;
            const returnShipmentId = body.return_shipment_id || body.return_shipment || body.return_id;
            const isReturnStatus = current_status && /RETURN/i.test(current_status);

            if (returnAwb || returnShipmentId || isReturnStatus) {
                // Try to find a matching Return document by order_id or awb
                let returnDoc = null;
                if (order) {
                    returnDoc = await ReturnModel.findOne({ orderId: order._id });
                }

                if (!returnDoc && returnAwb) {
                    returnDoc = await ReturnModel.findOne({ shiprocketReturnAwb: returnAwb });
                }

                if (returnDoc) {
                    if (returnShipmentId) returnDoc.shiprocketReturnShipmentId = returnShipmentId;
                    if (returnAwb) returnDoc.shiprocketReturnAwb = returnAwb;
                    if (courier_name) returnDoc.courierName = courier_name;
                    if (tracking_url) returnDoc.trackingUrl = tracking_url;

                    // Map return status from Shiprocket to our return statuses
                    const returnStatusMapping = {
                        'RETURN_REQUESTED': 'requested',
                        'RETURN REQUESTED': 'requested',
                        'RETURN_INITIATED': 'requested',
                        'RETURN INITIATED': 'requested',
                        'RETURN_PICKUP_SCHEDULED': 'pickup_scheduled',
                        'RETURN PICKUP SCHEDULED': 'pickup_scheduled',
                        'RETURN_PICKED_UP': 'in_transit',
                        'RETURN PICKED UP': 'in_transit',
                        'RETURN_IN_TRANSIT': 'in_transit',
                        'RETURN IN TRANSIT': 'in_transit',
                        'RETURN_OUT_FOR_DELIVERY': 'in_transit',
                        'RETURN OUT FOR DELIVERY': 'in_transit',
                        'RETURN_DELIVERED': 'returned_to_seller',
                        'RETURN DELIVERED': 'returned_to_seller',
                        'RETURNED_TO_SELLER': 'returned_to_seller',
                        'RETURNED TO SELLER': 'returned_to_seller',
                        'RETURN_RECEIVED': 'received',
                        'RETURN RECEIVED': 'received',
                        'RETURN_CANCELED': 'cancelled',
                        'RETURN CANCELED': 'cancelled',
                        'RETURN_CANCELLED': 'cancelled',
                        'RETURN CANCELLED': 'cancelled',
                        'CANCELED': 'cancelled',
                        'CANCELLED': 'cancelled'
                    };

                    // Update return status based on Shiprocket status
                    if (current_status) {
                        const normalizedStatus = current_status.toUpperCase().trim();
                        
                        // Check if it's a return cancellation
                        if (normalizedStatus.includes('CANCEL')) {
                            returnDoc.status = 'cancelled';
                            console.log(`Return ${returnDoc.returnNumber} cancelled via Shiprocket webhook`);
                        }
                        // Check specific return status mappings
                        else if (returnStatusMapping[normalizedStatus]) {
                            returnDoc.status = returnStatusMapping[normalizedStatus];
                            console.log(`Return ${returnDoc.returnNumber} status updated to: ${returnDoc.status}`);
                        }
                        // Check if it's a delivered status (return completed)
                        else if (normalizedStatus.includes('DELIVERED') || normalizedStatus.includes('RETURNED')) {
                            returnDoc.status = 'returned_to_seller';
                            // Set refund requested time if not set
                            if (!returnDoc.refundRequestedAt) returnDoc.refundRequestedAt = new Date();
                            console.log(`Return ${returnDoc.returnNumber} delivered back to seller`);
                        }
                    }

                    await returnDoc.save();
                    console.log(`Return ${returnDoc.returnNumber} updated via Shiprocket webhook`);
                }
            }
        } catch (retErr) {
            console.error('Error handling return in Shiprocket webhook:', retErr);
        }

        await order.save();

        console.log(`Order ${order.orderNumber} updated via Shiprocket webhook`);

        return NextResponse.json({ 
            message: 'Webhook processed successfully',
            orderNumber: order.orderNumber,
            status: order.status
        });
    } catch (error) {
        console.error('Shiprocket webhook error:', error);
        return NextResponse.json({ 
            error: 'Webhook processing failed',
            details: error.message 
        }, { status: 500 });
    }
}

// Handle GET request (for webhook verification)
export async function GET(request) {
    return NextResponse.json({ 
        message: 'Shiprocket webhook endpoint',
        status: 'active'
    });
}
