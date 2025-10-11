"use client";
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

export default function CheckoutSummary({ appliedCoupon, originalTotal, finalTotal }) {
    const { cartItems } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const displayTotal = originalTotal || calculateTotal();

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <svg className="w-6 h-6 text-[#D4AF76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {cartItems.map((item, index) => (
                    <motion.div
                        key={item._id || item.product}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-start p-3 bg-white rounded-xl border border-gray-100 hover:border-[#D4AF76]/30 transition-colors duration-200"
                    >
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">Qty:</span>
                                <span className="text-xs font-medium text-[#8B6B4C] bg-[#D4AF76]/10 px-2 py-0.5 rounded">
                                    {item.quantity}
                                </span>
                            </div>
                        </div>
                        <p className="font-bold text-gray-900 ml-3">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </motion.div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-200"></div>

            {/* Price Breakdown */}
            <div className="space-y-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-between items-center"
                >
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-semibold">₹{displayTotal.toFixed(2)}</span>
                </motion.div>
                
                {appliedCoupon && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-xl"
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <span className="text-green-700 font-semibold text-sm">Coupon Applied</span>
                                <p className="text-xs text-green-600">{appliedCoupon.couponCode}</p>
                            </div>
                        </div>
                        <span className="text-green-700 font-bold">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                    </motion.div>
                )}
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-xl"
                >
                    <span className="text-gray-600 font-medium">Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                </motion.div>
            </div>

            {/* Total */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-[#D4AF76] to-[#8B6B4C] p-4 rounded-xl shadow-lg"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-white/80 text-sm font-medium">Total Amount</p>
                        <p className="text-white text-2xl font-bold mt-1">
                            ₹{(finalTotal || displayTotal).toFixed(2)}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-gray-500 pt-2"
            >
                <p>All prices are in Indian Rupees (₹)</p>
            </motion.div>
        </div>
    );
}