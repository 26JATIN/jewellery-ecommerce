"use client";
import React, { useRef, useState } from "react"; // Add useState
import { motion } from "framer-motion";
import QuickViewModal from "./QuickViewModal"; // Add import

export default function NewArrivals() {
    const scrollRef = useRef(null);
    // Add state for modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const products = [
        {
            id: 1,
            name: "Diamond Pendant Necklace",
            price: 1299,
            image: "/product1.jpg",
            category: "Necklaces"
        },
        {
            id: 2,
            name: "Rose Gold Ring",
            price: 899,
            image: "/product2.jpg",
            category: "Rings"
        },
        {
            id: 3,
            name: "Pearl Drop Earrings",
            price: 599,
            image: "/product3.jpg",
            category: "Earrings"
        },
        {
            id: 4,
            name: "Sapphire Bracelet",
            price: 1499,
            image: "/product4.jpg",
            category: "Bracelets"
        },
        {
            id: 5,
            name: "Gold Chain Necklace",
            price: 799,
            image: "/product5.jpg",
            category: "Necklaces"
        },
        {
            id: 6,
            name: "Diamond Stud Earrings",
            price: 999,
            image: "/product6.jpg",
            category: "Earrings"
        },
    ];

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-3xl font-semibold text-[#8B6B4C] relative">
                        New Arrivals
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#8B6B4C]"></span>
                    </h2>
                </div>
                <div className="flex justify-end mb-8">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full border border-[#8B6B4C] text-[#8B6B4C] hover:bg-[#8B6B4C] hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full border border-[#8B6B4C] text-[#8B6B4C] hover:bg-[#8B6B4C] hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div 
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide py-4"
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="min-w-[280px] group"
                        >
                            <div className="relative overflow-hidden bg-white rounded-lg shadow-sm">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-[350px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                                    <button 
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsModalOpen(true);
                                        }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#8B6B4C] px-6 py-2 
                                            opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#8B6B4C] hover:text-white rounded"
                                    >
                                        Quick View
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 text-center px-2">
                                <p className="text-sm text-[#8B6B4C] mb-1">{product.category}</p>
                                <h3 className="text-gray-900 font-light text-lg mb-1">{product.name}</h3>
                                <p className="text-gray-700">${product.price}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <QuickViewModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </section>
    );
}