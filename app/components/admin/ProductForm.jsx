"use client";
import { useState, useEffect } from 'react';

export default function ProductForm({ product, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        mrp: '',
        costPrice: '',
        sellingPrice: '',
        price: '',
        stock: '',
        sku: '',
        image: '',
        isActive: true
    });

    const [loading, setLoading] = useState(false);

    const categories = [
        'Diamond',
        'Gold',
        'Silver',
        'Platinum',
        'Wedding',
        'Vintage',
        'Contemporary',
        'Traditional'
    ];

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                mrp: product.mrp || '',
                costPrice: product.costPrice || '',
                sellingPrice: product.sellingPrice || '',
                price: product.price || product.sellingPrice || '',
                stock: product.stock || '',
                sku: product.sku || '',
                image: product.image || '',
                isActive: product.isActive !== undefined ? product.isActive : true
            });
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newValue = type === 'checkbox' ? checked : value;
        
        // Auto-generate SKU if name changes and it's a new product
        if (name === 'name' && !product) {
            const sku = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) + Date.now().toString().slice(-4);
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                sku: sku
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }

        // Auto-set price to sellingPrice
        if (name === 'sellingPrice') {
            setFormData(prev => ({
                ...prev,
                sellingPrice: newValue,
                price: newValue
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!formData.name || !formData.description || !formData.category || 
            !formData.mrp || !formData.costPrice || !formData.sellingPrice || !formData.sku) {
            alert('Please fill in all required fields');
            setLoading(false);
            return;
        }

        // Validate prices
        const mrp = parseFloat(formData.mrp);
        const costPrice = parseFloat(formData.costPrice);
        const sellingPrice = parseFloat(formData.sellingPrice);

        if (sellingPrice > mrp) {
            alert('Selling price cannot be greater than MRP');
            setLoading(false);
            return;
        }

        if (costPrice > sellingPrice) {
            alert('Cost price cannot be greater than selling price');
            setLoading(false);
            return;
        }

        const submitData = {
            ...formData,
            mrp: parseFloat(formData.mrp),
            costPrice: parseFloat(formData.costPrice),
            sellingPrice: parseFloat(formData.sellingPrice),
            price: parseFloat(formData.sellingPrice),
            stock: parseInt(formData.stock) || 0
        };

        try {
            await onSubmit(submitData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        {product ? 'Update product information and pricing' : 'Fill in the details for your new product'}
                    </p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU *
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MRP (₹) *
                        </label>
                        <input
                            type="number"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cost Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="costPrice"
                            value={formData.costPrice}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selling Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image URL
                        </label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                        Product is active
                    </label>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#8B6B4C] text-white px-6 py-3 rounded-lg hover:bg-[#725939] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}