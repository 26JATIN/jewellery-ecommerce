import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';
import { adminAuth } from '@/middleware/adminAuth';
import cache from '@/lib/cache';

// GET: Fetch all subcategories (with optional category filter)
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        const includeInactive = searchParams.get('includeInactive') === 'true';
        
        // Generate cache key
        const cacheKey = `subcategories:${categoryId || 'all'}:${includeInactive}`;
        
        // Check cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
                }
            });
        }
        
        let query = {};
        
        if (categoryId) {
            query.category = categoryId;
        }
        
        if (!includeInactive) {
            query.isActive = true;
        }
        
        const subcategories = await Subcategory.find(query)
            .populate('category', 'name slug')
            .sort({ order: 1, name: 1 })
            .lean(); // Use lean() for better performance
        
        const response = {
            success: true,
            subcategories
        };
        
        // Cache for 10 minutes
        cache.set(cacheKey, response, 10 * 60 * 1000);
        
        return NextResponse.json(response, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
            }
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subcategories' },
            { status: 500 }
        );
    }
}

// POST: Create a new subcategory (Admin only)
export async function POST(request) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult; // Return error response
        }
        
        await connectDB();
        
        const body = await request.json();
        const { name, categoryId, description, image, order } = body;
        
        // Validate required fields
        if (!name || !categoryId) {
            return NextResponse.json(
                { error: 'Name and category are required' },
                { status: 400 }
            );
        }
        
        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Create subcategory
        const subcategory = new Subcategory({
            name,
            slug,
            category: categoryId,
            description: description || '',
            image: image || '',
            order: order || 0
        });
        
        await subcategory.save();
        
        // Populate category before returning
        await subcategory.populate('category', 'name slug');
        
        return NextResponse.json({
            success: true,
            subcategory
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating subcategory:', error);
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'A subcategory with this name already exists in this category' },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create subcategory' },
            { status: 500 }
        );
    }
}
