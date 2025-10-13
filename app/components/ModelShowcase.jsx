"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with WebGL
const CircularGallery = dynamic(
  () => import('@/components/ui/circular-gallery'),
  { ssr: false }
);

export default function ModelShowcase() {
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGalleryItems();
    }, []);

    const fetchGalleryItems = async () => {
        try {
            const res = await fetch('/api/gallery?activeOnly=true');
            if (res.ok) {
                const data = await res.json();
                setGalleryItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch gallery items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#1A1A1A] to-black" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 bg-gray-700 rounded w-1/3 mx-auto"></div>
                        <div className="h-96 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (galleryItems.length === 0) {
        return null; // Don't show section if no items
    }

    // Transform gallery items for OGL component with proper Cloudinary URLs
    const oglItems = galleryItems.map(item => {
        // Convert Cloudinary public ID to full URL
        const cloudinaryUrl = item.mediaUrl.startsWith('http') 
            ? item.mediaUrl 
            : `https://res.cloudinary.com/dolmulfds/image/upload/w_800,q_auto,f_auto/${item.mediaUrl}`;
        
        return {
            image: cloudinaryUrl,
            text: item.title
        };
    });

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#1A1A1A] to-black" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4AF76] rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#8B6B4C] rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 md:mb-16"
                >
                    <div className="inline-block mb-4 md:mb-6">
                        <p className="text-xs md:text-sm lg:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                            Model Gallery
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </p>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white tracking-tight mb-6 md:mb-8">
                        Elegance in Motion
                    </h2>
                    <p className="text-base md:text-xl lg:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed px-4">
                        Experience the beauty of our jewelry showcased by our stunning models
                    </p>
                </motion.div>

                {/* OGL Circular Gallery */}
                <div className="h-[600px] md:h-[700px] lg:h-[800px] w-full">
                    <CircularGallery
                        items={oglItems}
                        bend={3} // Circular arc effect
                        textColor="#D4AF76" // Gold text color
                        borderRadius={0.05} // Rounded corners
                        font="bold 30px sans-serif"
                        scrollSpeed={2}
                        scrollEase={0.05}
                    />
                </div>

                {/* Bottom hint */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mt-8 md:mt-12"
                >
                    <p className="text-gray-400 text-sm md:text-base font-light flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                        <span className="hidden md:inline">Drag to explore our collection</span>
                        <span className="md:hidden">Swipe to explore</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
