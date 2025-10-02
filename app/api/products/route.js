import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
    try {
        await connectDB();
        // Only return active products for public API
        const products = await Product.find({ isActive: true }).select('-costPrice');
        return NextResponse.json(products);
    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();
        
        // Ensure required fields for public product creation
        if (!data.name || !data.description || !data.category || !data.sellingPrice) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Set defaults for missing pricing fields
        const productData = {
            ...data,
            price: data.sellingPrice, // For backward compatibility
            mrp: data.mrp || data.sellingPrice,
            costPrice: data.costPrice || data.sellingPrice * 0.7, // Default 30% margin
            sku: data.sku || `SKU${Date.now()}`,
            isActive: data.isActive !== undefined ? data.isActive : true
        };

        const product = await Product.create(productData);
        return NextResponse.json(product);
    } catch (error) {
        console.error('Product creation error:', error);
        
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