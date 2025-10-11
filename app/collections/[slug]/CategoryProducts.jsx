"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SafeImage from '../../components/SafeImage';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Product Card Component (Grid View)
function ProductCard({ product, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
        >
            <Link href={`/products/${product._id}`} className="block group">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <div className="aspect-square overflow-hidden relative">
                        <SafeImage
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-2 md:px-3 py-1 md:py-1.5 shadow-lg">
                                <span className="text-xs font-medium">{product.stock} left</span>
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-2 md:px-3 py-1 md:py-1.5 shadow-lg">
                                <span className="text-xs font-medium">Out of Stock</span>
                            </div>
                        )}
                    </div>
                    <div className="p-3 md:p-6">
                        <p className="text-xs text-[#D4AF76] font-light mb-1 md:mb-2 uppercase tracking-wide">{product.category}</p>
                        <h3 className="text-sm md:text-lg font-light text-[#2C2C2C] mb-2 line-clamp-2 group-hover:text-[#D4AF76] transition-colors">
                            {product.name}
                        </h3>
                        <div className="flex flex-col gap-1">
                            <span className="text-lg md:text-2xl font-light text-[#2C2C2C]">
                                ₹{product.sellingPrice?.toLocaleString('en-IN')}
                            </span>
                            {product.mrp && product.mrp > product.sellingPrice && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs md:text-sm text-gray-400 line-through font-light">
                                        ₹{product.mrp.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-green-600 font-medium md:bg-green-50 md:px-2 md:py-1 md:rounded-full">
                                        {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% off
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Product List Item Component (List View - Responsive)
function ProductListItem({ product, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
        >
            <Link href={`/products/${product._id}`} className="block group">
                <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg md:hover:shadow-2xl transition-all duration-300 md:duration-500 group-hover:-translate-y-0.5 md:group-hover:-translate-y-1">
                    <div className="flex gap-3 md:gap-4 lg:gap-6 p-3 md:p-4 lg:p-6">
                        {/* Product Image - Responsive Sizing */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 xl:w-64 xl:h-64 flex-shrink-0">
                            <div className="aspect-square overflow-hidden rounded-lg md:rounded-xl lg:rounded-2xl relative">
                                <SafeImage
                                    src={product.images?.[0] || product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500 md:duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                {/* Stock Badges */}
                                {product.stock <= 5 && product.stock > 0 && (
                                    <div className="absolute top-1 right-1 md:top-2 md:right-2 lg:top-4 lg:right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full px-1.5 py-0.5 md:px-2 md:py-1 lg:px-3 lg:py-1.5 shadow-lg">
                                        <span className="text-[9px] md:text-[10px] lg:text-xs font-medium">
                                            <span className="hidden sm:inline">Only </span>{product.stock}<span className="hidden sm:inline"> left</span>
                                        </span>
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg md:rounded-xl lg:rounded-2xl">
                                        <span className="text-[10px] md:text-xs lg:text-sm text-white font-medium">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Product Info - Responsive Layout */}
                        <div className="flex-1 flex flex-col justify-between py-0.5 md:py-1 lg:py-2 min-w-0">
                            <div>
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-[#D4AF76] font-light mb-0.5 md:mb-1 lg:mb-2 uppercase tracking-wider">{product.category}</p>
                                <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-light text-[#2C2C2C] mb-1 md:mb-2 lg:mb-3 line-clamp-2 leading-snug group-hover:text-[#D4AF76] transition-colors">
                                    {product.name}
                                </h3>
                                <p className="hidden md:block text-gray-600 text-xs lg:text-sm font-light leading-relaxed mb-2 lg:mb-4 line-clamp-2">
                                    {product.description}
                                </p>
                            </div>
                            
                            {/* Price Section - Responsive */}
                            <div className="flex items-end justify-between gap-2">
                                <div className="flex flex-col gap-0.5 md:gap-1 lg:gap-2 min-w-0">
                                    <div className="flex items-baseline gap-1 md:gap-2 lg:gap-3 flex-wrap">
                                        <span className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-medium md:font-light text-[#2C2C2C]">
                                            ₹{product.sellingPrice?.toLocaleString('en-IN')}
                                        </span>
                                        {product.mrp && product.mrp > product.sellingPrice && (
                                            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-400 line-through font-light">
                                                ₹{product.mrp.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </div>
                                    {product.mrp && product.mrp > product.sellingPrice && (
                                        <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-green-600 font-medium bg-green-50 px-1.5 py-0.5 md:px-2 md:py-1 lg:px-3 rounded-full inline-flex items-center gap-1 w-fit">
                                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="sm:hidden">{Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}%</span>
                                            <span className="hidden sm:inline">Save {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}%</span>
                                        </span>
                                    )}
                                </div>
                                
                                {/* Arrow Icon - Hidden on small mobile */}
                                <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-[#D4AF76]/10 group-hover:bg-[#D4AF76] items-center justify-center transition-all flex-shrink-0">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[#D4AF76] group-hover:text-white group-hover:translate-x-0.5 md:group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function CategoryProducts({ slug }) {
    const router = useRouter();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('list'); // list or grid
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchCategoryProducts();
        }
    }, [slug, sortBy, currentPage]);

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(
                `/api/categories/${slug}/products?sortBy=${sortBy}&page=${currentPage}&limit=12`
            );
            
            if (response.ok) {
                const data = await response.json();
                setCategory(data.category);
                setProducts(data.products);
                setPagination(data.pagination);
            } else if (response.status === 404) {
                setError('Category not found');
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching category products:', error);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && !category) {
        return (
            <div className="min-h-screen pt-24 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF76]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="text-red-600 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {error === 'Category not found' ? 'Category Not Found' : 'Something went wrong'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {error === 'Category not found' 
                                ? 'The category you are looking for does not exist.' 
                                : 'Unable to load products at this time.'
                            }
                        </p>
                        <div className="space-x-4">
                            <button 
                                onClick={() => router.push('/collections')}
                                className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                            >
                                Back to Collections
                            </button>
                            {error !== 'Category not found' && (
                                <button 
                                    onClick={fetchCategoryProducts}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAFAFA] to-white pt-20 md:pt-24 lg:pt-28 pb-8 md:pb-12 lg:pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <button 
                        onClick={() => router.push('/collections')}
                        className="hover:text-[#D4AF76] transition-colors"
                    >
                        Collections
                    </button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#2C2C2C] font-medium">{category?.name}</span>
                </nav>

                {/* Category Header - Compact & Clean */}
                {category && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6 md:mb-8"
                    >
                        <div className="bg-gradient-to-r from-[#D4AF76]/5 via-[#8B6B4C]/5 to-transparent rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6">
                                {/* Category Image - Smaller & Circular on Mobile */}
                                <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 flex-shrink-0">
                                    <div className="aspect-square relative rounded-full md:rounded-xl overflow-hidden ring-2 ring-[#D4AF76]/20">
                                        <SafeImage
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                
                                {/* Category Info - Compact */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-light text-[#2C2C2C] mb-1 md:mb-2 tracking-tight truncate">
                                        {category.name}
                                    </h1>
                                    <p className="text-gray-600 font-light text-xs md:text-sm lg:text-base leading-relaxed mb-2 md:mb-3 line-clamp-2">
                                        {category.description}
                                    </p>
                                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <span className="font-medium text-[#2C2C2C]">{category.productsCount || 0}</span>
                                        <span className="ml-1">{category.productsCount === 1 ? 'product' : 'products'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Modern Controls Bar */}
                {!loading && products.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        {/* Results Count */}
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm font-medium text-[#2C2C2C]">
                                {pagination ? (
                                    <>
                                        {((pagination.page - 1) * 12) + 1}-{Math.min(pagination.page * 12, pagination.totalProducts)} of {pagination.totalProducts}
                                    </>
                                ) : (
                                    `${products.length} ${products.length === 1 ? 'Product' : 'Products'}`
                                )}
                            </span>
                        </div>

                        {/* Sort & View Controls */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Sort Dropdown */}
                            <div className="relative flex-1 sm:flex-initial">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-light text-[#2C2C2C] hover:border-[#D4AF76] focus:outline-none focus:ring-2 focus:ring-[#D4AF76]/20 focus:border-[#D4AF76] transition-all cursor-pointer"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* View Toggle - Mobile and Desktop */}
                            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'list' 
                                            ? 'bg-white shadow-sm text-[#D4AF76]' 
                                            : 'text-gray-400 hover:text-[#2C2C2C]'
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
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'grid' 
                                            ? 'bg-white shadow-sm text-[#D4AF76]' 
                                            : 'text-gray-400 hover:text-[#2C2C2C]'
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

                {/* Products Display - Mobile Grid, Desktop List/Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4AF76]/20"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#D4AF76] absolute top-0 left-0"></div>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 font-light">No products found in {category?.name || 'this category'}.</p>
                    </div>
                ) : (
                    <>
                        {/* View Mode Based Display - Both Mobile and Desktop */}
                        {viewMode === 'list' ? (
                            /* List View */
                            <div className="space-y-4 md:space-y-6 mb-8">
                                {products.map((product, index) => (
                                    <ProductListItem key={product._id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            /* Grid View */
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                                {products.map((product, index) => (
                                    <ProductCard key={product._id} product={product} index={index} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const page = Math.max(1, Math.min(
                                    pagination.totalPages - 4,
                                    pagination.page - 2
                                )) + i;
                                
                                if (page > pagination.totalPages) return null;
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            page === pagination.page
                                                ? 'bg-[#8B6B4C] text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}