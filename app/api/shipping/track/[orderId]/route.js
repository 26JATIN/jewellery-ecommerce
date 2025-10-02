import { NextResponse } from 'next/server';
import { shippingService } from '@/lib/shippingService';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Get tracking information for an order
export async function GET(req, { params }) {
    try {
        const { orderId } = params;
        
        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Update tracking info first
        await shippingService.updateTrackingInfo(orderId);
        
        // Get updated order
        await connectDB();
        const order = await Order.findById(orderId).select('shipping status');
        
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId: orderId,
                status: order.status,
                shipping: order.shipping
            }
        });
    } catch (error) {
        console.error('Get tracking error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get tracking information' },
            { status: 500 }
        );
    }
}

// Update tracking information for an order
export async function POST(req, { params }) {
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
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const { orderId } = params;
        
        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const result = await shippingService.updateTrackingInfo(orderId);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Update tracking error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update tracking information' },
            { status: 500 }
        );
    }
}