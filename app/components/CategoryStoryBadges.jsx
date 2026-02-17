"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function CategoryStoryBadges() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const timestamp = Date.now();
                const response = await fetch(`/api/categories?_=${timestamp}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Filter valid categories with images
                    const validCategories = data.filter(cat => cat && cat._id && cat.name && cat.image && cat.isActive);
                    setCategories(validCategories);
                } else {
                    console.error('Categories data is not an array:', data);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (category) => {
        const categoryName = typeof category.name === 'object' ? category.name?.name : category.name;
        if (categoryName === 'All') {
            router.push('/products');
        } else {
            router.push(`/products?category=${encodeURIComponent(categoryName)}`);
        }
    };

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="py-8 md:py-12 px-4 bg-gradient-to-b from-white to-[#FAFAFA]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-6 md:mb-8"
                >
                    <p className="text-xs md:text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-1 md:mb-2">
                        Shop by Category
                    </p>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#2C2C2C] tracking-tight">
                        Explore Collections
                    </h2>
                </motion.div>

                {/* Category Story Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-2 px-2">
                        {categories.map((category, index) => (
                            <motion.button
                                key={category._id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryClick(category)}
                                className="flex flex-col items-center gap-2 min-w-[70px] md:min-w-[80px] group"
                            >
                                {/* Circular Image Container with Story Ring */}
                                <div className="relative rounded-full p-[3px] bg-gradient-to-tr from-gray-200 to-gray-300 group-hover:from-[#D4AF76] group-hover:to-[#8B6B4C] transition-all duration-300">
                                    <div className="bg-white rounded-full p-[3px]">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] flex items-center justify-center shadow-sm">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-6 h-6 md:w-7 md:h-7 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Name */}
                                <span className="text-[10px] md:text-xs font-light tracking-wide text-[#2C2C2C] group-hover:text-[#D4AF76] transition-colors duration-300 text-center">
                                    {typeof category.name === 'object' ? category.name?.name : category.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
