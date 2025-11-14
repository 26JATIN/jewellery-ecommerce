"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "carousel1.png",
        },
        {
            image: "carousel2.png",
        },
        {
            image: "carousel3.png",
        }
    ];

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(timer);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] lg:h-screen overflow-hidden bg-black">
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
                        <Image
                            src={`/${slides[currentSlide].image}`}
                            alt="Nandika Jewellers"
                            fill
                            className="object-cover object-center"
                            priority
                            quality={90}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Text Overlay - Only for first slide */}
            {currentSlide === 0 && (
                <div className="absolute inset-0 z-20">
                    {/* Center Content - Main Heading */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-serif italic"
                            style={{ 
                                color: '#D1B48E',
                                textShadow: '0 0 20px rgba(209, 180, 142, 0.3)',
                                fontFamily: "'Playfair Display', serif"
                            }}
                        >
                            Designing Moments
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-2xl md:text-3xl lg:text-4xl mt-4 font-light"
                            style={{ color: '#E0E0E0' }}
                        >
                            that last forever
                        </motion.p>
                    </div>

                    {/* Bottom Bar */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 py-6 lg:py-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-8 text-sm lg:text-base" style={{ color: '#EAEAEA' }}>
                            {/* Bottom Left - Contact Info */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="flex flex-col gap-2 items-center lg:items-start"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-light">nandikajewellers.in</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-light">+91 9993439307</span>
                                </div>
                            </motion.div>

                            {/* Bottom Middle - Empty for first slide */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.9 }}
                                className="flex items-center gap-2"
                            >
                            </motion.div>

                            {/* Bottom Right - Features/Certifications */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 1.1 }}
                                className="flex items-center gap-4 lg:gap-6"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Rated 4.9/5</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Certified Quality</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Free Returns</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Text Overlay - For second slide */}
            {currentSlide === 1 && (
                <div className="absolute inset-0 z-20">
                    {/* Center Content - Second Slide */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
                            style={{ 
                                background: 'linear-gradient(to bottom, #D1D1D1, #9A9A9A)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Trusted Quality
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-2xl md:text-4xl lg:text-5xl mb-6 font-light italic"
                            style={{ 
                                color: '#FFFFFF',
                                fontFamily: "'Playfair Display', serif"
                            }}
                        >
                            timeless bond
                        </motion.p>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="text-lg md:text-2xl lg:text-3xl font-light"
                            style={{ color: '#C4A75A' }}
                        >
                            Guaranteed Purity and Intricate Craftsmanship
                        </motion.p>
                    </div>

                    {/* Bottom Bar for second slide */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 py-6 lg:py-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-8 text-sm lg:text-base" style={{ color: '#EAEAEA' }}>
                            {/* Bottom Left - Contact Info */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.9 }}
                                className="flex flex-col gap-2 items-center lg:items-start"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-light">nandikajewellers.in</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-light">+91 9993439307</span>
                                </div>
                            </motion.div>

                            {/* Bottom Middle - Empty */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.1 }}
                                className="flex items-center gap-2"
                            >
                            </motion.div>

                            {/* Bottom Right - Features/Certifications */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 1.3 }}
                                className="flex items-center gap-4 lg:gap-6"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Rated 4.9/5</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Certified Quality</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Free Returns</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Text Overlay - For third slide */}
            {currentSlide === 2 && (
                <div className="absolute inset-0 z-20">
                    {/* Center Content - Third Slide */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="text-3xl md:text-5xl lg:text-6xl mb-2 font-light"
                            style={{ 
                                color: '#DCC180',
                                fontFamily: "'Cormorant Garamond', serif"
                            }}
                        >
                            Your
                        </motion.p>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-5xl md:text-7xl lg:text-9xl mb-6 font-light"
                            style={{ 
                                color: '#DCC180',
                                fontFamily: "'Cormorant Garamond', serif"
                            }}
                        >
                            Destination
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="text-xl md:text-2xl lg:text-3xl font-light"
                            style={{ color: '#FFFFFF' }}
                        >
                            for Hallmarked Gold & Pure Silver
                        </motion.p>
                    </div>

                    {/* Bottom Bar for third slide */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 py-6 lg:py-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-8 text-sm lg:text-base" style={{ color: '#FFFFFF' }}>
                            {/* Bottom Left - Contact Info */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.9 }}
                                className="flex flex-col gap-2 items-center lg:items-start"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-light">nandikajewellers.in</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-light">+91 9993439307</span>
                                </div>
                            </motion.div>

                            {/* Bottom Middle - Address */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.1 }}
                                className="flex items-center gap-2 text-center lg:text-left"
                            >
                                <span className="font-light max-w-md">Soni Gali, Kankari Chok, Malwa, Barod, Madhya Pradesh - 465550</span>
                            </motion.div>

                            {/* Bottom Right - Features/Certifications */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 1.3 }}
                                className="flex items-center gap-4 lg:gap-6"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Rated 4.9/5</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Certified Quality</span>
                                </div>
                                <div className="w-px h-4 bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <span className="font-light">Free Returns</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide Navigation Dots */}
            <div className="absolute bottom-24 lg:bottom-28 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 ${
                            currentSlide === index 
                                ? 'w-8 h-2 bg-[#D1B48E]' 
                                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                        } rounded-full`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}