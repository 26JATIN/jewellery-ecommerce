import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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

        // SERVER-SIDE VALIDATION: Calculate actual cart total
        const productIds = items.map(item => item.product || item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        
        let calculatedTotal = 0;
        const enrichedItems = items.map(item => {
            const product = products.find(p => p._id.toString() === (item.product || item.productId).toString());
            if (!product) {
                throw new Error(`Product not found: ${item.product || item.productId}`);
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

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}