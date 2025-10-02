"use client";
import { useState } from 'react';
import ProductGrid from './ProductGrid';
import { useProductFilter } from '../hooks/useProducts';

export default function Collections() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [searchTerm, setSearchTerm] = useState('');
    
    const { 
        products: sortedProducts, 
        categories, 
        loading, 
        error 
    } = useProductFilter(searchTerm, selectedCategory, sortBy);

    return (
        <div className="min-h-screen bg-white pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-gray-900 mb-4">Our Collections</h1>
                    <p className="text-gray-600">Discover our exquisite jewelry collection</p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            />
                            <svg 
                                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-[#8B6B4C] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B6B4C]"
                    >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name</option>
                    </select>
                </div>

                {/* Products Grid */}
                <ProductGrid 
                    products={sortedProducts}
                    loading={loading}
                    error={error}
                    emptyMessage="No products found in this category."
                />
            </div>
        </div>
    );
}