"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '../../components/AdminLayout';

// Dynamically import components to prevent hydration issues
const ProductForm = dynamic(() => import('../../components/admin/ProductForm'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

const ProductList = dynamic(() => import('../../components/admin/ProductList'), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

import withAdminAuth from '../../components/withAdminAuth';

function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            console.log('Fetching products from /api/admin/products...');
            const res = await fetch('/api/admin/products');
            console.log('Response status:', res.status);
            
            if (res.ok) {
                const data = await res.json();
                console.log('Products fetched:', data.length, 'products');
                setProducts(data);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Failed to fetch products:', res.status, res.statusText, errorData);
                setProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setProducts(products.filter(p => p._id !== productId));
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete product');
        }
    };

    const handleFormSubmit = async (productData) => {
        try {
            const url = editingProduct 
                ? `/api/admin/products/${editingProduct._id}`
                : '/api/admin/products';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                const savedProduct = await res.json();
                
                if (editingProduct) {
                    setProducts(products.map(p => 
                        p._id === editingProduct._id ? savedProduct : p
                    ));
                } else {
                    setProducts([...products, savedProduct]);
                }
                
                setShowForm(false);
                setEditingProduct(null);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save product');
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-1">Manage your inventory and product catalog</p>
                        </div>
                        <div className="animate-pulse bg-gray-200 h-12 w-32 rounded-lg"></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C] mb-4"></div>
                            <p className="text-gray-600 font-medium">Initializing...</p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-1">Manage your inventory and product catalog</p>
                        </div>
                        <button
                            onClick={handleAddProduct}
                            className="bg-[#8B6B4C] text-white px-6 py-3 rounded-lg hover:bg-[#725939] transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Product</span>
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C] mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading products...</p>
                            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your inventory</p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600 mt-1">Manage your inventory and product catalog</p>
                    </div>
                    <button
                        onClick={handleAddProduct}
                        className="bg-[#8B6B4C] text-white px-6 py-3 rounded-lg hover:bg-[#725939] transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Form Section */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <ProductForm
                            product={editingProduct}
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                        />
                    </div>
                )}

                {/* Product List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <ProductList
                        products={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminAuth(AdminProductsPage);