import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import {
    logOrderCreated,
    logPaymentCaptured,
    logShipmentCreated,
    logShipmentFailed,
    logRefundInitiated,
    logRefundSuccess,
    logRefundFailed,
    logOrderCancelled,
    logManualInterventionRequired
} from '@/lib/transactionLogger';

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

        // Log order creation
        logOrderCreated(order.orderNumber, user.userId, totalAmount, paymentMethod);
        
        // Log payment if already captured
        if (paymentStatus === 'paid' && razorpayPaymentId) {
            logPaymentCaptured(order.orderNumber, razorpayPaymentId, totalAmount);
        }

        // Create Shiprocket order
        try {
            const { createShiprocketOrder, processShipment } = await import('@/lib/shiprocket');
            
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
                billingEmail: shippingAddress.email || user.email || 'customer@nandikajewellers.com',
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

            // Update order with Shiprocket details and mark confirmed
            if (shiprocketResponse.order_id) {
                order.shiprocketOrderId = shiprocketResponse.order_id;
                order.shiprocketShipmentId = shiprocketResponse.shipment_id;
                order.status = 'confirmed';

                // Log shipment creation
                logShipmentCreated(order.orderNumber, shiprocketResponse.order_id, 'Shipment created, processing...');

                // Automatically trigger "Ship Now" (Request AWB)
                try {
                    console.log(`🚚 Processing shipment (Ship Now) for order ${order.orderNumber}...`);
                    const processResponse = await processShipment(shiprocketResponse.shipment_id);
                    console.log(`✅ Ship Now processed for order ${order.orderNumber}:`, processResponse);
                    
                    // Update order notes with Ship Now status
                    order.notes = (order.notes ? order.notes + '\n' : '') + 
                        `[SYSTEM] Shipment processed automatically (Ship Now triggered)`;
                } catch (shipNowError) {
                    console.error(`⚠️ Failed to process Ship Now for order ${order.orderNumber}:`, shipNowError);
                    // Don't fail the order if Ship Now fails - can be done manually
                    order.notes = (order.notes ? order.notes + '\n' : '') + 
                        `[WARNING] Auto Ship Now failed: ${shipNowError.message}. Manual action may be required.`;
                }

                // Persist order
                await order.save();
            }
        } catch (shiprocketError) {
            console.error('Shiprocket order creation failed:', shiprocketError);
            
            // Log shipment failure
            logShipmentFailed(order.orderNumber, shiprocketError, order.paymentStatus);
            
            // CRITICAL: Rollback transaction for online payments
            if (paymentMethod === 'online' && order.paymentStatus === 'paid' && order.razorpayPaymentId) {
                console.log(`⚠️  Initiating automatic refund for order ${order.orderNumber} due to Shiprocket failure`);
                
                // Log refund initiation
                logRefundInitiated(order.orderNumber, order.razorpayPaymentId, order.totalAmount, 'Shiprocket shipment creation failed');
                
                try {
                    const { createRefund } = await import('@/lib/razorpay');
                    
                    // Initiate refund through Razorpay
                    const refund = await createRefund(order.razorpayPaymentId);
                    console.log(`✅ Refund initiated successfully. Refund ID: ${refund.id}`);
                    
                    // Log successful refund
                    logRefundSuccess(order.orderNumber, refund.id, order.totalAmount);
                    
                    // Update order with refund details
                    order.paymentStatus = 'refunded';
                    order.status = 'cancelled';
                    order.notes = (order.notes ? order.notes + '\n' : '') + 
                        `[SYSTEM] Order cancelled - Shiprocket shipment creation failed: ${shiprocketError.message}. ` +
                        `Automatic refund initiated. Refund ID: ${refund.id}. ` +
                        `Refund will be processed to customer's account in 5-7 business days.`;
                    await order.save();
                    
                    // Log order cancellation
                    logOrderCancelled(order.orderNumber, 'Shiprocket failure with auto-refund', true);
                    
                    console.log(`📧 Order ${order.orderNumber} cancelled with automatic refund`);
                    
                    // Don't reduce stock since order failed
                    // Don't clear cart so user can retry
                    
                    return NextResponse.json({ 
                        error: 'Shipment creation failed. Your payment has been refunded automatically.',
                        message: 'We apologize for the inconvenience. Your payment will be refunded to your account within 5-7 business days.',
                        refundId: refund.id,
                        orderNumber: order.orderNumber,
                        refundAmount: order.totalAmount,
                        refundStatus: 'processing'
                    }, { status: 500 });
                    
                } catch (refundError) {
                    console.error('❌ CRITICAL: Failed to refund payment after Shiprocket failure:', refundError);
                    
                    // Log refund failure
                    logRefundFailed(order.orderNumber, order.razorpayPaymentId, order.totalAmount, refundError);
                    
                    // Log manual intervention requirement
                    logManualInterventionRequired(
                        order.orderNumber,
                        'Auto-refund failed after shipment failure',
                        {
                            shiprocketError: shiprocketError.message,
                            refundError: refundError.message,
                            paymentId: order.razorpayPaymentId,
                            amount: order.totalAmount
                        }
                    );
                    
                    // Mark order for urgent manual review
                    order.status = 'cancelled';
                    order.notes = (order.notes ? order.notes + '\n' : '') + 
                        `[URGENT] Shiprocket failed, automatic refund failed. MANUAL REFUND REQUIRED. ` +
                        `Shiprocket Error: ${shiprocketError.message}. Refund Error: ${refundError.message}. ` +
                        `Payment ID: ${order.razorpayPaymentId}. Amount: ₹${order.totalAmount}`;
                    await order.save();
                    
                    // Don't reduce stock
                    // Don't clear cart
                    
                    console.log(`🚨 URGENT: Manual intervention required for order ${order.orderNumber}`);
                    
                    return NextResponse.json({ 
                        error: 'Shipment creation failed and automatic refund encountered an issue.',
                        message: 'Please contact our customer support immediately. Your refund will be processed manually within 24 hours.',
                        orderNumber: order.orderNumber,
                        supportContact: '+91 XXXXX XXXXX',
                        priority: 'urgent'
                    }, { status: 500 });
                }
            }
            
            // For COD orders, just cancel the order
            if (paymentMethod === 'cod') {
                console.log(`⚠️  COD order ${order.orderNumber} - Shiprocket failed, cancelling order`);
                
                order.status = 'cancelled';
                order.notes = (order.notes ? order.notes + '\n' : '') + 
                    `[SYSTEM] Order cancelled - Shiprocket shipment creation failed: ${shiprocketError.message}. ` +
                    `No payment was collected (COD).`;
                await order.save();
                
                // Log order cancellation
                logOrderCancelled(order.orderNumber, 'Shiprocket failure - COD order', false);
                
                // Don't reduce stock
                // Don't clear cart so user can retry
                
                return NextResponse.json({ 
                    error: 'Shipment scheduling failed. Please try again.',
                    message: 'We could not schedule pickup for your order. No payment was collected. Please try placing your order again.',
                    orderNumber: order.orderNumber
                }, { status: 500 });
            }
            
            // Fallback: Mark for admin attention if payment method is unclear
            logManualInterventionRequired(
                order.orderNumber,
                'Shiprocket failure - unclear payment status',
                { error: shiprocketError.message, paymentMethod, paymentStatus: order.paymentStatus }
            );
            
            order.status = 'pending';
            order.notes = (order.notes ? order.notes + '\n' : '') + 
                `[ATTENTION] Shiprocket failed - ${shiprocketError.message}. Admin must verify payment status and handle accordingly.`;
            await order.save();
            
            return NextResponse.json({ 
                error: 'Shipment creation encountered an issue.',
                message: 'Your order is being reviewed. We will contact you shortly.',
                orderNumber: order.orderNumber
            }, { status: 500 });
        }

        // Update stock for each product (only if Shiprocket succeeded)
        console.log(`📦 Updating stock for order ${order.orderNumber}`);
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

        // Clear user's cart (only if order succeeded)
        await Cart.deleteMany({ user: user.userId });
        console.log(`✅ Order ${order.orderNumber} placed successfully`);

        return NextResponse.json({ 
            message: 'Order placed successfully',
            order 
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}