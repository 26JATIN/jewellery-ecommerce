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
        if (!productId || !product.name || !product.price) {
            return NextResponse.json(
                { error: 'Invalid product data. Missing required fields.' }, 
                { status: 400 }
            );
        }

        await connectDB();

        let cart = await Cart.findOne({ user: decoded.userId });
        
        const cartItem = {
            product: productId.toString(),
            name: product.name,
            price: product.sellingPrice || product.price,
            image: product.image,
            quantity: 1
        };
        
        if (!cart) {
            cart = new Cart({
                user: decoded.userId,
                items: [cartItem]
            });
        } else {
            const existingItemIndex = cart.items.findIndex(
                item => item.product === productId.toString()
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += 1;
            } else {
                cart.items.push(cartItem);
            }
        }

        await cart.save();

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