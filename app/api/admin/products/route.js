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
        const products = await Product.find({}).sort({ createdAt: -1 });
        return NextResponse.json(products);
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

        // Validate required fields
        const requiredFields = ['name', 'description', 'category', 'mrp', 'costPrice', 'sellingPrice', 'sku'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
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

        // Check if SKU already exists
        await connectDB();
        const existingSKU = await Product.findOne({ sku: data.sku });
        if (existingSKU) {
            return NextResponse.json(
                { error: 'SKU already exists' },
                { status: 400 }
            );
        }

        const product = await Product.create({
            ...data,
            price: data.sellingPrice // Set price to selling price for backward compatibility
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Admin product creation error:', error);
        
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