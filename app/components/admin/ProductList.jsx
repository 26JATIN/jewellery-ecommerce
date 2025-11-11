"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function ProductList({ products, onEdit, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [expandedProducts, setExpandedProducts] = useState(new Set());

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

    const getStockStatus = (product) => {
        const totalStock = product.hasVariants ? (product.totalStock || 0) : (product.stock || 0);
        if (totalStock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (totalStock < 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const calculateDiscount = (mrp, sellingPrice) => {
        const discount = ((mrp - sellingPrice) / mrp * 100).toFixed(1);
        return discount;
    };

    const toggleVariantDisplay = (productId) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedProducts(newExpanded);
    };

    return (
        <div>
            {/* Filters */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="w-full">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
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

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
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
                            filteredProducts.flatMap((product) => {
                                const stockStatus = getStockStatus(product);
                                const discount = calculateDiscount(product.mrp, product.sellingPrice);

                                const rows = [
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
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        {product.name}
                                                        {product.hasVariants && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                🎨 Variants
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.category}
                                                        {product.hasVariants && (
                                                            <span className="ml-2 text-xs text-purple-600">
                                                                • {product.variants?.length || 0} options
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.hasVariants ? (
                                                <div className="text-sm space-y-1">
                                                    <div className="font-medium text-gray-700">Variant Pricing</div>
                                                    {product.variants && product.variants.length > 0 ? (
                                                        <>
                                                            <div className="text-xs text-gray-600">
                                                                Range: ₹{Math.min(...product.variants.map(v => v.price?.sellingPrice || v.price || 0))} - ₹{Math.max(...product.variants.map(v => v.price?.sellingPrice || v.price || 0))}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Base: ₹{product.sellingPrice}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-xs text-gray-500">No variants configured</div>
                                                    )}
                                                    <div className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                        🎨 {product.variants?.length || 0} variants
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm space-y-1">
                                                    <div>
                                                        <span className="text-gray-500">MRP:</span>
                                                        <span className="font-medium ml-1">₹{product.mrp}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Selling:</span>
                                                        <span className="font-medium ml-1 text-green-600">₹{product.sellingPrice}</span>
                                                    </div>
                                                    {discount > 0 && (
                                                        <div className="text-xs text-red-600">
                                                            {discount}% off
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.hasVariants ? (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900 mb-1">
                                                        {product.variants?.length || 0} variants
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-2">
                                                        Total: {product.totalStock || 0} units
                                                    </div>
                                                    {product.variants && product.variants.length > 0 && (
                                                        <div className="space-y-1">
                                                            {product.variants.slice(0, 3).map((variant, index) => (
                                                                <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                                    <div className="font-medium">{variant.sku}</div>
                                                                    <div className="flex justify-between">
                                                                        <span>Stock: {variant.stock}</span>
                                                                        <span>₹{variant.price?.sellingPrice || variant.price}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {product.variants.length > 3 && (
                                                                <div className="text-xs text-gray-400">
                                                                    +{product.variants.length - 3} more variants...
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {product.stock} units
                                                    </div>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                                                    >
                                                        {stockStatus.text}
                                                    </span>
                                                </div>
                                            )}
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
                                            <div className="flex flex-col space-y-1">
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
                                                {product.hasVariants && (
                                                    <button
                                                        onClick={() => toggleVariantDisplay(product._id)}
                                                        className="text-xs text-purple-600 hover:text-purple-500 transition-colors flex items-center"
                                                    >
                                                        {expandedProducts.has(product._id) ? '▼' : '▶'} View Variants
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ];

                                // Add expanded variant details row if expanded
                                if (product.hasVariants && expandedProducts.has(product._id)) {
                                    rows.push(
                                        <tr key={`${product._id}-variants`} className="bg-gray-50">
                                            <td colSpan="6" className="px-6 py-4">
                                                <div className="bg-white rounded-lg border p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                        🎨 Product Variants ({product.variants?.length || 0})
                                                    </h4>
                                                    {product.variants && product.variants.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {product.variants.map((variant, index) => (
                                                                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="font-medium text-sm text-gray-900">
                                                                            {variant.sku}
                                                                        </div>
                                                                        <div className={`px-2 py-1 rounded-full text-xs ${
                                                                            variant.isActive 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                            {variant.isActive ? 'Active' : 'Inactive'}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Variant Options */}
                                                                    <div className="mb-2">
                                                                        {variant.optionCombination && Object.entries(variant.optionCombination).map(([key, value]) => (
                                                                            <div key={key} className="text-xs text-gray-600">
                                                                                <span className="font-medium">{key}:</span> {value}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    
                                                                    {/* Variant Pricing */}
                                                                    <div className="mb-2 text-xs space-y-1">
                                                                        <div>
                                                                            <span className="text-gray-500">MRP:</span>
                                                                            <span className="font-medium ml-1">₹{variant.price?.mrp || 'N/A'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500">Selling:</span>
                                                                            <span className="font-medium ml-1 text-green-600">₹{variant.price?.sellingPrice || variant.price || 'N/A'}</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Stock Status */}
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="text-sm font-medium">
                                                                            Stock: {variant.stock || 0}
                                                                        </div>
                                                                        <div className={`px-2 py-1 rounded-full text-xs ${
                                                                            (variant.stock || 0) === 0 
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : (variant.stock || 0) < 10 
                                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                                    : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                            {(variant.stock || 0) === 0 ? 'Out' : (variant.stock || 0) < 10 ? 'Low' : 'Good'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 text-gray-500">
                                                            <div className="text-2xl mb-2">📦</div>
                                                            <p>No variants configured yet</p>
                                                            <p className="text-sm">Edit this product to add variant options</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                return rows;
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Shown only on mobile/tablet */}
            <div className="lg:hidden divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <div className="text-gray-500">
                            <div className="text-4xl mb-2">📦</div>
                            <p className="text-lg font-medium mb-2">No products found</p>
                            <p className="text-sm">
                                {products.length === 0 
                                    ? "Start by adding your first product using the 'Add New Product' button above."
                                    : "Try adjusting your search or filter criteria."
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product);
                        const discount = calculateDiscount(product.mrp, product.sellingPrice);

                        return (
                            <div key={product._id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                                {/* Product Image and Name */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="h-20 w-20 flex-shrink-0">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={80}
                                                height={80}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-xs text-gray-500">{product.category}</span>
                                            {product.hasVariants && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    🎨 {product.variants?.length || 0} variants
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            product.isActive
                                                ? 'text-green-800 bg-green-100'
                                                : 'text-red-800 bg-red-100'
                                        }`}
                                    >
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Product Details Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                                    {/* Pricing */}
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <p className="text-gray-500 mb-1 font-medium">Pricing</p>
                                        {product.hasVariants ? (
                                            <div className="space-y-0.5">
                                                <p className="text-gray-700">Variant Pricing</p>
                                                {product.variants && product.variants.length > 0 && (
                                                    <p className="text-gray-600">
                                                        ₹{Math.min(...product.variants.map(v => v.price?.sellingPrice || v.price || 0))} - ₹{Math.max(...product.variants.map(v => v.price?.sellingPrice || v.price || 0))}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5">
                                                <p className="text-gray-600">MRP: ₹{product.mrp}</p>
                                                <p className="text-green-600 font-medium">Selling: ₹{product.sellingPrice}</p>
                                                {discount > 0 && (
                                                    <p className="text-red-600">{discount}% off</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <p className="text-gray-500 mb-1 font-medium">Stock</p>
                                        {product.hasVariants ? (
                                            <div className="space-y-0.5">
                                                <p className="text-gray-700 font-medium">{product.totalStock || 0} units</p>
                                                <p className="text-gray-600">{product.variants?.length || 0} variants</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-0.5">
                                                <p className="text-gray-700 font-medium">{product.stock} units</p>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="flex-1 bg-[#8B6B4C] text-white px-3 py-2 rounded-lg hover:bg-[#725939] transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(product._id)}
                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                    {product.hasVariants && (
                                        <button
                                            onClick={() => toggleVariantDisplay(product._id)}
                                            className="px-3 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                                        >
                                            {expandedProducts.has(product._id) ? '▼' : '▶'}
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Variant Details */}
                                {product.hasVariants && expandedProducts.has(product._id) && (
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                        <h4 className="font-medium text-gray-900 mb-2 text-sm flex items-center">
                                            🎨 Product Variants ({product.variants?.length || 0})
                                        </h4>
                                        {product.variants && product.variants.length > 0 ? (
                                            <div className="space-y-2">
                                                {product.variants.map((variant, index) => (
                                                    <div key={index} className="border rounded-lg p-2 bg-white">
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <div className="font-medium text-xs text-gray-900">
                                                                {variant.sku}
                                                            </div>
                                                            <div className={`px-1.5 py-0.5 rounded-full text-xs ${
                                                                variant.isActive 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {variant.isActive ? 'Active' : 'Inactive'}
                                                            </div>
                                                        </div>
                                                        
                                                        {variant.optionCombination && Object.entries(variant.optionCombination).map(([key, value]) => (
                                                            <div key={key} className="text-xs text-gray-600 mb-1">
                                                                <span className="font-medium">{key}:</span> {value}
                                                            </div>
                                                        ))}
                                                        
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">Price:</span>
                                                                <span className="font-medium ml-1 text-green-600">₹{variant.price?.sellingPrice || variant.price || 'N/A'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Stock:</span>
                                                                <span className="font-medium ml-1">{variant.stock || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 text-xs">
                                                <p>No variants configured yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50">
                <div className="text-xs sm:text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>
        </div>
    );
}