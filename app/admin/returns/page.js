'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    RotateCcw, 
    Loader2, 
    CheckCircle2,
    Clock,
    Package,
    Truck,
    XCircle,
    CreditCard,
    User,
    Calendar,
    AlertCircle
} from 'lucide-react';
import AdminLayout from '@/app/components/AdminLayout';

const statusConfig = {
    requested: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Return Requested' },
    pickup_scheduled: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Pickup Scheduled' },
    in_transit: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Picked Up' },
    returned_to_seller: { icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Received in Warehouse' },
    received: { icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Received in Warehouse' },
    completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Return Complete' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' }
};

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingRefund, setProcessingRefund] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        fetchReturns();
    }, [page]);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/returns');
            const data = await res.json();
            if (res.ok) {
                const allReturns = data.returns || [];
                const total = Math.ceil(allReturns.length / ITEMS_PER_PAGE);
                setTotalPages(total);
                
                const start = (page - 1) * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                setReturns(allReturns.slice(start, end));
            }
        } catch (err) {
            console.error('Error fetching returns:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRefundComplete = async (returnId) => {
        if (!confirm('Are you sure you want to mark this refund as complete? This action cannot be undone.')) {
            return;
        }

        setProcessingRefund(returnId);
        try {
            const res = await fetch(`/api/admin/returns/${returnId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markRefundComplete' })
            });

            const data = await res.json();
            if (res.ok) {
                fetchReturns(); // Refresh list
            } else {
                alert(data.error || 'Failed to mark refund complete');
            }
        } catch (err) {
            console.error('Error marking refund complete:', err);
            alert('Something went wrong');
        } finally {
            setProcessingRefund(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <RotateCcw className="w-8 h-8 text-amber-600" />
                        Returns Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage product returns and refunds</p>
                </div>

                {/* Returns List */}
                {returns.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <RotateCcw className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Returns Yet</h2>
                        <p className="text-gray-600">Return requests will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {returns.map((returnItem) => {
                            const StatusIcon = statusConfig[returnItem.status]?.icon || Clock;
                            const statusInfo = statusConfig[returnItem.status] || statusConfig.requested;

                            return (
                                <motion.div
                                    key={returnItem._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        Return Request
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                                        <StatusIcon className="w-4 h-4 inline mr-1" />
                                                        {statusInfo.label}
                                                    </span>
                                                    {returnItem.refundSucceeded && (
                                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                                            <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                                            Refund Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(returnItem.createdAt)}
                                                    </span>
                                                    {returnItem.orderId?.orderNumber && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Order: {returnItem.orderId.orderNumber}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Customer Info */}
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                        Customer Details
                                                    </h4>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Name:</span> {returnItem.userId?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        <span className="font-medium">Email:</span> {returnItem.userId?.email || 'N/A'}
                                                    </p>
                                                </div>

                                                {/* Bank Details */}
                                                {returnItem.refundDetails && (
                                                    <div className="p-4 bg-blue-50 rounded-lg">
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                                            Refund Bank Details
                                                        </h4>
                                                        <div className="space-y-1 text-sm text-gray-700">
                                                            <p><span className="font-medium">Account Name:</span> {returnItem.refundDetails.accountName}</p>
                                                            <p><span className="font-medium">Account Number:</span> {returnItem.refundDetails.accountNumber}</p>
                                                            <p><span className="font-medium">IFSC:</span> {returnItem.refundDetails.ifsc}</p>
                                                            <p><span className="font-medium">Bank:</span> {returnItem.refundDetails.bankName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Return Info */}
                                            <div className="space-y-4">
                                                {/* Items */}
                                                <div className="p-4 bg-amber-50 rounded-lg">
                                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-amber-600" />
                                                        Return Items
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {returnItem.items?.map((item, idx) => (
                                                            <div key={idx} className="text-sm text-gray-700">
                                                                <p className="font-medium">{item.name}</p>
                                                                <p className="text-xs text-gray-600">
                                                                    Qty: {item.quantity} {item.reason && `• Reason: ${item.reason}`}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Shipping Info */}
                                                {(returnItem.shiprocketReturnAwb || returnItem.courierName) && (
                                                    <div className="p-4 bg-indigo-50 rounded-lg">
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <Truck className="w-4 h-4 text-indigo-600" />
                                                            Return Shipping
                                                        </h4>
                                                        {returnItem.shiprocketReturnAwb && (
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">AWB:</span> {returnItem.shiprocketReturnAwb}
                                                            </p>
                                                        )}
                                                        {returnItem.courierName && (
                                                            <p className="text-sm text-gray-700 mt-1">
                                                                <span className="font-medium">Courier:</span> {returnItem.courierName}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {returnItem.notes && (
                                                    <div className="p-4 bg-gray-50 rounded-lg">
                                                        <h4 className="font-semibold text-gray-900 mb-2">Customer Notes</h4>
                                                        <p className="text-sm text-gray-700">{returnItem.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {returnItem.status === 'returned_to_seller' && !returnItem.refundSucceeded && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <div className="flex items-start gap-3 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm text-yellow-800">
                                                        <p className="font-medium">Action Required</p>
                                                        <p>The return has been received. Please verify the items and process the refund manually to the customer&apos;s bank account.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleMarkRefundComplete(returnItem._id)}
                                                    disabled={processingRefund === returnItem._id}
                                                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingRefund === returnItem._id ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        'Mark Return Complete & Refund Processed'
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {returnItem.refundSucceeded && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                    <div>
                                                        <p className="font-semibold text-green-900">Refund Completed</p>
                                                        <p className="text-sm text-green-700">
                                                            Processed on {formatDate(returnItem.refundProcessedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
