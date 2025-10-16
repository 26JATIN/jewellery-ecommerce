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
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
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
        setActiveTab('new');
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setActiveTab('new');
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
                
                setActiveTab('list');
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
        setActiveTab('list');
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
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-1">Manage your jewelry inventory and product catalog</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-[#8B6B4C]">{products.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                    activeTab === 'list'
                                        ? 'bg-gradient-to-r from-[#8B6B4C] to-[#725939] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Existing Products</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    activeTab === 'list'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {products.length}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setActiveTab('new');
                                }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                    activeTab === 'new'
                                        ? 'bg-gradient-to-r from-[#8B6B4C] to-[#725939] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {activeTab === 'list' ? (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
                                    <p className="text-sm text-gray-600 mt-1">Browse and manage your product inventory</p>
                                </div>
                                <button
                                    onClick={handleAddProduct}
                                    className="bg-[#8B6B4C] text-white px-5 py-2.5 rounded-lg hover:bg-[#725939] transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Quick Add</span>
                                </button>
                            </div>
                            
                            {products.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                                    <p className="text-gray-600 mb-6">Get started by creating your first product</p>
                                    <button
                                        onClick={handleAddProduct}
                                        className="bg-[#8B6B4C] text-white px-6 py-3 rounded-lg hover:bg-[#725939] transition-all duration-200 font-medium shadow-sm hover:shadow-md inline-flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Create Your First Product</span>
                                    </button>
                                </div>
                            ) : (
                                <ProductList
                                    products={products}
                                    onEdit={handleEditProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {editingProduct ? 'Edit Product' : 'Create New Product'}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {editingProduct 
                                                ? 'Update product details and pricing information'
                                                : 'Fill in the details below to add a new product to your catalog'
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleFormCancel}
                                        className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            </div>
                            <ProductForm
                                product={editingProduct}
                                onSubmit={handleFormSubmit}
                                onCancel={handleFormCancel}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminAuth(AdminProductsPage);