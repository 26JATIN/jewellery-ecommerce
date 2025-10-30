"use client";
import { useState, useEffect, useCallback, useRef } from 'react';

export function useProducts(options = {}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAttemptRef = useRef(0);
    const abortControllerRef = useRef(null);
    const retryTimeoutRef = useRef(null);

    const fetchProducts = useCallback(async () => {
        // Cancel any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Clear any pending retry timeouts
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        try {
            setLoading(true);
            // Don't clear error during retries - only on success
            
            const res = await fetch('/api/products?limit=100', {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            // Handle non-OK responses gracefully
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `Server error: ${res.status}`);
            }
            
            const data = await res.json();
            
            // Handle response format
            if (data.success && Array.isArray(data.data)) {
                setProducts(data.data);
                fetchAttemptRef.current = 0; // Reset on success
                setError(null); // Clear error on success
            } else if (Array.isArray(data)) {
                setProducts(data);
                fetchAttemptRef.current = 0;
                setError(null); // Clear error on success
            } else if (data.error) {
                // API returned error in success response
                throw new Error(data.error);
            } else {
                console.warn('Unexpected API response format:', data);
                setProducts([]);
                // Only set error if max retries reached
                if (fetchAttemptRef.current >= 2) {
                    setError('Unexpected response format');
                }
            }
        } catch (err) {
            // Ignore abort errors
            if (err.name === 'AbortError') {
                return;
            }
            
            const errorMessage = err.message || 'Failed to load products';
            console.error('Failed to fetch products:', errorMessage);
            
            // Auto-retry with exponential backoff (max 3 attempts)
            if (fetchAttemptRef.current < 2) {
                const delay = Math.min(1000 * Math.pow(2, fetchAttemptRef.current), 4000);
                fetchAttemptRef.current += 1;
                
                console.log(`Retrying product fetch in ${delay}ms (attempt ${fetchAttemptRef.current + 1}/3)...`);
                
                // Don't set products to empty or show error during retries
                retryTimeoutRef.current = setTimeout(() => {
                    fetchProducts();
                }, delay);
            } else {
                // Max retries reached - now show error
                console.error('Max retry attempts reached. Product fetch failed.');
                setError(errorMessage);
                setProducts([]);
            }
        } finally {
            // Only set loading to false if not retrying
            if (fetchAttemptRef.current >= 2 || error === null) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        // Only fetch on client side
        if (typeof window !== 'undefined') {
            fetchProducts();
        }
        
        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [fetchProducts]);

    const refetch = useCallback(() => {
        fetchAttemptRef.current = 0;
        fetchProducts();
    }, [fetchProducts]);

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