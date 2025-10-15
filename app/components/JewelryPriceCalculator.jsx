"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const JewelryPriceCalculator = ({ onPriceCalculated }) => {
  const [formData, setFormData] = useState({
    goldWeight: '',
    goldPurity: '22',
    makingChargePercent: '15',
    gstPercent: '3',
    currency: 'INR'
  });
  
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrices, setCurrentPrices] = useState(null);

  // INR only for Indian jewelry business
  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const goldPurities = [
    { value: '24', label: '24K (99.9% Pure)', key: '24k' },
    { value: '22', label: '22K (91.7% Pure)', key: '22k' },
    { value: '18', label: '18K (75% Pure)', key: '18k' }
  ];

  // Fetch current gold prices
  useEffect(() => {
    const fetchCurrentPrices = async () => {
      try {
        const response = await fetch('/api/gold-price?currency=INR&cache=true');
        const result = await response.json();
        if (result.success && result.data.detailed) {
          setCurrentPrices(result.data.detailed);
        }
      } catch (err) {
        console.error('Error fetching current prices:', err);
      }
    };
    
    fetchCurrentPrices();
    
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchCurrentPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePrice = async () => {
    if (!formData.goldWeight || parseFloat(formData.goldWeight) <= 0) {
      setError('Please enter a valid gold weight');
      return;
    }

    setLoading(true);
    setError(null);

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
          gstPercent: parseFloat(formData.gstPercent),
          currency: formData.currency
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate price');
      }

      setCalculation(result.data);
      
      // Call parent callback if provided
      if (onPriceCalculated) {
        onPriceCalculated(result.data);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Price calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currencyCode = formData.currency) => {
    const currencyInfo = currencies.find(c => c.code === currencyCode);
    const symbol = currencyInfo?.symbol || '₹';
    
    return `${symbol}${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  useEffect(() => {
    if (formData.goldWeight && parseFloat(formData.goldWeight) > 0) {
      const debounceTimer = setTimeout(() => {
        calculatePrice();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [formData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Jewelry Price Calculator (₹ INR)</h2>
      
      {/* Current Gold Prices Display */}
      {currentPrices && currentPrices.gold && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Gold Prices (Per Gram)</h3>
          <div className="grid grid-cols-3 gap-3">
            {currentPrices.gold['24k'] && (
              <div className="bg-white p-3 rounded border border-yellow-300">
                <div className="text-xs text-gray-600 mb-1">24K Gold</div>
                <div className="text-lg font-bold text-yellow-700">
                  {formatPrice(currentPrices.gold['24k'])}
                </div>
              </div>
            )}
            {currentPrices.gold['22k'] && (
              <div className="bg-white p-3 rounded border border-amber-300">
                <div className="text-xs text-gray-600 mb-1">22K Gold</div>
                <div className="text-lg font-bold text-amber-700">
                  {formatPrice(currentPrices.gold['22k'])}
                </div>
              </div>
            )}
            {currentPrices.gold['18k'] && (
              <div className="bg-white p-3 rounded border border-orange-300">
                <div className="text-xs text-gray-600 mb-1">18K Gold</div>
                <div className="text-lg font-bold text-orange-700">
                  {formatPrice(currentPrices.gold['18k'])}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Gold Weight */}
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
            placeholder="Enter weight in grams"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gold Purity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gold Purity
          </label>
          <select
            name="goldPurity"
            value={formData.goldPurity}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {goldPurities.map((purity) => (
              <option key={purity.value} value={purity.value}>
                {purity.label}
              </option>
            ))}
          </select>
        </div>

        {/* Making Charge */}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* GST */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GST/Tax (%)
          </label>
          <input
            type="number"
            name="gstPercent"
            value={formData.gstPercent}
            onChange={handleInputChange}
            step="0.5"
            min="0"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Currency - Fixed to INR */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency (Fixed)
          </label>
          <div className="w-full px-3 py-2 border border-green-200 rounded-md bg-green-50">
            <span className="text-green-800 font-medium">₹ Indian Rupee (INR)</span>
            <span className="text-sm text-green-600 ml-2">- All calculations in INR</span>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="mb-6">
        <button
          onClick={calculatePrice}
          disabled={loading || !formData.goldWeight}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>Calculate Price</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Calculation Results */}
      {calculation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
          
          {/* Gold Price Info */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Current gold price: {formatPrice(calculation.breakdown.goldPricePerGram)}/gram
              {calculation.goldPriceData.fallback && (
                <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">
                  Fallback Price
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {calculation.goldPurity}K gold ({((calculation.goldPurity / 24) * 100).toFixed(1)}% purity)
            </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Pure Gold Value:</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.pureGoldValue)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Making Charges ({calculation.percentages.makingCharge}%):</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.makingCharges)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.subtotal)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">GST/Tax ({calculation.percentages.gst}%):</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.gstAmount)}</span>
            </div>
            
            <div className="flex justify-between py-3 text-lg font-bold text-gray-900 bg-blue-50 px-4 rounded-lg">
              <span>Final Price:</span>
              <span className="text-blue-600">{formatPrice(calculation.breakdown.finalPrice)}</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Calculated at: {new Date(calculation.calculatedAt).toLocaleString()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JewelryPriceCalculator;