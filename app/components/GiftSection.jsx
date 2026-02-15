'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const giftCategories = [
    {
        id: 'women',
        title: 'Gifts for Her',
        subtitle: 'Elegant pieces for the special woman',
        description: 'Discover stunning jewelry that speaks to her heart',
        image: '/images/gift-her.jpg',
        gradient: 'from-rose-100 via-pink-50 to-rose-50',
        accentColor: '#E8B4B8',
        iconBg: 'bg-rose-100',
        link: '/products?tag=Women',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        items: ['Necklaces', 'Earrings', 'Bangles', 'Rings']
    },
    {
        id: 'men',
        title: 'Gifts for Him',
        subtitle: 'Sophisticated designs for the modern man',
        description: 'Timeless pieces that complement his style',
        image: '/images/gift-him.jpg',
        gradient: 'from-slate-100 via-gray-50 to-slate-50',
        accentColor: '#8B8B8B',
        iconBg: 'bg-slate-100',
        link: '/products?tag=Men',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        items: ['Chains', 'Bracelets', 'Cufflinks', 'Rings']
    }
];

export default function GiftSection() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-[#FEFDFB] to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#D4AF76]/10 to-[#B8956A]/10 rounded-full text-sm text-[#8B6B4C] font-light tracking-widest uppercase mb-4">
                        Perfect Gifts
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] mb-4">
                        Find the <span className="text-[#D4AF76]">Perfect Gift</span>
                    </h2>
                    <p className="text-gray-500 font-light max-w-2xl mx-auto text-base md:text-lg">
                        Celebrate every special moment with our curated gift collections
                    </p>
                </motion.div>

                {/* Gift Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                    {giftCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                        >
                            <Link href={category.link}>
                                <div className={`relative group cursor-pointer rounded-3xl overflow-hidden bg-gradient-to-br ${category.gradient} p-6 md:p-8 lg:p-10 min-h-[320px] md:min-h-[380px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100/50`}>
                                    {/* Decorative Elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-20 transform translate-x-8 -translate-y-8">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            <circle cx="50" cy="50" r="45" stroke={category.accentColor} strokeWidth="0.5" fill="none" />
                                            <circle cx="50" cy="50" r="35" stroke={category.accentColor} strokeWidth="0.5" fill="none" />
                                            <circle cx="50" cy="50" r="25" stroke={category.accentColor} strokeWidth="0.5" fill="none" />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${category.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`} style={{ color: category.accentColor }}>
                                            {category.icon}
                                        </div>

                                        {/* Title & Subtitle */}
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#2C2C2C] mb-2 group-hover:text-[#D4AF76] transition-colors duration-300">
                                            {category.title}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-600 font-light mb-4">
                                            {category.subtitle}
                                        </p>

                                        {/* Items Tags */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {category.items.map((item, i) => (
                                                <span 
                                                    key={i}
                                                    className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs text-gray-600 font-light border border-gray-200/50"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <div className="flex items-center gap-2 text-[#D4AF76] font-medium text-sm group-hover:gap-4 transition-all duration-300">
                                            <span>Explore Collection</span>
                                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/30 to-transparent" />
                                    </div>

                                    {/* Gift Box Icon - Bottom Right */}
                                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                                        <svg className="w-24 h-24 md:w-32 md:h-32" fill="currentColor" viewBox="0 0 24 24" style={{ color: category.accentColor }}>
                                            <path d="M20 7h-4.586l1.293-1.293a1 1 0 10-1.414-1.414L12 7.586 8.707 4.293a1 1 0 00-1.414 1.414L8.586 7H4a2 2 0 00-2 2v2a1 1 0 001 1h1v6a2 2 0 002 2h12a2 2 0 002-2v-6h1a1 1 0 001-1V9a2 2 0 00-2-2zm-9 11H6v-6h5v6zm0-8H5V9h6v1zm7 8h-5v-6h5v6zm1-8h-6V9h6v1z"/>
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center mt-10 md:mt-14"
                >
                    <p className="text-gray-500 font-light mb-4">
                        Need help choosing the perfect gift?
                    </p>
                    <Link href="/contact">
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C2C2C] text-white rounded-full text-sm font-light hover:bg-[#D4AF76] transition-colors duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Get Expert Advice
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
