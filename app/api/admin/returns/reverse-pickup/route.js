import { NextResponse } from 'next/server';
import { reversePickupService } from '@/lib/reversePickupService';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

// POST: Create reverse pickup for return
export async function POST(req) {
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { returnId, automate = true } = await req.json();

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        let result;
        if (automate) {
            // Complete automation: create reverse pickup + assign AWB + schedule pickup
            result = await reversePickupService.automateReversePickup(returnId);
        } else {
            // Just create the reverse pickup shipment
            result = await reversePickupService.createReversePickup(returnId);
        }

        return NextResponse.json({
            success: true,
            message: 'Reverse pickup created successfully',
            data: result
        });
    } catch (error) {
        console.error('Create reverse pickup error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create reverse pickup' },
            { status: 500 }
        );
    }
}

// PATCH: Process reverse pickup (assign AWB + schedule pickup)
export async function PATCH(req) {
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { returnId } = await req.json();

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        const result = await reversePickupService.processReversePickup(returnId);

        return NextResponse.json({
            success: true,
            message: 'Reverse pickup processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Process reverse pickup error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process reverse pickup' },
            { status: 500 }
        );
    }
}

// DELETE: Cancel reverse pickup
export async function DELETE(req) {
    try {
        const authResult = await checkAdminAuth();
        if (authResult.error) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { searchParams } = new URL(req.url);
        const returnId = searchParams.get('returnId');

        if (!returnId) {
            return NextResponse.json(
                { error: 'Return ID is required' },
                { status: 400 }
            );
        }

        const result = await reversePickupService.cancelReversePickup(returnId);

        return NextResponse.json({
            success: true,
            message: 'Reverse pickup cancelled successfully',
            data: result
        });
    } catch (error) {
        console.error('Cancel reverse pickup error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel reverse pickup' },
            { status: 500 }
        );
    }
}