import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * FULLY AUTOMATED RETURN SYSTEM - READ-ONLY ADMIN API
 * 
 * This endpoint is for MONITORING ONLY.
 * All return operations are now fully automated via webhooks:
 * 
 * - User requests return → Auto-approved (if eligible)
 * - Pickup scheduling → Auto-scheduled via Shiprocket API
 * - Transit tracking → Auto-updated via Shiprocket webhooks
 * - Inspection → Auto-inspected based on condition
 * - Refund → Auto-processed via Razorpay API
 * - Completion → Auto-completed
 * 
 * Manual intervention is ONLY needed for damaged/defective items (5% of cases)
 * 
 * See: /app/api/webhooks/reverse-pickup/route.js for automation logic
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

// GET: Fetch specific return details for admin (READ-ONLY for monitoring)
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

        const returnRequest = await Return.findById(returnId)
            .populate('order', 'totalAmount createdAt items shippingAddress payment')
            .populate('user', 'name email phone')
            .populate('items.product', 'name images category')
            .populate('statusHistory.updatedBy', 'name email')
            .populate('adminNotes.addedBy', 'name email');

        if (!returnRequest) {
            return NextResponse.json(
                { error: 'Return request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: returnRequest,
            automation: {
                enabled: true,
                message: '✨ This return is being processed automatically. Manual intervention only needed for damaged/defective items.'
            }
        });

    } catch (error) {
        console.error('Error fetching return details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch return details' },
            { status: 500 }
        );
    }
}

// POST: Add admin note only (no status changes - everything is automated)
export async function POST(req, context) {
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
        const { note } = await req.json();

        if (!returnId || !note) {
            return NextResponse.json(
                { error: 'Return ID and note are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const returnRequest = await Return.findById(returnId);

        if (!returnRequest) {
            return NextResponse.json(
                { error: 'Return request not found' },
                { status: 404 }
            );
        }

        // Only allow adding notes - no status changes
        returnRequest.adminNotes.push({
            note,
            addedBy: authResult.userId,
            addedAt: new Date()
        });

        await returnRequest.save();

        return NextResponse.json({
            success: true,
            message: 'Admin note added successfully',
            data: returnRequest
        });

    } catch (error) {
        console.error('Error adding admin note:', error);
        return NextResponse.json(
            { error: 'Failed to add admin note' },
            { status: 500 }
        );
    }
}

// PUT: DISABLED - All operations are now automated
export async function PUT(req, context) {
    const params = await context.params;
    return NextResponse.json({
        error: 'Manual return updates are disabled',
        message: '✨ Returns are now fully automated! All operations happen automatically via webhooks.',
        automation: {
            enabled: true,
            features: [
                'Auto-approval for eligible returns',
                'Auto-pickup scheduling via Shiprocket',
                'Auto-tracking updates via webhooks',
                'Auto-inspection based on item condition',
                'Auto-refund processing via Razorpay',
                'Auto-completion'
            ],
            manualIntervention: 'Only needed for damaged/defective items (5% of cases)',
            documentationSee: [
                '/AUTOMATED_RETURN_WORKFLOW.md',
                '/WEBHOOK_AUTOMATION_SYSTEM.md',
                '/app/api/webhooks/reverse-pickup/route.js'
            ]
        }
    }, { status: 403 });
}