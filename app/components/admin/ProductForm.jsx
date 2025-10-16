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
        images: [],
        isActive: true,
        tags: [],
        // Dynamic pricing fields
        pricingMethod: 'fixed',
        metalType: 'gold',
        goldWeight: '',
        goldPurity: '22',
        silverWeight: '',
        silverPurity: '999',
        makingChargePercent: '15',
        stoneValue: '',
        isDynamicPricing: false,
        // Enhanced stone specifications
        stones: []
    });

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [calculatedPrice, setCalculatedPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const goldPurities = [
        { value: '24', label: '24K (99.9% Pure)' },
        { value: '22', label: '22K (91.7% Pure)' },
        { value: '20', label: '20K (83.3% Pure)' },
        { value: '18', label: '18K (75% Pure)' }
    ];

    const silverPurities = [
        { value: '999', label: '999 (99.9% Pure Silver)' }
    ];

    const metalTypes = [
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' }
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

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (response.ok) {
                    const categoriesData = await response.json();
                    setCategories(categoriesData);
                } else {
                    console.error('Failed to fetch categories');
                    // Fallback to hardcoded categories
                    setCategories([
                        { name: 'Diamond' },
                        { name: 'Gold' },
                        { name: 'Silver' },
                        { name: 'Wedding' },
                        { name: 'Vintage' },
                        { name: 'Contemporary' },
                        { name: 'Traditional' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to hardcoded categories
                setCategories([
                    { name: 'Diamond' },
                    { name: 'Gold' },
                    { name: 'Silver' },
                    { name: 'Wedding' },
                    { name: 'Vintage' },
                    { name: 'Contemporary' },
                    { name: 'Traditional' }
                ]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                mrp: product.mrp || '',
                costPrice: product.costPrice || '',
                sellingPrice: product.sellingPrice || '',
                price: product.sellingPrice || '',
                stock: product.stock || '',
                sku: product.sku || '',
                image: product.image || '',
                isActive: product.isActive !== undefined ? product.isActive : true,
                tags: product.tags || [],
                // Dynamic pricing fields
                pricingMethod: product.pricingMethod || 'fixed',
                metalType: product.metalType || 'gold',
                goldWeight: product.goldWeight || '',
                goldPurity: product.goldPurity || '22',
                silverWeight: product.silverWeight || '',
                silverPurity: product.silverPurity || '999',
                makingChargePercent: product.makingChargePercent || '15',
                stoneValue: product.stoneValue || '',
                isDynamicPricing: product.isDynamicPricing || false,
                // Enhanced stone specifications
                stones: product.stones || [],
                images: product.images || []
            });
            setImagePreview(product.image || '');
            // Set up multiple image previews
            if (product.images && product.images.length > 0) {
                setImagePreviews(product.images.map(img => img.url));
            }
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
        // Check selected metal type
        const selectedMetal = formData.metalType;
        const isGold = selectedMetal === 'gold';
        const isSilver = selectedMetal === 'silver';
        const isMixed = selectedMetal === 'mixed';
        
        // Validate only the selected metal type
        switch (formData.metalType) {
            case 'gold':
                const goldWeight = parseFloat(formData.goldWeight);
                if (!formData.goldWeight || isNaN(goldWeight) || goldWeight <= 0) {
                    alert('Gold weight is required for pricing calculation. Please enter a value like 10.5 grams.');
                    return;
                }
                break;
                
            case 'silver':
                const silverWeight = parseFloat(formData.silverWeight);
                if (!formData.silverWeight || isNaN(silverWeight) || silverWeight <= 0) {
                    alert('Silver weight is required for pricing calculation. Please enter a value like 15.0 grams.');
                    return;
                }
                break;
                
            default:
                alert('Please select a valid metal type (Gold or Silver).');
                return;
        }

        if (isMixed) {
            alert('Mixed metal pricing calculation is not yet implemented. Please select a single metal type for dynamic pricing.');
            return;
        }

        setCalculatingPrice(true);
        try {
            let response;
            
            if (isGold) {
                response = await fetch('/api/gold-price', {
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
            } else if (isSilver) {
                response = await fetch('/api/silver-price', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        silverWeight: parseFloat(formData.silverWeight),
                        silverPurity: parseFloat(formData.silverPurity),
                        makingChargePercent: parseFloat(formData.makingChargePercent),
                        gstPercent: 3,
                        currency: 'INR'
                    })
                });
            }

            // Check if response is valid
            if (!response) {
                throw new Error('No valid pricing method available for the selected metal type.');
            }

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

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

        // Handle metal type change - adjust default making charges
        if (name === 'metalType') {
            let defaultMakingCharge = '15';
            if (newValue === 'silver') {
                defaultMakingCharge = '20'; // Silver typically has higher making charges
            }
            
            setFormData(prev => ({
                ...prev,
                [name]: newValue,
                makingChargePercent: defaultMakingCharge
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
        if (['goldWeight', 'goldPurity', 'silverWeight', 'silverPurity', 'makingChargePercent', 'stoneValue', 'metalType'].includes(name) && 
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

    // Handle multiple image selection
    const handleMultipleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Check total image limit
        const currentImages = imageFiles.length;
        const totalImages = currentImages + validFiles.length;
        if (totalImages > 10) {
            alert(`Maximum 10 images allowed. You can add ${10 - currentImages} more images.`);
            return;
        }

        setImageFiles(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove image from multiple images
    const removeProductImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        
        // Update formData images
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Move image up/down in order
    const moveImage = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= imageFiles.length) return;

        // Move in imageFiles
        const newImageFiles = [...imageFiles];
        [newImageFiles[index], newImageFiles[newIndex]] = [newImageFiles[newIndex], newImageFiles[index]];
        setImageFiles(newImageFiles);

        // Move in previews
        const newPreviews = [...imagePreviews];
        [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
        setImagePreviews(newPreviews);

        // Move in formData
        const newImages = [...formData.images];
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
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

            // Upload single image if a new file is selected
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl && imageFile) {
                    // Upload failed, don't proceed
                    setLoading(false);
                    return;
                }
            }

            // Upload multiple images if new files are selected
            let uploadedImages = [...formData.images]; // Keep existing images
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(async (file, index) => {
                    try {
                        const formData = new FormData();
                        formData.append('image', file);

                        const response = await fetch('/api/admin/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        const result = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(result.error || 'Upload failed');
                        }

                        return {
                            url: result.imageUrl,
                            alt: `Product image ${uploadedImages.length + index + 1}`,
                            isPrimary: uploadedImages.length === 0 && index === 0, // First image is primary
                            order: uploadedImages.length + index
                        };
                    } catch (error) {
                        console.error(`Failed to upload image ${index + 1}:`, error);
                        return null;
                    }
                });

                const uploadResults = await Promise.all(uploadPromises);
                const successfulUploads = uploadResults.filter(result => result !== null);
                uploadedImages = [...uploadedImages, ...successfulUploads];
            }

            // Set primary image URL for backward compatibility
            if (!imageUrl && uploadedImages.length > 0) {
                const primaryImage = uploadedImages.find(img => img.isPrimary) || uploadedImages[0];
                imageUrl = primaryImage.url;
            }

            const submitData = {
                ...formData,
                image: imageUrl,
                images: uploadedImages,
                // For dynamic pricing, use calculated selling price but keep manual cost price and MRP
                mrp: parseFloat(formData.mrp), // Always use manual input
                costPrice: parseFloat(formData.costPrice), // Always use manual input
                sellingPrice: formData.pricingMethod === 'dynamic'
                    ? (calculatedPrice?.breakdown?.finalPrice || 0)
                    : parseFloat(formData.sellingPrice),
                price: formData.pricingMethod === 'dynamic'
                    ? (calculatedPrice?.breakdown?.finalPrice || 0)
                    : parseFloat(formData.sellingPrice),
                stock: parseInt(formData.stock) || 0,
                // Dynamic pricing fields
                metalType: formData.metalType,
                goldWeight: parseFloat(formData.goldWeight) || 0,
                goldPurity: parseFloat(formData.goldPurity) || 22,
                silverWeight: parseFloat(formData.silverWeight) || 0,
                silverPurity: parseFloat(formData.silverPurity) || 999,
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
        <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Basic Information */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#8B6B4C] to-[#725939] px-6 py-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Basic Information
                        </h3>
                    </div>
                    <div className="p-6">
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                    placeholder="e.g., Gold Diamond Ring"
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                    placeholder="Auto-generated"
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                    required
                                    disabled={loadingCategories}
                                >
                                    <option value="">
                                        {loadingCategories ? 'Loading categories...' : 'Select Category'}
                                    </option>
                                    {categories.map(cat => (
                                        <option key={cat.name || cat} value={cat.name || cat}>
                                            {cat.name || cat}
                                        </option>
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                    placeholder="Available quantity"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                    placeholder="Detailed product description..."
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Audience
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {['Men', 'Women', 'Kids'].map((tag) => (
                                        <label key={tag} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#8B6B4C] transition-all">
                                            <input
                                                type="checkbox"
                                                checked={formData.tags.includes(tag)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            tags: [...formData.tags, tag]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            tags: formData.tags.filter(t => t !== tag)
                                                        });
                                                    }
                                                }}
                                                className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{tag}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-[#8B6B4C] transition-all">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Product is Active (Visible to Customers)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Pricing Method */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#8B6B4C] to-[#725939] px-6 py-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pricing Configuration
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div 
                                onClick={() => handleInputChange({ target: { name: 'pricingMethod', value: 'fixed', type: 'text' }})}
                                className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                                    formData.pricingMethod === 'fixed' 
                                        ? 'border-[#8B6B4C] bg-amber-50 shadow-md' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="pricingMethod"
                                        value="fixed"
                                        checked={formData.pricingMethod === 'fixed'}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#8B6B4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Fixed Pricing</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">Set manual prices for this product</p>
                                        <p className="text-xs text-gray-500 mt-2">Best for: Unique items, limited editions</p>
                                    </div>
                                </div>
                            </div>

                            <div 
                                onClick={() => handleInputChange({ target: { name: 'pricingMethod', value: 'dynamic', type: 'text' }})}
                                className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                                    formData.pricingMethod === 'dynamic' 
                                        ? 'border-[#8B6B4C] bg-amber-50 shadow-md' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        name="pricingMethod"
                                        value="dynamic"
                                        checked={formData.pricingMethod === 'dynamic'}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#8B6B4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            <h4 className="font-semibold text-gray-900">Dynamic Pricing</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">Auto-calculate based on live metal rates</p>
                                        <p className="text-xs text-gray-500 mt-2">Best for: Gold, silver jewelry with market prices</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Pricing Fields */}
                        {formData.pricingMethod === 'dynamic' && (
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6 space-y-6">
                                <div className="flex items-center gap-2 pb-4 border-b border-yellow-200">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    <h4 className="text-lg font-semibold text-yellow-900">Metal Specifications</h4>
                                </div>

                                {/* Metal Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Metal Type *
                                    </label>
                                    <select
                                        name="metalType"
                                        value={formData.metalType}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                        required={formData.pricingMethod === 'dynamic'}
                                    >
                                        {metalTypes.map((metal) => (
                                            <option key={metal.value} value={metal.value}>
                                                {metal.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Gold Fields */}
                                    {formData.metalType === 'gold' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gold Weight (grams) *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="goldWeight"
                                                    value={formData.goldWeight}
                                                    onChange={handleInputChange}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                                    placeholder="e.g., 5.5"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gold Purity *
                                                </label>
                                                <select
                                                    name="goldPurity"
                                                    value={formData.goldPurity}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                                >
                                                    {goldPurities.map((purity) => (
                                                        <option key={purity.value} value={purity.value}>
                                                            {purity.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* Silver Fields */}
                                    {formData.metalType === 'silver' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Silver Weight (grams) *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="silverWeight"
                                                    value={formData.silverWeight}
                                                    onChange={handleInputChange}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                                    placeholder="e.g., 10.5"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Silver Purity *
                                                </label>
                                                <select
                                                    name="silverPurity"
                                                    value={formData.silverPurity}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                                >
                                                    {silverPurities.map((purity) => (
                                                        <option key={purity.value} value={purity.value}>
                                                            {purity.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}

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
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                            placeholder="15"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Typical: Gold 10-20%, Silver 15-25%
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total Stone Value (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="stoneValue"
                                            value={formData.stoneValue}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 transition-all"
                                            placeholder="Auto-calculated"
                                            readOnly
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Calculated from stones below
                                        </p>
                                    </div>
                                </div>

                                {/* Calculate Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-yellow-200">
                                    <button
                                        type="button"
                                        onClick={calculateDynamicPrice}
                                        disabled={calculatingPrice}
                                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md transition-all"
                                    >
                                        {calculatingPrice && (
                                            <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                        <span>Calculate Price</span>
                                    </button>

                                    {calculatedPrice?.breakdown?.finalPrice && (
                                        <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-300">
                                            <p className="text-xs text-gray-600">Calculated Price</p>
                                            <p className="text-xl font-bold text-green-600">
                                                ₹{Number(calculatedPrice.breakdown.finalPrice).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                {calculatedPrice?.breakdown && (
                                    <div className="bg-white border-2 border-gray-200 rounded-lg p-5 space-y-3">
                                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Price Breakdown
                                        </h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-600">Metal Value:</span>
                                                <span className="font-medium">₹{Number(
                                                    formData.metalType === 'gold' ? (calculatedPrice.breakdown.goldValue || 0) :
                                                    formData.metalType === 'silver' ? (calculatedPrice.breakdown.silverValue || 0) : 0
                                                ).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-600">Making Charges:</span>
                                                <span className="font-medium">₹{Number(calculatedPrice.breakdown.makingCharges || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-600">GST (3%):</span>
                                                <span className="font-medium">₹{Number(calculatedPrice.breakdown.gstAmount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-t border-gray-200 pt-2">
                                                <span className="font-semibold text-gray-900">Total Price:</span>
                                                <span className="font-bold text-[#8B6B4C] text-lg">₹{Number(calculatedPrice.breakdown.finalPrice || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fixed Pricing Fields */}
                        {formData.pricingMethod === 'fixed' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                        placeholder="Maximum Retail Price"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                        placeholder="Your Cost"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                        placeholder="Customer Price"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Dynamic Pricing - Cost and Discount */}
                        {formData.pricingMethod === 'dynamic' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                        placeholder="Your actual cost"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Your purchase/manufacturing cost</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount (%) *
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPercent"
                                        value={formData.discountPercent || 0}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                        placeholder="e.g., 10"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Discount on calculated MRP</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: Product Images */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#8B6B4C] to-[#725939] px-6 py-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Product Images
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Primary Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Primary Product Image
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative group">
                                        <div className="aspect-square rounded-xl overflow-hidden border-2 border-[#8B6B4C] shadow-md">
                                            <img 
                                                src={imagePreview} 
                                                alt="Product preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            Primary
                                        </div>
                                    </div>
                                )}
                                
                                {/* Upload Area */}
                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#F5F0EB] hover:to-[#EAE0D8] border-2 border-dashed border-gray-300 hover:border-[#8B6B4C] rounded-xl p-8 text-center transition-all block"
                                    >
                                        <div className="space-y-3">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold text-[#8B6B4C]">Click to upload</span> or drag and drop
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                PNG, JPG, GIF up to 5MB
                                            </div>
                                        </div>
                                    </label>

                                    {/* Manual URL Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">
                                            Or enter image URL:
                                        </label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                setImagePreview(e.target.value);
                                            }}
                                            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Multiple Images Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-semibold text-gray-900">Additional Images</h4>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {imagePreviews.length}/10 images
                                </span>
                            </div>

                            {/* Multiple Upload Button */}
                            <div className="mb-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleMultipleImageChange}
                                    className="hidden"
                                    id="multiple-image-upload"
                                />
                                <label
                                    htmlFor="multiple-image-upload"
                                    className="cursor-pointer bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg px-6 py-4 text-center transition-all block"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Add Multiple Images</p>
                                            <p className="text-xs text-gray-500 mt-1">Select up to 10 images</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Image Grid */}
                            {imagePreviews.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-[#8B6B4C] transition-all">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            
                                            {/* Controls Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(index, 'up')}
                                                        className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-sm transition-all"
                                                        title="Move left"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {index < imagePreviews.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(index, 'down')}
                                                        className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-sm transition-all"
                                                        title="Move right"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductImage(index)}
                                                    className="bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow-sm transition-all"
                                                    title="Remove"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Image Number */}
                                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm text-gray-500">No additional images</p>
                                    <p className="text-xs text-gray-400 mt-1">Upload more images to showcase your product</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 4: Stone Specifications */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#8B6B4C] to-[#725939] px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                </svg>
                                Stone & Gem Specifications
                            </h3>
                            <button
                                type="button"
                                onClick={addStone}
                                className="px-4 py-2 bg-white text-[#8B6B4C] rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Stone</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        {formData.stones.length === 0 ? (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                </svg>
                                <p className="text-gray-600 font-medium mb-2">No stones added yet</p>
                                <p className="text-gray-400 text-sm mb-4">Add diamonds, rubies, emeralds, and other precious gems</p>
                                <button
                                    type="button"
                                    onClick={addStone}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#725939] transition-all font-medium shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Add Your First Stone</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.stones.map((stone, index) => (
                                    <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <h4 className="text-base font-semibold text-gray-900">
                                                    {stone.type} - {stone.quality}
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeStone(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Stone Type</label>
                                                <select
                                                    value={stone.type}
                                                    onChange={(e) => updateStone(index, 'type', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    {stoneTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
                                                <select
                                                    value={stone.quality}
                                                    onChange={(e) => updateStone(index, 'quality', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    {stoneQualities.map((quality) => (
                                                        <option key={quality} value={quality}>{quality}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Weight (Carats)</label>
                                                <input
                                                    type="number"
                                                    value={stone.weight}
                                                    onChange={(e) => updateStone(index, 'weight', e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                    placeholder="0.50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Price per Carat (₹)</label>
                                                <input
                                                    type="number"
                                                    value={stone.pricePerUnit}
                                                    onChange={(e) => updateStone(index, 'pricePerUnit', e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                    placeholder="50000"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                                                <input
                                                    type="text"
                                                    value={stone.color}
                                                    onChange={(e) => updateStone(index, 'color', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                    placeholder="Colorless, Red, Blue..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Total Value</label>
                                                <div className="w-full p-2.5 bg-green-50 border-2 border-green-300 rounded-lg text-sm font-bold text-green-700">
                                                    ₹{stone.totalValue?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Cut</label>
                                                <select
                                                    value={stone.cut}
                                                    onChange={(e) => updateStone(index, 'cut', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    {stoneCuts.map((cut) => (
                                                        <option key={cut} value={cut}>{cut}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Setting</label>
                                                <select
                                                    value={stone.setting}
                                                    onChange={(e) => updateStone(index, 'setting', e.target.value)}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    {stoneSettings.map((setting) => (
                                                        <option key={setting} value={setting}>{setting}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Total Summary */}
                                {formData.stones.length > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Total Stones: <span className="font-bold text-gray-900">{formData.stones.length}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">All stones configured</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-600">Combined Value</p>
                                                <p className="text-2xl font-bold text-green-700">
                                                    ₹{formData.stoneValue || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading || uploadingImage}
                        className="px-8 py-3.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancel</span>
                    </button>

                    <button
                        type="submit"
                        disabled={loading || uploadingImage}
                        className="px-8 py-3.5 bg-gradient-to-r from-[#8B6B4C] to-[#725939] text-white rounded-lg hover:from-[#725939] hover:to-[#5F4A2F] transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        {(loading || uploadingImage) && (
                            <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        <span>
                            {uploadingImage ? 'Uploading Images...' : 
                             loading ? 'Saving Product...' : 
                             (product ? 'Update Product' : 'Create Product')}
                        </span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}