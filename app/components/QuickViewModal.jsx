"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickViewModal({ isOpen, onClose, product }) {
    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl bg-white p-6 rounded-lg z-50"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative h-[400px]">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-[#8B6B4C] text-sm mb-2">{product.category}</p>
                                <h3 className="text-2xl font-semibold mb-4">{product.name}</h3>
                                <p className="text-xl text-[#8B6B4C] mb-6">${product.price}</p>
                                <p className="text-gray-600 mb-6">
                                    Experience the elegance of our handcrafted {product.category.toLowerCase()}. 
                                    Each piece is made with the finest materials and attention to detail.
                                </p>
                                <button className="bg-[#8B6B4C] text-white px-8 py-3 rounded hover:bg-[#725939] transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}