"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SafeImage from './SafeImage';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedTags, setSelectedTags] = useState([]);
    
    // Set initial search term and category from URL
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        const categoryFromUrl = searchParams.get('category');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [searchParams]);

    // Fetch categories and products
    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories([{ name: 'All', slug: 'all' }, ...data]);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([{ name: 'All', slug: 'all' }]);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesTags = selectedTags.length === 0 || 
                (product.tags && product.tags.some(tag => selectedTags.includes(tag)));
            return matchesCategory && matchesSearch && matchesTags;
        })
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

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        // Update URL without navigation
        const params = new URLSearchParams(searchParams);
        if (categoryName === 'All') {
            params.delete('category');
        } else {
            params.set('category', categoryName);
        }
        router.replace(`/products?${params.toString()}`, { shallow: true });
    };

    const clearSearch = () => {
        setSearchTerm('');
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        router.replace(`/products?${params.toString()}`, { shallow: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white pt-4 md:pt-6 lg:pt-8 pb-6 md:pb-8 lg:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6 md:mb-8 lg:mb-10"
                >
                    <p className="text-xs md:text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-1 md:mb-2">
                        {searchTerm ? 'Search Results' : 'Shop by Category'}
                    </p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] tracking-tight mb-3 md:mb-4">
                        {searchTerm ? 'Product Search' : 'Explore Collections'}
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 font-light max-w-2xl mx-auto">
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
                            className="mt-6 inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm"
                        >
                            <span className="text-sm text-gray-600">
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
                </motion.div>
                
                {/* Category Story Badges */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6 md:mb-8 lg:mb-10"
                >
                    <div className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide py-2 px-1">
                        {categories.map((category, index) => (
                            <motion.button
                                key={category.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryClick(category.name)}
                                className="flex flex-col items-center gap-1.5 md:gap-2 min-w-[64px] md:min-w-[76px] lg:min-w-[80px] group"
                            >
                                {/* Circular Image Container with Story Ring */}
                                <div className={`
                                    relative rounded-full p-[3px] transition-all duration-300
                                    ${selectedCategory === category.name
                                        ? 'bg-gradient-to-tr from-[#D4AF76] via-[#C19A6B] to-[#8B6B4C]'
                                        : 'bg-gradient-to-tr from-gray-200 to-gray-300 group-hover:from-[#D4AF76]/50 group-hover:to-[#8B6B4C]/50'
                                    }
                                `}>
                                    <div className="bg-white rounded-full p-[3px]">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5] flex items-center justify-center shadow-sm">
                                            {category.image ? (
                                                <img 
                                                    src={category.image} 
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full">
                                                    {category.name === 'All' ? (
                                                        <svg className="w-6 h-6 md:w-7 md:h-7 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6 md:w-7 md:h-7 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                        </svg>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Active Indicator */}
                                    {selectedCategory === category.name && (
                                        <motion.div
                                            layoutId="activeRing"
                                            className="absolute -inset-[2px] rounded-full"
                                            style={{
                                                background: 'linear-gradient(135deg, #D4AF76, #8B6B4C)',
                                                filter: 'blur(4px)',
                                                opacity: 0.4
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
                                
                                {/* Category Name */}
                                <span className={`
                                    text-[10px] md:text-xs font-light tracking-wide transition-colors duration-300 text-center
                                    ${selectedCategory === category.name 
                                        ? 'text-[#D4AF76] font-medium' 
                                        : 'text-[#2C2C2C] group-hover:text-[#D4AF76]'
                                    }
                                `}>
                                    {category.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Tag Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-6 md:mb-8"
                >
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                        <label className="block text-sm font-medium text-[#2C2C2C] mb-3">
                            Filter by Target Audience
                        </label>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {['Men', 'Women', 'Kids'].map((tag) => (
                                <motion.button
                                    key={tag}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (selectedTags.includes(tag)) {
                                            setSelectedTags(selectedTags.filter(t => t !== tag));
                                        } else {
                                            setSelectedTags([...selectedTags, tag]);
                                        }
                                    }}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                                        ${selectedTags.includes(tag)
                                            ? 'bg-[#D4AF76] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    {tag}
                                    {selectedTags.includes(tag) && (
                                        <span className="ml-2">✓</span>
                                    )}
                                </motion.button>
                            ))}
                            {selectedTags.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedTags([])}
                                    className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300"
                                >
                                    Clear Tags ✕
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Filter & Sort Bar */}
                {!loading && filteredProducts.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100"
                    >
                        {/* Results Count */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-xs md:text-sm font-medium text-[#2C2C2C]">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                                {selectedCategory !== 'All' && <span className="hidden sm:inline"> in {selectedCategory}</span>}
                            </span>
                        </div>

                        {/* Sort & View Controls */}
                        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                            {/* Sort Dropdown */}
                            <div className="relative flex-1 sm:flex-initial min-w-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 pr-8 md:pr-10 text-xs md:text-sm font-light text-[#2C2C2C] hover:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 focus:border-[#D4AF76] transition-all cursor-pointer"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price ↑</option>
                                    <option value="price-high">Price ↓</option>
                                </select>
                                <svg className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center gap-0.5 md:gap-1 bg-gray-50 rounded-lg md:rounded-xl p-0.5 md:p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 md:p-2.5 rounded-md md:rounded-lg transition-all ${
                                        viewMode === 'grid' 
                                            ? 'bg-white text-[#D4AF76] shadow-sm' 
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="Grid View"
                                >
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 md:p-2.5 rounded-md md:rounded-lg transition-all ${
                                        viewMode === 'list' 
                                            ? 'bg-white text-[#D4AF76] shadow-sm' 
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="List View"
                                >
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Products Grid/List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-64 text-center"
                    >
                        <svg className="w-20 h-20 text-[#D4AF76] opacity-40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xl text-[#2C2C2C] font-light">
                            {searchTerm || selectedCategory !== 'All' 
                                ? 'No products found' 
                                : 'No products available'
                            }
                        </p>
                        <p className="text-gray-500 mt-2">
                            {searchTerm 
                                ? 'Try adjusting your search terms' 
                                : selectedCategory !== 'All' 
                                    ? 'Try selecting a different category' 
                                    : 'Check back soon for new items'
                            }
                        </p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={`${selectedCategory}-${viewMode}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
                                    : "space-y-4"
                            }
                        >
                            {filteredProducts.map((product, index) => (
                                viewMode === 'grid' ? (
                                    <ProductCard key={product._id} product={product} index={index} />
                                ) : (
                                    <ProductListItem key={product._id} product={product} index={index} />
                                )
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

// Grid Product Card Component
function ProductCard({ product, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
        >
            <Link href={`/products/${product._id}`} className="block">
                <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1 md:group-hover:-translate-y-2">
                    <div className="relative aspect-[4/5] overflow-hidden">
                        <SafeImage
                            src={product.image}
                            alt={product.name}
                            fill={true}
                            className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Mobile-optimized badge */}
                        <div className="absolute top-2 left-2 md:top-3 md:left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-[#D4AF76] text-[10px] md:text-xs px-2 py-1 rounded-full font-medium">
                                {product.category}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 md:p-4 lg:p-6">
                        <h3 className="text-[#2C2C2C] font-light text-sm md:text-base lg:text-lg mb-2 md:mb-3 group-hover:text-[#D4AF76] transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="text-[#2C2C2C] font-medium text-sm md:text-base lg:text-xl">
                            ₹{(product.sellingPrice || product.price).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// List Product Item Component
function ProductListItem({ product, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/products/${product._id}`} className="block">
                <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-[#D4AF76]/20 border border-transparent">
                    <div className="flex gap-3 md:gap-4 lg:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-48 xl:h-48 flex-shrink-0 relative">
                            <SafeImage
                                src={product.image}
                                alt={product.name}
                                fill={true}
                                className="object-cover rounded-lg md:rounded-xl group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <p className="text-[10px] sm:text-xs text-[#D4AF76] font-medium tracking-wide uppercase mb-1 sm:mb-2">
                                {product.category}
                            </p>
                            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl text-[#2C2C2C] font-light mb-1 sm:mb-2 md:mb-3 group-hover:text-[#D4AF76] transition-colors line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-[#2C2C2C] font-medium">
                                ₹{product.sellingPrice.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}