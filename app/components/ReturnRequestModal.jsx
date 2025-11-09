'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReturnRequestModal({ isOpen, onClose, order, onSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingReturnNumber, setExistingReturnNumber] = useState('');
    const [success, setSuccess] = useState(false);
    const [returnId, setReturnId] = useState(null);
    const [formData, setFormData] = useState({
        reason: '',
        accountName: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
        notes: ''
    });

    const handleClose = () => {
        setError('');
        setExistingReturnNumber('');
        setSuccess(false);
        setReturnId(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setExistingReturnNumber('');

        try {
            const res = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order._id,
                    items: order.items.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        quantity: item.quantity,
                        reason: formData.reason
                    })),
                    reason: formData.reason,
                    refundDetails: {
                        accountName: formData.accountName,
                        accountNumber: formData.accountNumber,
                        ifsc: formData.ifsc,
                        bankName: formData.bankName
                    },
                    notes: formData.notes
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setReturnId(data.returnId || data._id);
                setTimeout(() => {
                    onSuccess && onSuccess();
                    // Redirect to return details page
                    if (data.returnId || data._id) {
                        router.push(`/returns/${data.returnId || data._id}`);
                    }
                    handleClose();
                }, 2000);
            } else {
                // Handle duplicate return case
                if (data.returnNumber) {
                    setExistingReturnNumber(data.returnNumber);
                    setError(data.error || 'A return request already exists for this order');
                } else {
                    setError(data.error || 'Failed to submit return request');
                }
            }
        } catch (err) {
            console.error('Return request error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Container - Responsive positioning */}
                    <div key="modal-container" className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
                        <motion.div
                            key="modal-content"
                            initial={{ opacity: 0, y: "100%", scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: "100%", scale: 0.95 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden pointer-events-auto"
                        >
                    {/* Header - Sticky with brand colors */}
                    <div className="sticky top-0 bg-gradient-to-r from-[#F5E6D3] to-[#FFF8F0] border-b border-[#D4AF76]/30 px-4 sm:px-6 py-4 flex items-center justify-between z-10 backdrop-blur-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Return Request</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Scrollable Content with safe areas */}
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                        {success ? (
                            <div className="p-6 sm:p-8 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Return Request Submitted!</h3>
                                <p className="text-sm sm:text-base text-gray-600 mb-6">
                                    We'll process your return shortly. You'll receive updates via email.
                                </p>
                                {returnId && (
                                    <button
                                        onClick={() => router.push(`/returns/${returnId}`)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-xl hover:shadow-lg hover:shadow-[#D4AF76]/30 transition-all duration-300 font-semibold"
                                    >
                                        View Return Details
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-24 sm:pb-6">
                            {/* Order Info */}
                            <div className="bg-gradient-to-br from-[#F5E6D3] to-[#FFF8F0] rounded-xl p-3 sm:p-4 border border-[#D4AF76]/20">
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Order: {order.orderNumber}</h3>
                                <p className="text-xs sm:text-sm text-gray-700">
                                    Total Amount: <span className="font-bold text-[#8B6B4C]">₹{order.totalAmount.toLocaleString()}</span>
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
                                            {existingReturnNumber && (
                                                <div className="mt-3">
                                                    <a 
                                                        href="/returns" 
                                                        className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium underline"
                                                        onClick={handleClose}
                                                    >
                                                        View existing return ({existingReturnNumber})
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Return Reason */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Reason for Return *
                                </label>
                                <select
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="defective">Defective/Damaged Product</option>
                                    <option value="wrong_item">Wrong Item Received</option>
                                    <option value="not_as_described">Not as Described</option>
                                    <option value="quality_issues">Quality Issues</option>
                                    <option value="changed_mind">Changed Mind</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Bank Details Section */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-semibold text-gray-900">Refund Bank Details</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Holder Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountName}
                                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="State Bank of India"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="1234567890"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            IFSC Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.ifsc}
                                            onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF76] focus:ring-2 focus:ring-[#D4AF76]/20 outline-none resize-none text-sm sm:text-base"
                                    placeholder="Any specific details about the return..."
                                />
                            </div>

                            {/* Submit Buttons - Fixed on mobile, relative on desktop */}
                            <div className="fixed sm:relative bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto p-4 sm:p-0 bg-white sm:bg-transparent border-t-2 sm:border-t-0 border-gray-100 flex gap-2 sm:gap-3 sm:pt-2 z-10">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-xl hover:shadow-lg hover:shadow-[#D4AF76]/30 transition-all duration-300 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : 'Submit Return'}
                                </button>
                            </div>
                        </form>
                    )}
                    </div>
                </motion.div>
            </div>
                </>
            )}
        </AnimatePresence>
    );
}
