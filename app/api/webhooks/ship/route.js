import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Import the main webhook handler
import { POST as mainWebhookHandler } from '../shiprocket/route.js';

/**
 * SHORT WEBHOOK ENDPOINT ALIAS
 * Use this if Shiprocket rejects long URLs
 * 
 * URL: https://www.nandikajewellers.in/api/webhooks/ship
 */

export async function POST(req) {
    // Just forward to the main handler
    return mainWebhookHandler(req);
}

export async function GET(req) {
    return NextResponse.json({
        status: 'active',
        endpoint: 'shiprocket-forward-shipment-webhook',
        description: 'Short URL alias for Shiprocket webhooks'
    });
}
