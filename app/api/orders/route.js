import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const orders = await Order.find({ userId: user.userId })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name images');

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            items, 
            shippingAddress, 
            notes, 
            paymentMethod = 'cod',
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
            !shippingAddress.addressLine1 || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.pincode) {
            return NextResponse.json({ error: 'Complete shipping address required' }, { status: 400 });
        }

        if (!['cod', 'online'].includes(paymentMethod)) {
            return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
        }

        await connectDB();

        // Validate stock for each item
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json({ 
                    error: `Product ${item.name} not found` 
                }, { status: 404 });
            }

            // Check stock
            if (item.selectedVariant && product.hasVariants) {
                const variant = product.variants.find(
                    v => v.name === item.selectedVariant.name && v.value === item.selectedVariant.value
                );
                if (!variant) {
                    return NextResponse.json({ 
                        error: `Variant not found for ${item.name}` 
                    }, { status: 400 });
                }
                if (variant.stock < item.quantity) {
                    return NextResponse.json({ 
                        error: `Insufficient stock for ${item.name} - ${item.selectedVariant.value}` 
                    }, { status: 400 });
                }
            } else {
                if (product.stock < item.quantity) {
                    return NextResponse.json({ 
                        error: `Insufficient stock for ${item.name}` 
                    }, { status: 400 });
                }
            }
        }

        // Calculate total
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Determine payment status based on method
        let paymentStatus = 'pending';
        if (paymentMethod === 'online' && razorpayPaymentId) {
            paymentStatus = 'paid';
        }

        // Create order
        const order = new Order({
            userId: user.userId,
            items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                price: item.price,
                selectedVariant: item.selectedVariant
            })),
            shippingAddress,
            totalAmount,
            paymentMethod,
            paymentStatus,
            notes,
            status: 'pending',
            ...(razorpayOrderId && { razorpayOrderId }),
            ...(razorpayPaymentId && { razorpayPaymentId }),
            ...(razorpaySignature && { razorpaySignature }),
            ...(paymentStatus === 'paid' && { paidAt: new Date() }),
        });

        await order.save();

        // Create Shiprocket order
        try {
            const { createShiprocketOrder, getAvailableCouriers, generateAWB } = await import('@/lib/shiprocket');
            
            // Prepare order items for Shiprocket
            const shiprocketItems = items.map(item => ({
                name: item.name,
                sku: item.selectedVariant?.sku || `PROD-${item.productId}`,
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: '',
            }));

            // Calculate total weight (assuming 50g per item, adjust as needed)
            const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.05), 0);

            const shiprocketData = {
                orderNumber: order.orderNumber,
                orderDate: new Date().toISOString().split('T')[0],
                billingCustomerName: shippingAddress.fullName,
                billingAddress: shippingAddress.addressLine1 + (shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''),
                billingCity: shippingAddress.city,
                billingPincode: shippingAddress.pincode,
                billingState: shippingAddress.state,
                billingEmail: user.email || 'customer@nandikajewellers.com',
                billingPhone: shippingAddress.phone,
                shippingCustomerName: shippingAddress.fullName,
                shippingAddress: shippingAddress.addressLine1 + (shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''),
                shippingCity: shippingAddress.city,
                shippingPincode: shippingAddress.pincode,
                shippingState: shippingAddress.state,
                orderItems: shiprocketItems,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
                subTotal: totalAmount,
                weight: totalWeight,
                length: 15,
                breadth: 15,
                height: 10,
            };

            const shiprocketResponse = await createShiprocketOrder(shiprocketData);

            // Update order with Shiprocket details
            if (shiprocketResponse.order_id) {
                order.shiprocketOrderId = shiprocketResponse.order_id;
                order.shiprocketShipmentId = shiprocketResponse.shipment_id;
                order.status = 'confirmed';

                // Get pickup pincode from environment or config
                const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110001';
                
                // Get available couriers and find the cheapest one
                try {
                    const codAmount = paymentMethod === 'cod' ? totalAmount : 0;
                    const couriersResponse = await getAvailableCouriers(
                        pickupPincode,
                        shippingAddress.pincode,
                        totalWeight,
                        codAmount
                    );

                    if (couriersResponse.data?.available_courier_companies?.length > 0) {
                        // Sort by total charge (rate) to find cheapest
                        const sortedCouriers = couriersResponse.data.available_courier_companies.sort(
                            (a, b) => a.rate - b.rate
                        );
                        
                        const cheapestCourier = sortedCouriers[0];
                        console.log(`Selected cheapest courier: ${cheapestCourier.courier_name} - ₹${cheapestCourier.rate}`);

                        // Generate AWB with the cheapest courier
                        try {
                            const awbResponse = await generateAWB(
                                shiprocketResponse.shipment_id,
                                cheapestCourier.courier_company_id
                            );

                            if (awbResponse.awb_code) {
                                order.awbCode = awbResponse.awb_code;
                                order.courierName = cheapestCourier.courier_name;
                                console.log(`AWB generated: ${awbResponse.awb_code} for order ${order.orderNumber}`);
                            }
                        } catch (awbError) {
                            console.error('Failed to generate AWB:', awbError);
                        }
                    }
                } catch (courierError) {
                    console.error('Failed to get available couriers:', courierError);
                }

                await order.save();
            }
        } catch (shiprocketError) {
            console.error('Shiprocket order creation failed:', shiprocketError);
            // Don't fail the entire order if Shiprocket fails
            // Admin can manually create shipment later
        }

        // Update stock for each product
        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (item.selectedVariant && product.hasVariants) {
                const variantIndex = product.variants.findIndex(
                    v => v.sku === item.selectedVariant.sku
                );
                if (variantIndex !== -1) {
                    product.variants[variantIndex].stock -= item.quantity;
                }
            } else {
                product.stock -= item.quantity;
            }

            await product.save();
        }

        // Clear user's cart
        await Cart.deleteMany({ user: user.userId });

        return NextResponse.json({ 
            message: 'Order placed successfully',
            order 
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}