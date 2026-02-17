'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRequireAuth } from '@/app/hooks/useRequireAuth';
import { 
    RotateCcw, 
    Loader2, 
    Package, 
    Calendar,
    ArrowRight,
    CheckCircle,
    Clock,
    Truck,
    XCircle
} from 'lucide-react';

const statusConfig = {
    requested: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, label: 'Return Requested' },
    pickup_scheduled: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Package, label: 'Pickup Scheduled' },
    in_transit: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck, label: 'In Transit' },
    returned_to_seller: { color: 'text-purple-600', bg: 'bg-purple-50', icon: RotateCcw, label: 'Returned to Seller' },
    completed: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Completed' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, label: 'Cancelled' }
};

export default function ReturnsPage() {
    const { isAuthed, isChecking } = useRequireAuth({ message: 'Please sign in to view your returns' });
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const res = await fetch('/api/returns');
            const data = await res.json();
            if (res.ok) {
                setReturns(data.returns || []);
            }
        } catch (err) {
            console.error('Error fetching returns:', err);
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

    const totalPages = Math.ceil(returns.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedReturns = returns.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (isChecking || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-white to-[#FFF8F0] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#D4AF76] mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Loading returns...</p>
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:pt-[84px] sm:pb-5 lg:pt-10 lg:pb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold">
                                    My Returns
                                </h1>
                                <p className="text-xs sm:text-sm text-[#F5E6D3] mt-0.5 sm:mt-1 hidden sm:block">
                                    Track your return requests
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/orders"
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all duration-300 font-medium"
                        >
                            View Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {returns.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm rounded-3xl shadow-xl dark:shadow-none border border-gray-200/50 dark:border-white/[0.06] p-8 sm:p-12 text-center"
                    >
                        <div className="p-4 bg-gradient-to-br from-[#F5E6D3] to-[#FFF8F0] rounded-2xl w-fit mx-auto mb-4">
                            <RotateCcw className="w-12 h-12 sm:w-16 sm:h-16 text-[#D4AF76]" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Returns Yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6">
                            You haven&apos;t requested any returns
                        </p>
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-medium"
                        >
                            <Package className="w-5 h-5" />
                            View Orders
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedReturns.map((returnItem, index) => {
                            const StatusIcon = statusConfig[returnItem.status]?.icon || Clock;

                            return (
                                <motion.div
                                    key={returnItem._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/returns/${returnItem._id}`}
                                        className="block bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-none border border-gray-200/50 dark:border-white/[0.06] overflow-hidden hover:shadow-xl hover:border-[#D4AF76]/50 transition-all duration-300"
                                    >
                                        <div className="p-4 sm:p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                                        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                                                            {returnItem.returnNumber}
                                                        </h3>
                                                        <span className={`
                                                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold w-fit
                                                            ${statusConfig[returnItem.status]?.bg} ${statusConfig[returnItem.status]?.color}
                                                        `}>
                                                            <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            {statusConfig[returnItem.status]?.label || returnItem.status}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Product Names */}
                                                    {returnItem.items && returnItem.items.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                                                                {returnItem.items[0]?.name}
                                                                {returnItem.items.length > 1 && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-[#F5E6D3] text-[#8B6B4C] rounded-full text-xs font-semibold">
                                                                        +{returnItem.items.length - 1} more
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF76]" />
                                                            {formatDate(returnItem.createdAt)}
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span>{returnItem.items?.length || 0} item(s)</span>
                                                        {returnItem.shiprocketReturnAwb && (
                                                            <>
                                                                <span className="text-gray-300 hidden sm:inline">•</span>
                                                                <span className="text-blue-600 font-mono text-xs hidden sm:inline">
                                                                    AWB: {returnItem.shiprocketReturnAwb}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            </div>

                                            {/* Cancelled badge */}
                                            {returnItem.status === 'cancelled' && (
                                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    This return was cancelled
                                                </div>
                                            )}
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
                                    className="px-4 py-2 rounded-xl font-medium text-sm bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] hover:border-[#D4AF76] hover:text-[#D4AF76] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    : 'bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] hover:border-[#D4AF76] hover:text-[#D4AF76]'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl font-medium text-sm bg-white dark:bg-white/[0.06] border-2 border-gray-200 dark:border-white/[0.1] hover:border-[#D4AF76] hover:text-[#D4AF76] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
