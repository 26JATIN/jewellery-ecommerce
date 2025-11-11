import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory'; // Import to register the model
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
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

// GET single product with variants
export async function GET(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id } = await params;
        await connectDB();
        
        const product = await Product.findById(id).populate('subcategory', 'name slug');
        
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Admin product fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT update product with variants
export async function PUT(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id } = await params;
        const data = await req.json();

        await connectDB();
        
        // Debug log the incoming data
        console.log('=== PRODUCT UPDATE REQUEST ===');
        console.log('Product ID:', id);
        console.log('hasVariants:', data.hasVariants);
        console.log('variantOptions count:', data.variantOptions?.length || 0);
        console.log('variants count:', data.variants?.length || 0);
        if (data.variants && data.variants.length > 0) {
            console.log('First variant sample:', JSON.stringify(data.variants[0], null, 2));
        }
        
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate SKU uniqueness (excluding current product)
        if (data.sku && data.sku !== existingProduct.sku) {
            const existingSKU = await Product.findOne({ 
                sku: data.sku,
                _id: { $ne: id }
            });
            if (existingSKU) {
                return NextResponse.json(
                    { error: 'SKU already exists' },
                    { status: 400 }
                );
            }
        }

        // Handle variants if present
        if (data.hasVariants && data.variants && data.variants.length > 0) {
            // Validate variant SKUs are unique within the product
            const variantSkus = data.variants.map(v => v.sku);
            const uniqueSkus = [...new Set(variantSkus)];
            if (variantSkus.length !== uniqueSkus.length) {
                return NextResponse.json(
                    { error: 'Variant SKUs must be unique within the product' },
                    { status: 400 }
                );
            }

            // Check if any variant SKU already exists in other products
            const existingVariantSkus = await Product.find({
                _id: { $ne: id },
                $or: [
                    { sku: { $in: variantSkus } },
                    { 'variants.sku': { $in: variantSkus } }
                ]
            });

            if (existingVariantSkus.length > 0) {
                return NextResponse.json(
                    { error: 'One or more variant SKUs already exist in other products' },
                    { status: 400 }
                );
            }

            // Get base prices for variants
            const baseMRP = parseFloat(data.mrp) || 0;
            const baseSellingPrice = parseFloat(data.sellingPrice) || 0;

            // Process variants - ensure optionCombination is properly handled
            // AND calculate prices with adjustments
            data.variants = data.variants.map(variant => {
                console.log('Processing variant:', variant);
                
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

                return {
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
            });

            // For variants, main stock should be 0
            data.stock = 0;
        }

        // Validate dynamic pricing updates
        if (data.pricingMethod === 'dynamic' || data.isDynamicPricing) {
            // For dynamic pricing updates, ensure MRP and selling price are provided
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

            // Validate pricing logic
            if (data.sellingPrice > data.mrp) {
                return NextResponse.json(
                    { error: 'Selling price cannot be greater than MRP' },
                    { status: 400 }
                );
            }
        } else {
            // For fixed pricing, validate price fields
            if (data.sellingPrice > data.mrp) {
                return NextResponse.json(
                    { error: 'Selling price cannot be greater than MRP' },
                    { status: 400 }
                );
            }
        }

        console.log('About to update product with data:', JSON.stringify(data, null, 2));

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        ).populate('subcategory', 'name slug');

        console.log('Updated product result:', {
            id: updatedProduct._id,
            hasVariants: updatedProduct.hasVariants,
            variantOptionsCount: updatedProduct.variantOptions?.length || 0,
            variantsCount: updatedProduct.variants?.length || 0
        });

        // Clear product cache after successful update
        const stats = cache.getStats();
        stats.keys.forEach(key => {
            if (key.startsWith('products:')) {
                cache.delete(key);
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Admin product update error:', error);
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE product
export async function DELETE(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { id } = await params;
        await connectDB();

        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Clear product cache after successful delete
        const stats = cache.getStats();
        stats.keys.forEach(key => {
            if (key.startsWith('products:')) {
                cache.delete(key);
            }
        });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Admin product deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}