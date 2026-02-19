"use client";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ImageCarousel from './ImageCarousel';
import { useCart } from '../context/CartContext';
import { isProductOutOfStock, getEffectiveStock, hasLowStock, getAddToCartButtonText } from '@/lib/productUtils';

export default function ProductGrid({
    products,
    loading = false,
    error = null,
    showAddToCart = true,
    className = "",
    emptyMessage = "No products found."
}) {
    const { addToCart, setIsCartOpen } = useCart();

    const handleAddToCart = async (product) => {
        // If product has variants, redirect to detail page for variant selection
        if (product.hasVariants) {
            window.location.href = `/products/${product._id}`;
            return;
        }

        const result = await addToCart(product);
        // Only open cart if item was successfully added (user is authenticated)
        if (result !== false) {
            setIsCartOpen(true);
        }
    };

    if (loading) {
        return (
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 ${className}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#0A0A0A] rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 shimmer" />
                        <div className="p-3 md:p-6 space-y-2 md:space-y-3">
                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 shimmer" />
                            <div className="h-4 md:h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 shimmer" />
                            <div className="h-5 md:h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3 shimmer" />
                        </div>
                    </div>
                ))}
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
                className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6 ${className}`}
            >
                <AnimatePresence>
                    {products.map((product, index) => (
                        <motion.div
                            key={product._id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group card-hover"
                        >
                            {/* Mobile Layout - Amazon Style with Rounded Cards */}
                            <div className="lg:hidden bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="relative aspect-square overflow-hidden">
                                    <ImageCarousel
                                        images={product.images && product.images.length > 0 ? product.images : product.image}
                                        productName={product.name}
                                        showThumbnails={false}
                                        showDots={product.images && product.images.length > 1}
                                        autoPlay={false}
                                    />
                                    {isProductOutOfStock(product) && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded-full">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-[#2C2C2C] text-sm font-medium mb-1 line-clamp-2">{product.name}</h3>
                                    <p className="text-xs text-[#D4AF76] mb-2">
                                        {typeof product.category === 'object' ? (typeof product.category.name === 'object' ? product.category.name?.name : product.category.name) : product.category}
                                    </p>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[#2C2C2C] font-semibold text-sm">₹{product.sellingPrice || product.price}</span>
                                        {product.mrp && product.mrp > (product.sellingPrice || product.price) && (
                                            <>
                                                <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                                                <span className="text-xs text-green-600 font-medium">
                                                    {Math.round(((product.mrp - (product.sellingPrice || product.price)) / product.mrp) * 100)}% off
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/products/${product._id}`} className="flex-1">
                                            <button
                                                className="w-full bg-gray-100 text-[#2C2C2C] px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                View
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isProductOutOfStock(product)}
                                            className="flex-1 bg-[#2C2C2C] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#D4AF76] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {getAddToCartButtonText(product)}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout - Original Design with More Rounded Cards */}
                            <div className="hidden lg:block relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="relative aspect-square overflow-hidden">
                                    <ImageCarousel
                                        images={product.images && product.images.length > 0 ? product.images : product.image}
                                        productName={product.name}
                                        showThumbnails={false}
                                        showDots={product.images && product.images.length > 3}
                                        autoPlay={false}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    {/* Hover Actions */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex gap-2">
                                            <Link href={`/products/${product._id}`} className="flex-1">
                                                <button
                                                    className="w-full bg-white/95 backdrop-blur-sm text-[#2C2C2C] px-3 py-2.5 rounded-xl hover:bg-[#D4AF76] hover:text-white transition-all duration-300 text-sm font-light"
                                                >
                                                    View Details
                                                </button>
                                            </Link>
                                            {showAddToCart && (
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex-1 bg-[#2C2C2C] text-white px-3 py-2.5 rounded-xl hover:bg-[#D4AF76] transition-all duration-300 text-sm font-light"
                                                >
                                                    {getAddToCartButtonText(product, 'Add', 'Options', 'Unavailable')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 text-center p-4">
                                    <p className="text-xs text-[#D4AF76] font-light tracking-widest uppercase mb-2">
                                        {typeof product.category === 'object' ? (typeof product.category.name === 'object' ? product.category.name?.name : product.category.name) : product.category}
                                    </p>
                                    <h3 className="text-[#2C2C2C] font-light text-base mb-2 px-2">{product.name}</h3>
                                    <div className="flex justify-center items-center gap-2">
                                        {product.mrp && product.mrp > product.sellingPrice && (
                                            <span className="line-through text-gray-400 text-sm mr-2">₹{product.mrp}</span>
                                        )}
                                        <span className="text-[#2C2C2C] font-normal">₹{product.sellingPrice}</span>
                                    </div>
                                    {(() => {
                                        const effectiveStock = getEffectiveStock(product);
                                        return effectiveStock !== undefined && (
                                            <p className={`text-xs font-light mt-2 ${effectiveStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {effectiveStock > 0 ? `${effectiveStock} in stock` : 'Out of stock'}
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </>
    );
}