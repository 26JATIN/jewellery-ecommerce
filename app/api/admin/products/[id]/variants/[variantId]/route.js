import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Middleware to check admin access
async function checkAdminAccess() {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get('token');

        if (!token) {
            return { error: 'Unauthorized', status: 401 };
        }

        const decoded = verifyToken(token.value);

        if (!decoded) {
            return { error: 'Invalid token', status: 401 };
        }

        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return { error: 'Admin access required', status: 403 };
        }

        return null;
    } catch (error) {
        console.error('Admin auth error:', error);
        return { error: 'Internal server error', status: 500 };
    }
}

// PUT - Update variant inventory
export async function PUT(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id, variantId } = params;
        const { stock, isActive, price } = await req.json();

        await connectDB();
        
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (!product.hasVariants) {
            return NextResponse.json(
                { error: 'Product does not have variants' },
                { status: 400 }
            );
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return NextResponse.json(
                { error: 'Variant not found' },
                { status: 404 }
            );
        }

        // Update variant properties
        if (stock !== undefined) variant.stock = stock;
        if (isActive !== undefined) variant.isActive = isActive;
        if (price) {
            if (price.mrp !== undefined) variant.price.mrp = price.mrp;
            if (price.sellingPrice !== undefined) variant.price.sellingPrice = price.sellingPrice;
        }

        await product.save();

        return NextResponse.json({
            message: 'Variant updated successfully',
            variant: variant
        });
    } catch (error) {
        console.error('Variant update error:', error);
        return NextResponse.json(
            { error: 'Failed to update variant' },
            { status: 500 }
        );
    }
}

// DELETE - Remove variant
export async function DELETE(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id, variantId } = params;

        await connectDB();
        
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return NextResponse.json(
                { error: 'Variant not found' },
                { status: 404 }
            );
        }

        // Remove the variant
        product.variants.pull(variantId);
        
        // If no variants left, disable variants for the product
        if (product.variants.length === 0) {
            product.hasVariants = false;
        }

        await product.save();

        return NextResponse.json({
            message: 'Variant deleted successfully'
        });
    } catch (error) {
        console.error('Variant deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete variant' },
            { status: 500 }
        );
    }
}