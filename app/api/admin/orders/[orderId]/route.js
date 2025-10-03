import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Force Node.js runtime
export const runtime = 'nodejs';

// Get specific order details (Admin only)
export async function GET(req, { params }) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

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

        // Connect to DB and fetch user to verify admin status
        await connectDB();
        const User = require('@/models/User').default;
        const user = await User.findById(decoded.userId).select('isAdmin');

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { orderId } = params;

        // Fetch the order with all details
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Admin order fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// Update order status (Admin only)
export async function PUT(req, { params }) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

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

        // Connect to DB and fetch user to verify admin status
        await connectDB();
        const User = require('@/models/User').default;
        const user = await User.findById(decoded.userId).select('isAdmin');

        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { orderId } = params;
        const { status } = await req.json();

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { 
                status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Admin order update error:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}