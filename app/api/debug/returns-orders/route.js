import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';

/**
 * Debug endpoint to check returns and orders
 * GET /api/debug/returns-orders
 */
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;

        // Get recent orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id status createdAt payment.status shipping.shipmentId');

        // Get recent returns
        const recentReturns = await Return.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id order status createdAt source');

        return NextResponse.json({
            success: true,
            data: {
                orders: recentOrders.map(o => ({
                    id: o._id.toString(),
                    idShort: o._id.toString().slice(-8).toUpperCase(),
                    status: o.status,
                    paymentStatus: o.payment?.status,
                    hasShipment: !!o.shipping?.shipmentId,
                    createdAt: o.createdAt
                })),
                returns: recentReturns.map(r => ({
                    id: r._id.toString(),
                    idShort: r._id.toString().slice(-8).toUpperCase(),
                    orderId: r.order?.toString(),
                    orderIdShort: r.order?.toString().slice(-8).toUpperCase(),
                    status: r.status,
                    source: r.source,
                    createdAt: r.createdAt
                })),
                analysis: {
                    totalOrders: recentOrders.length,
                    totalReturns: recentReturns.length,
                    ordersWithShipment: recentOrders.filter(o => o.shipping?.shipmentId).length,
                    ordersWithoutShipment: recentOrders.filter(o => !o.shipping?.shipmentId).length,
                }
            }
        });

    } catch (error) {
        console.error('Debug endpoint error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
