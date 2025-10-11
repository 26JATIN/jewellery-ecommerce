import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

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

        // Search in products
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
        .select('name image images category sellingPrice _id')
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
        .select('name image')
        .limit(3)
        .lean();

        // Format suggestions with type identification
        const suggestions = [
            ...productSuggestions.map(product => {
                // Get the best available image
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                let imageUrl = primaryImage?.url || product.image;
                
                // If image is from Cloudinary, create full URL
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${imageUrl}`;
                }
                
                return {
                    id: product._id,
                    text: product.name,
                    type: 'product',
                    image: imageUrl,
                    category: product.category,
                    price: product.sellingPrice,
                    url: `/products/${product._id}` // Direct product URL
                };
            }),
            ...categorySuggestions.map(category => {
                let imageUrl = category.image;
                
                // If image is from Cloudinary, create full URL
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_100,h_100,c_fill,q_auto,f_auto/${imageUrl}`;
                }
                
                return {
                    id: category._id,
                    text: category.name,
                    type: 'category',
                    image: imageUrl,
                    url: `/collections/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`
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
                id: `popular-${search.term}`,
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