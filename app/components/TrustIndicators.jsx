"use client";
import React from "react";
import { motion } from "framer-motion";

export default function TrustIndicators() {
    const certifications = [
        {
            name: "ISO 9001",
            description: "Quality Management",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            )
        },
        {
            name: "GIA Certified",
            description: "Gemological Institute",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            )
        },
        {
            name: "Hallmarked",
            description: "Bureau of Indian Standards",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            name: "Eco-Friendly",
            description: "Sustainable Practices",
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        }
    ];

    const awards = [
        { year: "2024", title: "Excellence in Craftsmanship", organization: "Jewelry Association of India" },
        { year: "2023", title: "Best Design Innovation", organization: "International Jewelry Awards" },
        { year: "2022", title: "Customer Choice Award", organization: "Luxury Retail Council" },
        { year: "2021", title: "Sustainable Business Practice", organization: "Green Business Initiative" }
    ];

    const partners = [
        "Razorpay", "PayPal", "SSL Secured", "RBI Approved", "PCI Compliant"
    ];

    return (
        <section className="py-16 bg-gradient-to-b from-white to-[#FAFAFA] dark:from-black dark:to-[#050505] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="trust-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="1" fill="#D4AF76"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#trust-pattern)"/>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-block mb-4">
                        <div className="text-sm text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                            Trust & Excellence
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight">
                        Certified Quality & Security
                    </h2>
                </motion.div>

                {/* Certifications Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
                >
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-lg flex items-center justify-center text-[#D4AF76] group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                {cert.icon}
                            </div>
                            <h3 className="font-light text-[#2C2C2C] dark:text-gray-100 mb-1 group-hover:text-[#D4AF76] transition-colors">
                                {cert.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                                {cert.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Awards & Recognition */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Awards List */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl md:text-3xl font-light text-[#2C2C2C] dark:text-gray-100 mb-4">
                                Awards & Recognition
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                Our commitment to excellence has been recognized by industry leaders and prestigious organizations worldwide.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            {awards.map((award, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex gap-6 group"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#D4AF76]/20 to-[#8B6B4C]/20 rounded-xl flex items-center justify-center text-[#D4AF76] font-light text-lg group-hover:bg-gradient-to-br group-hover:from-[#D4AF76] group-hover:to-[#8B6B4C] group-hover:text-white transition-all duration-300">
                                        {award.year}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-light text-[#2C2C2C] dark:text-gray-100 mb-1 group-hover:text-[#D4AF76] transition-colors">
                                            {award.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                                            {award.organization}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Security Features */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 shadow-lg dark:border dark:border-white/[0.06]"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-light text-[#2C2C2C] dark:text-gray-100 mb-2">
                                Secure Shopping
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light">
                                Your privacy and security are our top priority
                            </p>
                        </div>

                        {/* Security Partners */}
                        <div className="space-y-4">
                            {partners.map((partner, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center justify-between py-3 px-4 bg-[#FAFAFA] dark:bg-white/[0.04] rounded-xl hover:bg-[#D4AF76]/10 transition-colors"
                                >
                                    <span className="text-[#2C2C2C] dark:text-gray-200 font-light">{partner}</span>
                                    <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            ))}
                        </div>

                        {/* Trust Score */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="mt-8 text-center"
                        >
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF76]/20 to-[#8B6B4C]/20 px-6 py-3 rounded-full">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-[#D4AF76]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-[#2C2C2C] dark:text-gray-200 font-light">99.8% Trust Score</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}