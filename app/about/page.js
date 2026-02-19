"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "../components/Footer";

export default function AboutPage() {
    const coreValues = [
        {
            title: "Authenticity",
            description: "Every piece is certified and hallmarked for purity.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Artistry",
            description: "Designs that merge tradition with contemporary finesse.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            )
        },
        {
            title: "Trust",
            description: "A legacy built on honesty and customer satisfaction.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
        {
            title: "Service",
            description: "From design consultation to lifetime maintenance — we're always with you.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F8F6F3] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#8B6B4C] to-transparent rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block mb-6">
                            <div className="text-sm md:text-base text-[#D4AF76] font-light tracking-[0.2em] uppercase relative">
                                About Nandika Jewellers
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent" />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-6">
                            A Bond of Trust & Quality
                            <br />
                            <span className="text-[#D4AF76]">Since the Beginning</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                            Where Craftsmanship Meets Elegance
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="py-16 lg:py-24 relative">
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 lg:p-16 shadow-xl dark:shadow-none border border-gray-100 dark:border-white/[0.06]"
                    >
                        <div className="space-y-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-light">
                            <p>
                                At <span className="text-[#D4AF76] font-normal">Nandika Jewellers</span>, we believe jewelry is not just an ornament — it&apos;s a reflection of emotion, legacy, and artistry.
                            </p>
                            
                            <p>
                                With years of experience in crafting timeless designs, we combine traditional techniques with modern precision to deliver pieces that speak of both heritage and luxury.
                            </p>
                            
                            <p>
                                From handcrafted gold bangles to elegant diamond necklaces, every creation is designed with care, authenticity, and a promise of purity. Our artisans pour passion into every detail, ensuring you receive jewelry that celebrates your moments beautifully.
                            </p>
                            
                            <p>
                                Trusted by thousands of customers across India, <span className="text-[#D4AF76] font-normal">Nandika Jewellers</span> stands for authenticity, hallmarked quality, and exceptional customer service.
                            </p>
                            
                            <p className="text-xl text-[#2C2C2C] dark:text-gray-200 font-normal italic border-l-4 border-[#D4AF76] pl-6">
                                We don&apos;t just sell jewelry — we create lifelong bonds built on trust, transparency, and timeless design.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-16 lg:py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-6">
                            Our Core Values
                        </h2>
                        <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF76] to-transparent mx-auto" />
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreValues.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl dark:shadow-none transition-all duration-500 border border-gray-100 dark:border-white/[0.06] group-hover:border-[#D4AF76]/30">
                                    {/* Icon */}
                                    <div className="mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                                            {value.icon}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-light text-[#2C2C2C] dark:text-gray-100 mb-4 group-hover:text-[#D4AF76] transition-colors">
                                        {value.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                        {value.description}
                                    </p>

                                    {/* Decorative Element */}
                                    <div className="mt-6 w-12 h-[1px] bg-gradient-to-r from-[#D4AF76] to-transparent group-hover:w-full transition-all duration-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#1A1A1A] to-[#2C2C2C]" />
                
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#D4AF76] to-transparent rounded-full blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white tracking-tight mb-8">
                            Experience the Luxury of Trust
                            <br />
                            <span className="text-[#D4AF76]">with Nandika Jewellers</span>
                        </h2>

                        <p className="text-xl text-gray-300 font-light mb-12 max-w-3xl mx-auto">
                            Discover our exclusive collection of handcrafted jewelry that celebrates your precious moments.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/products">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-4 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-full font-light text-lg tracking-wide hover:shadow-2xl hover:shadow-[#D4AF76]/30 transition-all duration-300"
                                >
                                    Explore Collection
                                </motion.button>
                            </Link>

                            <Link href="/products?category=Bridal">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-4 bg-transparent border-2 border-[#D4AF76] text-[#D4AF76] rounded-full font-light text-lg tracking-wide hover:bg-[#D4AF76] hover:text-white transition-all duration-300"
                                >
                                    View Bridal Collection
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white dark:bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { number: "10+", label: "Years of Excellence" },
                            { number: "50K+", label: "Happy Customers" },
                            { number: "100%", label: "Certified Quality" },
                            { number: "24/7", label: "Customer Support" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center group"
                            >
                                <h3 className="text-4xl lg:text-5xl font-light text-[#D4AF76] mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {stat.number}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 font-light">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer/>
        </main>
    );
}
