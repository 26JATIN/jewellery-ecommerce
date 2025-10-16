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

        // Validate quantity
        if (!quantity || quantity < 1) {
            return NextResponse.json(
                { error: 'Quantity must be at least 1' },
                { status: 400 }
            );
        }

        await connectDB();
        
        // Use atomic $set operation to update quantity
        const cart = await Cart.findOneAndUpdate(
            { 
                user: decoded.userId,
                'items.product': productId 
            },
            { 
                $set: { 'items.$.quantity': quantity } 
            },
            { new: true }
        ).populate('items.product');
        
        if (!cart) {
            return NextResponse.json({ error: 'Cart or item not found' }, { status: 404 });
        }

        return NextResponse.json(cart.items);
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
        
        // Use atomic $pull operation to remove item
        const cart = await Cart.findOneAndUpdate(
            { user: decoded.userId },
            { $pull: { items: { product: productId } } },
            { new: true }
        ).populate('items.product');
        
        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        return NextResponse.json(cart.items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
    }
}