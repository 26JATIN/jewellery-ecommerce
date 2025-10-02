"use client";
import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Link from 'next/link';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        revenue: 0,
        inventoryValue: 0
    });
    const [loading, setLoading] = useState(true);



    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add mounted state to prevent hydration issues
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchStats();
    }, []);

    if (!mounted || loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your jewelry store performance</p>
                </div>
                
                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                                <p className="text-3xl font-bold mt-2 text-green-600">₹{stats.revenue.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                                <p className="text-3xl font-bold mt-2 text-blue-600">{stats.totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                                <p className="text-3xl font-bold mt-2 text-purple-600">{stats.totalUsers}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Inventory Value</h3>
                                <p className="text-3xl font-bold mt-2 text-orange-600">₹{stats.inventoryValue.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Product Overview</h2>
                            <Link 
                                href="/admin/products"
                                className="text-[#8B6B4C] hover:text-[#725939] font-medium flex items-center gap-1"
                            >
                                Manage Products
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                                <div className="text-sm text-gray-500">Total Products</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
                                <div className="text-sm text-gray-500">Active Products</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
                                <div className="text-sm text-gray-500">Low Stock</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
                                <div className="text-sm text-gray-500">Out of Stock</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold">Inventory Alerts</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {stats.outOfStockProducts > 0 && (
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                        <span className="text-red-800 font-medium">
                                            {stats.outOfStockProducts} product{stats.outOfStockProducts > 1 ? 's' : ''} out of stock
                                        </span>
                                    </div>
                                    <Link 
                                        href="/admin/products?filter=out-of-stock"
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        View →
                                    </Link>
                                </div>
                            )}
                            {stats.lowStockProducts > 0 && (
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                        <span className="text-yellow-800 font-medium">
                                            {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's' : ''} running low
                                        </span>
                                    </div>
                                    <Link 
                                        href="/admin/products?filter=low-stock"
                                        className="text-yellow-600 hover:text-yellow-800 font-medium"
                                    >
                                        View →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link 
                                href="/admin/products"
                                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#8B6B4C] hover:bg-gray-50 transition-colors"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">📦</div>
                                    <div className="font-medium">Add Product</div>
                                </div>
                            </Link>
                            <Link 
                                href="/admin/orders"
                                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#8B6B4C] hover:bg-gray-50 transition-colors"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">📋</div>
                                    <div className="font-medium">View Orders</div>
                                </div>
                            </Link>
                            <Link 
                                href="/admin/users"
                                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#8B6B4C] hover:bg-gray-50 transition-colors"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">👥</div>
                                    <div className="font-medium">Manage Users</div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}