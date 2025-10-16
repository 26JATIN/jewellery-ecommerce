import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST: Check if order is eligible for return
export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify order exists and belongs to user
        const order = await Order.findOne({ 
            _id: orderId, 
            user: decoded.userId 
        }).populate('items.product', 'name category');

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check current return policy
        const returnPolicy = Return.getReturnPolicyForCategory('jewelry');
        const daysSinceOrder = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));
        const daysRemaining = returnPolicy.days - daysSinceOrder;

        // Check eligibility conditions
        const eligibilityChecks = {
            isDelivered: order.status === 'delivered',
            withinReturnWindow: daysSinceOrder <= returnPolicy.days,
            noExistingReturn: true,
            orderAmount: order.totalAmount >= 100 // Minimum order amount for returns
        };

        // Check for existing return
        const existingReturn = await Return.findOne({ 
            order: orderId,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (existingReturn) {
            eligibilityChecks.noExistingReturn = false;
        }

        const isEligible = Object.values(eligibilityChecks).every(check => check === true);

        // Determine eligibility reasons
        const reasons = [];
        if (!eligibilityChecks.isDelivered) {
            reasons.push('Order must be delivered to initiate return');
        }
        if (!eligibilityChecks.withinReturnWindow) {
            reasons.push(`Return window has expired. Returns are allowed within ${returnPolicy.days} days of delivery`);
        }
        if (!eligibilityChecks.noExistingReturn) {
            reasons.push('A return request already exists for this order');
        }
        if (!eligibilityChecks.orderAmount) {
            reasons.push('Order amount must be at least ₹100 for returns');
        }

        return NextResponse.json({
            success: true,
            data: {
                isEligible,
                eligibilityChecks,
                reasons: reasons.length > 0 ? reasons : ['Order is eligible for return'],
                returnPolicy: {
                    ...returnPolicy,
                    daysRemaining: Math.max(0, daysRemaining),
                    daysSinceOrder
                },
                order: {
                    id: order._id,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    createdAt: order.createdAt,
                    items: order.items.map(item => ({
                        id: item._id,
                        productId: item.product._id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image
                    }))
                },
                existingReturn: existingReturn ? {
                    id: existingReturn._id,
                    returnNumber: existingReturn.returnNumber,
                    status: existingReturn.status,
                    createdAt: existingReturn.createdAt
                } : null
            }
        });

    } catch (error) {
        console.error('Error checking return eligibility:', error);
        return NextResponse.json(
            { error: 'Failed to check return eligibility' },
            { status: 500 }
        );
    }
}