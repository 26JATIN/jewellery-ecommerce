"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

export default function CollectionCategories() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const timestamp = Date.now();
            const response = await fetch(`/api/categories?_=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Filter valid categories and show only first 6
                    const validCategories = data.filter(cat => cat && cat._id && cat.name && cat.isActive).map(cat => ({
                        ...cat,
                        name: typeof cat.name === 'object' ? cat.name?.name || '' : cat.name
                    }));
                    setCategories(validCategories.slice(0, 6));
                } else {
                    console.error('Categories data is not an array:', data);
                    setCategories([]);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        const categoryName = category.name;
        router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    };

    const handleViewAll = () => {
        router.push('/collections');
    };

    if (loading) {
        return (
            <section className="py-12 md:py-20 px-4 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="h-6 md:h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-72 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 md:h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-20 px-4 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-xs md:text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-1 md:mb-2"
                    >
                        Explore Our
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] tracking-tight mb-3 md:mb-4"
                    >
                        Collections
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto px-4"
                    >
                        Discover our curated jewelry collections, each crafted with precision and passion
                    </motion.p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                            onClick={() => handleCategoryClick(category)}
                        >
                            <div className="relative overflow-hidden bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none dark:border dark:border-white/[0.06] transition-all duration-500 group-hover:-translate-y-2">
                                {/* Category Image */}
                                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                                    <CldImage
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Products Count Badge */}
                                    {category.productsCount > 0 && (
                                        <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/95 backdrop-blur-sm rounded-full px-2.5 md:px-3 py-1 shadow-md">
                                            <span className="text-[10px] md:text-xs font-medium text-[#2C2C2C]">
                                                {category.productsCount} {category.productsCount === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Category Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                        <h3 className="text-xl md:text-2xl font-light text-white mb-1 md:mb-2 group-hover:text-[#D4AF76] transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/90 text-xs md:text-sm font-light leading-relaxed mb-3 md:mb-4 line-clamp-2">
                                            {category.description}
                                        </p>

                                        {/* Explore Button */}
                                        <div className="inline-flex items-center text-white bg-white/10 backdrop-blur-sm px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-light group-hover:bg-[#D4AF76] group-hover:text-white transition-all duration-300">
                                            <span>Explore Collection</span>
                                            <svg className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <button
                        onClick={handleViewAll}
                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-3.5 bg-[#2C2C2C] text-white rounded-full hover:bg-[#D4AF76] transition-all duration-300 text-sm md:text-base font-light shadow-md hover:shadow-xl group"
                    >
                        <span>View All Collections</span>
                        <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
