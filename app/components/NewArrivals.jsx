"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import SafeImage from './SafeImage';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export default function NewArrivals() {
    const router = useRouter();
    const { addToCart, setIsCartOpen } = useCart();
    const [hoveredProduct, setHoveredProduct] = useState(null);
    
    const { products: allProducts, loading } = useProducts();
    
    // Show first 8 products sorted by creation date (newest first)
    const products = allProducts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await addToCart(product);
        if (result !== false) {
            setIsCartOpen(true);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section id="new-arrivals" className="py-12 md:py-20 px-4 bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF76]/10 to-[#8B6B4C]/10 border border-[#D4AF76]/20 rounded-full px-4 py-2 mb-4"
                    >
                        <Sparkles className="w-4 h-4 text-[#D4AF76]" />
                        <span className="text-xs md:text-sm text-[#8B6B4C] font-medium tracking-wider uppercase">
                            Latest Collection
                        </span>
                    </motion.div>
                    
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-[#2C2C2C] tracking-tight mb-4">
                        New Arrivals
                    </h2>
                    <p className="text-sm md:text-base lg:text-lg text-gray-600 font-light max-w-2xl mx-auto">
                        Discover our newest pieces, handpicked for their exceptional beauty and craftsmanship
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded-3xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Grid Layout */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
                        >
                            {products.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    variants={itemVariants}
                                    onHoverStart={() => setHoveredProduct(product._id)}
                                    onHoverEnd={() => setHoveredProduct(null)}
                                    className="group relative"
                                >
                                    <Link href={`/products/${product._id}`} className="block">
                                        {/* Product Card */}
                                        <div className="relative overflow-hidden bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500">
                                            {/* Image Container */}
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                                                <SafeImage
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill={true}
                                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                                
                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                
                                                {/* NEW Badge */}
                                                <motion.div 
                                                    initial={{ scale: 0, rotate: -45 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="absolute top-4 left-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full px-3 py-1.5 shadow-lg z-10"
                                                >
                                                    <span className="text-xs font-semibold tracking-wider">NEW</span>
                                                </motion.div>

                                                {/* Quick View Badge */}
                                                <AnimatePresence>
                                                    {hoveredProduct === product._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#2C2C2C] rounded-full p-2.5 shadow-lg z-10"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                
                                                {/* Add to Cart Button */}
                                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className="w-full bg-white/95 backdrop-blur-sm text-[#2C2C2C] px-4 py-3 rounded-full hover:bg-[#D4AF76] hover:text-white transition-all duration-300 text-sm font-medium shadow-xl flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                        Add to Cart
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="mt-5 text-center px-2">
                                            <p className="text-xs text-[#D4AF76] font-medium tracking-widest uppercase mb-2">
                                                {product.category}
                                            </p>
                                            <h3 className="text-[#2C2C2C] font-medium text-base lg:text-lg mb-2 line-clamp-2 group-hover:text-[#8B6B4C] transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-[#2C2C2C] font-semibold text-lg">
                                                ₹{product.sellingPrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* View All Button */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center mt-12 md:mt-16"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/products')}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] text-white px-8 py-4 rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300 group"
                            >
                                <span>View All Products</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
}