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
        isActive: true,
        // Dynamic pricing fields
        pricingMethod: 'fixed',
        goldWeight: '',
        goldPurity: '22',
        makingChargePercent: '15',
        stoneValue: '',
        isDynamicPricing: false,
        // Enhanced stone specifications
        stones: []
    });

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

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

    const goldPurities = [
        { value: '24', label: '24K (99.9% Pure)' },
        { value: '22', label: '22K (91.7% Pure)' },
        { value: '18', label: '18K (75% Pure)' },
        { value: '14', label: '14K (58.3% Pure)' },
        { value: '10', label: '10K (41.7% Pure)' }
    ];

    const stoneTypes = [
        'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 
        'Amethyst', 'Topaz', 'Garnet', 'Opal', 'Turquoise', 'Other'
    ];

    const stoneQualities = [
        'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 
        'AAA', 'AA', 'A', 'B', 'Natural', 'Synthetic'
    ];

    const stoneCuts = [
        'Round', 'Princess', 'Emerald', 'Asscher', 'Oval', 'Marquise', 
        'Pear', 'Heart', 'Cushion', 'Radiant', 'Cabochon', 'Other'
    ];

    const stoneSettings = [
        'Prong', 'Bezel', 'Channel', 'Pave', 'Halo', 'Tension', 'Cluster', 'Other'
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
                isActive: product.isActive !== undefined ? product.isActive : true,
                // Dynamic pricing fields
                pricingMethod: product.pricingMethod || 'fixed',
                goldWeight: product.goldWeight || '',
                goldPurity: product.goldPurity || '22',
                makingChargePercent: product.makingChargePercent || '15',
                stoneValue: product.stoneValue || '',
                isDynamicPricing: product.isDynamicPricing || false,
                // Enhanced stone specifications
                stones: product.stones || []
            });
            setImagePreview(product.image || '');
        }
    }, [product]);

    // Stone management functions
    const addStone = () => {
        const newStone = {
            type: 'Diamond',
            quality: 'VS1',
            weight: 0,
            pricePerUnit: 0,
            totalValue: 0,
            color: 'Colorless',
            cut: 'Round',
            setting: 'Prong'
        };
        setFormData(prev => ({
            ...prev,
            stones: [...prev.stones, newStone]
        }));
    };

    const removeStone = (index) => {
        setFormData(prev => ({
            ...prev,
            stones: prev.stones.filter((_, i) => i !== index)
        }));
        updateTotalStoneValue();
    };

    const updateStone = (index, field, value) => {
        const updatedStones = [...formData.stones];
        updatedStones[index] = {
            ...updatedStones[index],
            [field]: value
        };

        // Auto-calculate total value when weight or price changes
        if (field === 'weight' || field === 'pricePerUnit') {
            const weight = field === 'weight' ? parseFloat(value) || 0 : updatedStones[index].weight;
            const pricePerUnit = field === 'pricePerUnit' ? parseFloat(value) || 0 : updatedStones[index].pricePerUnit;
            updatedStones[index].totalValue = weight * pricePerUnit;
        }

        setFormData(prev => ({
            ...prev,
            stones: updatedStones
        }));

        updateTotalStoneValue(updatedStones);
    };

    const updateTotalStoneValue = (stones = formData.stones) => {
        const totalStoneValue = stones.reduce((sum, stone) => sum + (stone.totalValue || 0), 0);
        setFormData(prev => ({
            ...prev,
            stoneValue: totalStoneValue.toFixed(2)
        }));
    };

    const calculateDynamicPrice = async () => {
        if (!formData.goldWeight || parseFloat(formData.goldWeight) <= 0) {
            return;
        }

        setCalculatingPrice(true);
        try {
            const response = await fetch('/api/gold-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goldWeight: parseFloat(formData.goldWeight),
                    goldPurity: parseFloat(formData.goldPurity),
                    makingChargePercent: parseFloat(formData.makingChargePercent),
                    gstPercent: 3,
                    currency: 'INR'
                })
            });

            const result = await response.json();

            if (result.success) {
                setCalculatedPrice(result.data);
                
                // Auto-update pricing fields if dynamic pricing is enabled
                if (formData.isDynamicPricing) {
                    const calculatedSellingPrice = result.data.breakdown.finalPrice;
                    const stoneValue = parseFloat(formData.stoneValue) || 0;
                    const totalPrice = calculatedSellingPrice + stoneValue;
                    
                    setFormData(prev => ({
                        ...prev,
                        sellingPrice: totalPrice.toFixed(2),
                        price: totalPrice.toFixed(2),
                        mrp: (totalPrice * 1.1).toFixed(2), // 10% margin for MRP
                        costPrice: (totalPrice * 0.7).toFixed(2) // Assumed 30% margin
                    }));
                }
            }
        } catch (error) {
            console.error('Price calculation error:', error);
        } finally {
            setCalculatingPrice(false);
        }
    };

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

        // Handle pricing method change
        if (name === 'pricingMethod') {
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                isDynamicPricing: newValue === 'dynamic'
            }));
        }

        // Handle dynamic pricing toggle
        if (name === 'isDynamicPricing') {
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                pricingMethod: newValue ? 'dynamic' : 'fixed'
            }));
        }

        // Auto-set price to sellingPrice for fixed pricing
        if (name === 'sellingPrice' && formData.pricingMethod === 'fixed') {
            setFormData(prev => ({
                ...prev,
                sellingPrice: newValue,
                price: newValue
            }));
        }

        // Trigger price calculation for dynamic pricing fields
        if (['goldWeight', 'goldPurity', 'makingChargePercent', 'stoneValue'].includes(name) && 
            formData.isDynamicPricing) {
            setTimeout(() => {
                calculateDynamicPrice();
            }, 500); // Debounce
        }
    };

    // Update total stone value when stones change
    useEffect(() => {
        updateTotalStoneValue();
    }, [formData.stones]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            return result.imageUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image: ' + error.message);
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.name || !formData.description || !formData.category || 
                !formData.mrp || !formData.costPrice || !formData.sellingPrice || !formData.sku) {
                alert('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Validate image URL if provided
            if (formData.image && !imageFile) {
                const isValidPath = formData.image.startsWith('/') || 
                                   formData.image.startsWith('./') || 
                                   formData.image.startsWith('../') ||
                                   formData.image.match(/^https?:\/\/.+/);
                
                if (!isValidPath) {
                    alert('Please enter a valid image URL (starting with http/https) or relative path (starting with /)');
                    setLoading(false);
                    return;
                }
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

            // Upload image if a new file is selected
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl && imageFile) {
                    // Upload failed, don't proceed
                    setLoading(false);
                    return;
                }
            }

            const submitData = {
                ...formData,
                image: imageUrl,
                mrp: parseFloat(formData.mrp),
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                price: parseFloat(formData.sellingPrice),
                stock: parseInt(formData.stock) || 0,
                // Dynamic pricing fields
                goldWeight: parseFloat(formData.goldWeight) || 0,
                goldPurity: parseFloat(formData.goldPurity) || 22,
                makingChargePercent: parseFloat(formData.makingChargePercent) || 15,
                stoneValue: parseFloat(formData.stoneValue) || 0,
                isDynamicPricing: formData.isDynamicPricing,
                pricingMethod: formData.pricingMethod,
                lastPriceUpdate: formData.isDynamicPricing ? new Date() : undefined,
                // Enhanced stone specifications
                stones: formData.stones.map(stone => ({
                    type: stone.type,
                    quality: stone.quality,
                    weight: parseFloat(stone.weight) || 0,
                    pricePerUnit: parseFloat(stone.pricePerUnit) || 0,
                    totalValue: parseFloat(stone.totalValue) || 0,
                    color: stone.color || 'Colorless',
                    cut: stone.cut,
                    setting: stone.setting
                }))
            };

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
                            MRP (₹ INR) *
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
                            Cost Price (₹ INR) *
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
                            Selling Price (₹ INR) *
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
                            Product Image
                        </label>
                        <div className="space-y-4">
                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Product preview" 
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            
                            {/* File Input */}
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-6 py-4 text-center transition-colors"
                                >
                                    <div className="space-y-2">
                                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18M13 12l4-4m0 0l-4-4m4 4H3" />
                                        </svg>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium text-[#8B6B4C]">Click to upload</span> or drag and drop
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            PNG, JPG, GIF up to 5MB
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Manual URL Input */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    Or enter image URL manually:
                                </label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        setImagePreview(e.target.value);
                                    }}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                    placeholder="/product1.jpg or https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter a full URL (https://...) or relative path (/product1.jpg)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Method Selection */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Pricing Method
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center p-4 border border-gray-300 rounded-lg">
                                <input
                                    type="radio"
                                    name="pricingMethod"
                                    value="fixed"
                                    checked={formData.pricingMethod === 'fixed'}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300"
                                />
                                <div className="ml-3">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Fixed Pricing
                                    </label>
                                    <p className="text-xs text-gray-500">Set manual prices</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center p-4 border border-gray-300 rounded-lg">
                                <input
                                    type="radio"
                                    name="pricingMethod"
                                    value="dynamic"
                                    checked={formData.pricingMethod === 'dynamic'}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300"
                                />
                                <div className="ml-3">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Dynamic Pricing
                                    </label>
                                    <p className="text-xs text-gray-500">Based on live gold rates</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Pricing Fields */}
                    {formData.pricingMethod === 'dynamic' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
                            <div className="flex items-center mb-4">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-yellow-800">Gold Specifications</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gold Weight (grams) *
                                    </label>
                                    <input
                                        type="number"
                                        name="goldWeight"
                                        value={formData.goldWeight}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        min="0.1"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                        placeholder="e.g., 5.5"
                                        required={formData.pricingMethod === 'dynamic'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gold Purity
                                    </label>
                                    <select
                                        name="goldPurity"
                                        value={formData.goldPurity}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                    >
                                        {goldPurities.map((purity) => (
                                            <option key={purity.value} value={purity.value}>
                                                {purity.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Making Charge (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="makingChargePercent"
                                        value={formData.makingChargePercent}
                                        onChange={handleInputChange}
                                        step="0.5"
                                        min="0"
                                        max="100"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Stone/Diamond Value (₹ INR)
                                    </label>
                                    <input
                                        type="number"
                                        name="stoneValue"
                                        value={formData.stoneValue}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent bg-gray-50"
                                        placeholder="0"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Calculated automatically from individual stones below
                                    </p>
                                </div>
                            </div>

                            {/* Price Calculator Button */}
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={calculateDynamicPrice}
                                    disabled={calculatingPrice || !formData.goldWeight}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {calculatingPrice && (
                                        <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    <span>Calculate Price</span>
                                </button>
                                
                                {calculatedPrice && (
                                    <div className="text-sm">
                                        <span className="text-gray-600">Calculated Price: </span>
                                        <span className="font-semibold text-green-600">
                                            ₹{calculatedPrice.breakdown.finalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            {calculatedPrice && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Price Breakdown</h4>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Gold Value:</span>
                                            <span>₹{calculatedPrice.breakdown.pureGoldValue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Making Charges:</span>
                                            <span>₹{calculatedPrice.breakdown.makingCharges.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">GST:</span>
                                            <span>₹{calculatedPrice.breakdown.gstAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Stone Value:</span>
                                            <span>₹{parseFloat(formData.stoneValue || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium border-t border-gray-200 pt-1">
                                            <span>Total:</span>
                                            <span>₹{(calculatedPrice.breakdown.finalPrice + parseFloat(formData.stoneValue || 0)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Stone/Gem Management */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-[#8B6B4C] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900">Stone & Gem Specifications</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addStone}
                                className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#7A5D42] transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Stone</span>
                            </button>
                        </div>

                        {formData.stones.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                </svg>
                                <p className="text-gray-500 text-sm mb-2">No stones added yet</p>
                                <p className="text-gray-400 text-xs">Click "Add Stone" to specify diamonds, rubies, emeralds, and other gems</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.stones.map((stone, index) => (
                                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-md font-medium text-gray-900">
                                                Stone #{index + 1} - {stone.type}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeStone(index)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Stone Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Stone Type
                                                </label>
                                                <select
                                                    value={stone.type}
                                                    onChange={(e) => updateStone(index, 'type', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                >
                                                    {stoneTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Quality */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quality/Grade
                                                </label>
                                                <select
                                                    value={stone.quality}
                                                    onChange={(e) => updateStone(index, 'quality', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                >
                                                    {stoneQualities.map((quality) => (
                                                        <option key={quality} value={quality}>{quality}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Weight */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Weight (Carats/Pieces)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={stone.weight}
                                                    onChange={(e) => updateStone(index, 'weight', e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                    placeholder="0.50"
                                                />
                                            </div>

                                            {/* Price per Unit */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Price per Unit (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={stone.pricePerUnit}
                                                    onChange={(e) => updateStone(index, 'pricePerUnit', e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                    placeholder="50000"
                                                />
                                            </div>

                                            {/* Color */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Color
                                                </label>
                                                <input
                                                    type="text"
                                                    value={stone.color}
                                                    onChange={(e) => updateStone(index, 'color', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                    placeholder="Colorless, Red, Blue..."
                                                />
                                            </div>

                                            {/* Cut */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cut
                                                </label>
                                                <select
                                                    value={stone.cut}
                                                    onChange={(e) => updateStone(index, 'cut', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                >
                                                    {stoneCuts.map((cut) => (
                                                        <option key={cut} value={cut}>{cut}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Setting */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Setting
                                                </label>
                                                <select
                                                    value={stone.setting}
                                                    onChange={(e) => updateStone(index, 'setting', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
                                                >
                                                    {stoneSettings.map((setting) => (
                                                        <option key={setting} value={setting}>{setting}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Total Value Display */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Total Value (₹)
                                                </label>
                                                <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-green-700">
                                                    ₹{stone.totalValue?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="md:col-span-3 pt-2">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        {stone.type} - {stone.quality}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {stone.weight} {stone.type === 'Pearl' ? 'pieces' : 'carats'}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        {stone.cut} Cut
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {stone.setting} Setting
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Total Summary */}
                                {formData.stones.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-[#8B6B4C] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-900">
                                                    Total Stones: {formData.stones.length}
                                                </span>
                                            </div>
                                            <div className="text-lg font-bold text-[#8B6B4C]">
                                                Total Value: ₹{formData.stoneValue || '0.00'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
                        disabled={loading || uploadingImage}
                        className="bg-[#8B6B4C] text-white px-6 py-3 rounded-lg hover:bg-[#725939] transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                        {(loading || uploadingImage) && (
                            <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        <span>
                            {uploadingImage ? 'Uploading Image...' : 
                             loading ? 'Saving...' : 
                             (product ? 'Update Product' : 'Add Product')}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading || uploadingImage}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}