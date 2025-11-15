import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import ReturnModel from '@/models/Return';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createRefund } from '@/lib/razorpay';
import { logRefundSuccess, logRefundFailed, LogLevel, TransactionType } from '@/lib/transactionLogger';

/**
 * Shiprocket Webhook Handler
 * Receives updates from Shiprocket about shipment status
 * 
 * This webhook handles:
 * 1. Order tracking updates (shipment status changes)
 * 2. Return tracking updates (return shipment status changes)
 * 3. Auto-payment for COD orders on delivery
 * 4. Real-time status synchronization with cache revalidation
 */

// Add CORS headers for webhook
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, anx-api-key',
};

export async function OPTIONS(request) {
    return new Response(null, { status: 200, headers: corsHeaders });
}

// GET handler for Shiprocket endpoint verification
export async function GET(request) {
    console.log('🔍 Webhook GET verification at', new Date().toISOString());
    return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
    const requestTime = new Date().toISOString();
    
    console.log('\n' + '='.repeat(80));
    console.log('📦 SHIPROCKET WEBHOOK RECEIVED');
    console.log('⏰ Time:', requestTime);
    console.log('='.repeat(80));
    
    try {
        // Parse webhook body
        const body = await request.json();
        
        console.log('📥 Webhook Payload:');
        console.log(JSON.stringify(body, null, 2));
        console.log('-'.repeat(80));

        // Extract data from webhook
        const {
            order_id,           // e.g., "1373900_150876814" or just order number
            sr_order_id,        // Shiprocket's internal order ID
            shipment_id,
            awb,                // Air Waybill number (tracking number)
            courier_name,
            current_status,
            shipment_status,    // Main status field
            etd,                // Estimated delivery date
            is_return,          // 0 = order, 1 = return shipment
            pod,
            pod_status,
            scans               // Array of tracking scans
        } = body;

        // Validation: Need at least one identifier
        if (!order_id && !sr_order_id && !awb) {
            console.log('⚠️  No identifiers found in webhook');
            return new Response(null, { status: 200, headers: corsHeaders });
        }

        // Connect to database
        await connectDB();
        console.log('✅ Database connected');

        // Determine if this is a return shipment
        const isReturnShipment = is_return === 1 || is_return === '1' || is_return === true;
        
        console.log('📋 Processing:', isReturnShipment ? 'RETURN SHIPMENT' : 'ORDER SHIPMENT');
        console.log('🔍 Looking for:', {
            order_id,
            sr_order_id,
            awb,
            isReturn: isReturnShipment
        });

        if (isReturnShipment) {
            // Handle return shipment update
            await handleReturnUpdate(body);
        } else {
            // Handle order shipment update
            await handleOrderUpdate(body);
        }

        console.log('✅ Webhook processed successfully');
        console.log('='.repeat(80) + '\n');

        // CRITICAL: Shiprocket requires only HTTP 200 with empty body
        return new Response(null, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        console.error('Stack:', error.stack);
        
        // Still return 200 to prevent Shiprocket retries
        return new Response(null, { status: 200, headers: corsHeaders });
    }
}

/**
 * Handle order shipment updates
 */
async function handleOrderUpdate(webhookData) {
    const {
        order_id,
        sr_order_id,
        shipment_id,
        awb,
        courier_name,
        shipment_status,
        current_status,
        etd,
        pod,
        pod_status
    } = webhookData;

    // Build search query to find the order
    // Shiprocket sends order_id in format: "orderNumber_shiprocketOrderId"
    // Or sometimes just the order number
    const searchCriteria = [];
    
    if (sr_order_id) {
        searchCriteria.push({ shiprocketOrderId: String(sr_order_id) });
    }
    
    if (order_id) {
        // Try exact match first
        searchCriteria.push({ shiprocketOrderId: String(order_id) });
        searchCriteria.push({ orderNumber: String(order_id) });
        
        // If order_id contains underscore, try splitting
        if (String(order_id).includes('_')) {
            const parts = String(order_id).split('_');
            searchCriteria.push({ orderNumber: parts[0] });
            searchCriteria.push({ shiprocketOrderId: parts[1] });
        }
    }

    if (awb) {
        searchCriteria.push({ awbCode: awb });
    }

    console.log('🔍 Searching for order with criteria:', searchCriteria);

    const order = await Order.findOne({ $or: searchCriteria });

    if (!order) {
        console.log('⚠️  Order not found. Searched with:', { order_id, sr_order_id, awb });
        return;
    }

    console.log('✅ Found order:', order.orderNumber);
    console.log('📦 Current order status:', order.status);

    // Update Shiprocket tracking fields
    let updated = false;
    
    if (shipment_id && order.shiprocketShipmentId !== String(shipment_id)) {
        order.shiprocketShipmentId = String(shipment_id);
        updated = true;
        console.log('📝 Updated shipment ID:', shipment_id);
    }
    
    if (awb && order.awbCode !== awb) {
        order.awbCode = awb;
        updated = true;
        console.log('📝 Updated AWB:', awb);
    }
    
    if (courier_name && order.courierName !== courier_name) {
        order.courierName = courier_name;
        updated = true;
        console.log('📝 Updated courier:', courier_name);
    }
    
    if (etd && order.estimatedDeliveryDate !== etd) {
        order.estimatedDeliveryDate = etd;
        updated = true;
        console.log('📝 Updated ETA:', etd);
    }

    // Map Shiprocket status to internal order status
    const statusMapping = {
        'MANIFEST GENERATED': 'confirmed',
        'PENDING PICKUP': 'confirmed',
        'PICKED UP': 'processing',
        'SHIPPED': 'shipped',
        'IN TRANSIT': 'shipped',
        'OUT FOR DELIVERY': 'shipped',
        'DELIVERED': 'delivered',
        'CANCELED': 'cancelled',
        'CANCELLED': 'cancelled',
        'RTO': 'cancelled',
        'RTO DELIVERED': 'cancelled',
        'RETURNED': 'returned',
        'RETURNED TO SENDER': 'returned',
        'RETURN TO ORIGIN': 'returned',
        'LOST': 'cancelled',
        'DAMAGED': 'cancelled'
    };

    const receivedStatus = (shipment_status || current_status || '').toUpperCase().trim();
    console.log('📊 Received status:', receivedStatus);
    console.log('📋 Current order status:', order.status);
    console.log('💳 Payment method:', order.paymentMethod);
    console.log('💰 Payment status:', order.paymentStatus);
    console.log('🔄 Refund status:', order.refundStatus);

    if (receivedStatus && statusMapping[receivedStatus]) {
        const newStatus = statusMapping[receivedStatus];
        console.log('🎯 Mapped to internal status:', newStatus);
        
        if (order.status !== newStatus) {
            const oldStatus = order.status;
            order.status = newStatus;
            updated = true;
            console.log(`🔄 Status changed: ${oldStatus} → ${newStatus}`);
            
            // Auto-mark COD orders as paid when delivered
            if (newStatus === 'delivered' && 
                order.paymentMethod === 'cod' && 
                order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                console.log('💰 COD payment marked as received');
            }

            // =============================================
            // AUTOMATIC REFUND ON SHIPMENT CANCELLATION
            // =============================================
            if (newStatus === 'cancelled') {
                console.log('🚨 Detected cancellation! Old status was:', oldStatus);
                console.log('\n' + '🚨'.repeat(30));
                console.log('🚨 SHIPMENT CANCELLED - Checking refund eligibility');
                console.log('🚨'.repeat(30));
                
                // Check if refund is needed
                const needsRefund = (
                    order.paymentMethod === 'online' && 
                    order.paymentStatus === 'paid' &&
                    order.refundStatus !== 'completed' &&
                    order.razorpayPaymentId
                );

                console.log('🔍 Refund eligibility check:');
                console.log('   - Payment Method:', order.paymentMethod, '(need: online)');
                console.log('   - Payment Status:', order.paymentStatus, '(need: paid)');
                console.log('   - Refund Status:', order.refundStatus, '(need: NOT completed)');
                console.log('   - Payment ID:', order.razorpayPaymentId ? 'EXISTS' : 'MISSING');
                console.log('   - RESULT:', needsRefund ? '✅ QUALIFIES' : '❌ DOES NOT QUALIFY');

                if (needsRefund) {
                    console.log('💰 Order qualifies for automatic refund:');
                    console.log('   - Payment Method: online');
                    console.log('   - Payment Status: paid');
                    console.log('   - Refund Status:', order.refundStatus || 'none');
                    console.log('   - Payment ID:', order.razorpayPaymentId);
                    
                    // Check environment flag
                    const autoRefundEnabled = process.env.SHIPROCKET_FAILURE_AUTO_REFUND === 'true';
                    
                    if (autoRefundEnabled) {
                        console.log('✅ AUTO_REFUND enabled - Processing refund...');
                        
                        try {
                            // Initiate refund via Razorpay
                            const refund = await createRefund(order.razorpayPaymentId);
                            
                            // Update order with refund details
                            order.refundStatus = 'completed';
                            order.refundAmount = order.totalAmount;
                            order.refundDate = new Date();
                            order.razorpayRefundId = refund.id;
                            order.notes = order.notes || '';
                            order.notes += `\n[${new Date().toISOString()}] Automatic refund initiated due to shipment cancellation. Refund ID: ${refund.id}`;
                            
                            updated = true; // Mark as updated to trigger save
                            
                            console.log('✅ Refund successful!');
                            console.log('   - Refund ID:', refund.id);
                            console.log('   - Amount:', order.totalAmount);
                            console.log('   - Status:', refund.status);
                            
                            // Log successful refund
                            logRefundSuccess(
                                order.orderNumber,
                                refund.id,
                                order.totalAmount
                            );

                            // =============================================
                            // RESTORE STOCK TO INVENTORY
                            // =============================================
                            console.log('\n📦 Restoring stock to inventory...');
                            try {
                                for (const item of order.items) {
                                    const product = await Product.findById(item.productId);
                                    
                                    if (!product) {
                                        console.log(`⚠️  Product not found: ${item.productId}`);
                                        continue;
                                    }

                                    // Check if product has variants
                                    if (product.hasVariants && item.selectedVariant) {
                                        // Find the specific variant
                                        const variantIndex = product.variants.findIndex(v => 
                                            v.sku === item.selectedVariant.sku || 
                                            JSON.stringify(v.optionCombination) === JSON.stringify(item.selectedVariant.optionCombination)
                                        );

                                        if (variantIndex !== -1) {
                                            product.variants[variantIndex].stock += item.quantity;
                                            console.log(`✅ Restored ${item.quantity}x ${product.name} (Variant: ${item.selectedVariant.name || 'SKU: ' + item.selectedVariant.sku}) - New stock: ${product.variants[variantIndex].stock}`);
                                        } else {
                                            console.log(`⚠️  Variant not found for: ${product.name}`);
                                        }
                                    } else {
                                        // Simple product without variants
                                        product.stock += item.quantity;
                                        console.log(`✅ Restored ${item.quantity}x ${product.name} - New stock: ${product.stock}`);
                                    }

                                    await product.save();
                                }
                                
                                console.log('✅ Stock restoration completed');
                                order.notes += `\n[${new Date().toISOString()}] Stock restored to inventory`;
                                
                            } catch (stockError) {
                                console.error('❌ Stock restoration failed:', stockError);
                                order.notes += `\n[${new Date().toISOString()}] WARNING: Stock restoration failed. Manual adjustment required.`;
                            }
                            
                        } catch (refundError) {
                            console.error('❌ REFUND FAILED:', refundError);
                            console.error('Stack:', refundError.stack);
                            
                            // Mark refund as failed
                            order.refundStatus = 'failed';
                            order.notes = order.notes || '';
                            order.notes += `\n[${new Date().toISOString()}] CRITICAL: Automatic refund failed for cancelled shipment. Error: ${refundError.message}. MANUAL INTERVENTION REQUIRED.`;
                            
                            updated = true; // Mark as updated to trigger save
                            
                            // Log failed refund
                            logRefundFailed(
                                order.orderNumber,
                                order.razorpayPaymentId,
                                order.totalAmount,
                                refundError
                            );
                            
                            console.log('⚠️  Order marked as requiring manual refund processing');
                        }
                    } else {
                        console.log('⚠️  AUTO_REFUND disabled - Manual refund required');
                        order.notes = order.notes || '';
                        order.notes += `\n[${new Date().toISOString()}] Shipment cancelled. Manual refund required for payment ID: ${order.razorpayPaymentId}`;
                        updated = true; // Mark as updated to trigger save
                    }
                } else {
                    console.log('ℹ️  No refund needed:');
                    console.log('   - Payment Method:', order.paymentMethod);
                    console.log('   - Payment Status:', order.paymentStatus);
                    console.log('   - Refund Status:', order.refundStatus || 'none');
                    console.log('   - Payment ID:', order.razorpayPaymentId || 'none');
                }
            }
        } else {
            console.log('ℹ️  Status unchanged:', order.status);
        }
    }

    if (updated) {
        await order.save();
        console.log('💾 Order saved to database');
        
        // Revalidate order pages to show updates immediately
        try {
            revalidatePath('/admin/orders');
            revalidatePath(`/orders/${order.orderNumber}`);
            revalidatePath('/orders');
            console.log('🔄 Cache revalidated for order pages');
        } catch (revalError) {
            console.log('⚠️  Cache revalidation failed:', revalError.message);
        }
    } else {
        console.log('ℹ️  No changes to save');
    }
}

/**
 * Handle return shipment updates
 */
async function handleReturnUpdate(webhookData) {
    const {
        order_id,
        sr_order_id,
        shipment_id,
        awb,
        courier_name,
        shipment_status,
        current_status,
        etd
    } = webhookData;

    console.log('🔙 Processing return shipment update');

    // Find return by AWB or shipment ID
    let returnDoc = null;

    // Try to find by shipment_id FIRST (most reliable for returns)
    if (shipment_id) {
        returnDoc = await ReturnModel.findOne({ shiprocketReturnShipmentId: String(shipment_id) });
        if (returnDoc) {
            console.log('✅ Found return by shipment ID:', shipment_id);
        }
    }

    // Then try AWB if not found
    if (!returnDoc && awb) {
        returnDoc = await ReturnModel.findOne({ shiprocketReturnAwb: awb });
        if (returnDoc) {
            console.log('✅ Found return by AWB:', awb);
        }
    }

    // If not found by tracking info, try to find by order
    if (!returnDoc && (order_id || sr_order_id)) {
        // For returns, Shiprocket sends order_id like "RETURN-ORD17626375923710012"
        // Extract the actual order number by removing "RETURN-" prefix
        let actualOrderId = order_id;
        if (order_id && order_id.startsWith('RETURN-')) {
            actualOrderId = order_id.replace('RETURN-', '');
            console.log('📋 Extracted order number from return:', actualOrderId);
        }
        
        const order = await Order.findOne({
            $or: [
                { shiprocketOrderId: String(sr_order_id) },
                { orderNumber: String(actualOrderId) },
                { shiprocketOrderId: String(actualOrderId) },
                { orderNumber: String(order_id) }
            ]
        });

        if (order) {
            returnDoc = await ReturnModel.findOne({ orderId: order._id });
            if (returnDoc) {
                console.log('✅ Found return by order:', order.orderNumber);
            }
        }
    }

    if (!returnDoc) {
        console.log('⚠️  Return not found for:', { order_id, sr_order_id, awb, shipment_id });
        return;
    }

    console.log('✅ Found return:', returnDoc.returnNumber);
    console.log('📦 Current return status:', returnDoc.status);

    // Update return tracking fields
    let updated = false;

    if (shipment_id && returnDoc.shiprocketReturnShipmentId !== String(shipment_id)) {
        returnDoc.shiprocketReturnShipmentId = String(shipment_id);
        updated = true;
        console.log('📝 Updated return shipment ID:', shipment_id);
    }

    if (awb && returnDoc.shiprocketReturnAwb !== awb) {
        returnDoc.shiprocketReturnAwb = awb;
        updated = true;
        console.log('📝 Updated return AWB:', awb);
    }

    if (courier_name && returnDoc.courierName !== courier_name) {
        returnDoc.courierName = courier_name;
        updated = true;
        console.log('📝 Updated return courier:', courier_name);
    }    if (etd && returnDoc.estimatedPickupDate !== etd) {
        returnDoc.estimatedPickupDate = etd;
        updated = true;
        console.log('📝 Updated return ETA:', etd);
    }

    // Map Shiprocket return status to internal return status
    const returnStatusMapping = {
        'MANIFEST GENERATED': 'pickup_scheduled',
        'PENDING PICKUP': 'pickup_scheduled',
        'PICKED UP': 'in_transit',
        'SHIPPED': 'in_transit',
        'IN TRANSIT': 'in_transit',
        'OUT FOR DELIVERY': 'in_transit',
        'DELIVERED': 'returned_to_seller',
        'CANCELED': 'cancelled',
        'CANCELLED': 'cancelled',
        'RTO': 'cancelled',
        'RTO DELIVERED': 'cancelled',
        'LOST': 'cancelled',
        'DAMAGED': 'cancelled'
    };

    const receivedStatus = (shipment_status || current_status || '').toUpperCase().trim();
    console.log('📊 Received return status:', receivedStatus);

    let newStatus = null;
    if (receivedStatus) {
        if (returnStatusMapping[receivedStatus]) {
            newStatus = returnStatusMapping[receivedStatus];
        } else if (receivedStatus.includes('CANCEL')) {
            // Catch variations like 'CANCELLED', 'CANCELED', 'Return cancelled', etc.
            newStatus = 'cancelled';
        } else if (receivedStatus.includes('RTO')) {
            newStatus = 'cancelled';
        }
    }

    if (newStatus) {
        
    if (returnDoc.status !== newStatus) {
            const oldStatus = returnDoc.status;
            returnDoc.status = newStatus;
            updated = true;
            console.log(`🔄 Return status changed: ${oldStatus} → ${newStatus}`);

            // Mark refund requested when returned to seller
            if (newStatus === 'returned_to_seller' && !returnDoc.refundRequestedAt) {
                returnDoc.refundRequestedAt = new Date();
                console.log('💰 Return delivered to seller - refund process triggered');
            }
        } else {
            console.log('ℹ️  Return status unchanged:', returnDoc.status);
        }
    }

    if (updated) {
        await returnDoc.save();
        console.log('💾 Return saved to database');
        
        // Revalidate return and related pages to show updates immediately
        try {
            // Admin list and public returns list
            revalidatePath('/admin/returns');
            revalidatePath('/returns');

            // If this return is linked to an order, revalidate the order page too
            if (returnDoc.orderId) {
                try {
                    const order = await (await import('@/models/Order')).default.findById(returnDoc.orderId).select('orderNumber');
                    if (order && order.orderNumber) {
                        revalidatePath(`/orders/${order.orderNumber}`);
                    }
                } catch (ordErr) {
                    console.log('⚠️  Failed to revalidate linked order page:', ordErr.message);
                }
            }

            // Generic orders list
            revalidatePath('/orders');
            console.log('🔄 Cache revalidated for return and related pages');
        } catch (revalError) {
            console.log('⚠️  Cache revalidation failed:', revalError.message);
        }
    } else {
        console.log('ℹ️  No changes to save');
    }
}
