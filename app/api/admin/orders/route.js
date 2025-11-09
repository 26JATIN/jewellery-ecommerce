import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        await connectDB();

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('userId', 'name email')
            .populate('items.productId', 'name images');

        return NextResponse.json({
            orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 });
        }

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await connectDB();
        
        // Get the order before updating
        const oldOrder = await Order.findById(orderId);
        if (!oldOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // If order is being cancelled, restock the inventory
        if (status === 'cancelled' && oldOrder.status !== 'cancelled') {
            console.log('Order being cancelled, restocking inventory...');
            
            for (const item of oldOrder.items) {
                try {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        if (item.selectedVariant && item.selectedVariant.sku) {
                            // Restock variant
                            const variantIndex = product.variants?.findIndex(v => v.sku === item.selectedVariant.sku);
                            if (variantIndex !== -1) {
                                product.variants[variantIndex].stock += item.quantity;
                                console.log(`Restocked variant ${item.selectedVariant.sku}: +${item.quantity}`);
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

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('userId', 'name email')
         .populate('items.productId', 'name images');

        return NextResponse.json({ 
            message: 'Order status updated successfully',
            order 
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
