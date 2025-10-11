"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Testimonials() {
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Bride",
            location: "Mumbai",
            text: "The wedding collection exceeded my expectations. Every piece was absolutely stunning and made my special day even more magical. The craftsmanship is unparalleled.",
            rating: 5,
            image: "SJ",
            purchase: "Diamond Bridal Set"
        },
        {
            id: 2,
            name: "Emily Parker",
            role: "Fashion Blogger",
            location: "Delhi",
            text: "The quality and craftsmanship of their jewelry is unmatched. Each piece tells a story and adds elegance to any outfit. Highly recommend to anyone looking for luxury.",
            rating: 5,
            image: "EP",
            purchase: "Gold Chain Collection"
        },
        {
            id: 3,
            name: "Michael Roberts",
            role: "Loyal Customer",
            location: "Bangalore",
            text: "Outstanding customer service and beautiful pieces that last forever. I've been buying from them for years and they never disappoint. True artistry in every piece.",
            rating: 5,
            image: "MR",
            purchase: "Custom Ring Design"
        },
        {
            id: 4,
            name: "Priya Sharma",
            role: "Interior Designer",
            location: "Chennai",
            text: "Absolutely love the contemporary designs! They perfectly blend traditional craftsmanship with modern aesthetics. My go-to place for special occasion jewelry.",
            rating: 5,
            image: "PS",
            purchase: "Heritage Collection"
        },
        {
            id: 5,
            name: "David Wilson",
            role: "CEO",
            location: "Pune",
            text: "Exceptional quality and service. Bought an anniversary gift and my wife was thrilled. The attention to detail and packaging was impressive. Will definitely return.",
            rating: 5,
            image: "DW",
            purchase: "Anniversary Necklace"
        },
        {
            id: 6,
            name: "Anita Gupta",
            role: "Doctor",
            location: "Hyderabad",
            text: "Beautiful, authentic pieces with excellent customer care. The team helped me choose the perfect earrings for my daughter's graduation. Couldn't be happier!",
            rating: 5,
            image: "AG",
            purchase: "Diamond Earrings"
        }
    ];

    const stats = [
        { number: "50K+", label: "Happy Customers" },
        { number: "4.9", label: "Average Rating" },
        { number: "99%", label: "Satisfaction Rate" },
        { number: "24/7", label: "Customer Support" }
    ];

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAFA] via-[#F8F6F3] to-white" />
            
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#8B6B4C] to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-20"
                >
                    <div className="inline-block mb-6">
                        <p className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                            Testimonials
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </p>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] tracking-tight mb-6">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                        Don't just take our word for it. Here's what our valued customers have to say about their experience with us.
                    </p>
                </motion.div>

                {/* Stats Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
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
                            <h3 className="text-3xl lg:text-4xl font-light text-[#D4AF76] mb-2 group-hover:scale-110 transition-transform duration-300">
                                {stat.number}
                            </h3>
                            <p className="text-gray-600 font-light">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Testimonials Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {testimonials.slice(0, 3).map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-[#D4AF76]/30 h-full">
                                {/* Quote Icon */}
                                <div className="mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Review Text */}
                                <p className="text-gray-700 mb-6 font-light leading-relaxed text-lg">
                                    "{testimonial.text}"
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-[#D4AF76]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                {/* Customer Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white font-light text-lg shadow-lg">
                                        {testimonial.image}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-light text-[#2C2C2C] text-lg group-hover:text-[#D4AF76] transition-colors">
                                            {testimonial.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-light mb-1">
                                            {testimonial.role} • {testimonial.location}
                                        </p>
                                        <p className="text-xs text-[#D4AF76] font-light">
                                            Purchased: {testimonial.purchase}
                                        </p>
                                    </div>
                                </div>

                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                                        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Testimonials Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {testimonials.slice(3, 6).map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-[#D4AF76]/30 hover:bg-white transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white text-sm font-light">
                                    {testimonial.image}
                                </div>
                                <div>
                                    <h4 className="font-light text-[#2C2C2C] group-hover:text-[#D4AF76] transition-colors">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 font-light">
                                        {testimonial.role}
                                    </p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3 text-[#D4AF76]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 font-light text-sm leading-relaxed">
                                "{testimonial.text.slice(0, 100)}..."
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}