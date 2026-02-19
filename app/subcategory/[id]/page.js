"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ProductGrid from '@/app/components/ProductGrid';

export default function SubcategoryPage() {
    const params = useParams();
    const subcategoryId = params?.id;
    
    const [subcategory, setSubcategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSubcategoryProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/subcategories/${subcategoryId}/products?page=${currentPage}&limit=20`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            const data = await response.json();
            setSubcategory(data.subcategory);
            setProducts(data.products);
            setPagination(data.pagination);
            setError(null);
        } catch (err) {
            console.error('Error fetching subcategory products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [subcategoryId, currentPage]);

    useEffect(() => {
        if (subcategoryId) {
            fetchSubcategoryProducts();
        }
    }, [subcategoryId, fetchSubcategoryProducts]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#FEFEFE] to-[#F8F6F3] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
                {/* Breadcrumb */}
                {subcategory && (
                    <nav className="mb-8">
                        <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>
                                <Link href="/" className="hover:text-[#8B6B4C] transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <span className="mx-2">/</span>
                            </li>
                            <li>
                                <Link 
                                    href={`/products?category=${encodeURIComponent(subcategory.category?.name || '')}`}
                                    className="hover:text-[#8B6B4C] transition-colors"
                                >
                                    {subcategory.category?.name || 'Category'}
                                </Link>
                            </li>
                            <li>
                                <span className="mx-2">/</span>
                            </li>
                            <li className="text-[#8B6B4C] font-medium">
                                {subcategory.name}
                            </li>
                        </ol>
                    </nav>
                )}

                {/* Subcategory Header */}
                {subcategory && (
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {subcategory.name}
                        </h1>
                        {subcategory.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                                {subcategory.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8B6B4C]"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-20">
                        <div className="text-red-600 text-xl mb-4">{error}</div>
                        <button
                            onClick={fetchSubcategoryProducts}
                            className="px-6 py-3 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <>
                        <ProductGrid products={products} />
                        
                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 dark:border-white/[0.1] dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex gap-2">
                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        // Show first 2, last 2, and pages around current
                                        if (
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-[#8B6B4C] text-white'
                                                            : 'border border-gray-300 dark:border-white/[0.1] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06]'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 border border-gray-300 dark:border-white/[0.1] dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* No Products */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No products yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Products in this subcategory are coming soon!
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
