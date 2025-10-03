"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import QuickViewModal from "./QuickViewModal";
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';

export default function NewArrivals() {
    const scrollRef = useRef(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToCart, setIsCartOpen } = useCart();
    
    const { products: allProducts, loading } = useProducts();
    
    // Show only first 6 products sorted by creation date (newest first)
    const products = allProducts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    const scroll = (direction) => {
        const container = scrollRef.current;
        const scrollAmount = 300;
        
        if (container) {
            const start = container.scrollLeft;
            const target = direction === 'left' 
                ? start - scrollAmount 
                : start + scrollAmount;
            
            const duration = 500; // Animation duration in ms
            const startTime = performance.now();
            
            const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOutQuad = t => t < 0.5 
                    ? 2 * t * t 
                    : 1 - Math.pow(-2 * t + 2, 2) / 2;
                
                container.scrollLeft = start + (target - start) * easeInOutQuad(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };
            
            requestAnimationFrame(animateScroll);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        setIsCartOpen(true);
    };

    return (
        <section id="new-arrivals" className="py-20 px-4 bg-[#FAFAFA]">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">Latest Collection</p>
                        <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-tight">
                            New Arrivals
                        </h2>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full border border-[#E5E5E5] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full border border-[#E5E5E5] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white hover:border-[#2C2C2C] transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                ) : (
                <div 
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide py-4"
                >
                    {products.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="min-w-[300px] md:min-w-[320px] group card-hover"
                        >
                            <div className="relative overflow-hidden bg-white rounded-3xl">
                                <div className="relative aspect-[3/4] overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Hover Actions */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="flex-1 bg-white/95 backdrop-blur-sm text-[#2C2C2C] px-4 py-3 rounded-full hover:bg-[#D4AF76] hover:text-white transition-all duration-300 text-sm font-light"
                                            >
                                                Quick View
                                            </button>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 bg-[#2C2C2C] text-white px-4 py-3 rounded-full hover:bg-[#D4AF76] transition-all duration-300 text-sm font-light"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 text-center">
                                <p className="text-xs text-[#D4AF76] font-light tracking-widest uppercase mb-2">{product.category}</p>
                                <h3 className="text-[#2C2C2C] font-light text-lg mb-2">{product.name}</h3>
                                <p className="text-[#2C2C2C] font-normal">₹{product.sellingPrice || product.price}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
                )}
            </div>

            <QuickViewModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </section>
    );
}