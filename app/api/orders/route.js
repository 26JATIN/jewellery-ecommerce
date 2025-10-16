import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Return from '@/models/Return';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET: Fetch user orders with filtering options
export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const returnEligible = searchParams.get('returnEligible') === 'true';
        const limit = parseInt(searchParams.get('limit')) || 20;

        await connectDB();

        let query = { user: decoded.userId };
        
        // If looking for return-eligible orders
        if (returnEligible) {
            // Include all orders except cancelled ones
            query.status = { $ne: 'cancelled' };
        } else if (status) {
            // Filter by specific status
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);

        // If fetching for returns, filter out orders that already have active returns
        if (returnEligible) {
            const orderIds = orders.map(order => order._id);
            
            // Find orders that already have active return requests
            const existingReturns = await Return.find({
                order: { $in: orderIds },
                status: { $nin: ['cancelled', 'completed'] }
            }).distinct('order');

            // Filter out orders with existing returns
            const eligibleOrders = orders.filter(order => 
                !existingReturns.some(returnOrderId => 
                    returnOrderId.toString() === order._id.toString()
                )
            );

            return NextResponse.json({
                success: true,
                orders: eligibleOrders,
                total: eligibleOrders.length
            });
        }

        return NextResponse.json({
            success: true,
            orders,
            total: orders.length
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

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

        const { items, shippingAddress, paymentMethod, totalAmount, coupon } = await req.json();

        await connectDB();

        // Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        // SERVER-SIDE VALIDATION: Calculate actual cart total and check stock
        // Extract product IDs properly (handle both string and object formats)
        const productIds = items.map(item => {
            const productId = item.product || item.productId || item.id || item._id;
            // Convert to string if it's an object
            return typeof productId === 'object' && productId._id 
                ? productId._id.toString()
                : productId?.toString();
        }).filter(Boolean); // Remove any undefined/null values
        
        if (productIds.length === 0) {
            return NextResponse.json(
                { error: 'Invalid cart items: No product IDs found' },
                { status: 400 }
            );
        }
        
        const products = await Product.find({ _id: { $in: productIds } });
        
        // Check stock availability first
        const stockErrors = [];
        const notFoundProducts = [];
        
        for (const item of items) {
            const productId = item.product || item.productId || item.id || item._id;
            const productIdString = typeof productId === 'object' && productId._id 
                ? productId._id.toString()
                : productId?.toString();
                
            const product = products.find(p => p._id.toString() === productIdString);
            
            if (!product) {
                notFoundProducts.push({
                    name: item.name || 'Unknown Product',
                    id: productIdString,
                    originalItem: item
                });
                continue;
            }
            
            // Validate stock availability
            if (product.stock < item.quantity) {
                stockErrors.push({
                    productName: product.name,
                    requested: item.quantity,
                    available: product.stock
                });
            }
        }
        
        // If products not found, return detailed error
        if (notFoundProducts.length > 0) {
            console.error('Products not found:', notFoundProducts);
            return NextResponse.json(
                { 
                    error: `${notFoundProducts.length} product(s) not found in database`,
                    details: notFoundProducts.map(p => `${p.name} (ID: ${p.id})`).join(', '),
                    notFoundProducts: notFoundProducts
                },
                { status: 404 }
            );
        }
        
        // If any stock issues, return error
        if (stockErrors.length > 0) {
            return NextResponse.json(
                { 
                    error: 'Insufficient stock for some items',
                    stockErrors: stockErrors 
                },
                { status: 400 }
            );
        }
        
        let calculatedTotal = 0;
        const enrichedItems = items.map(item => {
            const productId = item.product || item.productId || item.id || item._id;
            const productIdString = typeof productId === 'object' && productId._id 
                ? productId._id.toString()
                : productId?.toString();
                
            const product = products.find(p => p._id.toString() === productIdString);
            if (!product) {
                // This shouldn't happen as we already checked above
                throw new Error(`Product ${item.name || productIdString} not found`);
            }
            const itemTotal = (product.sellingPrice || product.price) * item.quantity;
            calculatedTotal += itemTotal;
            
            return {
                product: product._id,
                name: product.name,
                price: product.sellingPrice || product.price,
                quantity: item.quantity,
                image: product.image || product.images?.[0]?.url
            };
        });

        // SERVER-SIDE VALIDATION: Verify coupon discount if applied
        let validatedCouponData = null;
        if (coupon && coupon.code) {
            const couponDoc = await Coupon.findOne({ 
                code: coupon.code.toUpperCase(),
                isActive: true 
            });

            if (!couponDoc) {
                return NextResponse.json(
                    { error: 'Invalid coupon code' },
                    { status: 400 }
                );
            }

            // Validate coupon is currently valid
            if (!couponDoc.isCurrentlyValid) {
                return NextResponse.json(
                    { error: 'Coupon has expired or is not yet active' },
                    { status: 400 }
                );
            }

            // Check user usage limit
            if (!couponDoc.canUserUseCoupon(decoded.userId)) {
                return NextResponse.json(
                    { error: 'You have already used this coupon the maximum number of times' },
                    { status: 400 }
                );
            }

            // Calculate discount server-side
            const enrichedCartItems = enrichedItems.map(item => {
                const product = products.find(p => p._id.toString() === item.product.toString());
                return {
                    ...item,
                    category: product?.category
                };
            });

            const discountResult = couponDoc.calculateDiscount(enrichedCartItems, calculatedTotal);

            if (!discountResult.valid) {
                return NextResponse.json(
                    { error: discountResult.error },
                    { status: 400 }
                );
            }

            // Verify the discount matches what frontend sent (prevent tampering)
            const sentDiscount = parseFloat(coupon.discountAmount || 0);
            const calculatedDiscount = parseFloat(discountResult.discountAmount);
            
            if (Math.abs(sentDiscount - calculatedDiscount) > 0.01) {
                console.error(`Discount mismatch: Frontend sent ${sentDiscount}, server calculated ${calculatedDiscount}`);
                return NextResponse.json(
                    { error: 'Discount calculation mismatch. Please try again.' },
                    { status: 400 }
                );
            }

            // Verify final total
            const expectedTotal = discountResult.finalTotal;
            if (Math.abs(totalAmount - expectedTotal) > 0.01) {
                console.error(`Total mismatch: Frontend sent ${totalAmount}, server calculated ${expectedTotal}`);
                return NextResponse.json(
                    { error: 'Order total mismatch. Please refresh and try again.' },
                    { status: 400 }
                );
            }

            validatedCouponData = {
                code: couponDoc.code,
                discountAmount: discountResult.discountAmount,
                originalTotal: calculatedTotal,
                appliedAt: new Date()
            };
        } else {
            // No coupon - verify total matches cart total
            if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
                console.error(`Total mismatch without coupon: Frontend sent ${totalAmount}, server calculated ${calculatedTotal}`);
                return NextResponse.json(
                    { error: 'Order total mismatch. Please refresh and try again.' },
                    { status: 400 }
                );
            }
        }

        // Create order with validated data
        const orderData = {
            user: decoded.userId,
            items: enrichedItems, // Use enriched items with validated prices
            shippingAddress,
            paymentMethod,
            totalAmount,
            status: 'pending'
        };

        // Add validated coupon data if provided
        if (validatedCouponData) {
            orderData.coupon = validatedCouponData;
        }

        const order = new Order(orderData);

        await order.save();
        
        // Decrement stock for all ordered items (atomic operation)
        for (const item of enrichedItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
            console.log(`Decremented stock for product ${item.product} by ${item.quantity}`);
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}