import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';

// GET products by category
export async function GET(request, context) {
    try {
        await connectDB();
        
        const params = await context.params;
        const { slug } = params;
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const sortBy = searchParams.get('sortBy') || 'featured';
        const search = searchParams.get('search') || '';
        
        // First get the category name from slug
        const Category = (await import('@/models/Category')).default;
        const category = await Category.findOne({ slug, isActive: true });
        
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        // Build query
        let query = { 
            category: category.name, 
            isActive: true 
        };
        
        // Add search if provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort option
        let sortOption = {};
        switch (sortBy) {
            case 'price-low':
                sortOption = { price: 1 };
                break;
            case 'price-high':
                sortOption = { price: -1 };
                break;
            case 'name':
                sortOption = { name: 1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 }; // Featured = newest by default
        }
        
        const skip = (page - 1) * limit;
        
        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);
        
        const totalPages = Math.ceil(totalProducts / limit);
        
        return NextResponse.json({
            products,
            category,
            pagination: {
                page,
                totalPages,
                totalProducts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching category products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}