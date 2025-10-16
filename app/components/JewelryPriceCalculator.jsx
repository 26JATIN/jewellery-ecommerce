"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const JewelryPriceCalculator = ({ onPriceCalculated }) => {
  const [metalType, setMetalType] = useState('gold'); // 'gold', 'silver', or 'mixed'
  const [formData, setFormData] = useState({
    goldWeight: '',
    goldPurity: '22',
    silverWeight: '',
    silverPurity: '999',
    stoneValue: '',
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

  const metalTypes = [
    { value: 'gold', label: '🟡 Gold Only', icon: '💛' },
    { value: 'silver', label: '⚪ Silver Only', icon: '🤍' },
    { value: 'mixed', label: '🔶 Mixed Metals', icon: '💎' }
  ];

  const goldPurities = [
    { value: '24', label: '24K (99.99% Pure)', key: '24k' },
    { value: '22', label: '22K (91.67% Pure)', key: '22k' },
    { value: '20', label: '20K (83.33% Pure)', key: '20k' },
    { value: '18', label: '18K (75.00% Pure)', key: '18k' }
  ];

  const silverPurities = [
    { value: '999', label: '999 (99.9% Pure)', key: '999' }
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
    // Validation based on metal type
    if (metalType === 'gold' && (!formData.goldWeight || parseFloat(formData.goldWeight) <= 0)) {
      setError('Please enter a valid gold weight');
      return;
    }
    
    if (metalType === 'silver' && (!formData.silverWeight || parseFloat(formData.silverWeight) <= 0)) {
      setError('Please enter a valid silver weight');
      return;
    }
    
    if (metalType === 'mixed') {
      const hasGold = formData.goldWeight && parseFloat(formData.goldWeight) > 0;
      const hasSilver = formData.silverWeight && parseFloat(formData.silverWeight) > 0;
      
      if (!hasGold && !hasSilver) {
        setError('Please enter at least one metal weight for mixed metal jewelry');
        return;
      }
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
          goldWeight: parseFloat(formData.goldWeight) || 0,
          goldPurity: parseFloat(formData.goldPurity),
          silverWeight: parseFloat(formData.silverWeight) || 0,
          silverPurity: parseFloat(formData.silverPurity),
          stoneValue: parseFloat(formData.stoneValue) || 0,
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
    const hasValidInput = () => {
      if (metalType === 'gold') {
        return formData.goldWeight && parseFloat(formData.goldWeight) > 0;
      }
      if (metalType === 'silver') {
        return formData.silverWeight && parseFloat(formData.silverWeight) > 0;
      }
      if (metalType === 'mixed') {
        return (formData.goldWeight && parseFloat(formData.goldWeight) > 0) || 
               (formData.silverWeight && parseFloat(formData.silverWeight) > 0);
      }
      return false;
    };

    if (hasValidInput()) {
      const debounceTimer = setTimeout(() => {
        calculatePrice();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [formData, metalType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Jewelry Price Calculator (₹ INR)</h2>
      
      {/* Current Metal Prices Display */}
      {currentPrices && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-gray-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Market Prices (Per Gram)</h3>
          
          {/* Gold Prices */}
          {currentPrices.gold && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2 font-medium">Gold:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentPrices.gold['24k'] && (
                  <div className="bg-white p-2 rounded border border-yellow-300">
                    <div className="text-xs text-gray-600">24K</div>
                    <div className="text-sm font-bold text-yellow-700">
                      {formatPrice(currentPrices.gold['24k'])}
                    </div>
                  </div>
                )}
                {currentPrices.gold['22k'] && (
                  <div className="bg-white p-2 rounded border border-amber-300">
                    <div className="text-xs text-gray-600">22K</div>
                    <div className="text-sm font-bold text-amber-700">
                      {formatPrice(currentPrices.gold['22k'])}
                    </div>
                  </div>
                )}
                {currentPrices.gold['20k'] && (
                  <div className="bg-white p-2 rounded border border-orange-200">
                    <div className="text-xs text-gray-600">20K</div>
                    <div className="text-sm font-bold text-orange-700">
                      {formatPrice(currentPrices.gold['20k'])}
                    </div>
                  </div>
                )}
                {currentPrices.gold['18k'] && (
                  <div className="bg-white p-2 rounded border border-orange-300">
                    <div className="text-xs text-gray-600">18K</div>
                    <div className="text-sm font-bold text-orange-700">
                      {formatPrice(currentPrices.gold['18k'])}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Silver Price */}
          {currentPrices.silver?.['999'] && (
            <div>
              <p className="text-xs text-gray-600 mb-2 font-medium">Silver:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white p-2 rounded border border-gray-300">
                  <div className="text-xs text-gray-600">999</div>
                  <div className="text-sm font-bold text-gray-700">
                    {formatPrice(currentPrices.silver['999'])}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Metal Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Metal Type *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {metalTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setMetalType(type.value);
                setCalculation(null);
                // Clear weights when switching types
                if (type.value === 'gold') {
                  setFormData(prev => ({ ...prev, silverWeight: '' }));
                } else if (type.value === 'silver') {
                  setFormData(prev => ({ ...prev, goldWeight: '' }));
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                metalType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-xs font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); calculatePrice(); }} className="space-y-6">
        {/* Gold Fields - Show for 'gold' and 'mixed' types */}
        {(metalType === 'gold' || metalType === 'mixed') && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Gold Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gold Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (grams) *
                </label>
                <input
                  type="number"
                  name="goldWeight"
                  value={formData.goldWeight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g., 10.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required={metalType !== 'silver'}
                />
              </div>

              {/* Gold Purity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purity (Karat) *
                </label>
                <select
                  name="goldPurity"
                  value={formData.goldPurity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                  required={metalType !== 'silver'}
                >
                  {goldPurities.map((purity) => (
                    <option key={purity.key} value={purity.value}>
                      {purity.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Silver Fields - Show for 'silver' and 'mixed' types */}
        {(metalType === 'silver' || metalType === 'mixed') && (
          <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Silver Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Silver Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (grams) *
                </label>
                <input
                  type="number"
                  name="silverWeight"
                  value={formData.silverWeight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="e.g., 15.0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required={metalType !== 'gold'}
                />
              </div>

              {/* Silver Purity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purity *
                </label>
                <select
                  name="silverPurity"
                  value={formData.silverPurity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
                  required={metalType !== 'gold'}
                >
                  {silverPurities.map((purity) => (
                    <option key={purity.key} value={purity.value}>
                      {purity.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stone Value - Always visible */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stone/Gem Value (₹)
          </label>
          <input
            type="number"
            name="stoneValue"
            value={formData.stoneValue}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="e.g., 5000 (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty if no stones/gems</p>
        </div>

        {/* Making Charges & GST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Making Charge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Making Charge (%) *
            </label>
            <input
              type="number"
              name="makingChargePercent"
              value={formData.makingChargePercent}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              placeholder="e.g., 15"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* GST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST (%) *
            </label>
            <input
              type="number"
              name="gstPercent"
              value={formData.gstPercent}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              placeholder="e.g., 3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Calculate Price</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-sm flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </motion.div>
      )}

      {/* Calculation Results */}
      {calculation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Price Breakdown
          </h3>
          
          {/* Metal Values Section */}
          <div className="space-y-3 mb-4">
            {/* Gold Value - Show if gold was used */}
            {calculation.breakdown.goldValue && calculation.breakdown.goldValue > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Gold Value</span>
                  <span className="font-bold text-yellow-700">{formatPrice(calculation.breakdown.goldValue)}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {formData.goldWeight}g × {formData.goldPurity}K @ {formatPrice(calculation.breakdown.goldPricePerGram || 0)}/g
                </div>
              </div>
            )}

            {/* Silver Value - Show if silver was used */}
            {calculation.breakdown.silverValue && calculation.breakdown.silverValue > 0 && (
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Silver Value</span>
                  <span className="font-bold text-gray-700">{formatPrice(calculation.breakdown.silverValue)}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {formData.silverWeight}g × {formData.silverPurity} @ {formatPrice(calculation.breakdown.silverPricePerGram || 0)}/g
                </div>
              </div>
            )}

            {/* Stone Value - Show if stone value was entered */}
            {calculation.breakdown.stoneValue && calculation.breakdown.stoneValue > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Stone/Gem Value</span>
                  <span className="font-bold text-blue-700">{formatPrice(calculation.breakdown.stoneValue)}</span>
                </div>
              </div>
            )}

            {/* Base Metal Value */}
            <div className="flex justify-between py-2 border-t border-gray-300">
              <span className="text-gray-700 font-medium">Total Metal + Stone Value:</span>
              <span className="font-semibold">{formatPrice(calculation.breakdown.baseMetalValue || calculation.breakdown.pureGoldValue || 0)}</span>
            </div>
          </div>

          {/* Charges Section */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Making Charges ({formData.makingChargePercent}%):</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.makingCharges)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.subtotal)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">GST ({formData.gstPercent}%):</span>
              <span className="font-medium">{formatPrice(calculation.breakdown.gstAmount)}</span>
            </div>
          </div>
            
          {/* Final Price */}
          <div className="flex justify-between py-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 px-6 rounded-lg shadow-md">
            <span>Final Price:</span>
            <span>{formatPrice(calculation.breakdown.finalPrice)}</span>
          </div>

          {/* Timestamp */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Calculated at: {new Date(calculation.calculatedAt).toLocaleString('en-IN')}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JewelryPriceCalculator;