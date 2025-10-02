import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req, context) {
    try {
        // Get and await both cookies and params
        const cookieStore = await cookies();
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
        }).populate('user', 'name email');

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}