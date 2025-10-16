"use client";
import React, { useState } from 'react';
import withAdminAuth from '@/app/components/withAdminAuth';
import AdminLayout from '@/app/components/AdminLayout';
import GoldPriceDashboard from '@/app/components/GoldPriceDashboard';
import JewelryPriceCalculator from '@/app/components/JewelryPriceCalculator';

const MetalRatesManagement = () => {
  const [loading, setLoading] = useState({
    updatePrices: false,
    priceHistory: false,
    settings: false
  });
  const [showModal, setShowModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handlePriceCalculated = (calculationData) => {
    console.log('Price calculated:', calculationData);
    // You can add logic here to save the calculation or use it elsewhere
  };

  const handleUpdateAllPrices = async () => {
    setLoading(prev => ({ ...prev, updatePrices: true }));
    try {
      const response = await fetch('/api/admin/gold-prices/update-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setModalData({
          title: 'Price Update Complete',
          type: 'success',
          content: (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-green-800 font-semibold">Update Summary</h4>
                <p className="text-green-700">
                  Successfully updated {result.updated} products
                  {result.errors > 0 && ` (${result.errors} errors)`}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Current metal rates: Gold ₹{result.currentGoldPrice?.toFixed(2)}/g, Silver ₹{result.currentSilverPrice?.toFixed(2)}/g
                </p>
              </div>
              
              {result.details && result.details.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  <h5 className="font-medium text-gray-900 mb-2">Updated Products:</h5>
                  {result.details.filter(item => item.success).slice(0, 10).map((item, index) => (
                    <div key={index} className="text-sm bg-white border border-gray-200 p-3 rounded-lg mb-2 shadow-sm">
                      <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                      
                      {/* MRP Update */}
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">MRP:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">₹{item.oldMRP?.toFixed(2)}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-gray-900">₹{item.newMRP?.toFixed(2)}</span>
                          <span className={`ml-1 font-medium ${item.mrpChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({item.mrpChange >= 0 ? '+' : ''}₹{item.mrpChange?.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      
                      {/* Selling Price Update */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Selling:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">₹{item.oldSellingPrice?.toFixed(2)}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-blue-600">₹{item.newSellingPrice?.toFixed(2)}</span>
                          <span className={`ml-1 font-medium ${item.sellingPriceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({item.sellingPriceChange >= 0 ? '+' : ''}₹{item.sellingPriceChange?.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      
                      {/* Discount Info */}
                      {item.discountPercent > 0 && (
                        <div className="text-xs text-purple-600 mt-1">
                          Discount: {item.discountPercent}% off
                        </div>
                      )}
                    </div>
                  ))}
                  {result.details.filter(item => item.success).length > 10 && (
                    <p className="text-sm text-gray-500">...and {result.details.filter(item => item.success).length - 10} more</p>
                  )}
                </div>
              )}
            </div>
          )
        });
      } else {
        setModalData({
          title: 'Update Failed',
          type: 'error',
          content: (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{result.error}</p>
            </div>
          )
        });
      }
      setShowModal('result');
    } catch (error) {
      console.error('Error updating prices:', error);
      setModalData({
        title: 'Update Failed',
        type: 'error',
        content: (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to update prices: {error.message}</p>
          </div>
        )
      });
      setShowModal('result');
    } finally {
      setLoading(prev => ({ ...prev, updatePrices: false }));
    }
  };

  const handlePriceHistory = async () => {
    setLoading(prev => ({ ...prev, priceHistory: true }));
    try {
      const response = await fetch('/api/admin/gold-prices/history');
      const result = await response.json();
      
      if (result.success) {
        setModalData({
          title: 'Gold Price History (Last 30 Days)',
          type: 'info',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-xs text-blue-600">Current</div>
                  <div className="font-bold text-blue-900">₹{result.data.summary.current.toFixed(2)}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-xs text-green-600">Highest</div>
                  <div className="font-bold text-green-900">₹{result.data.summary.highest.toFixed(2)}</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-xs text-red-600">Lowest</div>
                  <div className="font-bold text-red-900">₹{result.data.summary.lowest.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600">Average</div>
                  <div className="font-bold text-gray-900">₹{result.data.summary.average.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                <h5 className="font-medium text-gray-900 mb-2">Recent Prices:</h5>
                {result.data.prices.slice(-10).reverse().map((price, index) => (
                  <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-gray-100">
                    <span>{price.date}</span>
                    <span className="font-medium">₹{price.price.toFixed(2)}/g</span>
                    <span className={`text-xs ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {price.change >= 0 ? '+' : ''}{price.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        });
        setShowModal('result');
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(prev => ({ ...prev, priceHistory: false }));
    }
  };

  const handlePricingSettings = async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    try {
      const response = await fetch('/api/admin/gold-prices/settings');
      const result = await response.json();
      
      if (result.success) {
        setModalData({
          title: 'Pricing Settings',
          type: 'settings',
          content: result.data
        });
        setShowModal('settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setModalData(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Metal Rates Management</h1>
          <p className="text-gray-600">
            Monitor live gold & silver prices and calculate jewelry pricing based on current market rates.
          </p>
        </div>

        {/* Live Metal Price Dashboard */}
        <section>
          <GoldPriceDashboard />
        </section>

        {/* Jewelry Price Calculator */}
        <section>
          <JewelryPriceCalculator onPriceCalculated={handlePriceCalculated} />
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleUpdateAllPrices}
              disabled={loading.updatePrices}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">
                {loading.updatePrices ? '⏳' : '📊'}
              </div>
              <div className="font-semibold text-gray-700">Update All Product Prices</div>
              <div className="text-sm text-gray-500 mt-1">
                {loading.updatePrices ? 'Updating prices...' : 'Recalculate all dynamic pricing products'}
              </div>
            </button>
            
            <button 
              onClick={handlePriceHistory}
              disabled={loading.priceHistory}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">
                {loading.priceHistory ? '⏳' : '📈'}
              </div>
              <div className="font-semibold text-gray-700">Price History</div>
              <div className="text-sm text-gray-500 mt-1">
                {loading.priceHistory ? 'Loading history...' : 'View historical gold price trends'}
              </div>
            </button>
            
            <button 
              onClick={handlePricingSettings}
              disabled={loading.settings}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">
                {loading.settings ? '⏳' : '⚙️'}
              </div>
              <div className="font-semibold text-gray-700">Pricing Settings</div>
              <div className="text-sm text-gray-500 mt-1">
                {loading.settings ? 'Loading settings...' : 'Configure default making charges and GST'}
              </div>
            </button>
          </div>
        </section>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{modalData?.title}</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {showModal === 'result' && modalData?.content}
                
                {showModal === 'settings' && modalData?.content && (
                  <PricingSettingsForm 
                    settings={modalData.content} 
                    onSave={async (newSettings) => {
                      try {
                        const response = await fetch('/api/admin/gold-prices/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newSettings)
                        });
                        const result = await response.json();
                        if (result.success) {
                          closeModal();
                          alert('Settings saved successfully!');
                        } else {
                          alert('Error saving settings: ' + result.error);
                        }
                      } catch (error) {
                        alert('Error saving settings: ' + error.message);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How Dynamic Pricing Works</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>Live Rates:</strong> Gold & Silver prices are fetched from Bullions.co.in in real-time</p>
            <p>• <strong>Auto Calculation:</strong> Product prices are calculated based on metal weight, purity, and making charges</p>
            <p>• <strong>Supported Metals:</strong> Gold (24K, 22K, 20K, 18K) and Silver (999 purity only)</p>
            <p>• <strong>INR Primary:</strong> All pricing optimized for Indian market with INR as primary currency</p>
            <p>• <strong>Caching:</strong> Prices are cached for 5 minutes to reduce API calls</p>
            <p>• <strong>Fallback:</strong> If scraper is unavailable, system uses fallback prices</p>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

// Pricing Settings Form Component
const PricingSettingsForm = ({ settings, onSave }) => {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gold Purity (K)
          </label>
          <input
            type="number"
            min="10"
            max="24"
            value={formData.goldPurity}
            onChange={(e) => handleChange('goldPurity', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Making Charge (%)
          </label>
          <input
            type="number"
            min="5"
            max="50"
            value={formData.makingChargePercent}
            onChange={(e) => handleChange('makingChargePercent', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST (%)
          </label>
          <input
            type="number"
            min="0"
            max="18"
            value={formData.gstPercent}
            onChange={(e) => handleChange('gstPercent', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Making Charge (₹)
          </label>
          <input
            type="number"
            min="0"
            value={formData.minimumMakingCharge}
            onChange={(e) => handleChange('minimumMakingCharge', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Buffer (%)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.priceBufferPercent}
            onChange={(e) => handleChange('priceBufferPercent', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auto Update Interval (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={formData.autoUpdateInterval}
            onChange={(e) => handleChange('autoUpdateInterval', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INR">INR - Indian Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Rounding
          </label>
          <select
            value={formData.priceRounding}
            onChange={(e) => handleChange('priceRounding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="none">No Rounding</option>
            <option value="nearest10">Nearest ₹10</option>
            <option value="nearest50">Nearest ₹50</option>
            <option value="nearest100">Nearest ₹100</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

export default withAdminAuth(MetalRatesManagement);