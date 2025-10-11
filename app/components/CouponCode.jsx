"use client";
import React, { useState } from 'react';

const CouponCode = ({ cartItems, onCouponApplied, onCouponRemoved, appliedCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  // Fetch available coupons
  React.useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await fetch('/api/coupons/showcase');
      if (response.ok) {
        const data = await response.json();
        setAvailableCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          cartItems: cartItems,
          userId: null // Add user ID from auth context if available
        })
      });

      const result = await response.json();

      if (result.success) {
        onCouponApplied(result.data);
        setCouponCode('');
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('Failed to apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🎫 Coupon Code
      </h3>

      {appliedCoupon ? (
        // Applied coupon display
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">✓</span>
                  <span className="font-medium text-green-800">
                    {appliedCoupon.couponCode}
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {appliedCoupon.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-green-600">
                    Discount: {appliedCoupon.discountType === 'percentage' 
                      ? `${appliedCoupon.discountValue}%` 
                      : `₹${appliedCoupon.discountValue}`}
                  </span>
                  <span className="text-green-600 font-semibold">
                    You saved ₹{appliedCoupon.savings.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">₹{appliedCoupon.originalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount:</span>
              <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>₹{appliedCoupon.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        // Coupon input form
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent text-sm"
              disabled={loading}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
              className="px-4 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#725939] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Applying...</span>
                </div>
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Available Coupons */}
          {availableCoupons.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAllCoupons(!showAllCoupons)}
                className="flex items-center justify-between w-full text-sm font-medium text-[#8B6B4C] hover:text-[#725939] mb-3"
              >
                <span>✨ {availableCoupons.length} Available Coupons</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showAllCoupons ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAllCoupons && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableCoupons.map((coupon) => (
                    <div 
                      key={coupon._id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-[#8B6B4C] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-[#8B6B4C] text-sm">
                              {coupon.code}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}% OFF` 
                                : `₹${coupon.discountValue} OFF`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {coupon.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {coupon.minOrderValue > 0 && (
                              <span>• Min order: ₹{coupon.minOrderValue}</span>
                            )}
                            {coupon.maxDiscount && (
                              <span>• Max discount: ₹{coupon.maxDiscount}</span>
                            )}
                            {coupon.expiryDate && (
                              <span>• Valid till: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            setCouponCode(coupon.code);
                            // Wait for state to update and then apply
                            setTimeout(async () => {
                              setLoading(true);
                              setError('');
                              try {
                                const response = await fetch('/api/coupons/validate', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    couponCode: coupon.code,
                                    cartItems: cartItems,
                                    userId: null
                                  })
                                });
                                const result = await response.json();
                                if (result.success) {
                                  onCouponApplied(result.data);
                                  setCouponCode('');
                                  setError('');
                                  setShowAllCoupons(false);
                                } else {
                                  setError(result.error);
                                }
                              } catch (error) {
                                console.error('Error applying coupon:', error);
                                setError('Failed to apply coupon. Please try again.');
                              } finally {
                                setLoading(false);
                              }
                            }, 100);
                          }}
                          disabled={loading}
                          className="ml-2 px-3 py-1.5 bg-[#8B6B4C] text-white rounded text-xs font-medium hover:bg-[#725939] transition-colors disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponCode;