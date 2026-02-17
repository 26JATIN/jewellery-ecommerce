"use client";
/**
 * Collections Component - Enhanced & Seamless
 * 
 * Features:
 * - Dynamic search functionality: Searches products (not categories)
 * - Smooth animations and transitions throughout
 * - Consistent design with home page
 * - Beautiful product cards with hover effects
 * - Enhanced loading and error states
 * - Responsive grid layout
 * - SEO-friendly with proper heading hierarchy
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SafeImage from './SafeImage';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { isProductOutOfStock, getEffectiveStock, hasLowStock } from '@/lib/productUtils';

export default function Collections() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('featured'); // featured, price-low, price-high, newest
    const [viewMode, setViewMode] = useState('list'); // list or grid for products

    // Set initial search term from URL
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (searchTerm) {
            fetchProducts();
        } else {
            fetchCategories();
        }
    }, [searchTerm]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const timestamp = Date.now();
            const response = await fetch(`/api/categories?_=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const timestamp = Date.now();
            const response = await fetch(`/api/products?limit=2000&_=${timestamp}`, {

                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (response.ok) {
                const data = await response.json();
                // API returns paginated response with data nested
                if (data.success && Array.isArray(data.data)) {
                    setProducts(data.data);
                } else if (Array.isArray(data)) {
                    // Backward compatibility if API returns direct array
                    setProducts(data);
                } else {
                    console.error('Unexpected API response format:', data);
                    setProducts([]);
                }
            } else {
                setError('Failed to fetch products');
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort products
    const filteredProducts = (Array.isArray(products) ? products : [])
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.sellingPrice || a.price) - (b.sellingPrice || b.price);
                case 'price-high':
                    return (b.sellingPrice || b.price) - (a.sellingPrice || a.price);
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

    const handleCategoryClick = (categorySlug) => {
        router.push(`/collections/${categorySlug}`);
    };

    // Clear search functionality
    const clearSearch = () => {
        setSearchTerm('');
        // Update URL to remove search parameter
        router.push('/collections');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white pt-20 md:pt-24 lg:pt-28 pb-8 md:pb-12 lg:pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 lg:mb-12"
                >
                    <div className="text-center">
                        <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">
                            {searchTerm ? 'Search Results' : 'Explore'}
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2C2C] mb-4 tracking-tight">
                            {searchTerm ? 'Product Search' : 'Our Collections'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
                            {searchTerm
                                ? `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} matching your search`
                                : 'Discover our curated selection of jewelry collections, each crafted with precision and passion'
                            }
                        </p>

                        {searchTerm && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="mt-6 inline-flex items-center gap-3 bg-white dark:bg-[#0A0A0A] dark:border dark:border-white/[0.06] px-6 py-3 rounded-full shadow-sm"
                            >
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Searching for "<span className="font-medium text-[#D4AF76]">{searchTerm}</span>"
                                </span>
                                <button
                                    onClick={clearSearch}
                                    className="text-sm text-white bg-[#D4AF76] hover:bg-[#8B6B4C] px-4 py-1.5 rounded-full transition-colors font-medium flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Search
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Filter & Sort Bar - Only show for products */}
                {!loading && !error && searchTerm && filteredProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A] rounded-2xl p-4 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/[0.06]"
                    >
                        {/* Results Count */}
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm font-medium text-[#2C2C2C]">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                            </span>
                        </div>

                        {/* Sort & View Controls */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Sort Dropdown */}
                            <div className="relative flex-1 sm:flex-initial">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-light text-[#2C2C2C] hover:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 focus:border-[#D4AF76] transition-all cursor-pointer"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* View Toggle - Mobile and Desktop */}
                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/[0.06] rounded-xl p-1">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                            ? 'bg-white dark:bg-white/[0.1] shadow-sm text-[#D4AF76]'
                                            : 'text-gray-400 hover:text-[#2C2C2C] dark:hover:text-gray-200'
                                        }`}
                                    title="List View"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                            ? 'bg-white dark:bg-white/[0.1] shadow-sm text-[#D4AF76]'
                                            : 'text-gray-400 hover:text-[#2C2C2C] dark:hover:text-gray-200'
                                        }`}
                                    title="Grid View"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4AF76]/20"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#D4AF76] absolute top-0 left-0"></div>
                        </div>
                        <p className="mt-6 text-gray-600 dark:text-gray-400 font-light">
                            {searchTerm ? 'Searching products...' : 'Loading collections...'}
                        </p>
                    </motion.div>
                )}

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-20"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">Something went wrong</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light mb-6">{error}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={searchTerm ? fetchProducts : fetchCategories}
                                className="px-6 py-3 bg-[#8B6B4C] text-white rounded-full hover:bg-[#7A5D42] transition-colors font-light shadow-lg"
                            >
                                Try Again
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Products/Categories Grid */}
                {!loading && !error && (
                    <>
                        {searchTerm ? (
                            // Show Products when searching
                            <>
                                {filteredProducts.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center py-20"
                                    >
                                        <div className="max-w-md mx-auto">
                                            <div className="bg-gradient-to-br from-[#D4AF76]/10 to-[#8B6B4C]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-12 h-12 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">No products found</h3>
                                            <p className="text-gray-600 dark:text-gray-400 font-light mb-6">
                                                We couldn't find any products matching "<span className="font-medium text-[#D4AF76]">{searchTerm}</span>"
                                            </p>
                                            <button
                                                onClick={clearSearch}
                                                className="px-6 py-3 bg-[#8B6B4C] text-white rounded-full hover:bg-[#7A5D42] transition-colors font-light"
                                            >
                                                Browse All Collections
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Mobile View - List or Grid based on viewMode */}
                                        {viewMode === 'list' ? (
                                            <div className="md:hidden space-y-4">
                                                {filteredProducts.map((product, index) => (
                                                    <motion.div
                                                        key={product._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                                                    >
                                                        <Link href={`/products/${product._id}`} className="block group">
                                                            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl md:rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:shadow-lg transition-all duration-300">
                                                                <div className="flex gap-3 md:gap-4 p-3 md:p-4">
                                                                    {/* Product Image */}
                                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                                                                        <div className="aspect-square overflow-hidden rounded-lg relative">
                                                                            <SafeImage
                                                                                src={product.images?.[0] || product.image}
                                                                                alt={product.name}
                                                                                fill
                                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                                            />
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                                            {/* Stock Badge */}
                                                                            {hasLowStock(product) && (
                                                                                <div className="absolute top-1 right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-1.5 py-0.5 shadow-lg">
                                                                                    <span className="text-[9px] sm:text-[10px] font-medium">{getEffectiveStock(product)}</span>
                                                                                </div>
                                                                            )}
                                                                            {isProductOutOfStock(product) && (
                                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                                                    <span className="text-[9px] sm:text-[10px] text-white font-medium">Out</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Product Info */}
                                                                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                                                                        <div>
                                                                            <p className="text-[9px] sm:text-[10px] text-[#D4AF76] font-light mb-0.5 sm:mb-1 uppercase tracking-wider">{product.category}</p>
                                                                            <h3 className="text-xs sm:text-sm font-light text-[#2C2C2C] mb-1 sm:mb-1.5 line-clamp-2 leading-snug group-hover:text-[#D4AF76] transition-colors">
                                                                                {product.name}
                                                                            </h3>
                                                                        </div>

                                                                        {/* Price */}
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-sm sm:text-base font-medium text-[#2C2C2C]">
                                                                                ₹{product.sellingPrice?.toLocaleString('en-IN')}
                                                                            </span>
                                                                            {product.mrp && product.mrp > product.sellingPrice && (
                                                                                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                                                                    <span className="text-[9px] sm:text-[10px] text-gray-400 line-through font-light">
                                                                                        ₹{product.mrp.toLocaleString('en-IN')}
                                                                                    </span>
                                                                                    <span className="text-[9px] sm:text-[10px] text-green-600 font-medium bg-green-50 px-1 sm:px-1.5 py-0.5 rounded">
                                                                                        {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Mobile Grid View */
                                            <div className="md:hidden grid grid-cols-2 gap-4">
                                                {filteredProducts.map((product, index) => (
                                                    <motion.div
                                                        key={product._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                                                    >
                                                        <Link href={`/products/${product._id}`} className="block group">
                                                            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:shadow-lg transition-all duration-300">
                                                                {/* Product Image */}
                                                                <div className="aspect-square overflow-hidden relative">
                                                                    <SafeImage
                                                                        src={product.images?.[0] || product.image}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    />

                                                                    {/* Stock Badge */}
                                                                    {hasLowStock(product) && (
                                                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-2 py-1 shadow-lg">
                                                                            <span className="text-xs font-medium">{getEffectiveStock(product)} left</span>
                                                                        </div>
                                                                    )}
                                                                    {isProductOutOfStock(product) && (
                                                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-2 py-1 shadow-lg">
                                                                            <span className="text-xs font-medium">Out of Stock</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Product Info */}
                                                                <div className="p-3">
                                                                    <p className="text-xs text-[#D4AF76] font-light mb-1 uppercase tracking-wide">{product.category}</p>
                                                                    <h3 className="text-sm font-light text-[#2C2C2C] mb-2 line-clamp-2 group-hover:text-[#D4AF76] transition-colors">
                                                                        {product.name}
                                                                    </h3>

                                                                    {/* Price */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-lg font-light text-[#2C2C2C]">
                                                                            ₹{product.sellingPrice?.toLocaleString('en-IN')}
                                                                        </span>
                                                                        {product.mrp && product.mrp > product.sellingPrice && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs text-gray-400 line-through font-light">
                                                                                    ₹{product.mrp.toLocaleString('en-IN')}
                                                                                </span>
                                                                                <span className="text-xs text-green-600 font-medium">
                                                                                    {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Desktop View - List or Grid based on viewMode */}
                                        {viewMode === 'list' ? (
                                            <div className="hidden md:block space-y-6">
                                                {filteredProducts.map((product, index) => (
                                                    <motion.div
                                                        key={product._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                                                    >
                                                        <Link href={`/products/${product._id}`} className="block group">
                                                            <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                                                                <div className="flex gap-6 p-6">
                                                                    {/* Product Image */}
                                                                    <div className="w-64 flex-shrink-0">
                                                                        <div className="aspect-square overflow-hidden rounded-2xl relative">
                                                                            <SafeImage
                                                                                src={product.images?.[0] || product.image}
                                                                                alt={product.name}
                                                                                fill
                                                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                            />
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                                            {/* Stock Badge */}
                                                                            {hasLowStock(product) && (
                                                                                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-3 py-1.5 shadow-lg">
                                                                                    <span className="text-xs font-medium">Only {getEffectiveStock(product)} left</span>
                                                                                </div>
                                                                            )}
                                                                            {isProductOutOfStock(product) && (
                                                                                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-3 py-1.5 shadow-lg">
                                                                                    <span className="text-xs font-medium">Out of Stock</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Product Info */}
                                                                    <div className="flex-1 flex flex-col justify-between py-2">
                                                                        <div>
                                                                            <div className="flex items-start justify-between mb-3">
                                                                                <div>
                                                                                    <p className="text-xs text-[#D4AF76] font-light mb-2 uppercase tracking-widest">{product.category}</p>
                                                                                    <h3 className="text-2xl font-light text-[#2C2C2C] mb-3 group-hover:text-[#D4AF76] transition-colors">
                                                                                        {product.name}
                                                                                    </h3>
                                                                                </div>
                                                                            </div>

                                                                            <p className="text-gray-600 dark:text-gray-400 text-sm font-light leading-relaxed mb-4 line-clamp-2">
                                                                                {product.description}
                                                                            </p>

                                                                            {/* Specifications if available */}
                                                                            {(product.metal || product.purity || product.weight) && (
                                                                                <div className="flex gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                                                                    {product.metal && (
                                                                                        <span className="flex items-center gap-1">
                                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                                                            </svg>
                                                                                            {product.metal}
                                                                                        </span>
                                                                                    )}
                                                                                    {product.purity && <span>{product.purity}</span>}
                                                                                    {product.weight && <span>{product.weight}g</span>}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Price Section */}
                                                                        <div className="flex items-end justify-between">
                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex items-baseline gap-3">
                                                                                    <span className="text-3xl font-light text-[#2C2C2C]">
                                                                                        ₹{product.sellingPrice?.toLocaleString('en-IN')}
                                                                                    </span>
                                                                                    {product.mrp && product.mrp > product.sellingPrice && (
                                                                                        <span className="text-base text-gray-400 line-through font-light">
                                                                                            ₹{product.mrp.toLocaleString('en-IN')}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {product.mrp && product.mrp > product.sellingPrice && (
                                                                                    <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                        </svg>
                                                                                        Save {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}%
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {/* Arrow Icon */}
                                                                            <div className="w-12 h-12 rounded-full bg-[#D4AF76]/10 group-hover:bg-[#D4AF76] flex items-center justify-center transition-all">
                                                                                <svg className="w-6 h-6 text-[#D4AF76] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                                                </svg>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Desktop Grid View */
                                            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-6">
                                                {filteredProducts.map((product, index) => (
                                                    <motion.div
                                                        key={product._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                                                    >
                                                        <Link href={`/products/${product._id}`} className="block group">
                                                            <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                                                                {/* Product Image */}
                                                                <div className="aspect-square overflow-hidden relative">
                                                                    <SafeImage
                                                                        src={product.images?.[0] || product.image}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                                    {/* Stock Badge */}
                                                                    {hasLowStock(product) && (
                                                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-3 py-1.5 shadow-lg">
                                                                            <span className="text-xs font-medium">Only {getEffectiveStock(product)} left</span>
                                                                        </div>
                                                                    )}
                                                                    {isProductOutOfStock(product) && (
                                                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-3 py-1.5 shadow-lg">
                                                                            <span className="text-xs font-medium">Out of Stock</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Product Info */}
                                                                <div className="p-5">
                                                                    <p className="text-xs text-[#D4AF76] font-light mb-2 uppercase tracking-widest">
                                                                        {typeof product.category === 'object' ? product.category?.name : product.category}
                                                                    </p>
                                                                    <h3 className="text-base font-light text-[#2C2C2C] mb-3 line-clamp-2 group-hover:text-[#D4AF76] transition-colors">
                                                                        {product.name}
                                                                    </h3>

                                                                    {/* Price */}
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-2xl font-light text-[#2C2C2C]">
                                                                            ₹{product.sellingPrice?.toLocaleString('en-IN')}
                                                                        </span>
                                                                        {product.mrp && product.mrp > product.sellingPrice && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm text-gray-400 line-through font-light">
                                                                                    ₹{product.mrp.toLocaleString('en-IN')}
                                                                                </span>
                                                                                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                                                                    {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Results Count */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="text-center mt-12"
                                        >
                                            <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0A0A0A] dark:border dark:border-white/[0.06] px-6 py-3 rounded-full shadow-sm">
                                                <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 font-light">
                                                    Showing <span className="font-medium text-[#D4AF76]">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </>
                        ) : (
                            // Show Categories when not searching
                            <>
                                {categories.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center py-20"
                                    >
                                        <div className="max-w-md mx-auto">
                                            <div className="bg-gradient-to-br from-[#D4AF76]/10 to-[#8B6B4C]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-12 h-12 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <h3 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">No collections yet</h3>
                                            <p className="text-gray-600 dark:text-gray-400 font-light">
                                                Our beautiful jewelry collections will appear here soon
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Categories Grid - Same for Mobile and Desktop */}
                                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                                            {categories.map((category, index) => (
                                                <motion.div
                                                    key={category._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                                                    className="group cursor-pointer"
                                                    onClick={() => handleCategoryClick(category.slug)}
                                                >
                                                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                                                        {/* Category Image */}
                                                        <div className="aspect-[4/3] overflow-hidden relative">
                                                            <SafeImage
                                                                src={category.image}
                                                                alt={category.name}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:from-black/50 transition-all duration-300" />

                                                            {/* Products Count Badge */}
                                                            {category.productsCount > 0 && (
                                                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                                                                    <span className="text-xs font-light text-[#2C2C2C] tracking-wide">
                                                                        {category.productsCount} {category.productsCount === 1 ? 'item' : 'items'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Category Info */}
                                                        <div className="p-6">
                                                            <h3 className="text-xl font-light text-[#2C2C2C] mb-2 group-hover:text-[#D4AF76] transition-colors">
                                                                {category.name}
                                                            </h3>
                                                            <p className="text-gray-500 text-sm font-light leading-relaxed mb-4 line-clamp-2">
                                                                {category.description}
                                                            </p>

                                                            {/* Explore Button */}
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[#D4AF76] text-sm font-light group-hover:text-[#8B6B4C] transition-colors">
                                                                    Explore Collection
                                                                </span>
                                                                <div className="w-8 h-8 rounded-full bg-[#D4AF76]/10 group-hover:bg-[#D4AF76] flex items-center justify-center transition-all">
                                                                    <svg className="w-4 h-4 text-[#D4AF76] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Results Count */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="text-center mt-12"
                                        >
                                            <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0A0A0A] dark:border dark:border-white/[0.06] px-6 py-3 rounded-full shadow-sm">
                                                <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 font-light">
                                                    Showing <span className="font-medium text-[#D4AF76]">{categories.length}</span> {categories.length === 1 ? 'collection' : 'collections'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}