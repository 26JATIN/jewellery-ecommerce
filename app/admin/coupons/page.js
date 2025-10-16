"use client";
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import withAdminAuth from '@/app/components/withAdminAuth';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderValue: '',
    maximumDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    userUsageLimit: '1',
    applicableCategories: [],
    excludedCategories: [],
    firstTimeUserOnly: false,
    isActive: true
  });

  const categories = [
    'Diamond', 'Gold', 'Silver', 
    'Wedding', 'Vintage', 'Contemporary', 'Traditional'
  ];

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/coupons?status=${statusFilter}`);
      const result = await response.json();
      
      if (result.success) {
        setCoupons(result.data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (category, type) => {
    setFormData(prev => {
      const field = type === 'applicable' ? 'applicableCategories' : 'excludedCategories';
      const currentList = prev[field];
      
      if (currentList.includes(category)) {
        return {
          ...prev,
          [field]: currentList.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentList, category]
        };
      }
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderValue: '',
      maximumDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      userUsageLimit: '1',
      applicableCategories: [],
      excludedCategories: [],
      firstTimeUserOnly: false,
      isActive: true
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon._id}`
        : '/api/admin/coupons';
      
      const method = editingCoupon ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchCoupons();
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrderValue: coupon.minimumOrderValue?.toString() || '',
      maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '',
      userUsageLimit: coupon.userUsageLimit.toString(),
      applicableCategories: coupon.applicableCategories || [],
      excludedCategories: coupon.excludedCategories || [],
      firstTimeUserOnly: coupon.firstTimeUserOnly,
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchCoupons();
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    if (!coupon.isActive) return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    if (coupon.validFrom > now) return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
    if (coupon.validUntil < now) return { status: 'Expired', color: 'bg-red-100 text-red-800' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { status: 'Used Up', color: 'bg-orange-100 text-orange-800' };
    }
    return { status: 'Active', color: 'bg-green-100 text-green-800' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
            <p className="text-gray-600">Create and manage discount coupons for your store</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#8B6B4C] text-white px-6 py-2 rounded-lg hover:bg-[#725939] transition-colors"
          >
            Create Coupon
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
            >
              <option value="all">All Coupons</option>
              <option value="active">Active</option>
              <option value="expired">Expired/Inactive</option>
            </select>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-[#8B6B4C] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                            <div className="text-sm text-gray-500">{coupon.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}%` 
                              : `₹${coupon.discountValue}`}
                          </div>
                          {coupon.minimumOrderValue > 0 && (
                            <div className="text-xs text-gray-500">
                              Min: ₹{coupon.minimumOrderValue}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{formatDate(coupon.validFrom)}</div>
                          <div>to {formatDate(coupon.validUntil)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {coupon.usedCount} / {coupon.usageLimit || '∞'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-[#8B6B4C] hover:text-[#725939] mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      required
                      placeholder="e.g., SAVE20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                      placeholder={formData.discountType === 'percentage' ? '20' : '1000'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      name="minimumOrderValue"
                      value={formData.minimumOrderValue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Discount Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="maximumDiscountAmount"
                        value={formData.maximumDiscountAmount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Usage Limit
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      min="1"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per User Usage Limit *
                    </label>
                    <input
                      type="number"
                      name="userUsageLimit"
                      value={formData.userUsageLimit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                    rows="3"
                    required
                    placeholder="Brief description of the coupon"
                  />
                </div>

                {/* Category Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Categories (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.applicableCategories.includes(category)}
                          onChange={() => handleCategoryChange(category, 'applicable')}
                          className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to apply to all categories
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="firstTimeUserOnly"
                      checked={formData.firstTimeUserOnly}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">First-time users only</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#8B6B4C] focus:ring-[#8B6B4C] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#8B6B4C] text-white rounded-lg hover:bg-[#725939] transition-colors"
                  >
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(CouponManagement);