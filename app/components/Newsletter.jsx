"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        
        // Simulate subscription process
        setTimeout(() => {
            setIsSubscribed(true);
            setIsLoading(false);
            setEmail("");
        }, 1500);
    };

    const benefits = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            ),
            title: "Exclusive Previews",
            description: "Be the first to see new collections"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
            title: "Special Offers",
            description: "Members-only discounts and deals"
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: "Style Tips",
            description: "Expert advice on jewelry trends"
        }
    ];

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#1A1A1A] to-black" />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#D4AF76] rounded-full opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
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
                                    Join Our Circle
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
                                Stay in the
                                <br />
                                <span className="text-[#D4AF76]">Loop</span>
                            </motion.h2>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-xl md:text-2xl font-light leading-relaxed text-gray-300 mb-8"
                            >
                                Subscribe to our newsletter and be the first to discover new collections, exclusive offers, and jewelry insights from our master craftsmen.
                            </motion.p>
                        </div>

                        {/* Benefits */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
                        >
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center group"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 bg-[#D4AF76]/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[#D4AF76] group-hover:bg-[#D4AF76] group-hover:text-white transition-all duration-300">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="font-light mb-1 group-hover:text-[#D4AF76] transition-colors duration-300">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm font-light">
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Newsletter Form */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                        >
                            {!isSubscribed ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email address"
                                                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF76] transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-xl font-light tracking-wide hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Subscribing...
                                                </>
                                            ) : (
                                                <>
                                                    Subscribe
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                    <p className="text-gray-400 text-sm font-light">
                                        By subscribing, you agree to our Privacy Policy and Terms of Service. Unsubscribe at any time.
                                    </p>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center p-8 bg-[#D4AF76]/20 backdrop-blur-sm rounded-2xl border border-[#D4AF76]/30"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 bg-[#D4AF76] rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-light mb-2">Welcome to Our Circle!</h3>
                                    <p className="text-gray-300 font-light">
                                        Thank you for subscribing. You'll receive our latest updates and exclusive offers.
                                    </p>
                                </motion.div>
                            )}
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
                        {/* Decorative Elements */}
                        <div className="relative">
                            <motion.div 
                                animate={{ 
                                    rotate: [0, 360],
                                }}
                                transition={{ 
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[#D4AF76]/20 rounded-full"
                            />
                            
                            <motion.div 
                                animate={{ 
                                    rotate: [360, 0],
                                }}
                                transition={{ 
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-[#8B6B4C]/20 rounded-full"
                            />

                            {/* Central Icon */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="relative z-10 w-80 h-80 mx-auto flex items-center justify-center"
                            >
                                <div className="w-32 h-32 bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] rounded-full flex items-center justify-center shadow-2xl">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Floating Icons */}
                            {[
                                { icon: "🎁", position: "top-0 left-1/4", delay: 0.5 },
                                { icon: "💎", position: "top-1/4 right-0", delay: 0.7 },
                                { icon: "✨", position: "bottom-1/4 left-0", delay: 0.9 },
                                { icon: "💝", position: "bottom-0 right-1/4", delay: 1.1 },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    animate={{
                                        y: [-5, 5, -5],
                                        rotate: [-5, 5, -5]
                                    }}
                                    transition={{
                                        opacity: { duration: 0.6, delay: item.delay },
                                        y: {
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.5
                                        },
                                        rotate: {
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.5
                                        }
                                    }}
                                    className={`absolute ${item.position} w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl border border-white/20`}
                                >
                                    {item.icon}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}