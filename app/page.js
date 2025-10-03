"use client";
import { Suspense, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import LoginModalHandler from './components/LoginModalHandler';
import { useProductFilter } from './hooks/useProducts';
import NewArrivals from './components/NewArrivals';

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic';

function ProductsSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  
  const { 
    products: sortedProducts, 
    categories, 
    loading, 
    error 
  } = useProductFilter('', selectedCategory, sortBy);

  return (
    <section id="products-section" className="py-20 px-4 bg-[#FAFAFA] pt-32 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">
            Our Collection
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-tight mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 font-light">
            Discover timeless pieces crafted for elegance
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-3 justify-center w-full lg:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-light transition-all ${
                  selectedCategory === category
                    ? 'bg-[#2C2C2C] text-white shadow-lg'
                    : 'bg-white text-[#2C2C2C] hover:bg-[#F5F5F5] border border-[#E5E5E5]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-3 bg-white border border-[#E5E5E5] rounded-full focus:outline-none focus:border-[#D4AF76] font-light text-[#2C2C2C] cursor-pointer w-full lg:w-auto"
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
          emptyMessage={searchTerm ? `No products found for "${searchTerm}"` : "No products found in this category."}
        />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <Navbar />
      <Suspense fallback={null}>
        <LoginModalHandler />
      </Suspense>
      <Hero />
      <NewArrivals />
      <Benefits />
      <Testimonials />
      <Footer />
    </main>
  );
}