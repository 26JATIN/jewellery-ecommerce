import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { adminAuth } from '@/middleware/adminAuth';

/**
 * Clear cache endpoint - for admin use only
 * This allows clearing the cache when products, categories, or subcategories are updated
 */
export async function POST(request) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult; // Return error response
        }
        
        const body = await request.json();
        const { type } = body; // Type can be 'all', 'products', 'categories', 'subcategories'
        
        if (type === 'all') {
            cache.clear();
            return NextResponse.json({
                success: true,
                message: 'All cache cleared successfully'
            });
        }
        
        // Clear specific cache types
        if (type === 'products') {
            // Clear all product-related cache entries
            const stats = cache.getStats();
            stats.keys.forEach(key => {
                if (key.startsWith('products:')) {
                    cache.delete(key);
                }
            });
            return NextResponse.json({
                success: true,
                message: 'Product cache cleared successfully'
            });
        }
        
        if (type === 'categories') {
            cache.delete('categories:all');
            return NextResponse.json({
                success: true,
                message: 'Category cache cleared successfully'
            });
        }
        
        if (type === 'subcategories') {
            // Clear all subcategory-related cache entries
            const stats = cache.getStats();
            stats.keys.forEach(key => {
                if (key.startsWith('subcategories:')) {
                    cache.delete(key);
                }
            });
            return NextResponse.json({
                success: true,
                message: 'Subcategory cache cleared successfully'
            });
        }
        
        return NextResponse.json({
            error: 'Invalid cache type. Use: all, products, categories, or subcategories'
        }, { status: 400 });
        
    } catch (error) {
        console.error('Cache clear error:', error);
        return NextResponse.json(
            { error: 'Failed to clear cache' },
            { status: 500 }
        );
    }
}

/**
 * Get cache statistics - for admin debugging
 */
export async function GET(request) {
    try {
        // Check admin authentication
        const authResult = await adminAuth(request);
        if (authResult && authResult.error === null) {
            // Authorized, continue
        } else {
            return authResult; // Return error response
        }
        
        const stats = cache.getStats();
        
        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Cache stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get cache stats' },
            { status: 500 }
        );
    }
}
