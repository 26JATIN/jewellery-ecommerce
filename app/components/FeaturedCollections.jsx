"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

export default function FeaturedCollections() {
    const router = useRouter();
    const [activeCollection, setActiveCollection] = useState(0);
    const [categories, setCategories] = useState([]);
    const [featuredCollections, setFeaturedCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch real category data
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
                setCategories(data);
                
                // Create featured collections from all categories
                const featured = data.map((category, index) => ({
                    id: category._id,
                    title: category.name,
                    subtitle: category.description?.substring(0, 50) + "..." || "Premium Collection",
                    description: category.description || "Exquisite pieces crafted with precision and care.",
                    image: category.image || "carousel1_l76hra.jpg",
                    products: category.productsCount || 0,
                    category: category.name.toLowerCase(),
                    color: getCollectionColor(index),
                    realData: true
                }));
                
                setFeaturedCollections(featured);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setLoading(false);
            }
        };
        
        fetchCategories();
    }, []);

    const getCollectionColor = (index) => {
        const colors = [
            "from-rose-100 to-pink-50",
            "from-amber-100 to-yellow-50", 
            "from-purple-100 to-indigo-50",
            "from-emerald-100 to-teal-50",
            "from-blue-100 to-cyan-50"
        ];
        return colors[index % colors.length];
    };

    const handleCollectionClick = (collection) => {
        if (collection.realData) {
            // For real categories, navigate to products page with category filter
            router.push(`/products?category=${encodeURIComponent(collection.title)}`);
        } else {
            // For default collections, navigate to products page
            router.push('/products');
        }
    };

    if (loading) {
        return (
            <section className="py-20 lg:py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-6 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 lg:py-32 px-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#8B6B4C] to-transparent rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-20"
                >
                    <div className="inline-block">
                        <div className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase mb-4 relative">
                            Curated Collections
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] tracking-tight mb-6">
                        Signature Collections
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                        Discover our carefully curated collections, each telling a unique story through exceptional design and craftsmanship
                    </p>
                </motion.div>

                {/* Collections Grid */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Collection Cards - Scrollable */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Scroll container */}
                        <div className="overflow-y-auto max-h-[600px] lg:max-h-[700px] space-y-6 pr-2 scrollbar-thin scrollbar-thumb-[#D4AF76] scrollbar-track-gray-100 hover:scrollbar-thumb-[#8B6B4C]">
                            {featuredCollections.map((collection, index) => (
                            <motion.button
                                key={collection.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                onMouseEnter={() => setActiveCollection(index)}
                                onClick={() => handleCollectionClick(collection)}
                                className={`relative group p-8 rounded-3xl border transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl text-left w-full ${
                                    activeCollection === index 
                                        ? `bg-gradient-to-br ${collection.color} border-[#D4AF76]/30 shadow-2xl` 
                                        : 'bg-white/80 backdrop-blur-sm border-gray-200/50 hover:border-[#D4AF76]/20'
                                }`}
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white font-light text-lg transition-transform duration-300 ${
                                        activeCollection === index ? 'scale-110' : 'group-hover:scale-105'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl lg:text-2xl font-light text-[#2C2C2C]">
                                                {collection.title}
                                            </h3>
                                            <span className="text-xs text-[#D4AF76] bg-[#D4AF76]/10 px-3 py-1 rounded-full font-light">
                                                {collection.products} pieces
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#D4AF76] font-light tracking-wide uppercase mb-3">
                                            {collection.subtitle}
                                        </p>
                                        <p className="text-gray-600 font-light leading-relaxed">
                                            {collection.description}
                                        </p>
                                        {collection.realData && (
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#D4AF76]"></div>
                                                <span className="text-xs text-gray-500 font-light">Live Collection</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Click to explore indicator */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-[#D4AF76] text-white p-2 rounded-full">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                        </div>
                        
                        {/* Scroll indicator - Only show if there are more than 3 collections */}
                        {featuredCollections.length > 3 && (
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none flex items-end justify-center pb-2">
                                <motion.div
                                    animate={{ y: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-xs text-[#D4AF76] flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Scroll for more
                                </motion.div>
                            </div>
                        )}
                    </motion.div>

                    {/* Featured Image */}
                    <motion.button 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        onClick={() => handleCollectionClick(featuredCollections[activeCollection])}
                        className="relative group cursor-pointer"
                    >
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCollection}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0"
                                >
                                    <CldImage
                                        src={featuredCollections[activeCollection]?.image || "carousel1_l76hra.jpg"}
                                        alt={featuredCollections[activeCollection]?.title || "Collection"}
                                        fill
                                        className="object-cover"
                                        quality={90}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Floating Badge */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="absolute bottom-6 left-6 right-6"
                            >
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-light text-[#2C2C2C] mb-1">
                                                {featuredCollections[activeCollection]?.title}
                                            </h4>
                                            <p className="text-sm text-[#D4AF76] font-light">
                                                {featuredCollections[activeCollection]?.subtitle}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-600">
                                                    {featuredCollections[activeCollection]?.products} Items
                                                </span>
                                                {featuredCollections[activeCollection]?.realData && (
                                                    <>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-[#D4AF76]">Live Data</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#D4AF76]/20 to-transparent rounded-full blur-xl" />
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-[#8B6B4C]/20 to-transparent rounded-full blur-xl" />

                        {/* Click overlay indicator */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full">
                                <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                        </div>
                    </motion.button>
                </div>
            </div>
        </section>
    );
}