'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Package, 
    Loader2, 
    CheckCircle, 
    Clock,
    Truck,
    Box,
    XCircle,
    ChevronDown,
    ChevronUp,
    MapPin,
    Calendar,
    RotateCcw,
    ChevronRight
} from 'lucide-react';
import ReturnRequestModal from '../components/ReturnRequestModal';

const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Confirmed' },
    processing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Processing' },
    shipped: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Shipped' },
    delivered: { icon: Box, color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
    returned: { icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Returned' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' }
};

export default function OrdersPage() {
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

    useEffect(() => {
        fetchOrders();
        
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            setOrderNumber(searchParams.get('orderNumber') || '');
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleReturnRequest = (order) => {
        setSelectedOrderForReturn(order);
        setReturnModalOpen(true);
    };

    const handleReturnSuccess = () => {
        fetchOrders(); // Refresh orders list
        setReturnModalOpen(false);
        setSelectedOrderForReturn(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Success Message */}
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-semibold text-green-900">Order Placed Successfully!</h3>
                            <p className="text-sm text-green-700">Order Number: {orderNumber}</p>
                        </div>
                    </motion.div>
                )}

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </motion.div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg p-12 text-center"
                    >
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <a
                            href="/products"
                            className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                        >
                            Browse Products
                        </a>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => {
                            const StatusIcon = statusConfig[order.status].icon;
                            const isExpanded = expandedOrder === order._id;

                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div 
                                        className="p-6 cursor-pointer hover:bg-gray-50 transition"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {order.orderNumber}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status].bg} ${statusConfig[order.status].color}`}>
                                                        <StatusIcon className="w-4 h-4 inline mr-1" />
                                                        {statusConfig[order.status].label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(order.createdAt)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{order.items.length} item(s)</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-amber-600">
                                                    ₹{order.totalAmount.toLocaleString()}
                                                </p>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-gray-200"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Payment & Tracking Info */}
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-amber-50 rounded-lg">
                                                        <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                                                        <p className="text-sm text-gray-700">
                                                            Method: <span className="font-medium">
                                                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            Status: <span className={`font-medium ${
                                                                order.paymentStatus === 'paid' ? 'text-green-600' :
                                                                order.paymentStatus === 'failed' ? 'text-red-600' :
                                                                'text-yellow-600'
                                                            }`}>
                                                                {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {order.awbCode && (
                                                        <div className="p-4 bg-blue-50 rounded-lg">
                                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                                <Truck className="w-4 h-4 text-blue-600" />
                                                                Tracking Information
                                                            </h4>
                                                            <p className="text-sm text-gray-700">
                                                                AWB: <span className="font-medium">{order.awbCode}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-700 mt-1">
                                                                Courier: <span className="font-medium">{order.courierName}</span>
                                                            </p>
                                                            {order.trackingUrl && (
                                                                <a 
                                                                    href={order.trackingUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
                                                                >
                                                                    Track Your Order
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Items */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                                    <div className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                                                <img
                                                                    src={item.image || '/placeholder.png'}
                                                                    alt={item.name}
                                                                    className="w-20 h-20 object-cover rounded-lg"
                                                                />
                                                                <div className="flex-1">
                                                                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                                                                    {item.selectedVariant && (
                                                                        <p className="text-sm text-gray-600">
                                                                            {item.selectedVariant.name}: {item.selectedVariant.value}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-sm text-gray-700 mt-1">
                                                                        ₹{item.price.toLocaleString()} × {item.quantity}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold text-gray-900">
                                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Shipping Address */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-amber-600" />
                                                        Shipping Address
                                                    </h4>
                                                    <div className="p-4 bg-amber-50 rounded-lg">
                                                        <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                                        <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                                                        <p className="text-sm text-gray-700 mt-2">
                                                            {order.shippingAddress.addressLine1}
                                                            {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                                        </p>
                                                        <p className="text-sm text-gray-700">
                                                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                {order.notes && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Order Notes</h4>
                                                        <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                                                            {order.notes}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Return Button */}
                                                {order.status === 'delivered' && order.status !== 'returned' && (
                                                    <div className="pt-4 border-t border-gray-200">
                                                        <button
                                                            onClick={() => handleReturnRequest(order)}
                                                            className="w-full md:w-auto px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <RotateCcw className="w-5 h-5" />
                                                            Request Return
                                                        </button>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            You can request a return for this delivered order
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Return Request Modal */}
                {selectedOrderForReturn && (
                    <ReturnRequestModal
                        isOpen={returnModalOpen}
                        onClose={() => {
                            setReturnModalOpen(false);
                            setSelectedOrderForReturn(null);
                        }}
                        order={selectedOrderForReturn}
                        onSuccess={handleReturnSuccess}
                    />
                )}
            </div>
        </div>
    );
}
