import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req) {
    try {
        await connectDB();
        
        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
        const maxPrice = parseFloat(searchParams.get('maxPrice')) || Infinity;
        
        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100.' },
                { status: 400 }
            );
        }
        
        // Build query
        const query = { isActive: true };
        
        // Add category filter
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Add search filter
        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add price filter
        if (minPrice > 0 || maxPrice < Infinity) {
            query.sellingPrice = {
                ...(minPrice > 0 && { $gte: minPrice }),
                ...(maxPrice < Infinity && { $lte: maxPrice })
            };
        }
        
        // Calculate skip value
        const skip = (page - 1) * limit;
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder;
        
        // Execute query with pagination
        const [products, totalCount] = await Promise.all([
            Product.find(query)
                .select('-costPrice') // Exclude cost price from public API
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                totalProducts: totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            },
            filters: {
                category: category || 'all',
                search: search || '',
                minPrice,
                maxPrice: maxPrice === Infinity ? null : maxPrice,
                sortBy,
                sortOrder: sortOrder === 1 ? 'asc' : 'desc'
            }
        });
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