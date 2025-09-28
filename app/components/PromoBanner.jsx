"use client";
import { motion } from "framer-motion";

export default function PromoBanner() {
    return (
        <section className="py-16 bg-gradient-to-r from-[#8B6B4C] to-[#725939]">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm"
                >
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="w-full h-full">
                            <motion.div 
                                animate={{ 
                                    x: ["0%", "100%"],
                                    opacity: [0, 1, 0] 
                                }}
                                transition={{ 
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "linear" 
                                }}
                                className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                            />
                        </div>
                    </div>

                    <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                        <div className="text-white space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-sm font-semibold tracking-wider uppercase">Limited Time Offer</span>
                                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                                    25% OFF on Diamond Collection
                                </h2>
                                <p className="mt-4 text-white/80">
                                    Discover our exquisite selection of diamond jewelry. 
                                    Use code SHINE25 at checkout.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex gap-4 mt-8">
                                    <button className="px-8 py-3 bg-white text-[#8B6B4C] rounded-lg hover:bg-white/90 transition-colors font-medium">
                                        Shop Now
                                    </button>
                                    <button className="px-8 py-3 border border-white text-white rounded-lg hover:bg-white/10 transition-colors">
                                        Learn More
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="hidden md:flex justify-end"
                        >
                            <div className="relative w-72 h-72">
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                                <div className="absolute inset-4 rounded-full bg-white/30" />
                                <div className="absolute inset-8 rounded-full bg-white/40 flex items-center justify-center">
                                    <span className="text-6xl font-bold text-white">25%</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}