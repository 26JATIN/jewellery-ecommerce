import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(req, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { productId } = params;
        const { quantity } = await req.json();

        await connectDB();
        const cart = await Cart.findOne({ user: decoded.userId });
        
        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        
        const populatedCart = await cart.populate('items.product');
        return NextResponse.json(populatedCart.items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token.value);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { productId } = params;

        await connectDB();
        const cart = await Cart.findOne({ user: decoded.userId });
        
        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        cart.items = cart.items.filter(item => 
            item.product.toString() !== productId
        );

        await cart.save();
        const populatedCart = await cart.populate('items.product');
        return NextResponse.json(populatedCart.items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
    }
}