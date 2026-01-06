'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Eye, User, ArrowLeft, Tag } from 'lucide-react';
import CloudinaryImage from '@/app/components/CloudinaryImage';
import { Button } from '@/components/ui/button';

export default function BlogPostPage({ params }) {
    const { slug } = use(params);
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlog = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/blogs/${slug}`);
            const data = await response.json();
            
            if (data.success) {
                setBlog(data.blog);
                setRelatedBlogs(data.relatedBlogs || []);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchBlog();
    }, [slug, fetchBlog]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#D4AF76] mb-4"></div>
                    <p className="text-gray-600 font-light">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-4xl font-light text-gray-800 mb-4">Article Not Found</h1>
                <p className="text-gray-500 mb-8 font-light">The article you&apos;re looking for doesn&apos;t exist</p>
                <Link href="/blogs">
                    <Button className="bg-[#D4AF76] hover:bg-[#B8956A] text-[#2C2C2C] rounded-full px-8 py-3 font-light">
                        Back to Journal
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Back Button */}
            <div className="border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/blogs" className="inline-flex items-center text-[#8B6B4C] hover:text-[#D4AF76] transition-colors font-light">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Journal
                    </Link>
                </div>
            </div>

            {/* Article Header */}
            <article className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Featured Image */}
                    {blog.featuredImage?.url && (
                        <div className="relative h-[500px] w-full overflow-hidden">
                            <CloudinaryImage
                                src={blog.featuredImage.url}
                                alt={blog.featuredImage.alt || blog.title}
                                width={1200}
                                height={500}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block px-5 py-2 bg-gradient-to-r from-[#D4AF76]/20 to-[#B8956A]/20 text-[#8B6B4C] text-sm font-light rounded-full border border-[#D4AF76]/30">
                                {blog.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-8 text-gray-900 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-10 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-2 font-light">
                                <User className="w-5 h-5 text-[#D4AF76]" />
                                <span>{blog.author?.name || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-2 font-light">
                                <Calendar className="w-5 h-5 text-[#D4AF76]" />
                                <span>
                                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 font-light">
                                <Clock className="w-5 h-5 text-[#D4AF76]" />
                                <span>{blog.readTime} min read</span>
                            </div>
                            <div className="flex items-center gap-2 font-light">
                                <Eye className="w-5 h-5 text-[#D4AF76]" />
                                <span>{blog.views || 0} views</span>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="text-xl text-gray-700 mb-10 font-light italic bg-gradient-to-r from-[#D4AF76]/10 to-[#B8956A]/5 p-8 rounded-2xl border-l-4 border-[#D4AF76] leading-relaxed">
                            {blog.excerpt}
                        </div>

                        {/* Content */}
                        <div 
                            className="blog-content max-w-none mb-10 font-light leading-relaxed text-gray-800"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />





                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="pt-10 border-t border-gray-200">
                                <h3 className="text-lg font-light mb-5 text-gray-900">Related Topics</h3>
                                <div className="flex flex-wrap gap-3">
                                    {blog.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full hover:from-[#D4AF76]/10 hover:to-[#B8956A]/5 hover:border-[#D4AF76]/30 transition-all font-light border border-gray-200"
                                        >
                                            <Tag className="w-4 h-4 text-[#D4AF76]" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Blogs */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-3xl font-light tracking-wide mb-8 text-gray-900">You May Also Like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <Link
                                    key={relatedBlog._id}
                                    href={`/blogs/${relatedBlog.slug}`}
                                    className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
                                >
                                    {relatedBlog.featuredImage?.url ? (
                                        <div className="relative h-44 w-full overflow-hidden">
                                            <CloudinaryImage
                                                src={relatedBlog.featuredImage.url}
                                                alt={relatedBlog.featuredImage.alt || relatedBlog.title}
                                                width={400}
                                                height={176}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </div>
                                    ) : (
                                        <div className="h-44 bg-gradient-to-br from-[#D4AF76]/20 via-[#B8956A]/10 to-[#D4AF76]/20 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-[#D4AF76]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="font-light text-lg mb-2 group-hover:text-[#8B6B4C] transition-colors line-clamp-2 tracking-wide">
                                            {relatedBlog.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 font-light leading-relaxed">
                                            {relatedBlog.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 font-light">
                                                <Clock className="w-3.5 h-3.5 text-[#D4AF76]" />
                                                {relatedBlog.readTime} min
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
