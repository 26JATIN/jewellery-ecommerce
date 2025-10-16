import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST: Process manual refund without return request
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

        // Check if user is admin
        await connectDB();
        const adminUser = await User.findById(decoded.userId);
        if (!adminUser || !adminUser.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { 
            orderId, 
            customerId, 
            amount, 
            reason, 
            method = 'original_payment'
        } = await req.json();

        // Validate required fields
        if (!orderId || !customerId || !amount || !reason) {
            return NextResponse.json(
                { error: 'Order ID, customer ID, amount, and reason are required' },
                { status: 400 }
            );
        }

        // Find the order
        const order = await Order.findById(orderId).populate('user');
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Find customer - can be by ID or email
        let customer;
        if (customerId.includes('@')) {
            customer = await User.findOne({ email: customerId });
        } else {
            customer = await User.findById(customerId);
        }

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Verify order belongs to customer
        if (order.user._id.toString() !== customer._id.toString()) {
            return NextResponse.json(
                { error: 'Order does not belong to specified customer' },
                { status: 400 }
            );
        }

        // Validate refund amount
        const refundAmount = parseFloat(amount);
        if (isNaN(refundAmount) || refundAmount <= 0) {
            return NextResponse.json(
                { error: 'Invalid refund amount' },
                { status: 400 }
            );
        }

        if (refundAmount > order.totalAmount) {
            return NextResponse.json(
                { error: 'Refund amount cannot exceed order total' },
                { status: 400 }
            );
        }

        // Generate manual return record for tracking
        const manualReturn = new Return({
            order: orderId,
            user: customer._id,
            items: order.items.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                returnReason: 'manual_refund',
                detailedReason: reason,
                itemCondition: 'not_applicable'
            })),
            status: 'completed',
            returnWindow: {
                orderDate: order.createdAt,
                returnRequestDate: new Date(),
                allowedReturnDays: 0, // Manual refund bypasses window
                isWithinWindow: true
            },
            refundDetails: {
                originalAmount: refundAmount,
                returnShippingCost: 0,
                restockingFee: 0,
                refundAmount: refundAmount,
                refundMethod: method
            },
            pickup: {
                address: null, // No pickup needed for manual refund
                specialInstructions: 'Manual refund processed by admin',
                pickupStatus: 'not_required'
            },
            eligibility: {
                isEligible: true,
                eligibilityReason: 'Manual refund authorized by admin',
                checkedAt: new Date()
            },
            source: 'admin_manual',
            adminNotes: [{
                note: `Manual refund processed. Reason: ${reason}`,
                timestamp: new Date(),
                adminId: decoded.userId
            }],
            statusHistory: [
                {
                    status: 'requested',
                    timestamp: new Date(),
                    note: 'Manual refund initiated by admin'
                },
                {
                    status: 'approved',
                    timestamp: new Date(),
                    note: 'Auto-approved (manual refund)'
                },
                {
                    status: 'approved_refund',
                    timestamp: new Date(),
                    note: 'Auto-approved (manual refund)'
                },
                {
                    status: 'refund_processed',
                    timestamp: new Date(),
                    note: 'Manual refund processed'
                },
                {
                    status: 'completed',
                    timestamp: new Date(),
                    note: 'Manual refund completed'
                }
            ]
        });

        await manualReturn.save();

        // Update order status if full refund
        if (refundAmount >= order.totalAmount) {
            order.status = 'refunded';
            order.refundDetails = {
                refundAmount: refundAmount,
                refundDate: new Date(),
                refundMethod: method,
                refundReason: reason,
                refundType: 'manual'
            };
            await order.save();
        }

        // Log the manual refund activity
        console.log(`Manual refund processed: Order ${orderId}, Customer ${customer.email}, Amount: ₹${refundAmount}, Admin: ${adminUser.email}`);

        // Populate the return for response
        const populatedReturn = await Return.findById(manualReturn._id)
            .populate('order', 'orderNumber totalAmount')
            .populate('user', 'name email');

        return NextResponse.json({
            success: true,
            message: 'Manual refund processed successfully',
            data: {
                return: populatedReturn,
                order: {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status
                },
                refund: {
                    amount: refundAmount,
                    method: method,
                    processedAt: new Date(),
                    processedBy: adminUser.email
                }
            }
        });

    } catch (error) {
        console.error('Error processing manual refund:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process manual refund' },
            { status: 500 }
        );
    }
}