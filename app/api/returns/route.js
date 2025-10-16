import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch user's returns
export async function GET(req) {
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

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');

        // Build query
        const query = { user: decoded.userId };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Fetch returns with pagination
        const returns = await Return.find(query)
            .populate('order', 'totalAmount createdAt items')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const totalReturns = await Return.countDocuments(query);
        const totalPages = Math.ceil(totalReturns / limit);

        return NextResponse.json({
            success: true,
            data: {
                returns,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReturns,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching returns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch returns' },
            { status: 500 }
        );
    }
}

// POST: Create new return request
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

        const { 
            orderId, 
            items, 
            pickupAddress,
            specialInstructions 
        } = await req.json();

        // Validate required fields
        if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Order ID and items are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify order exists and belongs to user
        const order = await Order.findOne({ 
            _id: orderId, 
            user: decoded.userId 
        }).populate('items.product');

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order is eligible for return
        const daysSinceOrder = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));
        const returnPolicy = Return.getReturnPolicyForCategory('jewelry'); // Default to jewelry policy

        if (daysSinceOrder > returnPolicy.days) {
            return NextResponse.json(
                { error: `Return window has expired. Returns are allowed within ${returnPolicy.days} days of delivery.` },
                { status: 400 }
            );
        }

        // Check if order is eligible for return (not cancelled)
        if (order.status === 'cancelled') {
            return NextResponse.json(
                { error: 'Returns cannot be initiated for cancelled orders' },
                { status: 400 }
            );
        }

        // Check if return already exists for this order
        const existingReturn = await Return.findOne({ 
            order: orderId,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (existingReturn) {
            return NextResponse.json(
                { error: 'A return request already exists for this order' },
                { status: 400 }
            );
        }

        // Validate return items against order items
        const validatedItems = [];
        let totalRefundAmount = 0;

        for (const returnItem of items) {
            const orderItem = order.items.find(
                item => item.product._id.toString() === returnItem.productId
            );

            if (!orderItem) {
                return NextResponse.json(
                    { error: `Product ${returnItem.productId} not found in order` },
                    { status: 400 }
                );
            }

            if (returnItem.quantity > orderItem.quantity) {
                return NextResponse.json(
                    { error: `Cannot return more items than ordered for ${orderItem.name}` },
                    { status: 400 }
                );
            }

            // Validate return reason
            if (!returnPolicy.allowedReasons.includes(returnItem.returnReason)) {
                return NextResponse.json(
                    { error: `Invalid return reason: ${returnItem.returnReason}` },
                    { status: 400 }
                );
            }

            const itemRefundAmount = orderItem.price * returnItem.quantity;
            totalRefundAmount += itemRefundAmount;

            validatedItems.push({
                product: orderItem.product._id,
                name: orderItem.name,
                price: orderItem.price,
                quantity: returnItem.quantity,
                image: orderItem.image,
                returnReason: returnItem.returnReason,
                detailedReason: returnItem.detailedReason || '',
                itemCondition: returnItem.itemCondition || 'unused'
            });
        }

        // Create return request
        const returnRequest = new Return({
            order: orderId,
            user: decoded.userId,
            items: validatedItems,
            status: 'requested',
            returnWindow: {
                orderDate: order.createdAt,
                returnRequestDate: new Date(),
                allowedReturnDays: returnPolicy.days,
                isWithinWindow: true
            },
            refundDetails: {
                originalAmount: totalRefundAmount,
                returnShippingCost: 0, // Free return shipping for now
                restockingFee: 0, // No restocking fee for jewelry
                refundAmount: totalRefundAmount,
                refundMethod: 'original_payment'
            },
            pickup: {
                address: pickupAddress || {
                    fullName: order.shippingAddress.fullName,
                    addressLine1: order.shippingAddress.addressLine1,
                    addressLine2: order.shippingAddress.addressLine2,
                    city: order.shippingAddress.city,
                    state: order.shippingAddress.state,
                    postalCode: order.shippingAddress.postalCode,
                    country: order.shippingAddress.country,
                    phone: order.shippingAddress.phone
                },
                specialInstructions: specialInstructions || '',
                pickupStatus: 'pending'
            },
            eligibility: {
                isEligible: true,
                eligibilityReason: `Order placed and within return window (Status: ${order.status})`,
                checkedAt: new Date()
            },
            source: 'website'
        });

        await returnRequest.save();

        // Populate the saved return for response
        const populatedReturn = await Return.findById(returnRequest._id)
            .populate('order', 'totalAmount createdAt')
            .populate('user', 'name email');

        return NextResponse.json({
            success: true,
            message: 'Return request created successfully',
            data: populatedReturn
        });

    } catch (error) {
        console.error('Error creating return request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create return request' },
            { status: 500 }
        );
    }
}