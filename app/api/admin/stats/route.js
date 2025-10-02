import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        // Check admin access
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        
        const user = await User.findById(decoded.userId);
        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const [
            totalProducts,
            activeProducts,
            lowStockProducts,
            outOfStockProducts,
            totalOrders,
            totalUsers,
            revenueData,
            totalInventoryValue
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ stock: { $lt: 10, $gt: 0 } }),
            Product.countDocuments({ stock: 0 }),
            Order.countDocuments(),
            User.countDocuments(),
            Order.aggregate([
                { $match: { 'payment.status': 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Product.aggregate([
                { $group: { _id: null, total: { $sum: { $multiply: ['$costPrice', '$stock'] } } } }
            ])
        ]);

        return NextResponse.json({
            totalProducts,
            activeProducts,
            lowStockProducts,
            outOfStockProducts,
            totalOrders,
            totalUsers,
            revenue: revenueData[0]?.total || 0,
            inventoryValue: totalInventoryValue[0]?.total || 0
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}