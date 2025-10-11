import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        const { id } = await params;
        
        const product = await Product.findById(id).lean();
        
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
