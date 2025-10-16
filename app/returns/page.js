"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

const ReturnReasons = {
    defective_product: { 
        label: 'Defective Product', 
        icon: '🔧',
        description: 'Product has manufacturing defects or is not working properly'
    },
    wrong_item_delivered: { 
        label: 'Wrong Item Delivered', 
        icon: '📦',
        description: 'Received a different product than what was ordered'
    },
    product_damaged: { 
        label: 'Product Damaged During Transit', 
        icon: '📪',
        description: 'Product was damaged during shipping'
    },
    poor_quality: { 
        label: 'Poor Quality', 
        icon: '⭐',
        description: 'Product quality does not meet expectations'
    },
    not_as_described: { 
        label: 'Not as Described', 
        icon: '📝',
        description: 'Product differs from website description or images'
    },
    size_fitting_issue: { 
        label: 'Size/Fitting Issue', 
        icon: '📏',
        description: 'Product size does not fit as expected'
    },
    ordered_by_mistake: { 
        label: 'Ordered by Mistake', 
        icon: '🤔',
        description: 'Placed order accidentally or changed mind'
    },
    better_price_available: { 
        label: 'Better Price Available', 
        icon: '💰',
        description: 'Found the same product at a lower price elsewhere'
    },
    no_longer_needed: { 
        label: 'No Longer Needed', 
        icon: '❌',
        description: 'Changed mind or no longer need the product'
    },
    delivery_delayed: { 
        label: 'Delivery Delayed', 
        icon: '⏰',
        description: 'Product was delivered much later than expected'
    },
    other: { 
        label: 'Other', 
        icon: '💬',
        description: 'Please specify your reason in the details'
    }
};

const ItemConditions = {
    unused: { label: 'Unused - Original packaging', icon: '📦' },
    lightly_used: { label: 'Lightly used - Good condition', icon: '✨' },
    damaged: { label: 'Damaged during transit', icon: '💔' },
    defective: { label: 'Defective - Not working', icon: '🔧' }
};

