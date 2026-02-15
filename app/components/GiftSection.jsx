'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const giftCategories = [
    {
        id: 'women',
        title: 'Gifts for Her',
        subtitle: 'Elegant pieces for the special woman in your life',
        image: '/images/gift-her.png',
        accentColor: '#D4AF76',
        accentLight: '#F5E6D3',
        cardBg: 'bg-[#FFF8F6]',
        borderHover: 'hover:border-rose-200',
        link: '/products?tag=Women',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        items: ['Necklaces', 'Earrings', 'Bangles', 'Rings']
    },
    {
        id: 'men',
        title: 'Gifts for Him',
        subtitle: 'Sophisticated designs for the modern man',
        image: '/images/gift-him.png',
        accentColor: '#D4AF76',
        accentLight: '#F0E8DA',
        cardBg: 'bg-[#F7F6F4]',
        borderHover: 'hover:border-amber-200',
        link: '/products?tag=Men',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <div 
                                    className={`group cursor-pointer rounded-3xl overflow-hidden ${category.cardBg} border border-gray-100 ${category.borderHover} transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-2`}
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                            src={category.image}
                                            alt={category.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority
                                        />
                                        {/* Subtle bottom fade into card */}
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 h-16"
                                            style={{ background: category.id === 'women' 
                                                ? 'linear-gradient(to top, #FFF8F6, transparent)' 
                                                : 'linear-gradient(to top, #F7F6F4, transparent)' 
                                            }}
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="px-6 md:px-8 pb-7 pt-3 md:pb-8">
                                        {/* Icon + Title row */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                                                style={{ backgroundColor: category.accentLight, color: category.accentColor }}
                                            >
                                                {category.icon}
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-medium text-[#2C2C2C] group-hover:text-[#D4AF76] transition-colors duration-300">
                                                {category.title}
                                            </h3>
                                        </div>

                                        {/* Subtitle */}
                                        <p className="text-sm text-gray-500 font-light mb-5 ml-[52px]">
                                            {category.subtitle}
                                        </p>

                                        {/* Items Tags */}
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {category.items.map((item, i) => (
                                                <span 
                                                    key={i}
                                                    className="px-3.5 py-1.5 bg-white rounded-full text-xs text-[#5C5C5C] font-light border border-gray-200/80 shadow-sm"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <div className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                                            <span 
                                                className="text-sm font-medium tracking-wide"
                                                style={{ color: category.accentColor }}
                                            >
                                                Explore Collection
                                            </span>
                                            <svg 
                                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                style={{ color: category.accentColor }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
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
