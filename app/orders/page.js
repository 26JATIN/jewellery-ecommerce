"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // active, past, returns
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnFormData, setReturnFormData] = useState({
        items: [],
        specialInstructions: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }

        setAuthChecked(true);

        if (!user) {
            router.push('/');
            return;
        }

        fetchOrders();
        fetchReturns();
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/user');
            const data = await res.json();
            if (res.ok) {
                setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchReturns = async () => {
        try {
            const res = await fetch('/api/returns');
            const data = await res.json();
            if (res.ok && data.success) {
                const returnData = data.data.returns || [];
                setReturns(returnData);
            }
        } catch (error) {
            console.error('Failed to fetch returns:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getOrdersByTab = () => {
        if (activeTab === 'active') {
            return orders.filter(order => 
                ['pending', 'processing', 'shipped'].includes(order.status)
            );
        } else if (activeTab === 'past') {
            return orders.filter(order => 
                ['delivered', 'cancelled', 'refunded'].includes(order.status)
            );
        }
        return [];
    };

    const getReturnForOrder = (orderId) => {
        if (!orderId) return null;
        
        // Convert orderId to string for comparison
        const orderIdStr = orderId.toString();
        
        // Find return where the order ID matches
        return returns.find(ret => {
            // Handle both populated and non-populated order field
            const retOrderId = typeof ret.order === 'string' 
                ? ret.order 
                : ret.order?._id?.toString();
            
            // Strict equality check
            return retOrderId === orderIdStr;
        }) || null;
    };

    const isReturnEligible = (order) => {
        if (!order || order.status !== 'delivered') return false;
        
        const existingReturn = getReturnForOrder(order._id);
        if (existingReturn && existingReturn.status !== 'cancelled') return false;
        
        const daysSinceDelivery = Math.floor(
            (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)
        );
        return daysSinceDelivery <= 7; // 7 days return policy
    };

    const handleInitiateReturn = async (order) => {
        setSelectedOrder(order);
        setReturnFormData({
            items: order.items.map(item => ({
                ...item,
                productId: item.product?._id || item.product,
                selected: false,
                returnQuantity: item.quantity,
                returnReason: '',
                detailedReason: '',
                itemCondition: 'unused'
            })),
            specialInstructions: ''
        });
        setShowReturnModal(true);
        setError('');
        setSuccess('');
    };

    const handleItemSelection = (index) => {
        setReturnFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, selected: !item.selected } : item
            )
        }));
    };

    const handleItemUpdate = (index, field, value) => {
        setReturnFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const validateReturnForm = () => {
        const selectedItems = returnFormData.items.filter(item => item.selected);
        
        if (selectedItems.length === 0) {
            setError('Please select at least one item to return');
            return false;
        }

        for (const item of selectedItems) {
            if (!item.returnReason) {
                setError('Please select a return reason for all selected items');
                return false;
            }
            if (item.returnQuantity < 1 || item.returnQuantity > item.quantity) {
                setError('Invalid return quantity');
                return false;
            }
        }

        return true;
    };

    const handleSubmitReturn = async () => {
        if (!validateReturnForm()) return;

        setSubmitting(true);
        setError('');

        try {
            const selectedItems = returnFormData.items.filter(item => item.selected);
            
            const response = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrder._id,
                    items: selectedItems.map(item => ({
                        productId: item.productId,
                        quantity: item.returnQuantity,
                        returnReason: item.returnReason,
                        detailedReason: item.detailedReason,
                        itemCondition: item.itemCondition
                    })),
                    pickupAddress: selectedOrder.shippingAddress,
                    specialInstructions: returnFormData.specialInstructions
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Return request submitted successfully!');
                setShowReturnModal(false);
                fetchReturns();
                fetchOrders();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                throw new Error(data.error || 'Failed to submit return request');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading while auth is being checked or orders are being fetched
    if (authLoading || loading || !authChecked) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-8 rounded-xl shadow-md">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const displayOrders = getOrdersByTab();

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track, manage, and return your orders</p>
                </div>

                {/* Success/Error Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl"
                        >
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">✅</span>
                                <span className="font-medium">{success}</span>
                            </div>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl"
                        >
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">⚠️</span>
                                <span className="font-medium">{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200">
                    <div className="flex space-x-8">
                        {[
                            { id: 'active', label: 'Active Orders', icon: '📦' },
                            { id: 'past', label: 'Past Orders', icon: '📋' },
                            { id: 'returns', label: 'Returns', icon: '↩️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-2 font-semibold transition-all relative ${
                                    activeTab === tab.id
                                        ? 'text-[#8B6B4C] border-b-2 border-[#8B6B4C]'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                {tab.id === 'returns' && returns.length > 0 && (
                                    <span className="ml-2 bg-[#8B6B4C] text-white text-xs rounded-full px-2 py-0.5">
                                        {returns.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {activeTab !== 'returns' ? (
                    displayOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-12 rounded-xl shadow-md text-center"
                        >
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No {activeTab} orders found
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {activeTab === 'active' 
                                    ? "You don't have any active orders" 
                                    : "Your order history is empty"}
                            </p>
                            <Link
                                href="/products"
                                className="inline-block bg-[#8B6B4C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6D5539] transition-colors"
                            >
                                Start Shopping
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {displayOrders.map((order) => {
                                const orderReturn = getReturnForOrder(order._id);
                                return (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        {/* Order Header */}
                                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-xl font-bold text-gray-900">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </h2>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                    {orderReturn && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            orderReturn.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            orderReturn.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                                                            orderReturn.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                                                            orderReturn.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            ↩️ RETURN {orderReturn.status.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Placed on {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ₹{order.totalAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4 mb-6">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                            sizes="80px"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Quantity: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Information */}
                                        {order.shipping && (
                                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                                <h4 className="font-bold mb-3 text-blue-900 flex items-center">
                                                    <span className="mr-2">🚚</span>
                                                    Shipping Information
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {order.shipping.awb_code && (
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Tracking Number</p>
                                                            <p className="font-mono font-semibold text-sm">{order.shipping.awb_code}</p>
                                                        </div>
                                                    )}
                                                    {order.shipping.courier_name && (
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Courier</p>
                                                            <p className="font-semibold text-sm">{order.shipping.courier_name}</p>
                                                        </div>
                                                    )}
                                                    {order.shipping.current_status && (
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Shipping Status</p>
                                                            <p className="font-semibold text-sm capitalize">
                                                                {order.shipping.current_status.replace(/_/g, ' ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {order.shipping.expected_delivery_date && (
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Expected Delivery</p>
                                                            <p className="font-semibold text-sm">
                                                                {formatDate(order.shipping.expected_delivery_date)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                {order.shipping.tracking_url && (
                                                    <a 
                                                        href={order.shipping.tracking_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                                    >
                                                        Track Your Order
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Shipping Address */}
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                                                <span className="mr-2">📍</span>
                                                Shipping Address
                                            </h4>
                                            <div className="text-sm text-gray-700 space-y-1">
                                                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                                <p>{order.shippingAddress.addressLine1}</p>
                                                {order.shippingAddress.addressLine2 && (
                                                    <p>{order.shippingAddress.addressLine2}</p>
                                                )}
                                                <p>
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                                </p>
                                                <p>{order.shippingAddress.country}</p>
                                                <p className="flex items-center mt-2">
                                                    <span className="mr-2">📞</span>
                                                    {order.shippingAddress.phone}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/orders/${order._id}`}
                                                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors text-center"
                                            >
                                                View Details
                                            </Link>
                                            {isReturnEligible(order) && !orderReturn && (
                                                <button
                                                    onClick={() => handleInitiateReturn(order)}
                                                    className="flex-1 bg-[#8B6B4C] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#6D5539] transition-colors"
                                                >
                                                    Request Return
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* Returns Tab */
                    returns.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-12 rounded-xl shadow-md text-center"
                        >
                            <div className="text-6xl mb-4">↩️</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No return requests found
                            </h3>
                            <p className="text-gray-500">
                                You haven&apos;t initiated any return requests yet
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {returns.map((returnItem) => (
                                <motion.div
                                    key={returnItem._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-6 rounded-xl shadow-md"
                                >
                                    {/* Return Header */}
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Return #{returnItem._id.slice(-8).toUpperCase()}
                                                </h2>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    returnItem.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    returnItem.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                                                    returnItem.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                                                    returnItem.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    returnItem.status === 'picked_up' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {returnItem.status.toUpperCase().replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Requested on {formatDate(returnItem.createdAt)}
                                            </p>
                                            {returnItem.order?._id && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Order: #{(returnItem.order._id || returnItem.order).toString().slice(-8).toUpperCase()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{returnItem.refundDetails?.refundAmount?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Return Items */}
                                    <div className="space-y-4 mb-6">
                                        {returnItem.items.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                                {item.image && (
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                            sizes="80px"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Quantity: {item.quantity} • ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                    <div className="text-xs text-gray-700">
                                                        <p className="mb-1">
                                                            <span className="font-semibold">Reason:</span> {item.returnReason?.replace(/_/g, ' ')}
                                                        </p>
                                                        {item.detailedReason && (
                                                            <p className="mb-1">
                                                                <span className="font-semibold">Details:</span> {item.detailedReason}
                                                            </p>
                                                        )}
                                                        <p>
                                                            <span className="font-semibold">Condition:</span> {item.itemCondition?.replace(/_/g, ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pickup Information */}
                                    {returnItem.pickup && (
                                        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                            <h4 className="font-bold text-yellow-900 mb-3 flex items-center">
                                                <span className="mr-2">📦</span>
                                                Pickup Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-600 mb-1">Status</p>
                                                    <p className="font-semibold capitalize">
                                                        {returnItem.pickup.pickupStatus?.replace(/_/g, ' ') || 'Pending'}
                                                    </p>
                                                </div>
                                                {returnItem.pickup.scheduledDate && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Scheduled Date</p>
                                                        <p className="font-semibold">
                                                            {formatDate(returnItem.pickup.scheduledDate)}
                                                        </p>
                                                    </div>
                                                )}
                                                {returnItem.pickup.awb_code && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-xs text-gray-600 mb-1">Tracking Number</p>
                                                        <p className="font-mono font-semibold">{returnItem.pickup.awb_code}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Response */}
                                    {returnItem.adminResponse && (
                                        <div className={`p-4 rounded-lg ${
                                            returnItem.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                                        }`}>
                                            <h4 className="font-bold mb-2 flex items-center">
                                                <span className="mr-2">
                                                    {returnItem.status === 'approved' ? '✅' : '❌'}
                                                </span>
                                                Admin Response
                                            </h4>
                                            <p className="text-sm">{returnItem.adminResponse}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {/* Return Request Modal */}
                <AnimatePresence>
                    {showReturnModal && selectedOrder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowReturnModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Return Request - Order #{selectedOrder._id.slice(-8).toUpperCase()}
                                    </h2>
                                    <button
                                        onClick={() => setShowReturnModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="p-6">
                                    {error && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                                            {error}
                                        </div>
                                    )}

                                    <h3 className="text-lg font-bold mb-4">Select Items to Return</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        {returnFormData.items.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`border-2 rounded-lg p-4 transition-all ${
                                                    item.selected ? 'border-[#8B6B4C] bg-amber-50' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.selected}
                                                        onChange={() => handleItemSelection(idx)}
                                                        className="mt-1 w-5 h-5 text-[#8B6B4C] rounded"
                                                    />
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                            sizes="80px"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            Price: ₹{item.price.toLocaleString()} × {item.quantity}
                                                        </p>

                                                        {item.selected && (
                                                            <div className="space-y-3 mt-4">
                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-1">
                                                                        Return Quantity
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={item.quantity}
                                                                        value={item.returnQuantity}
                                                                        onChange={(e) => handleItemUpdate(idx, 'returnQuantity', parseInt(e.target.value))}
                                                                        className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-1">
                                                                        Return Reason *
                                                                    </label>
                                                                    <select
                                                                        value={item.returnReason}
                                                                        onChange={(e) => handleItemUpdate(idx, 'returnReason', e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                                    >
                                                                        <option value="">Select a reason</option>
                                                                        <option value="defective_product">Defective Product</option>
                                                                        <option value="wrong_item_delivered">Wrong Item Delivered</option>
                                                                        <option value="product_damaged">Damaged During Transit</option>
                                                                        <option value="poor_quality">Poor Quality</option>
                                                                        <option value="not_as_described">Not as Described</option>
                                                                        <option value="size_fitting_issue">Size/Fitting Issue</option>
                                                                        <option value="ordered_by_mistake">Ordered by Mistake</option>
                                                                        <option value="no_longer_needed">No Longer Needed</option>
                                                                        <option value="other">Other</option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-1">
                                                                        Item Condition *
                                                                    </label>
                                                                    <select
                                                                        value={item.itemCondition}
                                                                        onChange={(e) => handleItemUpdate(idx, 'itemCondition', e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                                    >
                                                                        <option value="unused">Unused - Original packaging</option>
                                                                        <option value="lightly_used">Lightly used - Good condition</option>
                                                                        <option value="damaged">Damaged during transit</option>
                                                                        <option value="defective">Defective - Not working</option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-semibold mb-1">
                                                                        Additional Details
                                                                    </label>
                                                                    <textarea
                                                                        value={item.detailedReason}
                                                                        onChange={(e) => handleItemUpdate(idx, 'detailedReason', e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                                        rows="2"
                                                                        placeholder="Please provide more details about the issue..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold mb-2">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={returnFormData.specialInstructions}
                                            onChange={(e) => setReturnFormData(prev => ({ 
                                                ...prev, 
                                                specialInstructions: e.target.value 
                                            }))}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                            rows="3"
                                            placeholder="Any special instructions for pickup..."
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Estimated Refund:</span>
                                            <span className="text-2xl font-bold text-[#8B6B4C]">
                                                ₹{returnFormData.items
                                                    .filter(item => item.selected)
                                                    .reduce((sum, item) => sum + (item.price * item.returnQuantity), 0)
                                                    .toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            Refund will be processed to your original payment method within 5-7 business days after item inspection.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowReturnModal(false)}
                                            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitReturn}
                                            className="flex-1 bg-[#8B6B4C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6D5539] transition-colors disabled:bg-gray-400"
                                            disabled={submitting || returnFormData.items.filter(item => item.selected).length === 0}
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Return Request'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}