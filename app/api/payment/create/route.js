import { NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/razorpay';
import config from '@/lib/config';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    try {
        // Authenticate user first
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }
        
        // Rate limiting: 10 payment creation attempts per 10 minutes per user
        const rateLimitResult = rateLimit(`payment_create_${decoded.userId}`, 10, 10 * 60 * 1000);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { 
                    error: `Too many payment requests. Please try again in ${Math.ceil(rateLimitResult.waitTime / 60)} minutes.`,
                    retryAfter: rateLimitResult.retryAfter
                },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': rateLimitResult.retryAfter.toString()
                    }
                }
            );
        }
        
        if (!config.razorpay.keyId || !config.razorpay.keySecret) {
            console.error('Missing Razorpay credentials:', {
                keyId: !!config.razorpay.keyId,
                keySecret: !!config.razorpay.keySecret
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