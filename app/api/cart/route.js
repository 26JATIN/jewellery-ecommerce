import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Cart from '@/models/Cart';
import connectDB from '@/lib/mongodb';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        const cart = await Cart.findOne({ user: decoded.userId });

        return NextResponse.json(cart || { items: [] });
    } catch (error) {
        console.error('Cart fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' }, 
                { status: 401 }
            );
        }

        const { product } = await req.json();
        if (!product) {
            return NextResponse.json(
                { error: 'Product data is required' }, 
                { status: 400 }
            );
        }

        // Validate required product fields
        const productId = product._id || product.id;
        if (!productId || !product.name || !product.sellingPrice) {
            return NextResponse.json(
                { error: 'Invalid product data. Missing required fields (id, name, sellingPrice).' }, 
                { status: 400 }
            );
        }

        await connectDB();

        let cart = await Cart.findOne({ user: decoded.userId });
        
        const cartItem = {
            product: productId, // Store as ObjectId (mongoose will convert)
            name: product.name,
            price: product.sellingPrice,
            image: product.image,
            quantity: 1
        };
        
        // Use atomic operations to prevent race conditions
        if (!cart) {
            // Create new cart
            cart = await Cart.create({
                user: decoded.userId,
                items: [cartItem]
            });
        } else {
            // Check if item already exists
            const existingItem = cart.items.find(
                item => item.product.toString() === productId.toString()
            );

            if (existingItem) {
                // Use atomic $inc to increment quantity
                cart = await Cart.findOneAndUpdate(
                    { 
                        user: decoded.userId,
                        'items.product': productId 
                    },
                    { 
                        $inc: { 'items.$.quantity': 1 } 
                    },
                    { new: true }
                );
            } else {
                // Use atomic $push to add new item
                cart = await Cart.findOneAndUpdate(
                    { user: decoded.userId },
                    { $push: { items: cartItem } },
                    { new: true }
                );
            }
        }

        // Populate product details for response
        await cart.populate('items.product');

        return NextResponse.json({ 
            items: cart.items,
            message: 'Cart updated successfully' 
        });
    } catch (error) {
        console.error('Cart update error:', error);
        return NextResponse.json(
            { error: 'Failed to update cart' }, 
            { status: 500 }
        );
    }
}