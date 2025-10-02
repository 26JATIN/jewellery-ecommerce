import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

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

        const { items, shippingAddress, paymentMethod, totalAmount } = await req.json();

        await connectDB();

        const order = new Order({
            user: decoded.userId,
            items,
            shippingAddress,
            paymentMethod,
            totalAmount,
            status: 'pending'
        });

        await order.save();

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}