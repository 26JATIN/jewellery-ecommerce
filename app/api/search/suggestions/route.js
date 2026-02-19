import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';

export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim() || '';
        
        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        // Create regex for case-insensitive partial matching
        const searchRegex = new RegExp(query, 'i');

        // Search in products with subcategory population
        const productSuggestions = await Product.find({
            isActive: true,
            $or: [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { category: { $regex: searchRegex } },
                { metalType: { $regex: searchRegex } },
                { 'stones.type': { $regex: searchRegex } }
            ]
        })
        .select('name image images category subcategory sellingPrice _id')
        .populate('subcategory', 'name slug')
        .limit(5)
        .lean();

        // Search in categories
        const categorySuggestions = await Category.find({
            isActive: true,
            $or: [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ]
        })
        .select('name image slug')
        .limit(3)
        .lean();

        // Search in subcategories
        const subcategorySuggestions = await Subcategory.find({
            isActive: true,
            $or: [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ]
        })
        .select('name image slug category')
        .populate('category', 'name slug')
        .limit(3)
        .lean();

        // Helper function to generate proper image URL
        const getImageUrl = (imageData, type = 'product') => {
            if (!imageData) return null;
            
            let imageUrl = imageData;
            
            // For product images array
            if (type === 'product' && Array.isArray(imageData) && imageData.length > 0) {
                // Filter out null/undefined images first
                const validImages = imageData.filter(img => img && typeof img === 'object');
                const primaryImage = validImages.find(img => img.isPrimary) || validImages[0];
                imageUrl = primaryImage?.url || null;
            }
            
            if (!imageUrl) return null;
            
            // Handle string imageData
            if (typeof imageUrl === 'string') {
                // If it's already a full URL, return as is
                if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                    return imageUrl;
                }
                
                // Check if it's a public folder path (starts with / and is a simple filename)
                if (imageUrl.startsWith('/') && !imageUrl.includes('jewellery-products')) {
                    // This is a public folder image, return the path as-is for Next.js to handle
                    return imageUrl;
                }
                
                // If image is a Cloudinary public_id or relative path
                // Remove any leading slashes or 'uploads/' prefix
                const cleanPath = imageUrl.replace(/^\/?(uploads\/)?/, '');
                
                // Construct optimized Cloudinary URL
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                if (cloudName && cleanPath) {
                    // Check if it already has version number
                    if (cleanPath.includes('/v')) {
                        // Already has version, use as-is
                        return `https://res.cloudinary.com/${cloudName}/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${cleanPath}`;
                    } else {
                        // No version, might be a simple filename - skip transformation
                        return `https://res.cloudinary.com/${cloudName}/image/upload/${cleanPath}`;
                    }
                }
                
                // Fallback: return the original URL if no cloud name is configured
                return imageUrl;
            }
            
            return null;
        };        // Format suggestions with type identification
        const suggestions = [
            ...productSuggestions.map(product => {
                const imageUrl = getImageUrl(product.images || product.image, 'product');
                return {
                    id: product._id.toString(),
                    text: product.name,
                    type: 'product',
                    image: imageUrl,
                    category: product.category,
                    subcategory: product.subcategory?.name || null,
                    price: product.sellingPrice,
                    url: `/products/${product._id}`
                };
            }),
            ...categorySuggestions.map(category => {
                const imageUrl = getImageUrl(category.image, 'category');
                const categoryName = typeof category.name === 'object' ? category.name?.name || '' : category.name;
                return {
                    id: category._id.toString(),
                    text: categoryName,
                    type: 'category',
                    image: imageUrl,
                    url: `/products?category=${encodeURIComponent(categoryName)}`
                };
            }),
            ...subcategorySuggestions.map(subcategory => {
                const imageUrl = getImageUrl(subcategory.image, 'category');
                return {
                    id: subcategory._id.toString(),
                    text: `${subcategory.name} (${subcategory.category?.name || 'Subcategory'})`,
                    type: 'subcategory',
                    image: imageUrl,
                    url: `/products?category=${encodeURIComponent(subcategory.category?.name || '')}&subcategory=${subcategory._id}`
                };
            })
        ];

        // Add popular searches if no specific matches
        if (suggestions.length < 3) {
            const popularSearches = [
                { term: 'Gold Necklace', icon: 'necklace' },
                { term: 'Diamond Rings', icon: 'ring' },
                { term: 'Silver Earrings', icon: 'earring' },
                { term: 'Wedding Collection', icon: 'wedding' },
                { term: 'Bridal Sets', icon: 'bridal' },
                { term: 'Chain Bracelets', icon: 'bracelet' },
                { term: 'Pendant Sets', icon: 'pendant' },
                { term: 'Mangalsutra', icon: 'mangalsutra' }
            ].filter(search => 
                search.term.toLowerCase().includes(query.toLowerCase())
            ).map(search => ({
                id: `popular-${search.term.replace(/\s+/g, '-').toLowerCase()}`,
                text: search.term,
                type: 'popular',
                image: null,
                icon: search.icon,
                url: `/products?search=${encodeURIComponent(search.term)}`
            }));

            suggestions.push(...popularSearches.slice(0, 3));
        }

        return NextResponse.json(suggestions.slice(0, 8));

    } catch (error) {
        console.error('Search suggestions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suggestions' },
            { status: 500 }
        );
    }
}