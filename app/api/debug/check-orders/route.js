import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
    try {
        await dbConnect();

        // Find orders with shiprocketOrderId
        const ordersWithShiprocket = await Order.find({
            shiprocketOrderId: { $exists: true, $ne: null }
        })
        .select('orderNumber shiprocketOrderId status createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderNumber shiprocketOrderId status createdAt');

        // Get total counts
        const totalOrders = await Order.countDocuments();
        const ordersWithShiprocketCount = await Order.countDocuments({
            shiprocketOrderId: { $exists: true, $ne: null }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalOrders,
                ordersWithShiprocketCount,
                ordersWithShiprocket: ordersWithShiprocket.map(o => ({
                    orderNumber: o.orderNumber,
                    shiprocketOrderId: o.shiprocketOrderId,
                    status: o.status,
                    createdAt: o.createdAt
                })),
                recentOrders: recentOrders.map(o => ({
                    orderNumber: o.orderNumber,
                    shiprocketOrderId: o.shiprocketOrderId || 'NOT SET',
                    status: o.status,
                    createdAt: o.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error checking orders:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
