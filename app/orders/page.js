'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRequireAuth } from '@/app/hooks/useRequireAuth';
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
    pending: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: Clock, label: 'Pending' },
    confirmed: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: CheckCircle, label: 'Confirmed' },
    processing: { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: Package, label: 'Processing' },
    shipped: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: Truck, label: 'Shipped' },
    delivered: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: XCircle, label: 'Cancelled' },
    returned: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10', icon: RotateCcw, label: 'Returned' }
};

const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'past', label: 'Past Orders', icon: History },
];

function OrdersContent() {
    const searchParams = useSearchParams();
    const { isAuthed, isChecking } = useRequireAuth({ message: 'Please sign in to view your orders' });
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

    if (isChecking || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#D4AF76] mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (!isAuthed) {
        return null; // Will redirect via hook
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#FFF8F0] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] pb-20 sm:pb-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white z-40 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-24 lg:pb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                                <Package className="w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                                    My Orders
                                </h1>
                                <p className="text-xs sm:text-sm text-[#F5E6D3] mt-0.5 sm:mt-1 hidden sm:block">
                                    Track and manage your orders
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/products"
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all duration-300 font-medium"
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
                                className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200/50 dark:border-green-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm"
                            >
                                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-green-900 dark:text-green-300 text-sm sm:text-base">
                                        Order Placed Successfully!
                                    </h3>
                                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 truncate">
                                        Order Number: {orderNumber}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-white/[0.06]">
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
                                            : 'bg-gray-100/80 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-white/[0.12]'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-bold
                                            ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/[0.1] text-gray-700 dark:text-gray-300'}
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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;
    
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to page 1 when orders change
    useEffect(() => {
        setCurrentPage(1);
    }, [orders.length]);
    
    if (orders.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm rounded-3xl shadow-xl dark:shadow-none border border-gray-200/50 dark:border-white/[0.06] p-8 sm:p-12 text-center"
            >
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl w-fit mx-auto mb-4">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{emptyMessage}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6">{emptyDescription}</p>
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
            className="space-y-6"
        >
            {/* Orders List */}
            <div className="space-y-4">
                {paginatedOrders.map((order, index) => {
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
                            className="block bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-none border border-gray-200/50 dark:border-white/[0.06] overflow-hidden hover:shadow-xl hover:border-[#D4AF76]/30 transition-all duration-300"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
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
                                        
                                        {/* Product Names */}
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                                                {order.items[0]?.name}
                                                {order.items.length > 1 && (
                                                    <span className="ml-2 px-2 py-0.5 bg-[#F5E6D3] dark:bg-[#D4AF76]/15 text-[#8B6B4C] dark:text-[#D4AF76] rounded-full text-xs font-semibold">
                                                        +{order.items.length - 1} more
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF76]" />
                                                {formatDate(order.createdAt)}
                                            </span>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span>{order.items.length} item(s)</span>
                                            {order.awbCode && (
                                                <>
                                                    <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-mono text-xs hidden sm:inline">
                                                        AWB: {order.awbCode}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 sm:gap-3 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#D4AF76]">
                                                ₹{order.totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl font-medium text-sm bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 hover:border-[#D4AF76] hover:text-[#D4AF76] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                                    currentPage === page
                                        ? 'bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white shadow-lg'
                                        : 'bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 hover:border-[#D4AF76] hover:text-[#D4AF76]'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl font-medium text-sm bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 hover:border-[#D4AF76] hover:text-[#D4AF76] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </motion.div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#F5F0E8] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] py-12 px-4">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF76]" />
                </div>
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
