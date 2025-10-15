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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Live Gold & Silver Prices (Per Gram)</h2>
          <p className="text-gray-600 text-sm">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'} • All prices in Indian Rupees (₹/gram)
            {goldData?.fallback && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Fallback Data
              </span>
            )}
            {goldData?.source && (
              <span className="ml-2 text-xs text-gray-500">
                Source: {goldData.source}
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

      {/* Gold Purity Cards */}
      {goldData && goldData.detailed && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Gold Prices (Per Gram)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 24K Gold */}
              {goldData.detailed.gold['24k'] && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border-2 border-yellow-300 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">24K Gold</h3>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">99.99% Pure</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(goldData.detailed.gold['24k'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">per gram</p>
                </motion.div>
              )}

              {/* 22K Gold */}
              {goldData.detailed.gold['22k'] && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg border-2 border-amber-300 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">22K Gold</h3>
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">91.67% Pure</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(goldData.detailed.gold['22k'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">per gram</p>
                </motion.div>
              )}

              {/* 18K Gold */}
              {goldData.detailed.gold['18k'] && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-2 border-orange-300 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">18K Gold</h3>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">75.00% Pure</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(goldData.detailed.gold['18k'])}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">per gram</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Silver Price Card */}
          {goldData.detailed.silver?.perGram && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Silver Price (Per Gram)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-2 border-gray-300 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Silver 999</h3>
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">99.99% Pure</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(goldData.detailed.silver.perGram)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">per gram</p>
                </motion.div>
              </div>
            </div>
          )}
        </>
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