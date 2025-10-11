"use client";
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, X, Trash2, Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';

export default function Cart() {
    const router = useRouter();
    const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, loading } = useCart();

    const calculateTotal = () => {
        return (cartItems || []).reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateSubtotal = () => {
        return (cartItems || []).reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateSavings = () => {
        // Mock savings calculation - you can make this dynamic
        return calculateSubtotal() * 0.05; // 5% savings
    };

    const getTotalItems = () => {
        return (cartItems || []).reduce((total, item) => total + item.quantity, 0);
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push('/checkout');
    };

    const sidebarVariants = {
        hidden: { 
            x: '100%',
            opacity: 0,
        },
        visible: { 
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
            }
        },
        exit: { 
            x: '100%',
            opacity: 0,
            transition: {
                type: "spring",
                damping: 30,
                stiffness: 300,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05,
                type: "spring",
                damping: 20,
                stiffness: 300
            }
        }),
        exit: { 
            opacity: 0, 
            x: 20,
            transition: { duration: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />

                    {/* Cart Sidebar */}
                    <motion.aside
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-white via-gray-50/50 to-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] text-white px-6 py-6">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <ShoppingBag className="w-7 h-7 text-[#D4AF76]" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight">Shopping Bag</h2>
                                        <p className="text-xs text-gray-300 mt-0.5">
                                            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                                        </p>
                                    </div>
                                </div>
                                <motion.button 
                                    onClick={() => setIsCartOpen(false)}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-[#D4AF76] border-t-transparent rounded-full"
                                />
                                <p className="mt-4 text-gray-600 font-medium">Loading your cart...</p>
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center px-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                    className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6"
                                >
                                    <ShoppingCart className="w-16 h-16 text-gray-400" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500 text-center mb-6">
                                    Looks like you haven't added anything to your cart yet
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        router.push('/products');
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    Start Shopping
                                </motion.button>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                    <AnimatePresence mode="popLayout">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={item._id || item.product}
                                                custom={index}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                                className="group relative bg-white rounded-2xl p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="relative flex-shrink-0">
                                                        <motion.img
                                                            whileHover={{ scale: 1.05 }}
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-24 h-24 object-cover rounded-xl shadow-md"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-[#8B6B4C] transition-colors">
                                                            {item.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <p className="text-lg font-bold text-[#2C2C2C]">
                                                                {formatPrice(item.price)}
                                                            </p>
                                                            <span className="text-xs text-gray-400">each</span>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                                                                <motion.button
                                                                    whileHover={{ backgroundColor: "#D4AF76" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                                                                    className="p-2 hover:text-white transition-colors"
                                                                >
                                                                    <Minus className="w-3.5 h-3.5" />
                                                                </motion.button>
                                                                <span className="px-4 py-2 font-semibold text-sm min-w-[3rem] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <motion.button
                                                                    whileHover={{ backgroundColor: "#D4AF76" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                                                    className="p-2 hover:text-white transition-colors"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </motion.button>
                                                            </div>
                                                            
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => removeFromCart(item.product)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                                                                title="Remove item"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="absolute top-4 right-4">
                                                    <p className="text-sm font-bold text-[#2C2C2C]">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Footer - Summary & Checkout */}
                                <div className="border-t border-gray-200 bg-white px-6 py-5">
                                    {/* Savings Badge */}
                                    {calculateSavings() > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4"
                                        >
                                            <Sparkles className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">
                                                You're saving {formatPrice(calculateSavings())} on this order!
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Price Breakdown */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span className="font-medium text-green-600">FREE</span>
                                        </div>
                                        {calculateSavings() > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Savings</span>
                                                <span className="font-medium">-{formatPrice(calculateSavings())}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-200">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <motion.span 
                                            key={calculateTotal()}
                                            initial={{ scale: 1.2 }}
                                            animate={{ scale: 1 }}
                                            className="text-2xl font-bold bg-gradient-to-r from-[#2C2C2C] to-[#8B6B4C] bg-clip-text text-transparent"
                                        >
                                            {formatPrice(calculateTotal())}
                                        </motion.span>
                                    </div>

                                    {/* Checkout Button */}
                                    <motion.button 
                                        onClick={handleCheckout}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-[#2C2C2C] via-[#1A1A1A] to-[#2C2C2C] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-size-200 bg-pos-0 hover:bg-pos-100"
                                        style={{
                                            backgroundSize: '200% 100%',
                                        }}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Proceed to Checkout
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                →
                                            </motion.span>
                                        </span>
                                    </motion.button>

                                    {/* Security Badge */}
                                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 1L3 5v6c0 5.25 3.5 8.5 7 9 3.5-.5 7-3.75 7-9V5l-7-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Secure checkout powered by Razorpay</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}