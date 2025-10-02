import { NextResponse } from 'next/server';
import { shippingService } from '@/lib/shippingService';

export async function POST(req) {
    try {
        const { orderId } = await req.json();
        
        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        console.log('Testing shipping creation for order:', orderId);
        
        const result = await shippingService.createShipment(orderId);
        
        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Test shipping error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}