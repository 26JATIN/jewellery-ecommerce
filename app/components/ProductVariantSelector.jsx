"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

const ProductVariantSelector = ({ 
    product, 
    onVariantChange,
    selectedVariant = null
}) => {
    const [selections, setSelections] = useState({});
    const [availableVariants, setAvailableVariants] = useState([]);
    const [currentVariant, setCurrentVariant] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (product && product.hasVariants && product.variants) {
            // Filter available variants (active and in stock)
            const available = product.variants.filter(variant => 
                variant.isActive && variant.stock > 0
            );
            setAvailableVariants(available);

            // If there's a selected variant, set up initial selections
            if (selectedVariant) {
                setCurrentVariant(selectedVariant);
                setSelections(selectedVariant.optionCombination || {});
            }
        }
    }, [product, selectedVariant]);

    useEffect(() => {
        // Find matching variant based on current selections
        if (product?.hasVariants && product.variantOptions && availableVariants.length > 0) {
            // Check if all required options are selected
            const requiredOptions = product.variantOptions.filter(opt => opt.required);
            const allRequiredSelected = requiredOptions.every(opt => selections[opt.name]);

            if (allRequiredSelected) {
                // Find exact match
                const matchingVariant = availableVariants.find(variant => {
                    const combination = variant.optionCombination instanceof Map 
                        ? Object.fromEntries(variant.optionCombination)
                        : variant.optionCombination || {};
                    
                    return Object.keys(selections).every(key => 
                        combination[key] === selections[key]
                    );
                });

                if (matchingVariant) {
                    setCurrentVariant(matchingVariant);
                    onVariantChange?.(matchingVariant);
                    setErrors({});
                } else {
                    setCurrentVariant(null);
                    onVariantChange?.(null);
                    setErrors({ combination: 'This combination is not available' });
                }
            } else {
                setCurrentVariant(null);
                onVariantChange?.(null);
            }
        }
    }, [selections, availableVariants, product]);

    const handleOptionSelect = (optionName, value) => {
        setSelections(prev => ({
            ...prev,
            [optionName]: value
        }));
    };

    const isOptionValueAvailable = (optionName, value) => {
        // Check if selecting this value would result in at least one available variant
        const testSelections = { ...selections, [optionName]: value };
        
        return availableVariants.some(variant => {
            const combination = variant.optionCombination instanceof Map 
                ? Object.fromEntries(variant.optionCombination)
                : variant.optionCombination || {};
            
            return Object.keys(testSelections).every(key => 
                combination[key] === testSelections[key]
            );
        });
    };

    const getVariantPrice = () => {
        if (currentVariant?.price) {
            return {
                mrp: currentVariant.price.mrp,
                sellingPrice: currentVariant.price.sellingPrice,
                costPrice: currentVariant.price.costPrice
            };
        }
        return {
            mrp: product.mrp,
            sellingPrice: product.sellingPrice,
            costPrice: product.costPrice
        };
    };

    const getVariantStock = () => {
        return currentVariant?.stock || 0;
    };

    const getVariantImages = () => {
        if (currentVariant?.images && currentVariant.images.length > 0) {
            return currentVariant.images;
        }
        return product.images || [];
    };

    if (!product?.hasVariants || !product.variantOptions || product.variantOptions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Variant Options */}
            {product.variantOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900">
                            {option.displayName}
                            {option.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        {selections[option.name] && (
                            <span className="text-xs sm:text-sm text-gray-600">
                                Selected: {selections[option.name]}
                            </span>
                        )}
                    </div>

                    {/* Option Values */}
                    <div className="space-y-2">
                        {option.type === 'color' ? (
                            // Color picker layout
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {option.values.map((value, valueIndex) => {
                                    const isSelected = selections[option.name] === value.name;
                                    const isAvailable = isOptionValueAvailable(option.name, value.name);
                                    
                                    return (
                                        <motion.button
                                            key={valueIndex}
                                            onClick={() => isAvailable && handleOptionSelect(option.name, value.name)}
                                            disabled={!isAvailable}
                                            className={`
                                                relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all
                                                ${isSelected 
                                                    ? 'border-amber-500 shadow-lg scale-110' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                                }
                                                ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                            style={{ backgroundColor: value.colorCode || '#000000' }}
                                            whileHover={isAvailable ? { scale: 1.1 } : {}}
                                            whileTap={isAvailable ? { scale: 0.95 } : {}}
                                            title={`${value.displayName}${!isAvailable ? ' (Unavailable)' : ''}`}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                                                </div>
                                            )}
                                            {!isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : option.type === 'size' ? (
                            // Size selector layout
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {option.values.map((value, valueIndex) => {
                                    const isSelected = selections[option.name] === value.name;
                                    const isAvailable = isOptionValueAvailable(option.name, value.name);
                                    
                                    return (
                                        <motion.button
                                            key={valueIndex}
                                            onClick={() => isAvailable && handleOptionSelect(option.name, value.name)}
                                            disabled={!isAvailable}
                                            className={`
                                                relative px-2 py-2 sm:px-3 sm:py-2 text-center border rounded-md text-sm sm:text-base font-medium transition-all
                                                ${isSelected 
                                                    ? 'border-amber-500 bg-amber-50 text-amber-900' 
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                                }
                                                ${!isAvailable 
                                                    ? 'opacity-40 cursor-not-allowed line-through' 
                                                    : 'cursor-pointer'
                                                }
                                            `}
                                            whileHover={isAvailable ? { scale: 1.05 } : {}}
                                            whileTap={isAvailable ? { scale: 0.95 } : {}}
                                        >
                                            {value.displayName}
                                            {value.priceAdjustment !== 0 && (
                                                <span className="block text-xs text-gray-500">
                                                    {value.priceAdjustment > 0 ? '+' : ''}₹{value.priceAdjustment}
                                                </span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            // Default select layout
                            <div className="space-y-2">
                                {option.values.map((value, valueIndex) => {
                                    const isSelected = selections[option.name] === value.name;
                                    const isAvailable = isOptionValueAvailable(option.name, value.name);
                                    
                                    return (
                                        <motion.button
                                            key={valueIndex}
                                            onClick={() => isAvailable && handleOptionSelect(option.name, value.name)}
                                            disabled={!isAvailable}
                                            className={`
                                                w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg transition-all text-sm sm:text-base
                                                ${isSelected 
                                                    ? 'border-amber-500 bg-amber-50 text-amber-900' 
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                                }
                                                ${!isAvailable 
                                                    ? 'opacity-40 cursor-not-allowed' 
                                                    : 'cursor-pointer'
                                                }
                                            `}
                                            whileHover={isAvailable ? { scale: 1.02 } : {}}
                                            whileTap={isAvailable ? { scale: 0.98 } : {}}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{value.displayName}</span>
                                                <div className="flex items-center space-x-2">
                                                    {value.priceAdjustment !== 0 && (
                                                        <span className="text-xs sm:text-sm text-gray-600">
                                                            {value.priceAdjustment > 0 ? '+' : ''}₹{value.priceAdjustment}
                                                        </span>
                                                    )}
                                                    {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />}
                                                    {!isAvailable && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Error Messages */}
            <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4"
                    >
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 font-medium text-sm sm:text-base">Selection Error</p>
                        </div>
                        {Object.values(errors).map((error, index) => (
                            <p key={index} className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Selection Summary */}
            {currentVariant && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div>
                            <h5 className="font-medium text-green-900 text-sm sm:text-base">Selected Configuration</h5>
                            <p className="text-xs sm:text-sm text-green-700">
                                SKU: {currentVariant.sku} | Stock: {currentVariant.stock} available
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-lg sm:text-xl font-bold text-green-900">
                                ₹{currentVariant.price?.sellingPrice?.toLocaleString() || product.sellingPrice?.toLocaleString()}
                            </p>
                            {currentVariant.price?.mrp && currentVariant.price.mrp !== currentVariant.price.sellingPrice && (
                                <p className="text-xs sm:text-sm text-gray-500 line-through">
                                    ₹{currentVariant.price.mrp.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ProductVariantSelector;