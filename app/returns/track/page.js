"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

const StatusConfig = {
    requested: { 
        label: 'Return Requested', 
        icon: '📝', 
        color: 'blue',
        description: 'Your return request has been submitted and is under review'
    },
    pending_approval: { 
        label: 'Pending Approval', 
        icon: '⏳', 
        color: 'yellow',
        description: 'Our team is reviewing your return request'
    },
    approved: { 
        label: 'Return Approved', 
        icon: '✅', 
        color: 'green',
        description: 'Your return has been approved. Pickup will be scheduled soon'
    },
    rejected: { 
        label: 'Return Rejected', 
        icon: '❌', 
        color: 'red',
        description: 'Your return request has been rejected'
    },
    pickup_scheduled: { 
        label: 'Pickup Scheduled', 
        icon: '📅', 
        color: 'blue',
        description: 'Pickup has been scheduled. Our executive will contact you'
    },
    picked_up: { 
        label: 'Item Picked Up', 
        icon: '📦', 
        color: 'blue',
        description: 'Items have been picked up and are on their way to our facility'
    },
    in_transit: { 
        label: 'In Transit', 
        icon: '🚛', 
        color: 'blue',
        description: 'Items are in transit to our processing center'
    },
    received: { 
        label: 'Items Received', 
        icon: '🏢', 
        color: 'blue',
        description: 'Items have been received at our facility and will be inspected'
    },
    inspected: { 
        label: 'Quality Inspected', 
        icon: '🔍', 
        color: 'blue',
        description: 'Items have been inspected by our quality team'
    },
    approved_refund: { 
        label: 'Refund Approved', 
        icon: '💰', 
        color: 'green',
        description: 'Refund has been approved after quality inspection'
    },
    rejected_refund: { 
        label: 'Refund Rejected', 
        icon: '❌', 
        color: 'red',
        description: 'Refund has been rejected after quality inspection'
    },
    refund_processed: { 
        label: 'Refund Processed', 
        icon: '✅', 
        color: 'green',
        description: 'Refund has been processed and will reflect in your account'
    },
    completed: { 
        label: 'Return Completed', 
        icon: '🎉', 
        color: 'green',
        description: 'Return process has been completed successfully'
    },
    cancelled: { 
        label: 'Return Cancelled', 
        icon: '❌', 
        color: 'red',
        description: 'Return request has been cancelled'
    }
};

