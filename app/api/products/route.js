import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import cache from '@/lib/cache';

export async function GET(req) {
    try {
        await connectDB();
        
        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50; // Increased default limit
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
        const maxPrice = parseFloat(searchParams.get('maxPrice')) || Infinity;
        
        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 200) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-200.' },
                { status: 400 }
            );
        }
        
        // Generate cache key based on query parameters
        const cacheKey = `products:${page}:${limit}:${category || 'all'}:${subcategory || 'all'}:${search || ''}:${sortBy}:${sortOrder}:${minPrice}:${maxPrice}`;
        
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                }
            });
        }
        
        // Build query
        const query = { isActive: true };
        
        // Add category filter
        if (category && category !== 'all' && category !== 'All') {
            query.category = category;
        }
        
        // Add subcategory filter
        if (subcategory && subcategory !== 'all' && subcategory !== 'All') {
            query.subcategory = subcategory;
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
        
        // Optimize: Only select necessary fields
        const selectFields = 'name description category subcategory image images sellingPrice mrp stock sku hasVariants variants tags createdAt goldWeight silverWeight isDynamicPricing metalType';
        
        // Execute query with pagination (parallel execution)
        const [rawProducts, totalCount] = await Promise.all([
            Product.find(query)
                .select(selectFields)
                .populate('subcategory', 'name slug')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(), // Use lean() for better performance
            Product.countDocuments(query)
        ]);
        
        // Convert to plain objects and ensure totalStock is calculated
        const products = rawProducts.map(product => {
            // Calculate totalStock if not already calculated
            if (product.hasVariants && product.variants && product.variants.length > 0) {
                product.totalStock = product.variants.reduce((total, variant) => 
                    total + (variant.isActive && variant.stock ? variant.stock : 0), 0);
            } else {
                product.totalStock = product.stock || 0;
            }
            
            // Optimize images - only send primary image and first 3 images
            if (product.images && product.images.length > 0) {
                const primaryImage = product.images.find(img => img.isPrimary);
                const otherImages = product.images.filter(img => !img.isPrimary).slice(0, 2);
                product.images = primaryImage ? [primaryImage, ...otherImages] : otherImages.slice(0, 3);
            }
            
            return product;
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        const response = {
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
                subcategory: subcategory || 'all',
                search: search || '',
                minPrice,
                maxPrice: maxPrice === Infinity ? null : maxPrice,
                sortBy,
                sortOrder: sortOrder === 1 ? 'asc' : 'desc'
            }
        };
        
        // Cache the response for 5 minutes
        cache.set(cacheKey, response, 5 * 60 * 1000);
        
        return NextResponse.json(response, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', success: false, data: [] },
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