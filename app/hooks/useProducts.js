"use client";
import { useState, useEffect } from 'react';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/products');
            
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            } else {
                throw new Error('Failed to fetch products');
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const refetch = () => {
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