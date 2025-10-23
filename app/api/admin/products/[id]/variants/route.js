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

// POST - Add new variant to product
export async function POST(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id } = params;
        const variantData = await req.json();

        await connectDB();
        
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate variant SKU is unique
        const existingVariantSku = await Product.findOne({
            $or: [
                { sku: variantData.sku },
                { 'variants.sku': variantData.sku }
            ]
        });

        if (existingVariantSku) {
            return NextResponse.json(
                { error: 'Variant SKU already exists' },
                { status: 400 }
            );
        }

        // Convert option combination to Map
        const newVariant = {
            ...variantData,
            optionCombination: new Map(Object.entries(variantData.optionCombination || {}))
        };

        product.variants.push(newVariant);
        product.hasVariants = true;

        await product.save();

        return NextResponse.json({
            message: 'Variant added successfully',
            variant: product.variants[product.variants.length - 1]
        }, { status: 201 });
    } catch (error) {
        console.error('Variant creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create variant' },
            { status: 500 }
        );
    }
}

// GET - Get all variants for a product
export async function GET(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id } = params;

        await connectDB();
        
        const product = await Product.findById(id).select('variants variantOptions hasVariants');
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            hasVariants: product.hasVariants,
            variantOptions: product.variantOptions,
            variants: product.variants
        });
    } catch (error) {
        console.error('Variants fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch variants' },
            { status: 500 }
        );
    }
}

// PUT - Bulk update variants
export async function PUT(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id } = params;
        const { variants, variantOptions } = await req.json();

        await connectDB();
        
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (variants) {
            // Validate all variant SKUs are unique
            const variantSkus = variants.map(v => v.sku);
            const uniqueSkus = [...new Set(variantSkus)];
            if (variantSkus.length !== uniqueSkus.length) {
                return NextResponse.json(
                    { error: 'Variant SKUs must be unique' },
                    { status: 400 }
                );
            }

            // Check if any SKU exists in other products
            const existingSkus = await Product.find({
                _id: { $ne: id },
                $or: [
                    { sku: { $in: variantSkus } },
                    { 'variants.sku': { $in: variantSkus } }
                ]
            });

            if (existingSkus.length > 0) {
                return NextResponse.json(
                    { error: 'One or more variant SKUs already exist' },
                    { status: 400 }
                );
            }

            // Convert option combinations to Maps
            product.variants = variants.map(variant => ({
                ...variant,
                optionCombination: new Map(Object.entries(variant.optionCombination || {}))
            }));

            product.hasVariants = variants.length > 0;
        }

        if (variantOptions) {
            product.variantOptions = variantOptions;
        }

        await product.save();

        return NextResponse.json({
            message: 'Variants updated successfully',
            variants: product.variants,
            variantOptions: product.variantOptions
        });
    } catch (error) {
        console.error('Variants bulk update error:', error);
        return NextResponse.json(
            { error: 'Failed to update variants' },
            { status: 500 }
        );
    }
}