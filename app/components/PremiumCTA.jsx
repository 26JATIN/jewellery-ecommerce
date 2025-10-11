"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';

export default function PremiumCTA() {
    const router = useRouter();

    const features = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            ),
            title: "Custom Design",
            description: "Bespoke pieces tailored to your vision"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            ),
            title: "Certified Quality",
            description: "Every piece comes with authenticity guarantee"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: "Lifetime Service",
            description: "Complimentary maintenance and repairs"
        }
    ];

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <CldImage
                    src="carousel3_xpvlxx.jpg"
                    alt="Luxury jewelry background"
                    fill
                    className="object-cover"
                    quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
            </div>

            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#D4AF76] rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [-20, 20],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Content Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-white"
                    >
                        <div className="mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="inline-block mb-6"
                            >
                                <p className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                                    Exclusive Experience
                                    <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#D4AF76] to-transparent" />
                                </p>
                            </motion.div>
                            
                            <motion.h2 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 leading-tight"
                            >
                                Luxury <br />
                                <span className="text-[#D4AF76]">Redefined</span>
                            </motion.h2>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-xl md:text-2xl font-light leading-relaxed text-gray-300 mb-8"
                            >
                                Experience the pinnacle of craftsmanship with our exclusive collection. Each piece is a masterwork of design, precision, and timeless elegance.
                            </motion.p>
                        </div>

                        {/* Features */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="space-y-6 mb-12"
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-4 group"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#D4AF76]/20 backdrop-blur-sm flex items-center justify-center text-[#D4AF76] group-hover:bg-[#D4AF76] group-hover:text-white transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-light mb-1 group-hover:text-[#D4AF76] transition-colors duration-300">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 font-light">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                onClick={() => router.push('/products')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full font-light tracking-wide shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Explore Collection
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8B6B4C] to-[#D4AF76] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.button>

                            <motion.button
                                onClick={() => router.push('/contact')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-light tracking-wide hover:bg-white hover:text-[#2C2C2C] hover:border-white transition-all duration-300 backdrop-blur-sm"
                            >
                                Custom Consultation
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Visual Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Decorative Frame */}
                        <div className="relative">
                            {/* Floating Elements */}
                            <motion.div 
                                animate={{ 
                                    y: [-10, 10, -10],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{ 
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] rounded-full blur-xl opacity-60"
                            />
                            
                            <motion.div 
                                animate={{ 
                                    y: [10, -10, 10],
                                    rotate: [0, -5, 0]
                                }}
                                transition={{ 
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-[#8B6B4C] to-[#D4AF76] rounded-full blur-xl opacity-40"
                            />

                            {/* Premium Badge */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="relative z-10 max-w-md mx-auto"
                            >
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] rounded-full flex items-center justify-center">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-light text-white mb-3">
                                            Premium Collection
                                        </h3>
                                        <p className="text-[#D4AF76] font-light mb-6">
                                            Exclusively Crafted
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">Limited Edition</span>
                                                <span className="text-white">Available</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">Handcrafted</span>
                                                <span className="text-[#D4AF76]">✓</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">Lifetime Warranty</span>
                                                <span className="text-[#D4AF76]">✓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}