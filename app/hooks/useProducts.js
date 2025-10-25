"use client";
import { useState, useEffect, useCallback } from 'react';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchProducts = useCallback(async (isRetry = false) => {
        try {
            if (!isRetry) {
                setLoading(true);
            }
            setError(null);
            
            const res = await fetch('/api/products', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                // API returns paginated response with data nested
                if (data.success && Array.isArray(data.data)) {
                    setProducts(data.data);
                    setRetryCount(0); // Reset retry count on success
                } else if (Array.isArray(data)) {
                    // Backward compatibility if API returns direct array
                    setProducts(data);
                    setRetryCount(0);
                } else {
                    console.error('Unexpected API response format:', data);
                    setProducts([]);
                }
            } else {
                throw new Error(`Failed to fetch products: ${res.status}`);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(err.message);
            setProducts([]); // Ensure products is always an array
            
            // Auto-retry up to 2 times with exponential backoff
            if (retryCount < 2) {
                const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    fetchProducts(true);
                }, delay);
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        // Only fetch on client side
        if (typeof window !== 'undefined') {
            fetchProducts();
        }
    }, [fetchProducts]);

    const refetch = () => {
        setRetryCount(0);
        fetchProducts();
    };

    return {
        products,
        loading,
        error,
        refetch
    };
}

// Hook for fetching products by category
export function useProductsByCategory(category) {
    const { products, loading, error, refetch } = useProducts();
    
    const filteredProducts = products.filter(product => 
        !category || category === 'All' ? true : product.category === category
    );

    return {
        products: filteredProducts,
        allProducts: products,
        loading,
        error,
        refetch
    };
}

// Hook for product search and filtering
export function useProductFilter(searchTerm = '', category = 'All', sortBy = 'featured') {
    const { products, loading, error, refetch } = useProducts();

    const filteredAndSortedProducts = products
        .filter(product => {
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = category === 'All' || product.category === category;
            
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.sellingPrice || a.price) - (b.sellingPrice || b.price);
                case 'price-high':
                    return (b.sellingPrice || b.price) - (a.sellingPrice || a.price);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

    const categories = ['All', ...new Set(products.map(product => product.category))];

    return {
        products: filteredAndSortedProducts,
        allProducts: products,
        categories,
        loading,
        error,
        refetch
    };
}