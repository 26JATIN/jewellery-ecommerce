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
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
                <div className="max-w-4xl mx-auto px-6 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        {/* Subtitle */}
                        <motion.p 
                            key={`subtitle-${currentSlide}`}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm tracking-widest uppercase text-white/80"
                        >
                            {slides[currentSlide].subtitle}
                        </motion.p>

                        {/* Main Title */}
                        <motion.h1 
                            key={`title-${currentSlide}`}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight"
                        >
                            {slides[currentSlide].title}
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            key={`desc-${currentSlide}`}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto text-white/90"
                        >
                            {slides[currentSlide].description}
                        </motion.p>

                        {/* CTA Button */}
                        <div className="pt-8">
                            <motion.button
                                key={`cta-${currentSlide}`}
                                initial={{ opacity: 0.7 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                onClick={scrollToProducts}
                                className="px-8 py-3 bg-white text-black rounded hover:bg-white/90 transition-colors font-medium"
                            >
                                {slides[currentSlide].cta}
                            </motion.button>
                        </div>
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