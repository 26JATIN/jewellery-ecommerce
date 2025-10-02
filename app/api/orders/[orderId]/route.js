import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { shiprocket } from '@/lib/shiprocket';

export async function GET(req, context) {
    try {
        // Get and await both cookies and params
        const cookieStore = cookies();
        const token = await cookieStore.get('token');
        const { params } = context;
        const orderId = await params.orderId;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        const order = await Order.findOne({
            _id: orderId,
            user: decoded.userId
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Fetch Shiprocket tracking details if shipment exists
        if (order.shipping && order.shipping.shipmentId) {
            try {
                const trackingDetails = await shiprocket.trackOrder(order.shipping.shipmentId);
                
                // Update order with latest tracking information
                order.shipping = {
                    ...order.shipping,
                    currentStatus: trackingDetails.current_status,
                    currentLocation: trackingDetails.current_location,
                    estimatedDelivery: trackingDetails.etd,
                    trackingHistory: trackingDetails.tracking_data.map(data => ({
                        activity: data.activity,
                        location: data.location,
                        date: data.date,
                        status: data.status
                    })),
                    lastUpdate: new Date()
                };

                // Save the updated tracking info
                await order.save();
            } catch (trackingError) {
                console.error('Failed to fetch tracking details:', trackingError);
                // Continue with existing shipping info if tracking fetch fails
            }
        }

        // Transform the order data to include readable shipping status
        const orderResponse = {
            ...order.toObject(),
            shipping: order.shipping ? {
                ...order.shipping,
                statusDisplay: getStatusDisplay(order.shipping.status),
                isDelivered: order.shipping.status === 'delivered',
                isInTransit: ['picked_up', 'in_transit', 'out_for_delivery'].includes(order.shipping.status)
            } : null
        };

        return NextResponse.json(orderResponse);
    } catch (error) {
        console.error('Order fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// Helper function to get user-friendly status messages
function getStatusDisplay(status) {
    const statusMap = {
        'pending': 'Order Pending',
        'processing': 'Processing',
        'picked_up': 'Picked Up',
        'in_transit': 'In Transit',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}