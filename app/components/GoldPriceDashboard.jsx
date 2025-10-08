"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GoldPriceDashboard = () => {
  const [goldData, setGoldData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [lastUpdated, setLastUpdated] = useState(null);

  // INR only - Indian jewelry business
  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const fetchGoldPrice = async (selectedCurrency = currency) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/gold-price?currency=${selectedCurrency}&cache=true`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch gold price');
      }
      
      setGoldData(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching gold price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldPrice();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchGoldPrice();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currency]);

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    fetchGoldPrice(newCurrency);
  };

  const formatPrice = (price, currencyCode = currency) => {
    const currencyInfo = currencies.find(c => c.code === currencyCode);
    const symbol = currencyInfo?.symbol || '₹';
    
    return `${symbol}${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getChangeIndicator = (price) => {
    // This would need historical data to show actual changes
    // For now, showing a placeholder
    const change = Math.random() * 4 - 2; // Random change for demo
    const isPositive = change > 0;
    
    return (
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  if (loading && !goldData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Gold Prices</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchGoldPrice()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Live Precious Metal Prices (₹ INR)</h2>
          <p className="text-gray-600 text-sm">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'} • All prices in Indian Rupees
            {goldData?.fallback && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Fallback Data
              </span>
            )}
          </p>
        </div>
        
        {/* INR Currency Display */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
            <span className="text-sm font-medium">₹ Indian Rupee (INR)</span>
          </div>
        </div>
      </div>

      {/* Price Cards */}
      {goldData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(goldData.rates).map(([metal, price]) => (
            <motion.div
              key={metal}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 capitalize">{metal}</h3>
                {getChangeIndicator(price)}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(price)} <span className="text-xs text-gray-500">/oz</span>
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(goldData.perGram[metal])} <span className="text-xs text-gray-500">/g</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => fetchGoldPrice()}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>Refresh Prices</span>
        </button>
      </div>
    </motion.div>
  );
};

export default GoldPriceDashboard;