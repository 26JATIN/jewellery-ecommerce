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
        silverPurity: '925',
        platinumWeight: '',
        platinumPurity: '950',
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
        { value: '18', label: '18K (75% Pure)' },
        { value: '14', label: '14K (58.3% Pure)' },
        { value: '10', label: '10K (41.7% Pure)' }
    ];

    const silverPurities = [
        { value: '999', label: '999 (99.9% Pure Silver)' },
        { value: '950', label: '950 (95% Pure Silver)' },
        { value: '925', label: '925 (Sterling Silver - 92.5%)' },
        { value: '900', label: '900 (90% Pure Silver)' },
        { value: '835', label: '835 (83.5% Pure Silver)' },
        { value: '800', label: '800 (80% Pure Silver)' }
    ];

    const platinumPurities = [
        { value: '999', label: '999 (99.9% Pure Platinum)' },
        { value: '950', label: '950 (95% Pure Platinum - Jewelry Grade)' },
        { value: '900', label: '900 (90% Pure Platinum)' },
        { value: '850', label: '850 (85% Pure Platinum)' }
    ];

    const metalTypes = [
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
        { value: 'platinum', label: 'Platinum' },
        { value: 'mixed', label: 'Mixed Metals' }
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
                        { name: 'Platinum' },
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
                    { name: 'Platinum' },
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
                price: product.price || product.sellingPrice || '',
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
                silverPurity: product.silverPurity || '925',
                platinumWeight: product.platinumWeight || '',
                platinumPurity: product.platinumPurity || '950',
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
        const isPlatinum = selectedMetal === 'platinum';
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
                
            case 'platinum':
                const platinumWeight = parseFloat(formData.platinumWeight);
                if (!formData.platinumWeight || isNaN(platinumWeight) || platinumWeight <= 0) {
                    alert('Platinum weight is required for pricing calculation. Please enter a value like 5.5 grams.');
                    return;
                }
                break;
                
            default:
                alert('Please select a valid metal type (Gold, Silver, or Platinum).');
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
            } else if (isPlatinum) {
                response = await fetch('/api/platinum-price', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        platinumWeight: parseFloat(formData.platinumWeight),
                        platinumPurity: parseFloat(formData.platinumPurity),
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
            } else if (newValue === 'platinum') {
                defaultMakingCharge = '10'; // Platinum typically has lower making charges
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
                silverPurity: parseFloat(formData.silverPurity) || 925,
                platinumWeight: parseFloat(formData.platinumWeight) || 0,
                platinumPurity: parseFloat(formData.platinumPurity) || 950,
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
                        {loadingCategories && (
                            <p className="text-xs text-gray-500 mt-1">
                                Loading available categories...
                            </p>
                        )}
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

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pricing Method
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center p-3 border border-gray-300 rounded-lg">
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
                            
                            <div className="flex items-center p-3 border border-gray-300 rounded-lg">
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

                        {/* Dynamic Pricing Fields - Show immediately below when selected */}
                        {formData.pricingMethod === 'dynamic' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4 mt-4">
                                <div className="flex items-center mb-4">
                                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-yellow-800">Metal Specifications</h3>
                                </div>

                                {/* Metal Type Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Metal Type *
                                    </label>
                                    <select
                                        name="metalType"
                                        value={formData.metalType}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                        required={formData.pricingMethod === 'dynamic'}
                                    >
                                        {metalTypes.map((metal) => (
                                            <option key={metal.value} value={metal.value}>
                                                {metal.label}
                                            </option>
                                        ))}
                                    </select>
                                    {(formData.metalType === 'platinum' || formData.metalType === 'mixed') && (
                                        <p className="text-xs text-amber-600 mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            Dynamic pricing not yet available for {formData.metalType}. Use fixed pricing method.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Gold Fields - Show only for gold or mixed metals */}
                                    {(formData.metalType === 'gold' || formData.metalType === 'mixed') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Gold Weight (grams) {formData.metalType === 'gold' ? '*' : ''}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="goldWeight"
                                                    value={formData.goldWeight}
                                                    onChange={handleInputChange}
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                                    placeholder="e.g., 5.5"
                                                    required={formData.pricingMethod === 'dynamic' && formData.metalType === 'gold'}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter the total weight of gold in the jewelry</p>
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
                                        </>
                                    )}

                                    {/* Silver Fields - Show only for silver or mixed metals */}
                                    {(formData.metalType === 'silver' || formData.metalType === 'mixed') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Silver Weight (grams) {formData.metalType === 'silver' ? '*' : ''}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="silverWeight"
                                                    value={formData.silverWeight}
                                                    onChange={handleInputChange}
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                                    placeholder="e.g., 10.5"
                                                    required={formData.pricingMethod === 'dynamic' && formData.metalType === 'silver'}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter the total weight of silver in the jewelry</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Silver Purity
                                                </label>
                                                <select
                                                    name="silverPurity"
                                                    value={formData.silverPurity}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
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

                                    {/* Platinum Fields - Show only for platinum or mixed metals */}
                                    {(formData.metalType === 'platinum' || formData.metalType === 'mixed') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Platinum Weight (grams) {formData.metalType === 'platinum' ? '*' : ''}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="platinumWeight"
                                                    value={formData.platinumWeight}
                                                    onChange={handleInputChange}
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                                    placeholder="e.g., 5.5"
                                                    required={formData.pricingMethod === 'dynamic' && formData.metalType === 'platinum'}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter the total weight of platinum in the jewelry</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Platinum Purity
                                                </label>
                                                <select
                                                    name="platinumPurity"
                                                    value={formData.platinumPurity}
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                                >
                                                    {platinumPurities.map((purity) => (
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
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Typical: Gold 10-20%, Silver 15-25%
                                        </p>
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
                                        disabled={calculatingPrice || (formData.metalType === 'mixed')}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {calculatingPrice && (
                                            <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                        <span>
                                            {formData.metalType === 'mixed' ? 'Mixed Metal Pricing Not Available' :
                                             `Calculate ${formData.metalType.charAt(0).toUpperCase() + formData.metalType.slice(1)} Price`}
                                        </span>
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
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            {formData.metalType.charAt(0).toUpperCase() + formData.metalType.slice(1)} Price Breakdown
                                        </h4>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    {formData.metalType === 'gold' ? 'Gold' : 
                                                     formData.metalType === 'silver' ? 'Silver' : 'Platinum'} Value:
                                                </span>
                                                <span>
                                                    ₹{(calculatedPrice.breakdown.pureGoldValue || 
                                                       calculatedPrice.breakdown.pureSilverValue || 
                                                       calculatedPrice.breakdown.purePlatinumValue).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Making Charges:</span>
                                                <span>₹{calculatedPrice.breakdown.makingCharges.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">GST (3%):</span>
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
                                        
                                        {/* Live Metal Rate Display */}
                                        <div className="mt-3 pt-2 border-t border-gray-100">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>
                                                    Live {formData.metalType === 'gold' ? 'Gold' : 
                                                          formData.metalType === 'silver' ? 'Silver' : 'Platinum'} Rate:
                                                </span>
                                                <span>
                                                    ₹{(formData.metalType === 'gold' ? 
                                                        calculatedPrice.breakdown.goldPricePerGram : 
                                                        formData.metalType === 'silver' ? 
                                                        calculatedPrice.breakdown.silverPricePerGram :
                                                        calculatedPrice.breakdown.platinumPricePerGram
                                                    ).toFixed(2)}/gram
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Data Source:</span>
                                                <span>{calculatedPrice.goldPriceData?.source || 
                                                       calculatedPrice.silverPriceData?.source || 
                                                       calculatedPrice.platinumPriceData?.source}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Show price fields only for Fixed Pricing */}
                    {formData.pricingMethod === 'fixed' && (
                        <>
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
                        </>
                    )}

                    {/* For Dynamic Pricing - Show Cost Price and Discount % fields */}
                    {formData.pricingMethod === 'dynamic' && (
                        <>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter your actual cost/purchase price for this product
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Percentage (%) *
                                </label>
                                <input
                                    type="number"
                                    name="discountPercent"
                                    value={formData.discountPercent || 0}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Discount to apply on MRP (e.g., 10% off)
                                </p>
                                {calculatedPrice?.breakdown?.finalPrice && (
                                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                        <p className="text-xs text-gray-700">
                                            <strong>MRP:</strong> ₹{calculatedPrice.breakdown.finalPrice.toFixed(2)} (auto-calculated)
                                        </p>
                                        <p className="text-xs text-green-600 font-semibold mt-1">
                                            <strong>Selling Price:</strong> ₹{(calculatedPrice.breakdown.finalPrice * (1 - (formData.discountPercent || 0) / 100)).toFixed(2)} 
                                            {formData.discountPercent > 0 && ` (${formData.discountPercent}% off)`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Show info message for Dynamic Pricing */}
                    {formData.pricingMethod === 'dynamic' && (
                        <div className="md:col-span-2">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">Dynamic Pricing Enabled</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            MRP will be automatically calculated based on:
                                        </p>
                                        <ul className="text-sm text-blue-600 mt-2 space-y-1 list-disc list-inside ml-2">
                                            <li>Live metal rates (Gold/Silver/Platinum)</li>
                                            <li>Metal weight and purity</li>
                                            <li>Making charges</li>
                                            <li>Stone value (if applicable)</li>
                                        </ul>
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-xs text-blue-700">
                                                <strong>Manual Inputs:</strong>
                                            </p>
                                            <ul className="text-xs text-blue-600 mt-1 space-y-0.5 ml-4">
                                                <li>• Cost Price - Your actual cost/purchase price</li>
                                                <li>• Discount % - Percentage discount on MRP (e.g., 10% off)</li>
                                            </ul>
                                            <p className="text-xs text-blue-700 mt-2">
                                                <strong>Auto-Calculated:</strong>
                                            </p>
                                            <ul className="text-xs text-blue-600 mt-1 space-y-0.5 ml-4">
                                                <li>• MRP - Maximum Retail Price (based on metal rates)</li>
                                                <li>• Selling Price - MRP minus discount% (final price)</li>
                                            </ul>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                            💡 When gold prices change, MRP and Selling Price will update automatically. Cost price and discount % remain as you set them.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

                {/* Multiple Images Upload */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Additional Images</h3>
                        <span className="text-sm text-gray-500">({imagePreviews.length}/10 images)</span>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Multiple Image Upload Input */}
                        <div>
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
                                className="cursor-pointer bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg px-6 py-4 text-center transition-colors block"
                            >
                                <div className="space-y-2">
                                    <svg className="mx-auto h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600">Add multiple images</span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Select multiple PNG, JPG, GIF files up to 5MB each (Max 10 images)
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Image Previews Grid */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        
                                        {/* Image Controls */}
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            {/* Move Up */}
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(index, 'up')}
                                                    className="bg-white/80 hover:bg-white text-gray-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Move up"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            {/* Move Down */}
                                            {index < imagePreviews.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(index, 'down')}
                                                    className="bg-white/80 hover:bg-white text-gray-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Move down"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            {/* Remove */}
                                            <button
                                                type="button"
                                                onClick={() => removeProductImage(index)}
                                                className="bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove image"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        {/* Image Order */}
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                            {index + 1}
                                        </div>
                                        
                                        {/* Primary Badge */}
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Stone/Gem Management */}
                <div className="border-t border-gray-200 pt-6">
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

                {/* Tags Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {['Men', 'Women', 'Kids'].map((tag) => (
                            <label key={tag} className="flex items-center space-x-2 cursor-pointer">
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
                                <span className="text-sm text-gray-700">{tag}</span>
                            </label>
                        ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Select one or more target audiences for this product
                    </p>
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