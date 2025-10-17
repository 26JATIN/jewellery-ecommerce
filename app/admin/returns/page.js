"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import withAdminAuth from '@/app/components/withAdminAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusConfig, getNextActions } from '@/app/lib/returnStatusUtils';



function AdminReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showManualRefundModal, setShowManualRefundModal] = useState(false);
    const [showManualReturnModal, setShowManualReturnModal] = useState(false);
    const [manualRefundData, setManualRefundData] = useState({
        orderId: '',
        customerId: '',
        amount: '',
        reason: '',
        method: 'original_payment'
    });
    const [manualReturnData, setManualReturnData] = useState({
        orderId: '',
        customerId: '',
        items: [],
        reason: '',
        autoApprove: true,
        pickupRequired: true,
        notes: ''
    });

    useEffect(() => {
        fetchReturns();
    }, [filter]);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const url = filter === 'all' ? '/api/admin/returns' : `/api/admin/returns?status=${filter}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setReturns(data.data?.returns || []);
            }
        } catch (error) {
            console.error('Error fetching returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (returnId, payload, note = '') => {
        try {
            setActionLoading(true);
            // If payload is an object, use it directly; otherwise treat it as status
            const requestBody = typeof payload === 'object' 
                ? payload 
                : { status: payload, note: note };
            
            const response = await fetch(`/api/admin/returns/${returnId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                fetchReturns();
                setSelectedReturn(null);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSchedulePickup = async (returnId) => {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/admin/returns/${returnId}/pickup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                fetchReturns();
                setSelectedReturn(null);
                alert('Pickup scheduled successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to schedule pickup');
            }
        } catch (error) {
            console.error('Error scheduling pickup:', error);
            alert('Failed to schedule pickup');
        } finally {
            setActionLoading(false);
        }
    };

    const handleManualReturn = async () => {
        // Basic validation
        if (!manualReturnData.orderId || !manualReturnData.customerId) {
            alert('Please fill in both Order ID and Customer ID/Email');
            return;
        }

        try {
            setActionLoading(true);
            const response = await fetch('/api/admin/returns/manual-return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manualReturnData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Manual return order created successfully!');
                setShowManualReturnModal(false);
                setManualReturnData({
                    orderId: '',
                    customerId: '',
                    items: [],
                    reason: '',
                    autoApprove: true,
                    pickupRequired: true,
                    notes: ''
                });
                fetchReturns();
            } else {
                alert(data.error || 'Failed to create return order');
            }
        } catch (error) {
            console.error('Error creating manual return:', error);
            alert('Failed to create return order');
        } finally {
            setActionLoading(false);
        }
    };

    const getNextActions = (status) => {
        const actions = [];
        
        switch (status) {
            case 'requested':
            case 'pending_approval':
                actions.push(
                    { label: 'Approve', action: 'approve', color: 'green' },
                    { label: 'Reject', action: 'reject', color: 'red' }
                );
                break;
            case 'approved':
                actions.push(
                    { label: 'Schedule Pickup', action: 'pickup', color: 'blue' }
                );
                break;
            case 'received':
                actions.push(
                    { label: 'Mark Inspected', status: 'inspected', color: 'blue' }
                );
                break;
            case 'inspected':
                actions.push(
                    { label: 'Approve Refund', status: 'approved_refund', color: 'green' },
                    { label: 'Reject Refund', status: 'rejected_refund', color: 'red' }
                );
                break;
            case 'approved_refund':
                actions.push(
                    { label: 'Process Refund', action: 'process_refund', color: 'green' }
                );
                break;
            case 'refund_processed':
                actions.push(
                    { label: 'Complete Return', action: 'complete', color: 'green' }
                );
                break;
        }
        
        return actions;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
                        <p className="text-gray-600 mt-1">Manage customer returns, approvals, and refunds</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowManualReturnModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            + Manual Return Order
                        </button>
                        <button
                            onClick={() => setShowManualRefundModal(true)}
                            className="bg-[#8B6B4C] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#725939] transition-colors"
                        >
                            + Manual Refund
                        </button>
                        <button
                            onClick={fetchReturns}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{returns.length}</div>
                        <div className="text-sm text-gray-600">Total Returns</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">
                            {returns.filter(r => ['requested', 'pending_approval', 'approved'].includes(r.status)).length}
                        </div>
                        <div className="text-sm text-gray-600">Pending Returns</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {returns.filter(r => r.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed Returns</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-red-600">
                            ₹{returns.reduce((sum, r) => sum + (r.refundDetails?.refundAmount || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Refunds</div>
                    </div>
                </div>
                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Filter Returns</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'All Returns' },
                                { key: 'requested', label: 'Requested' },
                                { key: 'pending_approval', label: 'Pending Approval' },
                                { key: 'approved', label: 'Approved' },
                                { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
                                { key: 'received', label: 'Received' },
                                { key: 'inspected', label: 'Inspected' },
                                { key: 'approved_refund', label: 'Refund Approved' },
                                { key: 'completed', label: 'Completed' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === key
                                            ? 'bg-[#8B6B4C] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Returns List */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Returns List</h2>
                    </div>
                    <div className="p-6">
                        {returns.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Returns Found</h3>
                                <p className="text-gray-600">
                                    {filter === 'all' 
                                        ? "No return requests have been made yet."
                                        : `No returns found with status: ${filter}`
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {returns.map((returnRequest) => (
                                    <div
                                        key={returnRequest._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Return #{returnRequest.returnNumber}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${StatusConfig[returnRequest.status]?.bgColor} ${StatusConfig[returnRequest.status]?.textColor} ${StatusConfig[returnRequest.status]?.borderColor} border`}>
                                                        {StatusConfig[returnRequest.status]?.icon} {StatusConfig[returnRequest.status]?.label}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Customer:</span> {returnRequest.user?.name || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Order:</span> #{returnRequest.order?._id?.toString().slice(-8).toUpperCase() || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Date:</span> {new Date(returnRequest.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Items:</span> {returnRequest.items?.length || 0} item(s)
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Refund Amount:</span> ₹{returnRequest.refundDetails?.refundAmount || 0}
                                                    </div>
                                                    {returnRequest.pickup?.awbCode && (
                                                        <div>
                                                            <span className="font-medium">AWB:</span> {returnRequest.pickup.awbCode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button
                                                    onClick={() => setSelectedReturn(returnRequest)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                
                                                {getNextActions(returnRequest.status).map((actionItem, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (actionItem.action === 'pickup') {
                                                                handleSchedulePickup(returnRequest._id);
                                                            } else {
                                                                const note = prompt(`Add a note for ${actionItem.label}:`);
                                                                if (note !== null) {
                                                                    // Send action if available, otherwise send status
                                                                    const payload = actionItem.action 
                                                                        ? { action: actionItem.action, note }
                                                                        : { status: actionItem.status, note };
                                                                    handleStatusUpdate(returnRequest._id, payload, note);
                                                                }
                                                            }
                                                        }}
                                                        disabled={actionLoading}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            actionItem.color === 'green' 
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : actionItem.color === 'red'
                                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        } disabled:opacity-50`}
                                                    >
                                                        {actionLoading ? 'Processing...' : actionItem.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Return Details Modal */}
            <AnimatePresence>
                {selectedReturn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
                        onClick={() => setSelectedReturn(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl"
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
                                {/* Customer Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                                        <div className="space-y-2">
                                            <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedReturn.user?.name}</span></div>
                                            <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedReturn.user?.email}</span></div>
                                            <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedReturn.user?.phone || selectedReturn.pickup?.address?.phone || selectedReturn.order?.shippingAddress?.phone || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Return Information</h3>
                                        <div className="space-y-2">
                                            <div><span className="text-gray-600">Status:</span> 
                                                <span className={`ml-2 px-2 py-1 rounded text-sm ${StatusConfig[selectedReturn.status]?.bgColor} ${StatusConfig[selectedReturn.status]?.textColor}`}>
                                                    {StatusConfig[selectedReturn.status]?.label}
                                                </span>
                                            </div>
                                            <div><span className="text-gray-600">Date:</span> <span className="font-medium">{new Date(selectedReturn.createdAt).toLocaleDateString()}</span></div>
                                            <div><span className="text-gray-600">Order:</span> <span className="font-medium">#{selectedReturn.order?._id?.toString().slice(-8).toUpperCase() || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Items */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Returned Items</h3>
                                    <div className="space-y-4">
                                        {selectedReturn.items?.map((item, index) => (
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
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                                                <span className="text-gray-600 text-sm">Details:</span>
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

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    {getNextActions(selectedReturn.status).map((actionItem, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (actionItem.action === 'pickup') {
                                                    handleSchedulePickup(selectedReturn._id);
                                                } else {
                                                    const note = prompt(`Add a note for ${actionItem.label}:`);
                                                    if (note !== null) {
                                                        // Send action if available, otherwise send status
                                                        const payload = actionItem.action 
                                                            ? { action: actionItem.action, note }
                                                            : { status: actionItem.status, note };
                                                        handleStatusUpdate(selectedReturn._id, payload, note);
                                                    }
                                                }
                                            }}
                                            disabled={actionLoading}
                                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                                actionItem.color === 'green' 
                                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                                    : actionItem.color === 'red'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            } disabled:opacity-50`}
                                        >
                                            {actionLoading ? 'Processing...' : actionItem.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Refund Modal */}
            <AnimatePresence>
                {showManualRefundModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
                        onClick={() => setShowManualRefundModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg max-w-md w-full shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Manual Refund</h2>
                                <p className="text-sm text-gray-600 mt-1">Process a refund without return request</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order ID
                                        <span className="text-sm text-gray-500 font-normal ml-1">(Use #12345678 format or full ID)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={manualRefundData.orderId}
                                        onChange={(e) => setManualRefundData({...manualRefundData, orderId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        placeholder="e.g., #a1b2c3d4 or 67890abcdef12345"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Customer Email/ID
                                        <span className="text-sm text-gray-500 font-normal ml-1">(Email, name, or #12345678)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={manualRefundData.customerId}
                                        onChange={(e) => setManualRefundData({...manualRefundData, customerId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        placeholder="john@example.com, John Doe, or #a1b2c3d4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Refund Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={manualRefundData.amount}
                                        onChange={(e) => setManualRefundData({...manualRefundData, amount: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        placeholder="Enter refund amount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Refund Method
                                    </label>
                                    <select
                                        value={manualRefundData.method}
                                        onChange={(e) => setManualRefundData({...manualRefundData, method: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                    >
                                        <option value="original_payment">Original Payment Method</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="store_credit">Store Credit</option>
                                        <option value="cash">Cash</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason
                                    </label>
                                    <textarea
                                        value={manualRefundData.reason}
                                        onChange={(e) => setManualRefundData({...manualRefundData, reason: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        rows="3"
                                        placeholder="Enter reason for manual refund"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex space-x-3">
                                <button
                                    onClick={() => setShowManualRefundModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleManualRefund}
                                    disabled={actionLoading || !manualRefundData.orderId || !manualRefundData.amount}
                                    className="flex-1 px-4 py-2 bg-[#D4AF76] text-white rounded-lg hover:bg-[#C19B61] transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Process Refund'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Return Order Modal */}
            <AnimatePresence>
                {showManualReturnModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
                        onClick={() => setShowManualReturnModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Create Manual Return Order</h2>
                                <p className="text-sm text-gray-600 mt-1">Create a return request on behalf of a customer</p>
                            </div>

                            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Order ID *
                                            <span className="text-sm text-gray-500 font-normal ml-1">(Use #12345678 format or full ID)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={manualReturnData.orderId}
                                            onChange={(e) => setManualReturnData({...manualReturnData, orderId: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                            placeholder="e.g., #a1b2c3d4 or 67890abcdef12345"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Email/ID *
                                            <span className="text-sm text-gray-500 font-normal ml-1">(Email, name, or #12345678)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={manualReturnData.customerId}
                                            onChange={(e) => setManualReturnData({...manualReturnData, customerId: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                            placeholder="john@example.com, John Doe, or #a1b2c3d4"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Return Reason *
                                    </label>
                                    <select
                                        value={manualReturnData.reason}
                                        onChange={(e) => setManualReturnData({...manualReturnData, reason: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                    >
                                        <option value="">Select reason</option>
                                        <option value="defective">Defective Product</option>
                                        <option value="wrong_item">Wrong Item Sent</option>
                                        <option value="size_issue">Size/Fit Issue</option>
                                        <option value="not_as_described">Not as Described</option>
                                        <option value="quality_issue">Quality Issue</option>
                                        <option value="customer_request">Customer Request</option>
                                        <option value="admin_initiated">Admin Initiated</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Items to Return
                                    </label>
                                    <textarea
                                        value={manualReturnData.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('\n')}
                                        onChange={(e) => {
                                            // Simple text parsing for items - in production, you'd want a proper item selector
                                            const itemsText = e.target.value;
                                            setManualReturnData({...manualReturnData, itemsText});
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        rows="3"
                                        placeholder="Leave empty to return all items from the order, or specify items manually"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty to return all items. Format: Product Name (Qty: X)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={manualReturnData.notes}
                                        onChange={(e) => setManualReturnData({...manualReturnData, notes: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF76] focus:border-transparent"
                                        rows="3"
                                        placeholder="Add any additional notes or instructions"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="autoApprove"
                                            checked={manualReturnData.autoApprove}
                                            onChange={(e) => setManualReturnData({...manualReturnData, autoApprove: e.target.checked})}
                                            className="h-4 w-4 text-[#D4AF76] focus:ring-[#D4AF76] border-gray-300 rounded"
                                        />
                                        <label htmlFor="autoApprove" className="ml-2 block text-sm text-gray-700">
                                            Auto-approve return
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="pickupRequired"
                                            checked={manualReturnData.pickupRequired}
                                            onChange={(e) => setManualReturnData({...manualReturnData, pickupRequired: e.target.checked})}
                                            className="h-4 w-4 text-[#D4AF76] focus:ring-[#D4AF76] border-gray-300 rounded"
                                        />
                                        <label htmlFor="pickupRequired" className="ml-2 block text-sm text-gray-700">
                                            Pickup required
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex space-x-3">
                                <button
                                    onClick={() => setShowManualReturnModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleManualReturn}
                                    disabled={actionLoading || !manualReturnData.orderId || !manualReturnData.customerId}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Creating...' : 'Create Return Order'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

export default withAdminAuth(AdminReturnsPage);