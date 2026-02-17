"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/app/components/SafeImage';
import { ChevronRight, X, Filter, SlidersHorizontal, Sparkles } from "lucide-react";

function CollectionContent({ params }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    const categorySlug = params?.slug;

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        const subcategoryFromUrl = searchParams.get('subcategory');
        
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
        if (subcategoryFromUrl) {
            setSelectedSubcategory(subcategoryFromUrl);
        }
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [categoriesRes, subcategoriesRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/subcategories')
            ]);

            const categoriesData = await categoriesRes.json();
            const subcategoriesData = await subcategoriesRes.json();

            const activeCategories = categoriesData.filter(cat => cat.isActive).map(cat => ({
                ...cat,
                name: typeof cat.name === 'object' ? cat.name?.name || '' : cat.name
            }));
            setCategories(activeCategories);
            
            const activeSubcategories = subcategoriesData.success ? subcategoriesData.data.map(sub => ({
                ...sub,
                name: typeof sub.name === 'object' ? sub.name?.name || '' : sub.name,
                category: sub.category ? {
                    ...sub.category,
                    name: typeof sub.category.name === 'object' ? sub.category.name?.name || '' : sub.category.name
                } : sub.category
            })) : [];
            setSubcategories(activeSubcategories);

            // Find category by slug if provided
            if (categorySlug) {
                const category = activeCategories.find(cat => cat.slug === categorySlug);
                if (category && !selectedCategory) {
                    setSelectedCategory(category.name);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [categorySlug, selectedCategory]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory && selectedCategory !== 'All') {
                params.append('category', selectedCategory);
            }
            if (selectedSubcategory && selectedSubcategory !== 'All') {
                params.append('subcategory', selectedSubcategory);
            }

            const queryString = params.toString();
            const url = `/api/products${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                setProducts(data.data);
            } else if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedSubcategory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (selectedCategory || selectedSubcategory) {
            fetchProducts();
        }
    }, [fetchProducts, selectedCategory, selectedSubcategory]);

    const getSubcategoriesForCategory = (categoryName) => {
        return subcategories.filter(sub => {
            const match = sub.category?.name === categoryName || 
                         sub.category === categoryName;
            return match && sub.isActive;
        });
    };

    const filteredProducts = products
        .filter(product => {
            const matchesTags = selectedTags.length === 0 || 
                (product.tags && product.tags.some(tag => selectedTags.includes(tag)));
            return matchesTags;
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

    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName);
        setSelectedSubcategory('All');
        setSidebarOpen(false);
        
        const params = new URLSearchParams();
        if (categoryName !== 'All') {
            params.set('category', categoryName);
        }
        router.replace(`${window.location.pathname}?${params.toString()}`, { shallow: true });
    };

    const handleSubcategorySelect = (subcategoryId) => {
        setSelectedSubcategory(subcategoryId);
        setSidebarOpen(false);
        
        const params = new URLSearchParams(searchParams);
        if (subcategoryId === 'All') {
            params.delete('subcategory');
        } else {
            params.set('subcategory', subcategoryId);
        }
        router.replace(`${window.location.pathname}?${params.toString()}`, { shallow: true });
    };

    const currentCategory = categories.find(cat => cat.name === selectedCategory);
    const currentSubcategories = selectedCategory ? getSubcategoriesForCategory(selectedCategory) : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
            {/* Mobile Filter Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-24 left-4 z-40 bg-[#2C2C2C] text-white p-3 rounded-full shadow-lg"
            >
                <Filter className="w-5 h-5" />
            </motion.button>

            <div className="flex">
                {/* Sidebar */}
                <AnimatePresence>
                    {(sidebarOpen || window.innerWidth >= 1024) && (
                        <>
                            {/* Mobile Overlay */}
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSidebarOpen(false)}
                                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                                />
                            )}

                            {/* Sidebar Content */}
                            <motion.aside
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed lg:sticky top-0 left-0 h-screen w-80 bg-white dark:bg-[#0A0A0A] border-r border-gray-100 dark:border-white/[0.06] overflow-y-auto z-50 lg:z-0 shadow-2xl lg:shadow-none"
                            >
                                {/* Close Button (Mobile) */}
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="lg:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-[#D4AF76]" />
                                            <span className="text-xs text-[#D4AF76] uppercase tracking-wider font-medium">
                                                Filter & Refine
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-light text-[#2C2C2C]">
                                            Collections
                                        </h2>
                                    </div>

                                    {/* Categories */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                            Categories
                                        </h3>
                                        <div className="space-y-1">
                                            <motion.button
                                                whileHover={{ x: 4 }}
                                                onClick={() => handleCategorySelect('All')}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                                    selectedCategory === 'All' || !selectedCategory
                                                        ? 'bg-gradient-to-r from-[#D4AF76] to-[#C19A6B] text-white shadow-md'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">All Collections</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </motion.button>
                                            
                                            {categories.map((category) => (
                                                <motion.button
                                                    key={category._id}
                                                    whileHover={{ x: 4 }}
                                                    onClick={() => handleCategorySelect(category.name)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                                        selectedCategory === category.name
                                                            ? 'bg-gradient-to-r from-[#D4AF76] to-[#C19A6B] text-white shadow-md'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06]'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {category.image && (
                                                                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                                                    <SafeImage
                                                                        src={category.image}
                                                                        alt={category.name}
                                                                        width={32}
                                                                        height={32}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                </div>
                                                            )}
                                                            <span className="font-medium">{typeof category.name === 'object' ? category.name?.name || '' : category.name}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subcategories */}
                                    {selectedCategory && selectedCategory !== 'All' && currentSubcategories.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mb-8 p-4 bg-gradient-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-xl border border-gray-100 dark:border-white/[0.06]"
                                        >
                                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-[#D4AF76] rounded-full"></span>
                                                {selectedCategory} Styles
                                            </h3>
                                            <div className="space-y-1">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSubcategorySelect('All')}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                                        selectedSubcategory === 'All' || !selectedSubcategory
                                                            ? 'bg-[#D4AF76] text-white shadow-sm'
                                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-sm'
                                                    }`}
                                                >
                                                    All {selectedCategory}
                                                </motion.button>
                                                
                                                {currentSubcategories.map((sub) => (
                                                    <motion.button
                                                        key={sub._id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleSubcategorySelect(sub._id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                                            selectedSubcategory === sub._id
                                                                ? 'bg-[#D4AF76] text-white shadow-sm'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-sm'
                                                        }`}
                                                    >
                                                        {typeof sub.name === 'object' ? sub.name?.name || '' : sub.name}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Tags Filter */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                            Target Audience
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
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
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                                        selectedTags.includes(tag)
                                                            ? 'bg-[#2C2C2C] text-white shadow-md'
                                                            : 'bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.12]'
                                                    }`}
                                                >
                                                    {tag}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clear All */}
                                    {(selectedCategory !== 'All' || selectedSubcategory !== 'All' || selectedTags.length > 0) && (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setSelectedCategory('All');
                                                setSelectedSubcategory('All');
                                                setSelectedTags([]);
                                                router.replace(window.location.pathname);
                                            }}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Clear All Filters
                                        </motion.button>
                                    )}
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 lg:ml-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        {/* Breadcrumb & Header */}
                        <div className="mb-8">
                            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <Link href="/" className="hover:text-[#D4AF76] transition-colors">Home</Link>
                                <ChevronRight className="w-4 h-4" />
                                <Link href="/products" className="hover:text-[#D4AF76] transition-colors">Collections</Link>
                                {selectedCategory && selectedCategory !== 'All' && (
                                    <>
                                        <ChevronRight className="w-4 h-4" />
                                        <span className="text-[#D4AF76] font-medium">{selectedCategory}</span>
                                    </>
                                )}
                            </nav>

                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl lg:text-5xl font-light text-[#2C2C2C] mb-2">
                                        {selectedCategory && selectedCategory !== 'All' ? selectedCategory : 'All Collections'}
                                    </h1>
                                    {currentCategory?.description && (
                                        <p className="text-gray-600 dark:text-gray-400 font-light max-w-2xl">
                                            {currentCategory.description}
                                        </p>
                                    )}
                                </div>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-3 pr-10 text-sm font-medium text-[#2C2C2C] hover:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 focus:border-[#D4AF76] transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="newest">Newest</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                    <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Active Filters */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                {selectedSubcategory && selectedSubcategory !== 'All' && (
                                    <span className="inline-flex items-center gap-2 bg-[#D4AF76]/10 text-[#8B6B4C] px-3 py-1.5 rounded-full text-sm font-medium">
                                        {currentSubcategories.find(s => s._id === selectedSubcategory)?.name}
                                        <button
                                            onClick={() => handleSubcategorySelect('All')}
                                            className="hover:text-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedTags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                                        {tag}
                                        <button
                                            onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                                            className="hover:text-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Products Count */}
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                            </span>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-[4/5] bg-gray-200 rounded-xl mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="text-gray-300 mb-4">
                                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-600 dark:text-gray-400 mb-2">No products found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('All');
                                        setSelectedSubcategory('All');
                                        setSelectedTags([]);
                                    }}
                                    className="px-6 py-3 bg-[#D4AF76] text-white rounded-full font-medium hover:bg-[#8B6B4C] transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                            >
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={product._id} product={product} index={index} />
                                ))}
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Product Card Component
function ProductCard({ product, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/products/${product._id}`} className="block">
                <div className="bg-white dark:bg-[#0A0A0A] rounded-xl overflow-hidden shadow-sm hover:shadow-2xl dark:shadow-none dark:border dark:border-white/[0.06] transition-all duration-500 group-hover:-translate-y-2">
                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5]">
                        <SafeImage
                            src={product.image}
                            alt={product.name}
                            fill={true}
                            className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className="bg-white/90 backdrop-blur-sm text-[#D4AF76] text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                {typeof product.category === 'object' ? product.category?.name : product.category}
                            </span>
                            {product.subcategory?.name && (
                                <span className="bg-[#D4AF76]/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                    {product.subcategory.name}
                                </span>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-4">
                        <h3 className="text-[#2C2C2C] font-light text-sm lg:text-base mb-2 group-hover:text-[#D4AF76] transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="text-[#2C2C2C] font-medium text-base lg:text-lg">
                            ₹{(product.sellingPrice || product.price).toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function CollectionPage({ params }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF76]"></div>
            </div>
        }>
            <CollectionContent params={params} />
        </Suspense>
    );
}
