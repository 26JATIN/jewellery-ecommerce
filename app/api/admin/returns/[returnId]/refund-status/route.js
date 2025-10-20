import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { checkRefundStatus } from '@/lib/refundService';

/**
 * AUTOMATED REFUND STATUS CHECKER
 * 
 * This endpoint only CHECKS refund status (read-only).
 * Refunds are automatically processed via webhooks - no manual processing needed.
 * 
 * See: /app/api/webhooks/shiprocket-return/route.js for auto-refund logic
 * See: /app/api/webhooks/razorpay-refund/route.js for refund status updates
 */

// Middleware to check admin authentication
async function checkAdminAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return { error: 'Unauthorized', status: 401 };
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return { error: 'Invalid token', status: 401 };
        }

        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return { error: 'Admin access required', status: 403 };
        }

        return { userId: decoded.userId };
    } catch (error) {
        console.error('Admin auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// GET: Check refund status from Razorpay (READ-ONLY for monitoring)
export async function GET(req, context) {
    const params = await context.params;
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { returnId } = await params;

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const result = await checkRefundStatus(returnId);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error checking refund status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check refund status' },
            { status: 500 }
        );
    }
}
