import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';
import Order from '@/models/Order';
import connectDB from '@/lib/mongodb';

export async function GET(req, { params }) {
    try {
        await connectDB();
        const order = await Order.findById(params.orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order has shipping details
        if (!order.shipping?.shipmentId && !order.shipping?.awbCode) {
            return NextResponse.json({
                message: 'No tracking information available yet',
                order
            });
        }

        let trackingData;
        if (order.shipping.awbCode) {
            // Try tracking by AWB first
            trackingData = await shiprocket.trackByAWB(order.shipping.awbCode);
        } else if (order.shipping.shipmentId) {
            // Fallback to shipment ID tracking
            trackingData = await shiprocket.trackByShipmentId(order.shipping.shipmentId);
        }

        return NextResponse.json({
            success: true,
            tracking: trackingData,
            order
        });
    } catch (error) {
        console.error('Tracking fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracking info' },
            { status: 500 }
        );
    }
}