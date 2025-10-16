"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useNavbar } from "../context/NavbarContext";
import { useEffect } from "react";
import ImageCarousel from "./ImageCarousel";

export default function QuickViewModal({ isOpen, onClose, product }) {
    const { addToCart, setIsCartOpen } = useCart();
    const { hideNavbar, showNavbar } = useNavbar();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            hideNavbar();
        } else {
            document.body.style.overflow = 'unset';
            showNavbar();
        }

        return () => {
            document.body.style.overflow = 'unset';
            showNavbar();
        };
    }, [isOpen, hideNavbar, showNavbar]);

    const handleAddToCart = async () => {
        if (product) {
            const result = await addToCart(product);
            if (result !== false) {
                setIsCartOpen(true);
                onClose();
            }
        }
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative overflow-hidden"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white shadow-lg transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Mobile Layout */}
                            <div className="block lg:hidden max-h-[90vh] overflow-y-auto">
                                <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100">
                                    <ImageCarousel 
                                        images={product.images && product.images.length > 0 ? product.images : product.image}
                                        productName={product.name}
                                        showThumbnails={true}
                                        showDots={true}
                                        autoPlay={true}
                                        autoPlayInterval={4000}
                                    />
                                </div>
                                
                                <div className="p-6">
                                    <h2 className="text-2xl font-light text-[#2C2C2C] mb-2">{product.name}</h2>
                                    <p className="text-[#D4AF76] text-sm mb-4">{product.category}</p>
                                    
                                    <div className="flex items-baseline gap-3 mb-6">
                                        <span className="text-3xl font-light text-[#2C2C2C]">₹{product.sellingPrice}</span>
                                        {product.mrp && product.mrp > product.sellingPrice && (
                                            <>
                                                <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
                                                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                                    {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="w-full bg-[#2C2C2C] text-white py-4 rounded-2xl font-medium text-lg hover:bg-[#D4AF76] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex min-h-[600px]">
                                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
                                    <div className="aspect-square w-full max-w-lg">
                                        <ImageCarousel 
                                            images={product.images && product.images.length > 0 ? product.images : product.image}
                                            productName={product.name}
                                            showThumbnails={true}
                                            showDots={true}
                                            autoPlay={true}
                                            autoPlayInterval={4000}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-8 flex flex-col justify-center" style={{ maxWidth: '500px' }}>
                                    <h2 className="text-4xl font-light text-[#2C2C2C] mb-3">{product.name}</h2>
                                    <p className="text-[#D4AF76] mb-6">{product.category}</p>
                                    
                                    <div className="flex items-baseline gap-4 mb-8">
                                        <span className="text-4xl font-light text-[#2C2C2C]">₹{product.sellingPrice}</span>
                                        {product.mrp && product.mrp > product.sellingPrice && (
                                            <>
                                                <span className="text-xl text-gray-400 line-through">₹{product.mrp}</span>
                                                <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                                                    {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="bg-[#2C2C2C] text-white py-4 px-8 rounded-2xl font-light text-lg hover:bg-[#D4AF76] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
