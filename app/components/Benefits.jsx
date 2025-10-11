"use client";
import { motion } from "framer-motion";

export default function Benefits() {
    const benefits = [
        {
            id: 1,
            title: "Free Shipping",
            description: "On all orders over ₹5,000",
            details: "Complimentary secure delivery to your doorstep",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            color: "from-emerald-500 to-teal-600"
        },
        {
            id: 2,
            title: "30 Days Return",
            description: "Money back guarantee",
            details: "Hassle-free returns with full refund",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
            ),
            color: "from-blue-500 to-indigo-600"
        },
        {
            id: 3,
            title: "Secure Payment",
            description: "100% secure checkout",
            details: "Bank-grade encryption & multiple payment options",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            color: "from-purple-500 to-violet-600"
        },
        {
            id: 4,
            title: "24/7 Support",
            description: "Dedicated customer service",
            details: "Expert assistance whenever you need it",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: "from-orange-500 to-red-500"
        }
    ];

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FAFAFA] to-[#F8F6F3]" />
            
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-[#8B6B4C] to-transparent rounded-full blur-3xl" />
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
                            Why Choose Us
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                        </p>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] tracking-tight mb-6">
                        Premium Benefits
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
                        Experience the luxury of exceptional service with every purchase
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative"
                        >
                            {/* Card Container */}
                            <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-[#D4AF76]/30 h-full">
                                {/* Icon Container */}
                                <div className="relative mb-6">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                        {benefit.icon}
                                    </div>
                                    {/* Glow Effect */}
                                    <div className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <h3 className="text-xl lg:text-2xl font-light text-[#2C2C2C] group-hover:text-[#D4AF76] transition-colors duration-300">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 font-light leading-relaxed">
                                        {benefit.description}
                                    </p>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                                        {benefit.details}
                                    </p>
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    <div className="w-8 h-8 bg-[#D4AF76] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                                        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                                        <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1" className="text-[#D4AF76]"/>
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <p className="text-lg text-gray-600 font-light mb-6">
                        Join thousands of satisfied customers who trust our commitment to excellence
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] border-2 border-white flex items-center justify-center text-white text-xs font-light">
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-600 font-light ml-3">
                            Trusted by 10,000+ customers
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}