export default function ReturnPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnItems, setReturnItems] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pickupAddress, setPickupAddress] = useState(null);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch user orders on component mount
    useEffect(() => {
        if (user) {
            fetchEligibleOrders();
        }
    }, [user]);

    const fetchEligibleOrders = async () => {
        try {
            setLoading(true);
            // Fetch all orders except cancelled ones - let backend filter eligible ones
            const response = await fetch('/api/orders?returnEligible=true&limit=50');
            if (response.ok) {
                const data = await response.json();
                // Filter out orders that already have active returns
                const eligibleOrders = data.orders || [];
                setOrders(eligibleOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    const checkOrderEligibility = async (orderId) => {
        try {
            const response = await fetch('/api/returns/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            
            const data = await response.json();
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to check eligibility');
            }
        } catch (error) {
            console.error('Error checking eligibility:', error);
            setError(error.message);
            return null;
        }
    };

    const handleOrderSelect = async (order) => {
        setLoading(true);
        setError('');
        
        const eligibilityData = await checkOrderEligibility(order._id);
        
        if (eligibilityData) {
            if (eligibilityData.isEligible) {
                setSelectedOrder({ ...order, eligibilityData });
                setPickupAddress(order.shippingAddress);
                setReturnItems(order.items.map(item => ({
                    ...item,
                    selected: false,
                    returnQuantity: 1,
                    returnReason: '',
                    detailedReason: '',
                    itemCondition: 'unused'
                })));
                setCurrentStep(2);
            } else {
                setError(eligibilityData.reasons.join('. '));
            }
        }
        
        setLoading(false);
    };

    const handleItemToggle = (itemIndex) => {
        setReturnItems(prev => prev.map((item, index) => 
            index === itemIndex ? { ...item, selected: !item.selected } : item
        ));
    };

    const handleItemUpdate = (itemIndex, field, value) => {
        setReturnItems(prev => prev.map((item, index) => 
            index === itemIndex ? { ...item, [field]: value } : item
        ));
    };

    const selectedReturnItems = useMemo(() => 
        returnItems.filter(item => item.selected)
    , [returnItems]);

    const totalRefundAmount = useMemo(() => 
        selectedReturnItems.reduce((sum, item) => sum + (item.price * item.returnQuantity), 0)
    , [selectedReturnItems]);

    const canProceed = useMemo(() => {
        return selectedReturnItems.length > 0 && 
               selectedReturnItems.every(item => 
                   item.returnReason && 
                   item.returnQuantity > 0 && 
                   item.returnQuantity <= item.quantity
               );
    }, [selectedReturnItems]);

    const handleSubmitReturn = async () => {
        if (!canProceed) {
            setError('Please complete all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const returnData = {
                orderId: selectedOrder._id,
                items: selectedReturnItems.map(item => ({
                    productId: item.product || item.productId,
                    quantity: item.returnQuantity,
                    returnReason: item.returnReason,
                    detailedReason: item.detailedReason,
                    itemCondition: item.itemCondition
                })),
                pickupAddress,
                specialInstructions
            };

            const response = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(returnData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Return request submitted successfully!');
                setCurrentStep(4);
            } else {
                throw new Error(data.error || 'Failed to submit return request');
            }
        } catch (error) {
            console.error('Error submitting return:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedOrder(null);
        setReturnItems([]);
        setCurrentStep(1);
        setPickupAddress(null);
        setSpecialInstructions('');
        setError('');
        setSuccess('');
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl p-8"
                    >
                        <div className="text-6xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
                        <p className="text-gray-600 mb-6">Please log in to initiate a return request</p>
                        <Link 
                            href="/login"
                            className="inline-block bg-[#D4AF76] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#C19B61] transition-colors"
                        >
                            Login to Continue
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Return Request</h1>
                    <p className="text-gray-600">We make returns easy and hassle-free</p>
                </motion.div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[
                            { step: 1, label: 'Select Order', icon: '📋' },
                            { step: 2, label: 'Select Items', icon: '📦' },
                            { step: 3, label: 'Return Details', icon: '📝' },
                            { step: 4, label: 'Confirmation', icon: '✅' }
                        ].map(({ step, label, icon }) => (
                            <div key={step} className="flex items-center">
                                <motion.div
                                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                                        currentStep >= step
                                            ? 'bg-[#D4AF76] border-[#D4AF76] text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <span className="text-lg">{currentStep > step ? '✓' : icon}</span>
                                </motion.div>
                                <span className={`ml-2 font-medium ${
                                    currentStep >= step ? 'text-[#D4AF76]' : 'text-gray-400'
                                }`}>
                                    {label}
                                </span>
                                {step < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                        >
                            <div className="flex items-center">
                                <span className="text-red-500 text-xl mr-3">⚠️</span>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Display */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                        >
                            <div className="flex items-center">
                                <span className="text-green-500 text-xl mr-3">✅</span>
                                <p className="text-green-700">{success}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step 1: Select Order */}
                {currentStep === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-2xl shadow-xl p-6"
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Order to Return</h2>
                            <p className="text-gray-600">You can return orders that are pending, processing, shipped, or delivered (within 10 days of order placement).</p>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF76]"></div>
                                <p className="mt-2 text-gray-600">Loading your orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Eligible Orders</h3>
                                <p className="text-gray-600">You don&apos;t have any orders eligible for return. Orders must be placed within the last 10 days and not cancelled.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {orders.map((order) => (
                                    <motion.div
                                        key={order._id}
                                        whileHover={{ scale: 1.02 }}
                                        className="border border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#D4AF76] hover:shadow-lg transition-all"
                                        onClick={() => handleOrderSelect(order)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                                                <div className={`text-sm px-2 py-1 rounded-full text-center ${
                                                    order.status === 'delivered' ? 'text-green-600 bg-green-100' :
                                                    order.status === 'shipped' ? 'text-blue-600 bg-blue-100' :
                                                    order.status === 'processing' ? 'text-yellow-600 bg-yellow-100' :
                                                    order.status === 'pending' ? 'text-orange-600 bg-orange-100' :
                                                    'text-gray-600 bg-gray-100'
                                                }`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0">
                                                        {item.image && (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Qty: {item.quantity} × ₹{item.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-sm text-gray-500 pl-15">
                                                    +{order.items.length - 2} more items
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Step 2: Select Items */}
                {currentStep === 2 && selectedOrder && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Select Items to Return</h2>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="text-[#D4AF76] hover:text-[#C19B61] font-medium"
                            >
                                ← Back to Orders
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Order #{selectedOrder._id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Order Date:</span>
                                    <span className="ml-2 font-medium">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Return Window:</span>
                                    <span className="ml-2 font-medium text-green-600">
                                        {selectedOrder.eligibilityData?.returnPolicy.daysRemaining} days remaining
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            {returnItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    className={`border rounded-xl p-4 transition-all ${
                                        item.selected 
                                            ? 'border-[#D4AF76] bg-[#D4AF76]/5' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => handleItemToggle(index)}
                                            className="mt-2 h-5 w-5 text-[#D4AF76] focus:ring-[#D4AF76] border-gray-300 rounded"
                                        />
                                        
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                                            {item.image && (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                            <p className="text-gray-600 mb-2">₹{item.price} each</p>
                                            
                                            {item.selected && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-4 mt-4"
                                                >
                                                    {/* Quantity Selection */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Return Quantity (Max: {item.quantity})
                                                        </label>
                                                        <select
                                                            value={item.returnQuantity}
                                                            onChange={(e) => handleItemUpdate(index, 'returnQuantity', parseInt(e.target.value))}
                                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76]"
                                                        >
                                                            {Array.from({ length: item.quantity }, (_, i) => i + 1).map(qty => (
                                                                <option key={qty} value={qty}>{qty}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Return Reason */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Reason for Return *
                                                        </label>
                                                        <select
                                                            value={item.returnReason}
                                                            onChange={(e) => handleItemUpdate(index, 'returnReason', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76]"
                                                            required
                                                        >
                                                            <option value="">Select a reason</option>
                                                            {Object.entries(ReturnReasons).map(([key, reason]) => (
                                                                <option key={key} value={key}>
                                                                    {reason.icon} {reason.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {item.returnReason && (
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {ReturnReasons[item.returnReason]?.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Item Condition */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Item Condition
                                                        </label>
                                                        <select
                                                            value={item.itemCondition}
                                                            onChange={(e) => handleItemUpdate(index, 'itemCondition', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76]"
                                                        >
                                                            {Object.entries(ItemConditions).map(([key, condition]) => (
                                                                <option key={key} value={key}>
                                                                    {condition.icon} {condition.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Detailed Reason */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Additional Details (Optional)
                                                        </label>
                                                        <textarea
                                                            value={item.detailedReason}
                                                            onChange={(e) => handleItemUpdate(index, 'detailedReason', e.target.value)}
                                                            placeholder="Please provide any additional details about the issue..."
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] resize-none"
                                                            rows="3"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">
                                                ₹{item.price * item.quantity}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Qty: {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {selectedReturnItems.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#D4AF76]/10 rounded-xl p-4 mb-6"
                            >
                                <h3 className="font-semibold text-gray-900 mb-2">Return Summary</h3>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Items Selected:</span>
                                        <span className="font-medium">{selectedReturnItems.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Refund Amount:</span>
                                        <span className="font-bold text-[#D4AF76]">₹{totalRefundAmount}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={!canProceed}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                                    canProceed
                                        ? 'bg-[#D4AF76] text-white hover:bg-[#C19B61]'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Return Details */}
                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Return Details</h2>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="text-[#D4AF76] hover:text-[#C19B61] font-medium"
                            >
                                ← Back to Items
                            </button>
                        </div>

                        {/* Pickup Address */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <span className="ml-2 font-medium">{pickupAddress?.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="ml-2 font-medium">{pickupAddress?.phone}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-gray-600">Address:</span>
                                        <span className="ml-2 font-medium">
                                            {pickupAddress?.addressLine1}, {pickupAddress?.addressLine2 && `${pickupAddress.addressLine2}, `}
                                            {pickupAddress?.city}, {pickupAddress?.state} - {pickupAddress?.postalCode}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    📍 We&apos;ll pick up the items from this address (same as delivery address)
                                </p>
                            </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-900 mb-2">
                                Special Instructions for Pickup (Optional)
                            </label>
                            <textarea
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                placeholder="Any specific instructions for our pickup executive (e.g., best time to call, gate/door number, etc.)"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF76] focus:border-[#D4AF76] resize-none"
                                rows="4"
                            />
                        </div>

                        {/* Return Summary */}
                        <div className="bg-[#D4AF76]/10 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Summary</h3>
                            <div className="space-y-3">
                                {selectedReturnItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-600">
                                                Qty: {item.returnQuantity} × ₹{item.price} 
                                                | Reason: {ReturnReasons[item.returnReason]?.label}
                                            </div>
                                        </div>
                                        <div className="font-semibold">
                                            ₹{item.price * item.returnQuantity}
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                                    <div className="text-lg font-semibold">Total Refund Amount:</div>
                                    <div className="text-xl font-bold text-[#D4AF76]">₹{totalRefundAmount}</div>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">📋 Important Notes</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Items will be picked up within 2-3 business days after approval</li>
                                <li>• Please keep items in original condition and packaging</li>
                                <li>• Refund will be processed after quality inspection (5-7 business days)</li>
                                <li>• Refund will be credited to your original payment method</li>
                                <li>• You&apos;ll receive SMS/Email updates on return status</li>
                            </ul>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitReturn}
                                disabled={loading}
                                className="px-8 py-3 bg-[#D4AF76] text-white rounded-xl font-medium hover:bg-[#C19B61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Return Request'
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-6xl mb-6"
                        >
                            🎉
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Return Request Submitted!</h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Your return request has been successfully submitted. We&apos;ll review your request and send you an email confirmation shortly. 
                            You can track the status of your return in your orders section.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/orders"
                                className="inline-block bg-[#D4AF76] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#C19B61] transition-colors"
                            >
                                Track Your Returns
                            </Link>
                            <button
                                onClick={resetForm}
                                className="px-8 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Submit Another Return
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}