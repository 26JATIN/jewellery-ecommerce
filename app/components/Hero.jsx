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
            mobileImage: "carousel1-mobile.png",
        },
        {
            image: "carousel2.png",
            mobileImage: "carousel2-mobile.png", // No mobile version yet
        },
        {
            image: "carousel3.png",
            mobileImage: "carousel3-mobile.png", // No mobile version yet
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
        <div className="relative w-full h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-screen overflow-hidden bg-black">
            {/* Full-screen Image Slideshow */}
            <div className="absolute inset-0">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentSlide}
                        initial={{ 
                            opacity: 0,
                        }}
                        animate={{ 
                            opacity: 1,
                        }}
                        exit={{ 
                            opacity: 0,
                        }}
                        transition={{ 
                            duration: 0.8,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0"
                    >
                        {/* Desktop & Tablet Image - Hidden only on small mobile if mobile version exists */}
                        <Image
                            src={`/${slides[currentSlide].image}`}
                            alt="Nandika Jewellers"
                            fill
                            className={`object-cover object-center ${slides[currentSlide].mobileImage ? 'hidden sm:block' : ''}`}
                            priority={currentSlide === 0}
                            quality={90}
                        />
                        
                        {/* Mobile Image - Only for small mobile devices */}
                        {slides[currentSlide].mobileImage && (
                            <Image
                                src={`/${slides[currentSlide].mobileImage}`}
                                alt="Nandika Jewellers Mobile"
                                fill
                                className="sm:hidden object-cover object-center"
                                priority={currentSlide === 0}
                                quality={90}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}