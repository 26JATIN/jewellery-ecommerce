"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import QuickViewModal from './QuickViewModal';
import { useCart } from '../context/CartContext';

export default function ProductGrid({ 
    products, 
    loading = false, 
    error = null,
    showQuickView = true,
    showAddToCart = true,
    className = "",
    emptyMessage = "No products found."
}) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToCart, setIsCartOpen } = useCart();

    const handleAddToCart = (product) => {
        addToCart(product);
        setIsCartOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load products: {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-[#8B6B4C] text-white px-4 py-2 rounded hover:bg-[#6d5238]"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            <motion.div 
                layout
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}
            >
                <AnimatePresence>
                    {products.map((product) => (
                        <motion.div
                            key={product._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="group"
                        >
                            <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        {showQuickView && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="bg-white text-[#8B6B4C] px-6 py-2 rounded hover:bg-[#8B6B4C] hover:text-white transition-colors"
                                            >
                                                Quick View
                                            </button>
                                        )}
                                        {showAddToCart && (
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-white text-[#8B6B4C] px-6 py-2 rounded hover:bg-[#8B6B4C] hover:text-white transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-[#8B6B4C] mb-1">{product.category}</p>
                                <h3 className="text-gray-900 font-light text-lg mb-1">{product.name}</h3>
                                <div className="flex justify-center items-center gap-2">
                                    {product.mrp && product.mrp > (product.sellingPrice || product.price) && (
                                        <span className="text-sm text-gray-500 line-through">₹{product.mrp}</span>
                                    )}
                                    <span className="text-gray-700 font-medium">₹{product.sellingPrice || product.price}</span>
                                </div>
                                {product.stock !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {showQuickView && (
                <QuickViewModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={selectedProduct}
                />
            )}
        </>
    );
}