const getStatusColor = (status) => {
    const config = StatusConfig[status];
    const colors = {
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        green: 'bg-green-100 text-green-800 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[config?.color] || colors.blue;
};

export default function ReturnsPage() {
    const { user } = useAuth();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetchReturns();
        }
    }, [user, filter]);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const url = filter === 'all' ? '/api/returns' : `/api/returns?status=${filter}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setReturns(data.data?.returns || []);
            } else {
                throw new Error('Failed to fetch returns');
            }
        } catch (error) {
            console.error('Error fetching returns:', error);
            setError('Failed to load your returns');
        } finally {
            setLoading(false);
        }
    };

    const fetchReturnDetails = async (returnId) => {
        try {
            const response = await fetch(`/api/returns/${returnId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedReturn(data.data);
            }
        } catch (error) {
            console.error('Error fetching return details:', error);
        }
    };

    const handleCancelReturn = async (returnId) => {
        if (!confirm('Are you sure you want to cancel this return request?')) {
            return;
        }

        try {
            const response = await fetch(`/api/returns/${returnId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'cancel',
                    message: 'Return cancelled by customer'
                })
            });

            if (response.ok) {
                fetchReturns(); // Refresh the list
                setSelectedReturn(null);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to cancel return');
            }
        } catch (error) {
            console.error('Error cancelling return:', error);
            alert('Failed to cancel return');
        }
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
                        <p className="text-gray-600 mb-6">Please log in to view your returns</p>
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
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Returns</h1>
                        <p className="text-gray-600">Track and manage your return requests</p>
                    </div>
                    <Link
                        href="/returns"
                        className="mt-4 md:mt-0 bg-[#D4AF76] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#C19B61] transition-colors"
                    >
                        + New Return Request
                    </Link>
                </motion.div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { key: 'all', label: 'All Returns' },
                        { key: 'requested', label: 'Requested' },
                        { key: 'approved', label: 'Approved' },
                        { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
                        { key: 'in_transit', label: 'In Transit' },
                        { key: 'completed', label: 'Completed' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === key
                                    ? 'bg-[#D4AF76] text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
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

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF76]"></div>
                        <p className="mt-2 text-gray-600">Loading your returns...</p>
                    </div>
                ) : returns.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl p-12 text-center"
                    >
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Returns Found</h2>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? "You haven't made any return requests yet."
                                : `No returns found with status: ${filter}`
                            }
                        </p>
                        <Link
                            href="/returns"
                            className="inline-block bg-[#D4AF76] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#C19B61] transition-colors"
                        >
                            Create Return Request
                        </Link>
                    </motion.div>
                ) : (
                    /* Returns List */
                    <div className="grid gap-6">
                        {returns.map((returnRequest) => (
                            <motion.div
                                key={returnRequest._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Return Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                Return #{returnRequest.returnNumber}
                                            </h3>
                                            <p className="text-gray-600">
                                                Requested on {new Date(returnRequest.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3 mt-3 md:mt-0">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(returnRequest.status)}`}>
                                                {StatusConfig[returnRequest.status]?.icon} {StatusConfig[returnRequest.status]?.label}
                                            </span>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-[#D4AF76]">
                                                    ₹{returnRequest.refundDetails.refundAmount}
                                                </div>
                                                <div className="text-xs text-gray-500">Refund</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Description */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            {StatusConfig[returnRequest.status]?.description}
                                        </p>
                                    </div>

                                    {/* Return Items */}
                                    <div className="space-y-3 mb-4">
                                        {returnRequest.items.slice(0, 2).map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                                                    {item.image && (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qty: {item.quantity} × ₹{item.price}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        ₹{item.price * item.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {returnRequest.items.length > 2 && (
                                            <p className="text-sm text-gray-500 text-center">
                                                +{returnRequest.items.length - 2} more items
                                            </p>
                                        )}
                                    </div>

                                    {/* Pickup Information */}
                                    {returnRequest.pickup?.awbCode && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                                                    <p className="text-lg font-mono text-blue-800">{returnRequest.pickup.awbCode}</p>
                                                </div>
                                                {returnRequest.pickup.trackingUrl && (
                                                    <a
                                                        href={returnRequest.pickup.trackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Track →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => fetchReturnDetails(returnRequest._id)}
                                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            View Details
                                        </button>
                                        
                                        {['requested', 'pending_approval', 'approved'].includes(returnRequest.status) && (
                                            <button
                                                onClick={() => handleCancelReturn(returnRequest._id)}
                                                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                                            >
                                                Cancel Return
                                            </button>
                                        )}

                                        {returnRequest.pickup?.trackingUrl && (
                                            <a
                                                href={returnRequest.pickup.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#D4AF76] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#C19B61] transition-colors text-center"
                                            >
                                                Track Package
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Return Details Modal */}
                <AnimatePresence>
                    {selectedReturn && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setSelectedReturn(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Return Details - #{selectedReturn.returnNumber}
                                        </h2>
                                        <button
                                            onClick={() => setSelectedReturn(null)}
                                            className="text-gray-400 hover:text-gray-600 text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[70vh]">
                                    {/* Status Timeline */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                                        <div className="space-y-3">
                                            {selectedReturn.statusHistory?.map((status, index) => (
                                                <div key={index} className="flex items-start space-x-3">
                                                    <div className={`w-3 h-3 rounded-full mt-2 ${
                                                        index === 0 ? 'bg-[#D4AF76]' : 'bg-gray-300'
                                                    }`} />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-900">
                                                                {StatusConfig[status.status]?.icon} {StatusConfig[status.status]?.label}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(status.timestamp).toLocaleDateString('en-IN')}
                                                            </span>
                                                        </div>
                                                        {status.note && (
                                                            <p className="text-sm text-gray-600 mt-1">{status.note}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )).reverse()}
                                        </div>
                                    </div>

                                    {/* Return Items */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Returned Items</h3>
                                        <div className="space-y-4">
                                            {selectedReturn.items.map((item, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start space-x-4">
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
                                                            <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Quantity:</span>
                                                                    <span className="ml-2 font-medium">{item.quantity}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Price:</span>
                                                                    <span className="ml-2 font-medium">₹{item.price}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Reason:</span>
                                                                    <span className="ml-2 font-medium">{item.returnReason?.replace(/_/g, ' ')}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Condition:</span>
                                                                    <span className="ml-2 font-medium">{item.itemCondition?.replace(/_/g, ' ')}</span>
                                                                </div>
                                                            </div>
                                                            {item.detailedReason && (
                                                                <div className="mt-2">
                                                                    <span className="text-gray-600 text-sm">Additional Details:</span>
                                                                    <p className="text-sm text-gray-800 bg-gray-50 rounded p-2 mt-1">
                                                                        {item.detailedReason}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">
                                                                ₹{item.price * item.quantity}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pickup Address */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium">{selectedReturn.pickup.address?.fullName}</span>
                                                </div>
                                                <div>{selectedReturn.pickup.address?.addressLine1}</div>
                                                {selectedReturn.pickup.address?.addressLine2 && (
                                                    <div>{selectedReturn.pickup.address?.addressLine2}</div>
                                                )}
                                                <div>
                                                    {selectedReturn.pickup.address?.city}, {selectedReturn.pickup.address?.state} - {selectedReturn.pickup.address?.postalCode}
                                                </div>
                                                <div>Phone: {selectedReturn.pickup.address?.phone}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Refund Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Details</h3>
                                        <div className="bg-[#D4AF76]/10 rounded-lg p-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Original Amount:</span>
                                                    <span className="font-medium">₹{selectedReturn.refundDetails.originalAmount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Return Shipping:</span>
                                                    <span className="font-medium">₹{selectedReturn.refundDetails.returnShippingCost}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Processing Fee:</span>
                                                    <span className="font-medium">₹{selectedReturn.refundDetails.restockingFee}</span>
                                                </div>
                                                <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold">
                                                    <span>Refund Amount:</span>
                                                    <span className="text-[#D4AF76]">₹{selectedReturn.refundDetails.refundAmount}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Refund Method: {selectedReturn.refundDetails.refundMethod?.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        </div>
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