"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function ProductList({ products, onEdit, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const categories = [...new Set(products.map(p => p.category))];

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const calculateProfit = (sellingPrice, costPrice) => {
        const profit = sellingPrice - costPrice;
        const profitPercentage = ((profit / costPrice) * 100).toFixed(1);
        return { profit, profitPercentage };
    };

    const calculateDiscount = (mrp, sellingPrice) => {
        const discount = ((mrp - sellingPrice) / mrp * 100).toFixed(1);
        return discount;
    };

    return (
        <div>
            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="sellingPrice-desc">Price High to Low</option>
                            <option value="sellingPrice-asc">Price Low to High</option>
                            <option value="stock-desc">Stock High to Low</option>
                            <option value="stock-asc">Stock Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pricing
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Profit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="text-gray-500">
                                        <div className="text-lg mb-2">📦</div>
                                        <p className="text-lg font-medium mb-2">No products found</p>
                                        <p className="text-sm">
                                            {products.length === 0 
                                                ? "Start by adding your first product using the 'Add New Product' button above."
                                                : "Try adjusting your search or filter criteria."
                                            }
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => {
                                const stockStatus = getStockStatus(product.stock);
                                const profit = calculateProfit(product.sellingPrice, product.costPrice);
                                const discount = calculateDiscount(product.mrp, product.sellingPrice);

                                return (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-16 w-16 flex-shrink-0">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            width={64}
                                                            height={64}
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm space-y-1">
                                                <div>
                                                    <span className="text-gray-500">MRP:</span>
                                                    <span className="font-medium ml-1">₹{product.mrp}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Selling:</span>
                                                    <span className="font-medium ml-1 text-green-600">₹{product.sellingPrice}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Cost:</span>
                                                    <span className="font-medium ml-1">₹{product.costPrice}</span>
                                                </div>
                                                {discount > 0 && (
                                                    <div className="text-xs text-red-600">
                                                        {discount}% off
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {product.stock} units
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                                            >
                                                {stockStatus.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-green-600">
                                                    ₹{profit.profit.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {profit.profitPercentage}% margin
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.isActive
                                                        ? 'text-green-800 bg-green-100'
                                                        : 'text-red-800 bg-red-100'
                                                }`}
                                            >
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => onEdit(product)}
                                                    className="text-[#8B6B4C] hover:text-[#725939] transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product._id)}
                                                    className="text-red-600 hover:text-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>
        </div>
    );
}