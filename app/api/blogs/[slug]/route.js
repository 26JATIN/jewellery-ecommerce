import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import cache from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET single blog by slug (public)
export async function GET(request, context) {
    try {
        const params = await context.params;
        const { slug } = params;

        // Generate cache key
        const cacheKey = `blog:${slug}`;
        
        // Check cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, max-age=600, s-maxage=1200, stale-while-revalidate=2400'
                }
            });
        }

        await connectDB();

        // Use aggregation to get blog with author and related posts
        const blogResult = await Blog.aggregate([
            {
                $match: { slug, isPublished: true }
            },
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
                                _id: '$$authorDoc._id',
                                name: '$$authorDoc.name'
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    authorData: 0
                }
            }
        ]);

        if (!blogResult || blogResult.length === 0) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        const blog = blogResult[0];

        // Get related blogs (same category, excluding current blog)
        const relatedBlogs = await Blog.aggregate([
            {
                $match: {
                    isPublished: true,
                    category: blog.category,
                    _id: { $ne: blog._id }
                }
            },
            { $sort: { publishedAt: -1 } },
            { $limit: 3 },
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
                    publishedAt: 1,
                    readTime: 1
                }
            }
        ]);

        // Increment view count (don't wait for it)
        Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

        const response = {
            success: true,
            blog,
            relatedBlogs
        };

        // Cache for 10 minutes
        cache.set(cacheKey, response, 10 * 60 * 1000);

        return NextResponse.json(response, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, max-age=600, s-maxage=1200, stale-while-revalidate=2400'
            }
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog' },
            { status: 500 }
        );
    }
}
