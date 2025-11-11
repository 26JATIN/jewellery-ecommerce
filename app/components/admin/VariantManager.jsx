"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Save, X, Copy } from 'lucide-react';

const VariantManager = ({ 
    productData, 
    onVariantsChange, 
    onOptionsChange,
    hasVariants = false,
    variantOptions = [],
    variants = []
}) => {
    const [localHasVariants, setLocalHasVariants] = useState(hasVariants);
    const [localOptions, setLocalOptions] = useState(variantOptions);
    const [localVariants, setLocalVariants] = useState(variants);
    const [editingOption, setEditingOption] = useState(null);
    const [editingVariant, setEditingVariant] = useState(null);

    // Common variant option types for jewelry
    const commonOptionTypes = [
        { 
            name: 'Size', 
            displayName: 'Ring Size', 
            type: 'size',
            commonValues: [
                '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', 
                '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'
            ]
        },
        {
            name: 'Color',
            displayName: 'Metal Color',
            type: 'color',
            commonValues: [
                { name: 'Yellow Gold', colorCode: '#FFD700' },
                { name: 'White Gold', colorCode: '#E8E8E8' },
                { name: 'Rose Gold', colorCode: '#E8B4A0' },
                { name: 'Silver', colorCode: '#C0C0C0' }
            ]
        },
        {
            name: 'Stone Color',
            displayName: 'Gemstone Color',
            type: 'select',
            commonValues: [
                'Colorless', 'Yellow', 'Blue', 'Pink', 'Green', 
                'Red', 'Purple', 'Orange', 'Brown', 'Black'
            ]
        },
        {
            name: 'Length',
            displayName: 'Chain Length',
            type: 'select',
            commonValues: [
                '14 inch', '16 inch', '18 inch', '20 inch', '22 inch', '24 inch', '26 inch'
            ]
        }
    ];

    // Sync with incoming props when they change (for editing existing products)
    useEffect(() => {
        console.log('VariantManager: Syncing with props', {
            hasVariants,
            variantOptionsCount: variantOptions?.length || 0,
            variantsCount: variants?.length || 0
        });
        setLocalHasVariants(hasVariants);
        setLocalOptions(variantOptions || []);
        setLocalVariants(variants || []);
    }, [hasVariants, variantOptions, variants]);

    // Notify parent component of changes
    useEffect(() => {
        console.log('VariantManager: Notifying parent of changes', {
            localHasVariants,
            localOptionsCount: localOptions?.length || 0,
            localVariantsCount: localVariants?.length || 0,
            localVariants
        });
        onVariantsChange?.(localHasVariants, localVariants);
        onOptionsChange?.(localOptions);
    }, [localHasVariants, localVariants, localOptions]);

    const handleEnableVariants = (enabled) => {
        setLocalHasVariants(enabled);
        if (!enabled) {
            setLocalOptions([]);
            setLocalVariants([]);
        }
    };

    const addVariantOption = () => {
        const newOption = {
            name: '',
            displayName: '',
            type: 'select',
            required: true,
            values: []
        };
        setLocalOptions([...localOptions, newOption]);
        setEditingOption(localOptions.length);
    };

    const updateVariantOption = (index, field, value) => {
        const updated = [...localOptions];
        updated[index] = { ...updated[index], [field]: value };
        setLocalOptions(updated);
    };

    const addOptionValue = (optionIndex, value = null) => {
        const updated = [...localOptions];
        const newValue = value || {
            name: '',
            displayName: '',
            colorCode: null,
            priceAdjustment: 0,
            isAvailable: true
        };
        updated[optionIndex].values.push(newValue);
        setLocalOptions(updated);
    };

    const updateOptionValue = (optionIndex, valueIndex, field, value) => {
        const updated = [...localOptions];
        updated[optionIndex].values[valueIndex] = {
            ...updated[optionIndex].values[valueIndex],
            [field]: value
        };
        setLocalOptions(updated);
    };

    const removeOptionValue = (optionIndex, valueIndex) => {
        const updated = [...localOptions];
        updated[optionIndex].values.splice(valueIndex, 1);
        setLocalOptions(updated);
    };

    const removeVariantOption = (index) => {
        const updated = [...localOptions];
        updated.splice(index, 1);
        setLocalOptions(updated);
        // Remove variants that use this option
        regenerateVariants(updated);
    };

    const regenerateVariants = (options = localOptions) => {
        if (options.length === 0) {
            setLocalVariants([]);
            return;
        }

        // Get base prices from product data
        const baseMRP = parseFloat(productData.mrp) || 0;
        const baseSellingPrice = parseFloat(productData.sellingPrice) || 0;

        // Generate all combinations
        const combinations = generateCombinations(options);
        const newVariants = combinations.map((combo, index) => {
            // Check if variant already exists
            const existing = localVariants.find(v => {
                const existingCombination = v.optionCombination || {};
                return JSON.stringify(combo.optionCombination) === JSON.stringify(existingCombination);
            });

            // Calculate total price adjustment for this combination
            const totalPriceAdjustment = combo.priceAdjustment || 0;

            // If variant exists, keep its custom prices, otherwise apply adjustment
            if (existing) {
                return existing;
            }

            return {
                sku: `${productData.sku || 'PROD'}-VAR-${index + 1}`,
                optionCombination: combo.optionCombination,
                price: {
                    mrp: baseMRP + totalPriceAdjustment,
                    sellingPrice: baseSellingPrice + totalPriceAdjustment
                },
                stock: 0,
                isActive: true,
                images: [],
                weightAdjustment: {
                    gold: 0,
                    silver: 0
                }
            };
        });

        setLocalVariants(newVariants);
    };

    const generateCombinations = (options) => {
        const optionsWithValues = options.filter(opt => opt.values.length > 0);
        if (optionsWithValues.length === 0) return [];

        const combinations = [];
        
        const generate = (current, priceAdjustment, depth) => {
            if (depth === optionsWithValues.length) {
                combinations.push({ 
                    optionCombination: { ...current },
                    priceAdjustment: priceAdjustment
                });
                return;
            }

            const option = optionsWithValues[depth];
            option.values.forEach(value => {
                current[option.name] = value.name;
                const valuePriceAdjustment = parseFloat(value.priceAdjustment) || 0;
                generate(current, priceAdjustment + valuePriceAdjustment, depth + 1);
            });
        };

        generate({}, 0, 0);
        return combinations;
    };

    const updateVariant = (index, field, value) => {
        const updated = [...localVariants];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updated[index][parent] = { ...updated[index][parent], [child]: value };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setLocalVariants(updated);
    };

    const duplicateVariant = (index) => {
        const original = localVariants[index];
        const duplicate = {
            ...original,
            sku: `${original.sku}-COPY-${Date.now()}`,
        };
        setLocalVariants([...localVariants, duplicate]);
    };

    const removeVariant = (index) => {
        const updated = [...localVariants];
        updated.splice(index, 1);
        setLocalVariants(updated);
    };

    const addCommonOption = (commonOption) => {
        const newOption = {
            name: commonOption.name,
            displayName: commonOption.displayName,
            type: commonOption.type,
            required: true,
            values: commonOption.commonValues.map(val => 
                typeof val === 'string' 
                    ? { name: val, displayName: val, colorCode: null, priceAdjustment: 0, isAvailable: true }
                    : { ...val, priceAdjustment: 0, isAvailable: true }
            )
        };
        setLocalOptions([...localOptions, newOption]);
    };

    // Calculate price adjustment for a specific variant based on its option combination
    const calculateVariantPriceAdjustment = (variant) => {
        let totalAdjustment = 0;
        const combination = variant.optionCombination || {};
        
        Object.entries(combination).forEach(([optionName, valueName]) => {
            const option = localOptions.find(opt => opt.name === optionName);
            if (option) {
                const value = option.values.find(v => v.name === valueName);
                if (value) {
                    totalAdjustment += parseFloat(value.priceAdjustment) || 0;
                }
            }
        });
        
        return totalAdjustment;
    };

    return (
        <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Product Variants 
                        <span className="text-xs sm:text-sm text-gray-500 ml-2 block sm:inline mt-1 sm:mt-0">
                            (Has: {localHasVariants ? 'Yes' : 'No'}, Options: {localOptions.length}, Variants: {localVariants.length})
                        </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Add variants for different sizes, colors, or other options
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="hasVariants"
                        checked={localHasVariants}
                        onChange={(e) => handleEnableVariants(e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="hasVariants" className="text-xs sm:text-sm text-gray-700">
                        Enable variants
                    </label>
                </div>
            </div>

            <AnimatePresence>
                {localHasVariants && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                    >
                        {/* Variant Options Section */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900">Variant Options</h4>
                                <button
                                    type="button"
                                    onClick={addVariantOption}
                                    className="flex items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm text-amber-600 hover:text-amber-700 py-2 sm:py-0"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Option</span>
                                </button>
                            </div>

                            {/* Quick Add Common Options */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-600 mb-2">Quick add common options:</p>
                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                    {commonOptionTypes.map((option, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => addCommonOption(option)}
                                            className="text-xs px-2 py-1.5 sm:py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            {option.displayName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {localOptions.map((option, optionIndex) => (
                                <div key={optionIndex} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Option Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={option.name}
                                                    onChange={(e) => updateVariantOption(optionIndex, 'name', e.target.value)}
                                                    placeholder="e.g., Size, Color"
                                                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Display Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={option.displayName}
                                                    onChange={(e) => updateVariantOption(optionIndex, 'displayName', e.target.value)}
                                                    placeholder="e.g., Ring Size, Stone Color"
                                                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={option.type}
                                                    onChange={(e) => updateVariantOption(optionIndex, 'type', e.target.value)}
                                                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                                >
                                                    <option value="select">Select</option>
                                                    <option value="color">Color</option>
                                                    <option value="size">Size</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVariantOption(optionIndex)}
                                            className="ml-0 sm:ml-2 self-start sm:self-auto text-red-600 hover:text-red-700 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Option Values */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-gray-700">
                                                Available Values
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => addOptionValue(optionIndex)}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                Add Value
                                            </button>
                                        </div>
                                        
                                        {/* Column Headers */}
                                        {option.values.length > 0 && (
                                            <div className="hidden sm:grid sm:grid-cols-12 gap-2 mb-2 text-xs font-medium text-gray-600">
                                                <div className="col-span-4">Internal Name</div>
                                                <div className="col-span-4">Display Name</div>
                                                <div className="col-span-3">
                                                    {option.type === 'color' ? 'Color & Price' : 'Price Adj.'}
                                                </div>
                                                <div className="col-span-1"></div>
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2">
                                            {option.values.map((value, valueIndex) => (
                                                <div key={valueIndex} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={value.name}
                                                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'name', e.target.value)}
                                                        placeholder="e.g., yellow-gold"
                                                        title="Internal identifier (no spaces)"
                                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={value.displayName}
                                                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'displayName', e.target.value)}
                                                        placeholder="e.g., Yellow Gold"
                                                        title="Customer-facing display name"
                                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        {option.type === 'color' && (
                                                            <input
                                                                type="color"
                                                                value={value.colorCode || '#000000'}
                                                                onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'colorCode', e.target.value)}
                                                                title="Color swatch"
                                                                className="w-10 h-9 border border-gray-300 rounded"
                                                            />
                                                        )}
                                                        <input
                                                            type="number"
                                                            value={value.priceAdjustment}
                                                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                                                            placeholder="₹0"
                                                            title="Price adjustment (+ for extra, - for discount)"
                                                            className="w-20 sm:w-20 text-sm border border-gray-300 rounded px-2 py-1.5"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                            title="Remove this value"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {localOptions.length > 0 && (
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => regenerateVariants()}
                                        className="w-full bg-amber-600 text-white px-4 py-2.5 rounded-md hover:bg-amber-700 transition-colors text-sm sm:text-base"
                                    >
                                        Generate Variants ({localOptions.reduce((acc, opt) => acc * Math.max(opt.values.length, 1), 1)} combinations)
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Generated Variants Section */}
                        {localVariants.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                                    Generated Variants ({localVariants.length})
                                </h4>
                                <div className="space-y-3">
                                    {localVariants.map((variant, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                                <div className="lg:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        SKU
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                </div>
                                                
                                                <div className="lg:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Combination
                                                    </label>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded min-h-[34px] flex items-center">
                                                            {Object.entries(variant.optionCombination || {}).map(([key, value]) => 
                                                                `${key}: ${value}`
                                                            ).join(', ')}
                                                        </div>
                                                        {(() => {
                                                            const adjustment = calculateVariantPriceAdjustment(variant);
                                                            if (adjustment !== 0) {
                                                                return (
                                                                    <div className={`text-xs px-2 py-0.5 rounded ${adjustment > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        Price Adj: {adjustment > 0 ? '+' : ''}₹{adjustment.toFixed(2)}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        MRP
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.price?.mrp || ''}
                                                        onChange={(e) => updateVariant(index, 'price.mrp', parseFloat(e.target.value) || 0)}
                                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Selling
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.price?.sellingPrice || ''}
                                                        onChange={(e) => updateVariant(index, 'price.sellingPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-3 mt-3">
                                                <div className="lg:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Stock
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                </div>

                                                <div className="lg:col-span-3">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Weight Adjustment (grams)
                                                    </label>
                                                    <div className="flex space-x-1">
                                                        <input
                                                            type="number"
                                                            value={variant.weightAdjustment?.gold || ''}
                                                            onChange={(e) => updateVariant(index, 'weightAdjustment.gold', parseFloat(e.target.value) || 0)}
                                                            placeholder="Gold"
                                                            step="0.001"
                                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={variant.weightAdjustment?.silver || ''}
                                                            onChange={(e) => updateVariant(index, 'weightAdjustment.silver', parseFloat(e.target.value) || 0)}
                                                            placeholder="Silver"
                                                            step="0.001"
                                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 flex items-end gap-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={variant.isActive}
                                                            onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                                                            className="w-4 h-4 text-amber-600 border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-xs sm:text-sm text-gray-700">Active</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => duplicateVariant(index)}
                                                        className="text-blue-600 hover:text-blue-700 p-1.5"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-600 hover:text-red-700 p-1.5"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VariantManager;