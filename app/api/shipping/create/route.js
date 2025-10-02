import { NextResponse } from 'next/server';
import { shippingService } from '@/lib/shippingService';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Middleware to check authentication
async function checkAuth() {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

        if (!token) {
            return { error: 'Unauthorized', status: 401 };
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return { error: 'Invalid token', status: 401 };
        }

        return { userId: decoded.userId };
    } catch (error) {
        console.error('Auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// Create shipment for an order
export async function POST(req) {
    try {
        const authResult = await checkAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { orderId, automate = true } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        let result;
        if (automate) {
            // Complete automation: create shipment + assign AWB + generate pickup
            result = await shippingService.automateShipping(orderId);
        } else {
            // Just create the shipment
            result = await shippingService.createShipment(orderId);
        }

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Create shipment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create shipment' },
            { status: 500 }
        );
    }
}

// Process shipment (assign AWB + generate pickup)
export async function PATCH(req) {
    try {
        const authResult = await checkAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        const result = await shippingService.processShipment(orderId);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Process shipment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process shipment' },
            { status: 500 }
        );
    }
}