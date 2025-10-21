import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import { processAutomaticRefund } from '@/lib/refundService';

// Import the main webhook handler
import { POST as mainReturnHandler } from '../shiprocket-return/route.js';

/**
 * SHORT WEBHOOK ENDPOINT ALIAS FOR RETURNS
 * Use this if Shiprocket rejects long URLs
 * 
 * URL: https://www.nandikajewellers.in/api/webhooks/return
 */

export async function POST(req) {
    // Just forward to the main handler
    return mainReturnHandler(req);
}

export async function GET(req) {
    return NextResponse.json({
        status: 'active',
        endpoint: 'shiprocket-return-shipment-webhook',
        description: 'Short URL alias for Shiprocket return webhooks'
    });
}
