"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const slides = [
        {
            image: "carousel1_l76hra.jpg",
            title: "Timeless Elegance",
            subtitle: "Curated Collection",
            description: "Discover pieces that transcend trends and define luxury",
            cta: "Shop Classics"
        },
        {
            image: "carousel2_gycam4.jpg",
            title: "Artisan Craftsmanship",
            subtitle: "Handcrafted with Precision",
            description: "Every piece tells a story of skilled artisanship and dedication",
            cta: "Explore Craftsmanship"
        },
        {
            image: "carousel3_xpvlxx.jpg",
            title: "New Arrivals",
            subtitle: "Contemporary Luxury",
            description: "Fresh designs that blend modern aesthetics with timeless appeal",
            cta: "View Collection"
        }
    ];

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(timer);
    }, [slides.length]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const scrollToProducts = () => {
        // Navigate to products page
        router.push('/products');
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black pt-16 lg:pt-0 pb-20 lg:pb-0">
            {/* Full-screen Image Slideshow */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <CldImage
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            fill
                            className="object-cover"
                            priority
                            quality={90}
                        />
                        {/* Simple dark overlay */}
                        <div className="absolute inset-0 bg-black/40" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="max-w-5xl mx-auto px-6 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        {/* Subtitle */}
                        <motion.div 
                            key={`subtitle-${currentSlide}`}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm md:text-base tracking-[0.3em] uppercase text-white/90 font-light relative"
                        >
                            <span className="relative z-10">{slides[currentSlide].subtitle}</span>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1 
                            key={`title-${currentSlide}`}
                            initial={{ opacity: 0.7, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight"
                        >
                            <span className="block">{slides[currentSlide].title.split(' ')[0]}</span>
                            <span className="block text-[#D4AF76] mt-2">{slides[currentSlide].title.split(' ')[1]}</span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            key={`desc-${currentSlide}`}
                            initial={{ opacity: 0.7, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto text-white/95 font-light"
                        >
                            {slides[currentSlide].description}
                        </motion.p>

                        {/* Enhanced CTA Section */}
                        <motion.div 
                            key={`cta-section-${currentSlide}`}
                            initial={{ opacity: 0.7, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="pt-8 space-y-6"
                        >
                            {/* Primary CTA */}
                            <motion.button
                                onClick={scrollToProducts}
                                className="group relative px-10 py-5 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full hover:shadow-2xl transition-all duration-500 font-light tracking-wide shadow-xl overflow-hidden"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="relative z-10 flex items-center gap-3 text-lg">
                                    {slides[currentSlide].cta}
                                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8B6B4C] to-[#D4AF76] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.button>

                            {/* Secondary CTA */}
                            <motion.button
                                onClick={() => router.push('/collections')}
                                className="group px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white rounded-full hover:bg-white hover:text-[#2C2C2C] hover:border-white transition-all duration-300 font-light tracking-wide"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="flex items-center gap-2">
                                    Explore Collections
                                    <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </span>
                            </motion.button>

                            {/* Trust Indicators */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="flex items-center justify-center gap-8 pt-8"
                            >
                                <div className="flex items-center gap-2 text-white/80">
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-light">Rated 4.9/5</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2 text-white/80">
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="text-sm font-light">Certified Quality</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2 text-white/80">
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                    </svg>
                                    <span className="text-sm font-light">Free Returns</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide 
                                ? 'bg-white w-8' 
                                : 'bg-white/50 hover:bg-white/70'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}