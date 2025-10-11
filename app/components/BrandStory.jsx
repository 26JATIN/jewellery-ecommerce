"use client";
import React from "react";
import { motion } from "framer-motion";
import { CldImage } from 'next-cloudinary';

export default function BrandStory() {
    const stats = [
        { number: "50+", label: "Years of Excellence", description: "Crafting luxury since 1974" },
        { number: "10K+", label: "Happy Customers", description: "Trust built over generations" },
        { number: "500+", label: "Unique Designs", description: "Handcrafted masterpieces" },
        { number: "99%", label: "Customer Satisfaction", description: "Quality you can trust" }
    ];

    const values = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: "Innovation",
            description: "Pioneering new techniques while honoring traditional craftsmanship"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            title: "Excellence",
            description: "Uncompromising quality in every piece we create"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            title: "Passion",
            description: "Every creation is a labor of love and dedication"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: "Trust",
            description: "Building relationships that last generations"
        }
    ];

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
                    className="text-center mb-20"
                >
                    <div className="inline-block mb-6">
                        <p className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                            Our Heritage
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </p>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight mb-8">
                        Crafting Dreams
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
                        For over five decades, we have been creating exceptional jewelry that celebrates life's most precious moments. Our story is one of passion, precision, and unwavering commitment to excellence.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <div className="relative">
                                <h3 className="text-4xl lg:text-5xl font-light text-[#D4AF76] mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {stat.number}
                                </h3>
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#D4AF76]/20 to-[#8B6B4C]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <p className="text-white font-light mb-1 text-lg">
                                {stat.label}
                            </p>
                            <p className="text-gray-400 text-sm font-light">
                                {stat.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Story Content */}
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Text Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-3xl lg:text-4xl font-light text-white mb-6">
                                Where Tradition Meets Innovation
                            </h3>
                            <p className="text-gray-300 font-light leading-relaxed text-lg mb-6">
                                Our journey began in 1974 with a simple vision: to create jewelry that transcends time and trends. What started as a small workshop has evolved into a renowned atelier, yet our commitment to handcrafted excellence remains unchanged.
                            </p>
                            <p className="text-gray-300 font-light leading-relaxed text-lg">
                                Each piece tells a story - of skilled artisans who pour their hearts into every detail, of precious metals and gems carefully selected for their beauty and quality, and of the special moments our jewelry helps celebrate.
                            </p>
                        </div>

                        {/* Values Grid */}
                        <div className="grid grid-cols-2 gap-6 pt-8">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group"
                                >
                                    <div className="text-[#D4AF76] mb-3 group-hover:scale-110 transition-transform duration-300">
                                        {value.icon}
                                    </div>
                                    <h4 className="text-white font-light text-lg mb-2">
                                        {value.title}
                                    </h4>
                                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Image Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                            <CldImage
                                src="carousel2_gycam4.jpg"
                                alt="Artisan crafting jewelry"
                                fill
                                className="object-cover"
                                quality={90}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* Floating Quote */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="absolute -bottom-8 -left-8 right-8 lg:right-auto lg:w-80"
                        >
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                                <div className="text-[#D4AF76] mb-4">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>
                                <p className="text-[#2C2C2C] font-light leading-relaxed mb-4">
                                    "Every piece we create is a testament to our belief that jewelry should be as unique and beautiful as the person wearing it."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white text-sm font-light">
                                        M
                                    </div>
                                    <div>
                                        <p className="text-[#2C2C2C] font-light">Master Artisan</p>
                                        <p className="text-[#D4AF76] text-sm">Founder & Creative Director</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-[#D4AF76]/30 to-transparent rounded-full blur-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}