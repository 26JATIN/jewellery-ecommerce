import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory'; // Import to register the model
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { calculateJewelryPrice } from '@/lib/goldPrice';
import cache from '@/lib/cache';

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

export async function GET() {
    try {
        const authError = await checkAdminAccess();

        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        await connectDB();
        const products = await Product.find({})
            .populate('subcategory', 'name slug')
            .sort({ createdAt: -1 });
        return NextResponse.json(products, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Admin products fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const data = await req.json();

        // Validate required fields (different for dynamic vs fixed pricing)
        const basicRequiredFields = ['name', 'description', 'category', 'sku'];
        for (const field of basicRequiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // For dynamic pricing, calculate MRP and selling price automatically
        if (data.pricingMethod === 'dynamic' || data.isDynamicPricing) {
            // Validate dynamic pricing requirements
            if (data.metalType === 'gold' && (!data.goldWeight || data.goldWeight <= 0)) {
                return NextResponse.json(
                    { error: 'Gold weight is required for dynamic pricing' },
                    { status: 400 }
                );
            }
            if (data.metalType === 'silver' && (!data.silverWeight || data.silverWeight <= 0)) {
                return NextResponse.json(
                    { error: 'Silver weight is required for dynamic pricing' },
                    { status: 400 }
                );
            }

            // For dynamic pricing, MRP and sellingPrice should already be calculated on frontend
            // Validate that they are provided
            if (!data.mrp || data.mrp <= 0) {
                return NextResponse.json(
                    { error: 'MRP is required for dynamic pricing. Please calculate price first.' },
                    { status: 400 }
                );
            }

            if (!data.sellingPrice || data.sellingPrice <= 0) {
                return NextResponse.json(
                    { error: 'Selling price is required for dynamic pricing. Please calculate price first.' },
                    { status: 400 }
                );
            }

            // Validate discount percent is provided
            if (data.discountPercent === undefined || data.discountPercent === null) {
                data.discountPercent = 0; // Default to 0% discount
            }

            data.isDynamicPricing = true;
            data.pricingMethod = 'dynamic';
        } else {
            // For fixed pricing, validate price fields
            const priceFields = ['sellingPrice', 'mrp'];
            for (const field of priceFields) {
                if (!data[field]) {
                    return NextResponse.json(
                        { error: `${field} is required for fixed pricing` },
                        { status: 400 }
                    );
                }
            }

            // Validate pricing logic
            if (data.sellingPrice > data.mrp) {
                return NextResponse.json(
                    { error: 'Selling price cannot be greater than MRP' },
                    { status: 400 }
                );
            }
        }

        // Check if SKU already exists
        await connectDB();
        const existingSKU = await Product.findOne({ sku: data.sku });
        if (existingSKU) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        // Handle variants if present
        if (data.hasVariants && data.variants && data.variants.length > 0) {
            
            // Validate variant SKUs are unique
            const variantSkus = data.variants.map(v => v.sku);
            const uniqueSkus = [...new Set(variantSkus)];
            if (variantSkus.length !== uniqueSkus.length) {
                return NextResponse.json(
                    { error: 'Variant SKUs must be unique' },
                    { status: 400 }
                );
            }

            // Check if any variant SKU already exists in database
            const existingVariantSkus = await Product.find({
                $or: [
                    { sku: { $in: variantSkus } },
                    { 'variants.sku': { $in: variantSkus } }
                ]
            });

            if (existingVariantSkus.length > 0) {
                return NextResponse.json(
                    { error: 'One or more variant SKUs already exist' },
                    { status: 400 }
                );
            }

            // Get base prices for variants
            const baseMRP = parseFloat(data.mrp) || 0;
            const baseSellingPrice = parseFloat(data.sellingPrice) || 0;

            // Process variants - ensure optionCombination is properly handled as object
            // AND calculate prices with adjustments
            data.variants = data.variants.map((variant, index) => {
                
                // Validate required fields for variants
                if (!variant.sku) {
                    throw new Error(`Variant ${index + 1} is missing SKU`);
                }
                
                // Calculate price adjustment for this variant based on its option combination
                let variantPriceAdjustment = 0;
                
                if (variant.optionCombination && data.variantOptions) {
                    // Loop through each option in the combination
                    Object.entries(variant.optionCombination).forEach(([optionName, valueName]) => {
                        // Find the option definition
                        const option = data.variantOptions.find(opt => opt.name === optionName);
                        if (option && option.values) {
                            // Find the value definition
                            const value = option.values.find(v => v.name === valueName);
                            if (value && typeof value.priceAdjustment !== 'undefined') {
                                const adjustment = parseFloat(value.priceAdjustment) || 0;
                                variantPriceAdjustment += adjustment;
                            }
                        }
                    });
                }

                // Apply the adjustment to the base prices
                const variantMRP = baseMRP + variantPriceAdjustment;
                const variantSellingPrice = baseSellingPrice + variantPriceAdjustment;

                const processedVariant = {
                    ...variant,
                    // Keep optionCombination as object, not Map - MongoDB handles objects better
                    optionCombination: variant.optionCombination || {},
                    price: {
                        mrp: variantMRP,
                        sellingPrice: variantSellingPrice
                    },
                    stock: parseInt(variant.stock) || 0,
                    isActive: variant.isActive !== undefined ? variant.isActive : true
                };
                
                return processedVariant;
            });

            // For variants, main stock should be 0
            data.stock = 0;
        }

        // Create the product data object
        const productData = {
            ...data,
            price: data.sellingPrice // Set price to selling price for backward compatibility
        };

        let product;
        try {
            // Try using .save() instead of .create() to see if there's a difference
            product = new Product(productData);
            
            await product.save();
            
            // Clear product cache after successful save
            const stats = cache.getStats();
            stats.keys.forEach(key => {
                if (key.startsWith('products:')) {
                    cache.delete(key);
                }
            });
            
        } catch (saveError) {
            try {
                product = await Product.create(productData);
                
                // Clear product cache after successful create
                const stats = cache.getStats();
                stats.keys.forEach(key => {
                    if (key.startsWith('products:')) {
                        cache.delete(key);
                    }
                });
            } catch (createError) {
                console.error('Both save and create failed:', createError);
                throw createError;
            }
        }

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}