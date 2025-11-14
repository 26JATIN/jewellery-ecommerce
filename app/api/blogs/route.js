import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import cache from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET all published blogs (public)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');

        // Generate cache key
        const cacheKey = `blogs:public:${page}:${limit}:${category || 'all'}:${tag || 'all'}:${search || ''}`;
        
        // Check cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200'
                }
            });
        }

        await connectDB();

        // Build query
        let matchStage = { isPublished: true };
        
        if (category && category !== 'all') {
            matchStage.category = category;
        }
        
        if (tag) {
            matchStage.tags = tag;
        }
        
        if (search) {
            matchStage.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // Use aggregation for better performance
        const [blogsResult, totalCount] = await Promise.all([
            Blog.aggregate([
                { $match: matchStage },
                { $sort: { publishedAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authorData'
                    }
                },
                {
                    $addFields: {
                        author: {
                            $let: {
                                vars: {
                                    authorDoc: { $arrayElemAt: ['$authorData', 0] }
                                },
                                in: {
                                    name: '$$authorDoc.name'
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        title: 1,
                        slug: 1,
                        excerpt: 1,
                        featuredImage: 1,
                        author: 1,
                        category: 1,
                        tags: 1,
                        publishedAt: 1,
                        views: 1,
                        readTime: 1,
                        createdAt: 1
                    }
                }
            ]),
            Blog.countDocuments(matchStage)
        ]);

        const response = {
            success: true,
            blogs: blogsResult,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            }
        };

        // Cache for 5 minutes
        cache.set(cacheKey, response, 5 * 60 * 1000);

        return NextResponse.json(response, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200'
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}
