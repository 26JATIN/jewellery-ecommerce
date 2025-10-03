"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from './ProductGrid';
import { useProductFilter } from '../hooks/useProducts';

export default function Collections() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Set initial search term from URL
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setSearchTerm(searchFromUrl);
        }
    }, [searchParams]);
    
    const { 
        products: sortedProducts, 
        categories, 
        loading, 
        error 
    } = useProductFilter(searchTerm, selectedCategory, sortBy);

    // Clear search functionality
    const clearSearch = () => {
        setSearchTerm('');
        // Update URL to remove search parameter
        router.push('/collections');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-16 pb-20 lg:pt-24 lg:pb-16">
            {/* Mobile Filter Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
                    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-[#2C2C2C]">Filters</h2>
                                <button 
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Categories */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">Categories</h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setSidebarOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                                selectedCategory === category
                                                    ? 'bg-[#2C2C2C] text-white'
                                                    : 'bg-gray-50 text-[#2C2C2C] hover:bg-gray-100'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div>
                                <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF76] text-[#2C2C2C]"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                {/* Desktop Header */}
                <div className="mb-8 lg:mb-12 hidden lg:block">
                    <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">Shop</p>
                    <h1 className="text-5xl md:text-6xl font-light text-[#2C2C2C] mb-4 tracking-tight">All Collections</h1>
                    <p className="text-gray-600 font-light">Discover timeless pieces crafted for elegance</p>
                </div>

                {/* Mobile Header */}
                <div className="mb-4 lg:hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-medium text-[#2C2C2C] mb-1">Collections</h1>
                            {searchTerm && (
                                <p className="text-sm text-gray-600">
                                    Results for "<span className="font-medium text-[#D4AF76]">{searchTerm}</span>"
                                </p>
                            )}
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            <span className="text-sm font-medium">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Results Count and Clear - Mobile */}
                <div className="lg:hidden mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-medium">
                        {sortedProducts.length} {sortedProducts.length === 1 ? 'result' : 'results'}
                        {selectedCategory !== 'All' && (
                            <span className="ml-2 text-[#D4AF76]">in {selectedCategory}</span>
                        )}
                    </p>
                    {searchTerm && (
                        <button 
                            onClick={clearSearch}
                            className="text-sm text-[#D4AF76] font-medium flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

                {/* Desktop Layout with Sidebar */}
                <div className="hidden lg:flex gap-8">
                    {/* Desktop Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">Categories</h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                                                selectedCategory === category
                                                    ? 'bg-[#2C2C2C] text-white shadow-md'
                                                    : 'bg-gray-50 text-[#2C2C2C] hover:bg-gray-100'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div>
                                <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF76] text-[#2C2C2C]"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                </select>
                            </div>

                            {/* Search Term Display */}
                            {searchTerm && (
                                <div className="mt-6 p-4 bg-[#D4AF76]/10 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Searching for:</p>
                                            <p className="font-medium text-[#2C2C2C]">"{searchTerm}"</p>
                                        </div>
                                        <button 
                                            onClick={clearSearch}
                                            className="text-gray-400 hover:text-[#2C2C2C] transition-colors"
                                            title="Clear search"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Products Grid */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-light">
                                    {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
                                    {selectedCategory !== 'All' && (
                                        <span className="ml-2 text-[#D4AF76]">in {selectedCategory}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <ProductGrid 
                            products={sortedProducts}
                            loading={loading}
                            error={error}
                            emptyMessage="No products found in this category."
                        />
                    </div>
                </div>

                {/* Mobile Products Grid */}
                <div className="lg:hidden">
                    <ProductGrid 
                        products={sortedProducts}
                        loading={loading}
                        error={error}
                        emptyMessage="No products found in this category."
                    />
                </div>
            </div>
        </div>
    );
}