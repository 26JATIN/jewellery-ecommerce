import connectDB from '@/lib/mongodb';
import ReturnModel from '@/models/Return';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const returnDoc = await ReturnModel.findById(params.id).populate('orderId').populate('userId');
        if (!returnDoc) return NextResponse.json({ error: 'Return not found' }, { status: 404 });

        return NextResponse.json({ success: true, return: returnDoc });
    } catch (error) {
        console.error('Get return error:', error);
        return NextResponse.json({ error: 'Failed to get return', details: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { action } = body;

        await connectDB();
        const returnDoc = await ReturnModel.findById(params.id);
        if (!returnDoc) return NextResponse.json({ error: 'Return not found' }, { status: 404 });

        if (action === 'markRefundComplete') {
            // Mark refund as processed
            returnDoc.refundSucceeded = true;
            returnDoc.refundProcessedAt = new Date();
            returnDoc.status = 'completed';
            await returnDoc.save();

            // Restock inventory when return is completed
            console.log('Return completed, restocking inventory...');
            for (const item of returnDoc.items) {
                try {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        // Check if it's a variant or main product
                        if (item.variant && item.variant.sku) {
                            // Restock variant
                            const variantIndex = product.variants?.findIndex(v => v.sku === item.variant.sku);
                            if (variantIndex !== -1) {
                                product.variants[variantIndex].stock += item.quantity;
                                console.log(`Restocked variant ${item.variant.sku}: +${item.quantity}`);
                            }
                        } else {
                            // Restock main product
                            product.stock += item.quantity;
                            console.log(`Restocked product ${product.name}: +${item.quantity}`);
                        }
                        await product.save();
                    }
                } catch (err) {
                    console.error(`Error restocking product ${item.productId}:`, err);
                }
            }

            // Update related order payment status
            try {
                const order = await Order.findById(returnDoc.orderId);
                if (order) {
                    order.paymentStatus = 'refunded';
                    order.status = 'returned';
                    await order.save();
                }
            } catch (orderError) {
                console.error('Failed to update order for refund:', orderError);
            }

            return NextResponse.json({ success: true, message: 'Refund marked complete', returnId: returnDoc._id });
        }

        // Other admin actions (e.g., update status)
        if (body.status) {
            const oldStatus = returnDoc.status;
            returnDoc.status = body.status;
            
            // Restock inventory when status changes to 'returned_to_seller' or 'received'
            if ((body.status === 'returned_to_seller' || body.status === 'received') && 
                oldStatus !== 'returned_to_seller' && oldStatus !== 'received') {
                console.log('Product received at warehouse, restocking inventory...');
                
                for (const item of returnDoc.items) {
                    try {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            if (item.variant && item.variant.sku) {
                                // Restock variant
                                const variantIndex = product.variants?.findIndex(v => v.sku === item.variant.sku);
                                if (variantIndex !== -1) {
                                    product.variants[variantIndex].stock += item.quantity;
                                    console.log(`Restocked variant ${item.variant.sku}: +${item.quantity}`);
                                }
                            } else {
                                // Restock main product
                                product.stock += item.quantity;
                                console.log(`Restocked product ${product.name}: +${item.quantity}`);
                            }
                            await product.save();
                        }
                    } catch (err) {
                        console.error(`Error restocking product ${item.productId}:`, err);
                    }
                }
            }
            
            await returnDoc.save();
            return NextResponse.json({ success: true, message: 'Return status updated', returnId: returnDoc._id });
        }

        return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
    } catch (error) {
        console.error('Update return error:', error);
        return NextResponse.json({ error: 'Failed to update return', details: error.message }, { status: 500 });
    }
}
