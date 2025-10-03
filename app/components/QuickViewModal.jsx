"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useNavbar } from "../context/NavbarContext";
import { useEffect } from "react";
import Image from "next/image";

export default function QuickViewModal({ isOpen, onClose, product }) {
    const { addToCart, setIsCartOpen } = useCart();
    const { hideNavbar, showNavbar } = useNavbar();

    // Prevent background scrolling and hide navbar when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px'; // Prevent layout shift
            hideNavbar(); // Hide navbar on mobile
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
            showNavbar(); // Show navbar when modal closes
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
            showNavbar(); // Ensure navbar is shown on cleanup
        };
    }, [isOpen, hideNavbar, showNavbar]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            setIsCartOpen(true);
            onClose();
        }
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && product && (
                <>
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        transition={{ duration: 0.3 }}
                    />
                    
                    {/* Modal Container - Fixed positioning with scrolling */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 60 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 60 }}
                            className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 mx-auto relative"
                            transition={{ 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 30,
                                duration: 0.4 
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on modal
                        >
                            {/* Close Button */}
                            <motion.button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </motion.button>

                            {/* Scrollable Content */}
                            <div className="max-h-[90vh] overflow-y-auto">
                                {/* Mobile Layout */}
                                <div className="block lg:hidden">
                                    {/* Mobile Image */}
                                    <motion.div 
                                        className="relative h-[280px] sm:h-[350px] bg-gradient-to-br from-gray-50 to-gray-100"
                                        initial={{ opacity: 0, y: -30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                    </motion.div>

                                    {/* Mobile Details */}
                                    <motion.div 
                                        className="p-6 space-y-4"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        <div>
                                            <p className="text-[#D4AF76] text-sm font-medium tracking-wider uppercase mb-2">
                                                {product.category}
                                            </p>
                                            <h3 className="text-2xl sm:text-3xl font-light text-[#2C2C2C] mb-3 leading-tight">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl font-semibold text-[#2C2C2C]">
                                                ₹{product.sellingPrice || product.price}
                                            </span>
                                            {product.mrp && product.mrp > (product.sellingPrice || product.price) && (
                                                <>
                                                    <span className="text-lg text-gray-400 line-through">
                                                        ₹{product.mrp}
                                                    </span>
                                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                                                        {Math.round(((product.mrp - (product.sellingPrice || product.price)) / product.mrp) * 100)}% off
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-gray-600 leading-relaxed text-sm mb-4">
                                            {product.description || `Experience the elegance of our handcrafted ${product.category.toLowerCase()}. Each piece is made with the finest materials and attention to detail, designed to complement your unique style and create lasting memories.`}
                                        </p>

                                        {/* Stock Status */}
                                        {product.stock !== undefined && (
                                            <div className="mb-4">
                                                <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {product.stock > 0 ? (
                                                        <>
                                                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                            {product.stock} in stock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                            Out of stock
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {/* Mobile Action Buttons */}
                                        <div className="flex flex-col gap-3 pt-2">
                                            <motion.button
                                                onClick={handleAddToCart}
                                                disabled={product.stock === 0}
                                                className="w-full bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] text-white py-4 px-6 rounded-2xl hover:from-[#D4AF76] hover:to-[#B8956A] transition-all duration-300 font-medium shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </motion.button>
                                            <motion.button
                                                onClick={onClose}
                                                className="w-full py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-2xl hover:border-[#D4AF76] hover:text-[#D4AF76] transition-all duration-300 font-medium"
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                Continue Shopping
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden lg:grid lg:grid-cols-2 lg:gap-0">
                                    {/* Desktop Image */}
                                    <motion.div 
                                        className="relative h-[600px] bg-gradient-to-br from-gray-50 to-gray-100"
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </motion.div>

                                    {/* Desktop Details */}
                                    <motion.div 
                                        className="flex flex-col justify-center p-8 xl:p-12 space-y-6"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                        >
                                            <p className="text-[#D4AF76] text-sm font-medium tracking-wider uppercase mb-2">
                                                {product.category}
                                            </p>
                                            <h3 className="text-3xl xl:text-4xl font-light text-[#2C2C2C] mb-4 leading-tight">
                                                {product.name}
                                            </h3>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                            className="flex items-center gap-4 mb-4"
                                        >
                                            <span className="text-3xl xl:text-4xl font-semibold text-[#2C2C2C]">
                                                ₹{product.sellingPrice || product.price}
                                            </span>
                                            {product.mrp && product.mrp > (product.sellingPrice || product.price) && (
                                                <>
                                                    <span className="text-xl text-gray-400 line-through">
                                                        ₹{product.mrp}
                                                    </span>
                                                    <span className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
                                                        {Math.round(((product.mrp - (product.sellingPrice || product.price)) / product.mrp) * 100)}% off
                                                    </span>
                                                </>
                                            )}
                                        </motion.div>

                                        <motion.p 
                                            className="text-gray-600 leading-relaxed mb-6"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                        >
                                            {product.description || `Experience the elegance of our handcrafted ${product.category.toLowerCase()}. Each piece is made with the finest materials and attention to detail, designed to complement your unique style and create lasting memories.`}
                                        </motion.p>

                                        {/* Desktop Stock Status */}
                                        {product.stock !== undefined && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7, duration: 0.5 }}
                                                className="mb-6"
                                            >
                                                <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {product.stock > 0 ? (
                                                        <>
                                                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                            {product.stock} in stock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                            Out of stock
                                                        </>
                                                    )}
                                                </p>
                                            </motion.div>
                                        )}

                                        {/* Desktop Action Buttons */}
                                        <motion.div 
                                            className="flex gap-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8, duration: 0.5 }}
                                        >
                                            <motion.button
                                                onClick={handleAddToCart}
                                                disabled={product.stock === 0}
                                                className="flex-1 bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] text-white py-4 px-6 rounded-2xl hover:from-[#D4AF76] hover:to-[#B8956A] transition-all duration-300 font-medium shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </motion.button>
                                            <motion.button
                                                onClick={onClose}
                                                className="px-6 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl hover:border-[#D4AF76] hover:text-[#D4AF76] transition-all duration-300 font-medium"
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                Continue Shopping
                                            </motion.button>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}