// This route has been moved to avoid conflict with [orderId] route
// Use /api/shipping/track/order/[orderId] instead
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    return NextResponse.json(
        { 
            error: 'This endpoint has been deprecated. Use /api/shipping/track/order/[orderId] instead.',
            redirect: '/api/shipping/track/order/'
        },
        { status: 410 }
    );
}