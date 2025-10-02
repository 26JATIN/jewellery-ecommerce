import { NextResponse } from 'next/server';
import { shippingService } from '@/lib/shippingService';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// Bulk update tracking for all active shipments
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
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Check if user is admin
        await connectDB();
        const user = await User.findById(decoded.userId);
        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const result = await shippingService.bulkUpdateTracking();

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Bulk tracking update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update tracking information' },
            { status: 500 }
        );
    }
}

// Cancel shipment
export async function DELETE(req) {
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

        // Check if user is admin
        await connectDB();
        const user = await User.findById(decoded.userId);
        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const result = await shippingService.cancelShipment(orderId);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Cancel shipment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel shipment' },
            { status: 500 }
        );
    }
}