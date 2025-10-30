import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory'; // Import to register the model
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        const { id } = await params;
        
        // Validate if id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }
        
        const product = await Product.findById(id)
            .populate('subcategory', 'name slug')
            .lean()
            .maxTimeMS(10000); // Add MongoDB query timeout
        
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        console.error('Error stack:', error.stack);
        
        return NextResponse.json(
            { error: 'Failed to fetch product', details: error.message },
            { status: 500 }
        );
    }
}
