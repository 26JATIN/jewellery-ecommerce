import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';
import cache from '@/lib/cache';

// GET all categories
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';
        
        // For admin requests (includeInactive=true), skip caching
        if (includeInactive) {
            const categories = await Category.find({})
                .sort({ sortOrder: 1, name: 1 })
                .lean();
            
            // Update product counts for each category in parallel
            const categoriesWithCounts = await Promise.all(
                categories.map(async (category) => {
                    const productCount = await Product.countDocuments({ 
                        category: category.name
                    });
                    return {
                        ...category,
                        productsCount: productCount
                    };
                })
            );
            
            return NextResponse.json(categoriesWithCounts, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        }
        
        // For public requests, use caching
        const cacheKey = 'categories:all';
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
                }
            });
        }
        
        const categories = await Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .lean(); // Use lean() for better performance
        
        // Update product counts for each category in parallel
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ 
                    category: category.name, 
                    isActive: true 
                });
                return {
                    ...category,
                    productsCount: productCount
                };
            })
        );

        // Cache for 10 minutes
        cache.set(cacheKey, categoriesWithCounts, 10 * 60 * 1000);

        return NextResponse.json(categoriesWithCounts, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST create new category
export async function POST(request) {
    try {
        await connectDB();
        
        const data = await request.json();
        
        // Validate required fields
        if (!data.name || !data.description || !data.image) {
            return NextResponse.json(
                { error: 'Name, description, and image are required' },
                { status: 400 }
            );
        }
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${data.name}$`, 'i') }
        });
        
        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }
        
        const category = new Category(data);
        await category.save();
        
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}