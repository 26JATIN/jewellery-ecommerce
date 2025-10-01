import { NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/razorpay';
import paymentConfig from '@/lib/payment-config';

export async function POST(req) {
    try {
        if (!paymentConfig.razorpay.keyId || !paymentConfig.razorpay.keySecret) {
            console.error('Missing Razorpay credentials:', {
                keyId: !!paymentConfig.razorpay.keyId,
                keySecret: !!paymentConfig.razorpay.keySecret
            });
            return NextResponse.json(
                { error: 'Payment gateway not configured' },
                { status: 503 }
            );
        }

        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const order = await createPaymentOrder(amount);
        
        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment' },
            { status: 500 }
        );
    }
}