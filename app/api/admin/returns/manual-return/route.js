import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// POST: Create manual return order from admin
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
            items, 
            reason, 
            autoApprove = true,
            pickupRequired = true,
            notes
        } = await req.json();

        // Validate required fields
        if (!orderId || !customerId) {
            return NextResponse.json(
                { error: 'Order ID and customer ID are required' },
                { status: 400 }
            );
        }

        // Log received data for debugging
        console.log('Manual return request received:', { orderId, customerId, items, reason });

        // Clean and validate Order ID
        let cleanOrderId = orderId.toString().trim();
        // Remove any hash prefix if present
        if (cleanOrderId.startsWith('#')) {
            cleanOrderId = cleanOrderId.substring(1);
        }

        console.log('Cleaned Order ID:', cleanOrderId);

        let order;
        
        // If it looks like a short order ID (8 characters or less), search by suffix
        if (cleanOrderId.length <= 8 && /^[a-f0-9]+$/i.test(cleanOrderId)) {
            console.log('Searching for order by ID suffix:', cleanOrderId);
            // Find order where the ObjectId ends with this string
            const orders = await Order.find({}).populate('user');
            order = orders.find(o => o._id.toString().toLowerCase().endsWith(cleanOrderId.toLowerCase()));
            
            if (order) {
                console.log('Found order by suffix:', order._id);
                cleanOrderId = order._id.toString(); // Use the full ObjectId
            }
        } else {
            // Try to find by full ObjectId if it's valid
            if (mongoose.Types.ObjectId.isValid(cleanOrderId) && cleanOrderId.length === 24) {
                order = await Order.findById(cleanOrderId).populate('user');
            }
        }

        if (!order) {
            return NextResponse.json(
                { error: `Order not found. Please check the order ID: "${orderId}". Use either the full order ID or the last 8 characters (e.g., #a1b2c3d4)` },
                { status: 404 }
            );
        }

        // Find customer - support multiple formats
        let customer;
        console.log('Looking up customer with identifier:', customerId);

        if (customerId.includes('@')) {
            console.log('Looking up customer by email:', customerId);
            customer = await User.findOne({ email: customerId });
        } else {
            // Try to find by name first (case-insensitive)
            const nameSearch = customerId.toString().trim();
            customer = await User.findOne({ 
                name: { $regex: new RegExp(nameSearch, 'i') }
            });

            if (!customer) {
                // If not found by name, try ObjectId format
                let cleanCustomerId = customerId.toString().trim();
                if (cleanCustomerId.startsWith('#')) {
                    cleanCustomerId = cleanCustomerId.substring(1);
                }

                console.log('Cleaned Customer ID:', cleanCustomerId);

                // Validate if it's a valid MongoDB ObjectId for customer lookup
                if (mongoose.Types.ObjectId.isValid(cleanCustomerId) && cleanCustomerId.length === 24) {
                    customer = await User.findById(cleanCustomerId);
                } else {
                    // Try searching by partial ObjectId (last 8 characters)
                    if (cleanCustomerId.length <= 8 && /^[a-f0-9]+$/i.test(cleanCustomerId)) {
                        const users = await User.find({});
                        customer = users.find(u => u._id.toString().toLowerCase().endsWith(cleanCustomerId.toLowerCase()));
                    }
                }
            }
        }

        if (!customer) {
            return NextResponse.json(
                { error: `Customer not found. Please use: email address, customer name, full customer ID, or last 8 characters (e.g., "john@example.com", "John Doe", or "#a1b2c3d4"). Received: "${customerId}"` },
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

        // Check if return already exists
        const existingReturn = await Return.findOne({ 
            order: cleanOrderId,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (existingReturn) {
            return NextResponse.json(
                { error: 'A return request already exists for this order' },
                { status: 400 }
            );
        }

        // Handle items - if empty or not provided, return all items from order
        let itemsToReturn = items;
        if (!items || !Array.isArray(items) || items.length === 0) {
            // Return all items from the order
            itemsToReturn = order.items.map(item => ({
                productId: item.product.toString(),
                quantity: item.quantity,
                returnReason: 'admin_initiated', // Should work now with restarted server
                detailedReason: reason || 'Return initiated by admin',
                itemCondition: 'unknown' // Should work now with restarted server
            }));
        }

        // Validate return items against order items
        const validatedItems = [];
        let totalRefundAmount = 0;

        for (const returnItem of itemsToReturn) {
            const orderItem = order.items.find(
                item => item.product.toString() === returnItem.productId
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

            const itemRefundAmount = orderItem.price * returnItem.quantity;
            totalRefundAmount += itemRefundAmount;

            validatedItems.push({
                product: orderItem.product,
                name: orderItem.name,
                price: orderItem.price,
                quantity: returnItem.quantity,
                image: orderItem.image,
                returnReason: returnItem.returnReason || 'admin_initiated', // Should work now with restarted server
                detailedReason: returnItem.detailedReason || reason || 'Return initiated by admin',
                itemCondition: returnItem.itemCondition || 'unknown' // Should work now with restarted server
            });
        }

        // Create return request
        const initialStatus = autoApprove ? 'approved' : 'requested';
        const statusHistory = [
            {
                status: 'requested',
                timestamp: new Date(),
                note: 'Return created by admin'
            }
        ];

        if (autoApprove) {
            statusHistory.push({
                status: 'approved',
                timestamp: new Date(),
                note: 'Auto-approved by admin'
            });
        }

        // Generate return number explicitly to avoid validation errors
        const returnCount = await Return.countDocuments();
        const returnNumber = `RET${Date.now()}${String(returnCount + 1).padStart(4, '0')}`;

        const returnRequest = new Return({
            order: cleanOrderId,
            user: customer._id,
            returnNumber: returnNumber, // Explicitly set return number
            items: validatedItems,
            status: initialStatus,
            returnWindow: {
                orderDate: order.createdAt,
                returnRequestDate: new Date(),
                allowedReturnDays: 30, // Extended window for admin returns
                isWithinWindow: true
            },
            refundDetails: {
                originalAmount: totalRefundAmount,
                returnShippingCost: 0, // Free return shipping
                restockingFee: 0, // No restocking fee
                refundAmount: totalRefundAmount,
                refundMethod: 'original_payment'
            },
            pickup: {
                address: {
                    fullName: order.shippingAddress.fullName,
                    addressLine1: order.shippingAddress.addressLine1,
                    addressLine2: order.shippingAddress.addressLine2,
                    city: order.shippingAddress.city,
                    state: order.shippingAddress.state,
                    postalCode: order.shippingAddress.postalCode,
                    country: order.shippingAddress.country,
                    phone: order.shippingAddress.phone
                },
                specialInstructions: notes || 'Return initiated by admin',
                pickupStatus: pickupRequired ? 'pending' : 'not_required'
            },
            eligibility: {
                isEligible: true,
                eligibilityReason: 'Admin initiated return',
                checkedAt: new Date()
            },
            source: 'admin',
            adminNotes: [{
                note: notes || 'Return created by admin',
                addedBy: decoded.userId,
                addedAt: new Date()
            }],
            statusHistory: statusHistory
        });

        await returnRequest.save();

        // Populate the saved return for response
        const populatedReturn = await Return.findById(returnRequest._id)
            .populate('order', 'orderNumber totalAmount createdAt')
            .populate('user', 'name email');

        // Log the manual return creation
        console.log(`Manual return created: Order ${cleanOrderId}, Customer ${customer.email}, Admin: ${adminUser.email}`);

        return NextResponse.json({
            success: true,
            message: 'Manual return order created successfully',
            data: {
                return: populatedReturn,
                autoApproved: autoApprove,
                pickupRequired: pickupRequired
            }
        });

    } catch (error) {
        console.error('Error creating manual return:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create manual return' },
            { status: 500 }
        );
    }
}