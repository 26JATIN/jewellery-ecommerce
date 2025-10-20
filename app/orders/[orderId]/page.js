"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [returnData, setReturnData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrderDetails = async () => {
        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`/api/orders/${orderId}?t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch order');
            const data = await res.json();
            setOrder(data);

            // Fetch return data if exists
            const returnRes = await fetch(`/api/returns?orderId=${orderId}&t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            if (returnRes.ok) {
                const returnDataRes = await returnRes.json();
                if (returnDataRes.success && returnDataRes.data.returns.length > 0) {
                    setReturnData(returnDataRes.data.returns[0]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        // Auto-refresh every 30 seconds for real-time updates
        const interval = setInterval(() => {
            setRefreshing(true);
            fetchOrderDetails();
        }, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-8 rounded-xl shadow-md">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 rounded-xl shadow-md text-center"
                    >
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {error || 'Order not found'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            The order you're looking for doesn't exist or you don't have access to it
                        </p>
                        <Link
                            href="/orders"
                            className="inline-block bg-[#8B6B4C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6D5539] transition-colors"
                        >
                            Back to Orders
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    const isReturnEligible = order.status === 'delivered' && !returnData;
    const daysSinceOrder = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
    const withinReturnWindow = daysSinceOrder <= 7;

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Refresh Indicator */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href="/orders"
                        className="inline-flex items-center text-[#8B6B4C] hover:text-[#6D5539] font-semibold transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Orders
                    </Link>
                    {refreshing && (
                        <span className="text-sm text-gray-600 flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refreshing...
                        </span>
                    )}
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-md mb-6"
                >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                </h1>
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
                                {returnData && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        returnData.status === 'approved' || returnData.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        returnData.status === 'requested' || returnData.status === 'pickup_scheduled' ? 'bg-blue-100 text-blue-700' :
                                        returnData.status === 'refund_processed' ? 'bg-purple-100 text-purple-700' :
                                        returnData.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        ↩️ RETURN {returnData.status.toUpperCase().replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm">Placed on {formatDate(order.createdAt)}</p>
                            {order.payment?.paidAt && (
                                <p className="text-gray-600 text-sm">Paid on {formatDate(order.payment.paidAt)}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-gray-900">
                                ₹{order.totalAmount.toLocaleString()}
                            </p>
                            {order.coupon?.code && (
                                <p className="text-xs text-green-600 mt-1">
                                    Coupon Applied: {order.coupon.code} (-₹{order.coupon.discountAmount?.toLocaleString()})
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Return Information (if exists) */}
                        {returnData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-6 rounded-xl shadow-md"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">↩️</span>
                                    Return Request Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">Return #{returnData._id.slice(-8).toUpperCase()}</p>
                                                <p className="text-sm text-gray-600">Requested on {formatDate(returnData.createdAt)}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                returnData.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                returnData.status === 'refund_processed' ? 'bg-purple-100 text-purple-700' :
                                                returnData.status === 'picked_up' || returnData.status === 'in_transit' ? 'bg-yellow-100 text-yellow-700' :
                                                returnData.status === 'approved' || returnData.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                                                returnData.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {returnData.status.toUpperCase().replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Return Timeline */}
                                        <div className="mt-4 space-y-3">
                                            <h4 className="font-semibold text-gray-900 text-sm">Return Progress</h4>
                                            <div className="relative">
                                                {/* Timeline */}
                                                <div className="space-y-4">
                                                    {[
                                                        { status: 'requested', label: 'Return Requested', icon: '📝', completed: true },
                                                        { status: 'approved', label: 'Approved by Admin', icon: '✅', completed: ['approved', 'pickup_scheduled', 'picked_up', 'in_transit', 'received', 'inspected', 'approved_refund', 'refund_processed', 'completed'].includes(returnData.status) },
                                                        { status: 'pickup_scheduled', label: 'Pickup Scheduled', icon: '📦', completed: ['pickup_scheduled', 'picked_up', 'in_transit', 'received', 'inspected', 'approved_refund', 'refund_processed', 'completed'].includes(returnData.status) },
                                                        { status: 'picked_up', label: 'Item Picked Up', icon: '🚚', completed: ['picked_up', 'in_transit', 'received', 'inspected', 'approved_refund', 'refund_processed', 'completed'].includes(returnData.status) },
                                                        { status: 'received', label: 'Received at Warehouse', icon: '🏭', completed: ['received', 'inspected', 'approved_refund', 'refund_processed', 'completed'].includes(returnData.status) },
                                                        { status: 'refund_processed', label: 'Refund Processed', icon: '💰', completed: ['refund_processed', 'completed'].includes(returnData.status) },
                                                        { status: 'completed', label: 'Return Completed', icon: '🎉', completed: returnData.status === 'completed' }
                                                    ].map((step, idx) => (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                                step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                                            }`}>
                                                                {step.completed ? '✓' : step.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                    {step.label}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Refund Information */}
                                        {returnData.refundDetails && (
                                            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-2">Refund Information</h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Refund Amount</p>
                                                        <p className="font-bold text-gray-900">₹{returnData.refundDetails.refundAmount?.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Refund Status</p>
                                                        <p className="font-semibold capitalize">{returnData.refundDetails.refundStatus}</p>
                                                    </div>
                                                    {returnData.refundDetails.refundProcessedAt && (
                                                        <div className="col-span-2">
                                                            <p className="text-gray-600">Processed On</p>
                                                            <p className="font-semibold">{formatDate(returnData.refundDetails.refundProcessedAt)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pickup Information */}
                                        {returnData.pickup && returnData.pickup.awbCode && (
                                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-2">Pickup Tracking</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Tracking Number</p>
                                                        <p className="font-mono font-semibold">{returnData.pickup.awbCode}</p>
                                                    </div>
                                                    {returnData.pickup.courier && (
                                                        <div>
                                                            <p className="text-gray-600">Courier</p>
                                                            <p className="font-semibold">{returnData.pickup.courier}</p>
                                                        </div>
                                                    )}
                                                    {returnData.pickup.trackingUrl && (
                                                        <a
                                                            href={returnData.pickup.trackingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                                                        >
                                                            Track Return Shipment
                                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-xl shadow-md"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">📦</span>
                                Order Items
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                                                Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="space-y-2">
                                    {order.coupon?.originalTotal && (
                                        <>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Subtotal</span>
                                                <span>₹{order.coupon.originalTotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount ({order.coupon.code})</span>
                                                <span>-₹{order.coupon.discountAmount.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                                        <span>Total</span>
                                        <span>₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shipping */}
                        {order.shipping && (order.shipping.awb_code || order.shipping.awbCode) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-xl shadow-md"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">🚚</span>
                                    Shipping & Tracking
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Tracking Number</p>
                                            <p className="font-mono font-semibold text-sm">{order.shipping.awb_code || order.shipping.awbCode}</p>
                                        </div>
                                        {(order.shipping.courier_name || order.shipping.courier) && (
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Courier</p>
                                                <p className="font-semibold text-sm">{order.shipping.courier_name || order.shipping.courier}</p>
                                            </div>
                                        )}
                                        {order.shipping.current_status && (
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Current Status</p>
                                                <p className="font-semibold text-sm capitalize">{order.shipping.current_status.replace(/_/g, ' ')}</p>
                                            </div>
                                        )}
                                        {order.shipping.expected_delivery_date && (
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Expected Delivery</p>
                                                <p className="font-semibold text-sm">{formatDate(order.shipping.expected_delivery_date)}</p>
                                            </div>
                                        )}
                                    </div>
                                    {order.shipping.tracking_url && (
                                        <a
                                            href={order.shipping.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Track Live Shipment
                                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Payment Information */}
                        {order.payment && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-6 rounded-xl shadow-md"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">💳</span>
                                    Payment Information
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method</span>
                                        <span className="font-semibold capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Status</span>
                                        <span className={`font-semibold ${
                                            order.payment.status === 'completed' ? 'text-green-600' :
                                            order.payment.status === 'failed' ? 'text-red-600' :
                                            'text-yellow-600'
                                        }`}>
                                            {order.payment.status.toUpperCase()}
                                        </span>
                                    </div>
                                    {order.payment.id && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Transaction ID</span>
                                            <span className="font-mono font-semibold text-xs">{order.payment.id}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Address */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-xl shadow-md"
                        >
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">📍</span>
                                Shipping Address
                            </h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                                <p className="pt-2 mt-2 border-t font-semibold flex items-center">
                                    <span className="mr-2">📞</span>
                                    {order.shippingAddress.phone}
                                </p>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-xl shadow-md"
                        >
                            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {isReturnEligible && withinReturnWindow && (
                                    <Link
                                        href="/orders"
                                        className="block bg-[#8B6B4C] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#6D5539] transition-colors text-center"
                                    >
                                        Request Return
                                    </Link>
                                )}
                                <Link
                                    href="/orders"
                                    className="block bg-gray-100 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                                >
                                    View All Orders
                                </Link>
                                <button
                                    onClick={() => window.print()}
                                    className="w-full bg-white border-2 border-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Print Invoice
                                </button>
                            </div>
                        </motion.div>

                        {/* Help */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md border-2 border-blue-100"
                        >
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                                <span className="mr-2">❓</span>
                                Need Help?
                            </h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Have questions about your order? We're here to help!
                            </p>
                            <Link
                                href="/contact"
                                className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center text-sm"
                            >
                                Contact Support
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
