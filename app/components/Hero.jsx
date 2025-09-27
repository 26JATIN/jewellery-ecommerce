"use client";
import React, { useState, useEffect } from "react";

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "/carousel1.jpg",
            title: "Timeless Elegance",
            subtitle: "Discover our exclusive collection"
        },
        {
            image: "/carousel2.jpg",
            title: "Luxury Defined",
            subtitle: "Handcrafted with precision"
        },
        {
            image: "/carousel3.jpg",
            title: "New Arrivals",
            subtitle: "Experience contemporary designs"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Multiple overlay layers for better text visibility */}
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                        <h1 className="text-5xl md:text-6xl font-light mb-4 drop-shadow-lg">{slide.title}</h1>
                        <p className="text-xl md:text-2xl drop-shadow-lg">{slide.subtitle}</p>
                        <button className="mt-8 px-8 py-3 bg-[#8B6B4C] text-white hover:bg-[#725939] transition-colors">
                            Shop Now
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}