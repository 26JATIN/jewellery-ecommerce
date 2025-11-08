'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Loader2, Package, AlertCircle } from 'lucide-react';
import ReturnTracker from '../components/ReturnTracker';

export default function MyReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const res = await fetch('/api/returns');
            const data = await res.json();
            if (res.ok) {
                setReturns(data.returns);
            } else {
                setError(data.error || 'Failed to fetch returns');
            }
        } catch (err) {
            console.error('Error fetching returns:', err);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <RotateCcw className="w-10 h-10 text-amber-600" />
                        My Returns
                    </h1>
                    <p className="text-gray-600">Track your return requests and refund status</p>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Returns List */}
                {returns.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg p-12 text-center"
                    >
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Returns Yet</h2>
                        <p className="text-gray-600 mb-6">You haven't requested any returns</p>
                        <a
                            href="/orders"
                            className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                        >
                            View My Orders
                        </a>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {returns.map((returnItem, index) => (
                            <motion.div
                                key={returnItem._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Return Tracker */}
                                <ReturnTracker returnData={returnItem} />

                                {/* Return Items */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Return Items</h3>
                                    <div className="space-y-3">
                                        {returnItem.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    {item.reason && (
                                                        <p className="text-sm text-gray-600">
                                                            Reason: <span className="capitalize">{item.reason.replace('_', ' ')}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Additional Notes */}
                                    {returnItem.notes && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-2">Your Notes</h4>
                                            <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                                                {returnItem.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
