import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { calculateJewelryPrice } from '@/lib/goldPrice';

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

export async function GET(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { productId } = await params;
        
        await connectDB();
        const product = await Product.findById(productId);
        
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

export async function PUT(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { productId } = await params;
        const data = await req.json();

        // Validate required fields (different for dynamic vs fixed pricing)
        const basicRequiredFields = ['name', 'description', 'category', 'sku', 'costPrice'];
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

            // Validate discount percent is provided
            if (data.discountPercent === undefined || data.discountPercent === null) {
                data.discountPercent = 0; // Default to 0% discount
            }

            // Calculate MRP based on current metal rates
            try {
                const priceCalc = await calculateJewelryPrice({
                    goldWeight: data.goldWeight || 0,
                    goldPurity: data.goldPurity || 22,
                    silverWeight: data.silverWeight || 0,
                    silverPurity: data.silverPurity || 999,
                    makingChargePercent: data.makingChargePercent || 15,
                    stoneValue: data.stoneValue || 0,
                    gstPercent: 3,
                    currency: 'INR'
                });

                if (priceCalc.success) {
                    // Calculate MRP (auto-calculated from metal rates)
                    data.mrp = priceCalc.breakdown.finalPrice;
                    
                    // Calculate Selling Price = MRP - (MRP × discount%)
                    const discountMultiplier = 1 - (data.discountPercent / 100);
                    data.sellingPrice = data.mrp * discountMultiplier;
                    data.price = data.sellingPrice; // For backward compatibility
                    
                    data.isDynamicPricing = true;
                    data.pricingMethod = 'dynamic';

                    // Validate cost price is less than selling price
                    if (data.costPrice > data.sellingPrice) {
                        return NextResponse.json(
                            { error: 'Cost price should be less than selling price for profitability' },
                            { status: 400 }
                        );
                    }
                } else {
                    return NextResponse.json(
                        { error: 'Failed to calculate price: ' + priceCalc.error },
                        { status: 400 }
                    );
                }
            } catch (error) {
                console.error('Price calculation error:', error);
                return NextResponse.json(
                    { error: 'Failed to calculate dynamic price' },
                    { status: 500 }
                );
            }
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

            if (data.costPrice > data.sellingPrice) {
                return NextResponse.json(
                    { error: 'Cost price cannot be greater than selling price' },
                    { status: 400 }
                );
            }
        }

        await connectDB();

        // Check if SKU already exists for other products
        const existingSKU = await Product.findOne({ 
            sku: data.sku, 
            _id: { $ne: productId } 
        });
        
        if (existingSKU) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                ...data,
                price: data.sellingPrice // Set price to selling price for backward compatibility
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
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

export async function DELETE(req, { params }) {
    try {
        const authError = await checkAdminAccess();
        if (authError) {
            return NextResponse.json(
                { error: authError.error },
                { status: authError.status }
            );
        }

        const { productId } = await params;

        await connectDB();
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Admin product deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}