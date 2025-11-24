"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CouponShowcase() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);
    const { user } = useAuth();
    const { cart } = useCart();

    useEffect(() => {
        fetchActiveCoupons();
    }, [user, cart]);

    const fetchActiveCoupons = async () => {
        try {
            setLoading(true);
            
            // Build query params
            const params = new URLSearchParams();
            if (user?._id) {
              params.append('userId', user._id);
            }
            if (cart?.length > 0) {
              // Send minimal cart data for filtering
              const cartItems = cart.map(item => ({
                productId: item.productId || item._id,
                quantity: item.quantity
              }));
              params.append('cartItems', JSON.stringify(cartItems));
            }
            
            const response = await fetch(`/api/coupons/showcase?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setCoupons(data.coupons || []);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };



    const getDiscountText = (coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}% OFF`;
        } else {
            return `₹${coupon.discountValue} OFF`;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 30
        },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    if (loading) {
        return (
            <section className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (coupons.length === 0) {
        return null;
    }

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm text-[#D4AF76] font-light tracking-widest uppercase mb-2">
                        Exclusive Offers
                    </p>
                    <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-tight mb-4">
                        Special Savings
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto font-light">
                        Unlock exceptional value on our curated jewelry collection with these limited-time offers
                    </p>
                </motion.div>

                {/* Coupons Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {coupons.slice(0, 3).map((coupon, index) => (
                        <motion.div
                            key={coupon._id}
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            className="group relative"
                        >
                            {/* Main Card */}
                            <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500">
                                {/* Content */}
                                <div className="p-8">
                                    {/* Discount Badge */}
                                    <div className="text-center mb-6">
                                        <div className="inline-block relative">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF76] to-[#B8956A] flex items-center justify-center mb-4 mx-auto relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                                                <span className="text-white font-light text-lg relative z-10">
                                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                                </span>
                                            </div>
                                            <div className="text-xs text-[#D4AF76] font-medium tracking-wider uppercase">
                                                {coupon.discountType === 'percentage' ? 'Discount' : 'Off'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coupon Code */}
                                    <div className="text-center mb-6">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => copyToClipboard(coupon.code)}
                                            className="inline-block bg-gray-50 border border-gray-200 rounded-2xl px-6 py-3 cursor-pointer group-hover:bg-[#D4AF76]/5 group-hover:border-[#D4AF76]/30 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500 mb-1 font-light">Code</div>
                                                    <div className="text-xl font-light text-[#2C2C2C] tracking-wider">
                                                        {coupon.code}
                                                    </div>
                                                </div>
                                                <div className="text-gray-400 group-hover:text-[#D4AF76] transition-colors">
                                                    <AnimatePresence mode="wait">
                                                        {copiedCode === coupon.code ? (
                                                            <motion.div
                                                                key="check"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="w-5 h-5 text-green-500"
                                                            >
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="copy"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="w-5 h-5"
                                                            >
                                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 font-light">
                                                Tap to copy
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Description */}
                                    <div className="text-center mb-6">
                                        <p className="text-gray-600 text-sm font-light leading-relaxed">
                                            {coupon.description}
                                        </p>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        {coupon.minimumOrderValue > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-light">Minimum Order</span>
                                                <span className="text-[#2C2C2C] font-light">₹{coupon.minimumOrderValue.toLocaleString()}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-light">Valid Until</span>
                                            <span className="text-[#2C2C2C] font-light">
                                                {new Date(coupon.validUntil).toLocaleDateString('en-IN', { 
                                                    day: 'numeric', 
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {coupon.usageLimit && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-light">Remaining Uses</span>
                                                <span className="text-[#D4AF76] font-light">
                                                    {coupon.usageLimit - (coupon.usedCount || 0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Subtle Border Effect */}
                                <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-br from-[#D4AF76]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </div>

                            {/* Special Badge */}
                            {(coupon.firstTimeUserOnly || coupon.code.includes('WELCOME')) && !user && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="absolute -top-3 -right-3 bg-[#D4AF76] text-white text-xs font-light px-3 py-1 rounded-full shadow-lg"
                                >
                                    New Customer
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center mt-16"
                >
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center gap-3 bg-[#2C2C2C] text-white px-8 py-4 rounded-full hover:bg-[#D4AF76] transition-all duration-300 font-light"
                    >
                        <span>Explore Collection</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}