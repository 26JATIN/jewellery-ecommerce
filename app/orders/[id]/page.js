'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
    Package, 
    Loader2, 
    CheckCircle, 
    Clock,
    Truck,
    Box,
    XCircle,
    MapPin,
    Calendar,
    RotateCcw,
    ChevronRight,
    ArrowLeft,
    CreditCard
} from 'lucide-react';
import ReturnRequestModal from '@/app/components/ReturnRequestModal';

const statusConfig = {
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, label: 'Pending' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle, label: 'Confirmed' },
    processing: { color: 'text-purple-600', bg: 'bg-purple-50', icon: Package, label: 'Processing' },
    shipped: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck, label: 'Shipped' },
    delivered: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, label: 'Cancelled' },
    returned: { color: 'text-gray-600', bg: 'bg-gray-50', icon: RotateCcw, label: 'Returned' }
};

export default function OrderDetailPage({ params }) {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [resolvedParams, setResolvedParams] = useState(null);

    // Resolve params first (Next.js 15 requirement)
    useEffect(() => {
        Promise.resolve(params).then(setResolvedParams);
    }, [params]);

    // Fetch order and check for success parameter when params are resolved
    useEffect(() => {
        if (resolvedParams?.id) {
            fetchOrder();
            // Check for success parameter
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('success') === 'true') {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 5000);
                    // Clean URL
                    window.history.replaceState({}, '', window.location.pathname);
                }
            }
        }
    }, [resolvedParams]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            
            if (res.ok) {
                const foundOrder = data.orders.find(o => o._id === resolvedParams.id);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    router.push('/orders');
                }
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            router.push('/orders');
        } finally {
            setLoading(false);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#D4AF76] mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const StatusIcon = statusConfig[order.status].icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] pb-20 sm:pb-0">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/orders"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Order Details
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">{order.orderNumber}</p>
                        </div>
                        <span className={`
                            inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                            ${statusConfig[order.status].bg} ${statusConfig[order.status].color}
                        `}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig[order.status].label}
                        </span>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl flex items-center gap-3"
                        >
                            <div className="p-2 bg-green-100 rounded-xl">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                                    Order Placed Successfully!
                                </h3>
                                <p className="text-xs sm:text-sm text-green-700">
                                    Your order has been confirmed and will be processed soon.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">
                    {/* Order Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                                <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#D4AF76]" />
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-[#D4AF76]">
                                    ₹{order.totalAmount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Payment & Tracking Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-5 bg-gradient-to-br from-[#F5E6D3] to-[#FFF8F0] rounded-2xl border border-[#D4AF76]/30 shadow-sm"
                        >
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#D4AF76]" />
                                Payment Details
                            </h4>
                            <p className="text-sm text-gray-700 mb-2">
                                Method: <span className="font-semibold">
                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </span>
                            </p>
                            <p className="text-sm text-gray-700">
                                Status: <span className={`font-semibold ${
                                    order.paymentStatus === 'paid' ? 'text-green-600' :
                                    order.paymentStatus === 'failed' ? 'text-red-600' :
                                    'text-yellow-600'
                                }`}>
                                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                                </span>
                            </p>
                            {order.razorpayPaymentId && (
                                <p className="text-xs text-gray-600 mt-3 font-mono bg-white/50 p-2 rounded">
                                    ID: {order.razorpayPaymentId}
                                </p>
                            )}
                        </motion.div>

                        {order.awbCode && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-sm"
                            >
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    Tracking Info
                                </h4>
                                <p className="text-sm text-gray-700 mb-2">
                                    AWB: <span className="font-semibold font-mono">{order.awbCode}</span>
                                </p>
                                <p className="text-sm text-gray-700 mb-3">
                                    Courier: <span className="font-semibold">{order.courierName}</span>
                                </p>
                                {order.trackingUrl && (
                                    <a 
                                        href={order.trackingUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                                    >
                                        Track Shipment
                                        <ChevronRight className="w-4 h-4" />
                                    </a>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Order Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Box className="w-5 h-5 text-[#D4AF76]" />
                            Order Items ({order.items.length})
                        </h3>
                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={item.image || '/placeholder.png'}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg ring-2 ring-gray-200"
                                        />
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#8B6B4C] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-gray-900 mb-1">
                                            {item.name}
                                        </h5>
                                        {item.selectedVariant && (
                                            <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">{item.selectedVariant.name}:</span> {item.selectedVariant.value}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">
                                            ₹{item.price.toLocaleString()} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right self-center">
                                        <p className="font-bold text-gray-900">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Shipping Address */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#D4AF76]" />
                            Shipping Address
                        </h3>
                        <div className="p-4 bg-gradient-to-br from-[#F5E6D3] to-[#FFF8F0] rounded-xl">
                            <p className="font-bold text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
                            <p className="text-sm text-gray-600 mb-2">{order.shippingAddress.phone}</p>
                            <div className="text-sm text-gray-700 space-y-0.5">
                                <p>
                                    {order.shippingAddress.addressLine1}
                                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                </p>
                                <p className="font-medium">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notes */}
                    {order.notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Order Notes</h3>
                            <p className="text-sm text-gray-700 p-4 bg-gray-50 rounded-xl">
                                {order.notes}
                            </p>
                        </motion.div>
                    )}

                    {/* Return Button */}
                    {order.status === 'delivered' && order.status !== 'returned' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to return this order?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                You can request a return for this delivered order. Our team will process it within 24-48 hours.
                            </p>
                            <button
                                onClick={() => setReturnModalOpen(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
                            >
                                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Request Return
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Return Request Modal */}
            {order && (
                <ReturnRequestModal
                    isOpen={returnModalOpen}
                    onClose={() => setReturnModalOpen(false)}
                    order={order}
                    onSuccess={() => {
                        setReturnModalOpen(false);
                        router.push('/returns');
                    }}
                />
            )}
        </div>
    );
}
