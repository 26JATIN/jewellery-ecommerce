import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
    try {
        await connectDB();
        
        // Get the most recent order to inspect its structure
        const order = await Order.findOne().populate('user').sort({ createdAt: -1 }).limit(1);
        
        if (!order) {
            return NextResponse.json({ error: 'No orders found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId: order._id,
                shippingAddress: order.shippingAddress,
                user: order.user ? { 
                    email: order.user.email,
                    name: order.user.name 
                } : 'No user populated',
                items: order.items,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Debug order error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}