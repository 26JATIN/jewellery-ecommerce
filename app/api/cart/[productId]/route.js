import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

        const { productId } = await params;
        const { quantity } = await req.json();

        console.log('PATCH /api/cart/[productId] - Request:', {
            productId,
            quantity,
            userId: decoded.userId
        });

        // Validate quantity
        if (!quantity || quantity < 1) {
            return NextResponse.json(
                { error: 'Quantity must be at least 1' },
                { status: 400 }
            );
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid product ID format:', productId);
            return NextResponse.json(
                { error: 'Invalid product ID format' },
                { status: 400 }
            );
        }

        await connectDB();
        
        // First check if cart exists
        const existingCart = await Cart.findOne({ user: decoded.userId });
        if (!existingCart) {
            console.error('Cart not found for user:', decoded.userId);
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        console.log('Cart items:', existingCart.items.map(item => ({
            product: item.product.toString(),
            quantity: item.quantity
        })));

        // Convert productId to ObjectId for matching
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // Check if product exists in cart
        const itemIndex = existingCart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            console.error('Product not found in cart:', productId);
            return NextResponse.json({ error: 'Product not found in cart' }, { status: 404 });
        }
        
        console.log('Found item at index:', itemIndex, 'Current quantity:', existingCart.items[itemIndex].quantity);
        
        // Update the quantity directly on the found item
        existingCart.items[itemIndex].quantity = quantity;
        
        // Save the cart
        await existingCart.save();
        
        // Populate and return
        await existingCart.populate('items.product');
        
        console.log('Cart updated successfully, items count:', existingCart.items.length);

        return NextResponse.json(existingCart.items);
    } catch (error) {
        console.error('Error updating cart:', error);
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

        const { productId } = await params;

        console.log('DELETE /api/cart/[productId] - Request:', {
            productId,
            userId: decoded.userId
        });

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid product ID format:', productId);
            return NextResponse.json(
                { error: 'Invalid product ID format' },
                { status: 400 }
            );
        }

        await connectDB();
        
        // First check if cart exists
        const existingCart = await Cart.findOne({ user: decoded.userId });
        if (!existingCart) {
            console.error('Cart not found for user:', decoded.userId);
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        console.log('Cart before deletion:', existingCart.items.length, 'items');
        console.log('Looking for product:', productId);
        console.log('Existing items:', existingCart.items.map(item => ({
            product: item.product.toString(),
            productType: typeof item.product,
            matches: item.product.toString() === productId
        })));

        // Convert productId to ObjectId for proper matching
        const productObjectId = new mongoose.Types.ObjectId(productId);
        
        console.log('Attempting to pull product ObjectId:', productObjectId.toString());

        // Use atomic $pull operation to remove item - match by ObjectId
        // Don't populate yet - do it after successful deletion
        const cart = await Cart.findOneAndUpdate(
            { user: decoded.userId },
            { $pull: { items: { product: productObjectId } } },
            { new: true }
        );
        
        if (!cart) {
            console.error('Cart update returned null');
            return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
        }
        
        console.log('Cart after deletion:', cart.items.length, 'items');
        
        // If $pull didn't work (items count didn't change), try manual filter
        if (cart.items.length === existingCart.items.length) {
            console.log('$pull failed, trying manual removal');
            const filteredItems = existingCart.items.filter(
                item => item.product.toString() !== productId
            );
            
            if (filteredItems.length === existingCart.items.length) {
                console.error('Item not found in cart after both methods');
                // Still try to populate and return current state
                await cart.populate('items.product');
                return NextResponse.json({
                    success: false,
                    items: cart.items,
                    message: 'Item not found in cart'
                }, { status: 404 });
            }
            
            // Manually update cart with filtered items
            cart.items = filteredItems;
            await cart.save();
            console.log('Manual removal successful, new count:', cart.items.length);
        }
        
        // Now populate - if product doesn't exist, it will be null but won't fail
        await cart.populate('items.product');

        return NextResponse.json({
            success: true,
            items: cart.items,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        return NextResponse.json({ 
            error: 'Failed to remove item',
            details: error.message 
        }, { status: 500 });
    }
}