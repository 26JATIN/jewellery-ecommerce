'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    Package, 
    Loader2, 
    CheckCircle, 
    Clock,
    Truck,
    XCircle,
    Calendar,
    RotateCcw,
    PackageCheck,
    History,
    ArrowRight
} from 'lucide-react';

const statusConfig = {
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, label: 'Pending' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle, label: 'Confirmed' },
    processing: { color: 'text-purple-600', bg: 'bg-purple-50', icon: Package, label: 'Processing' },
    shipped: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck, label: 'Shipped' },
    delivered: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, label: 'Cancelled' },
    returned: { color: 'text-gray-600', bg: 'bg-gray-50', icon: RotateCcw, label: 'Returned' }
};

const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'past', label: 'Past Orders', icon: History },
];

function OrdersContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('pending');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    useEffect(() => {
        fetchOrders();
        
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            setOrderNumber(searchParams.get('orderNumber') || '');
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            
            if (res.ok) setOrders(data.orders);
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

    const pendingOrders = orders.filter(o => 
        ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
    );
    const pastOrders = orders.filter(o => 
        ['delivered', 'cancelled', 'returned'].includes(o.status)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#D4AF76] mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] pb-20 sm:pb-0">
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-[#D4AF76] to-[#8B6B4C] rounded-xl sm:rounded-2xl shadow-lg">
                                <Package className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    My Orders
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                                    Track and manage your orders
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/products"
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                        >
                            <PackageCheck className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                    </div>

                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl flex items-center gap-3 backdrop-blur-sm"
                            >
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                                        Order Placed Successfully!
                                    </h3>
                                    <p className="text-xs sm:text-sm text-green-700 truncate">
                                        Order Number: {orderNumber}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-[72px] sm:top-[96px] z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex gap-2 sm:gap-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const count = tab.id === 'pending' ? pendingOrders.length : pastOrders.length;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base
                                        whitespace-nowrap transition-all duration-300 rounded-xl sm:rounded-2xl
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white shadow-lg shadow-[#D4AF76]/30' 
                                            : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-bold
                                            ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
                                        `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'pending' && (
                        <OrdersList
                            key="pending"
                            orders={pendingOrders}
                            formatDate={formatDate}
                            emptyMessage="No pending orders"
                            emptyDescription="Your active orders will appear here"
                        />
                    )}
                    
                    {activeTab === 'past' && (
                        <OrdersList
                            key="past"
                            orders={pastOrders}
                            formatDate={formatDate}
                            emptyMessage="No past orders"
                            emptyDescription="Your completed orders will appear here"
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function OrdersList({ orders, formatDate, emptyMessage, emptyDescription }) {
    if (orders.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 sm:p-12 text-center"
            >
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl w-fit mx-auto mb-4">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{emptyMessage}</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">{emptyDescription}</p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-medium"
                >
                    <PackageCheck className="w-5 h-5" />
                    Start Shopping
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            {orders.map((order, index) => {
                const StatusIcon = statusConfig[order.status].icon;

                return (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={`/orders/${order._id}`}
                            className="block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl hover:border-[#D4AF76]/30 transition-all duration-300"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <h3 className="text-base sm:text-xl font-bold text-gray-900">
                                                {order.orderNumber}
                                            </h3>
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold w-fit
                                                ${statusConfig[order.status].bg} ${statusConfig[order.status].color}
                                            `}>
                                                <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                {statusConfig[order.status].label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF76]" />
                                                {formatDate(order.createdAt)}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>{order.items.length} item(s)</span>
                                            {order.awbCode && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-blue-600 font-mono text-xs">
                                                        AWB: {order.awbCode}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="text-lg sm:text-2xl font-bold text-[#D4AF76]">
                                                ₹{order.totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                    {order.items.slice(0, 4).map((item, idx) => (
                                        <img
                                            key={idx}
                                            src={item.image || '/placeholder.png'}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-100"
                                        />
                                    ))}
                                    {order.items.length > 4 && (
                                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-600">
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] py-12 px-4">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF76]" />
                </div>
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
