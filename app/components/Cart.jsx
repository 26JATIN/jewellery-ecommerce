"use client";
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, X, Trash2, Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export default function Cart() {
    const router = useRouter();
    const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, loading } = useCart();

    // Handle browser back button to close cart
    useEffect(() => {
        if (isCartOpen) {
            // Push a new state when cart opens
            window.history.pushState({ cartOpen: true }, '');
            
            const handlePopState = (event) => {
                if (isCartOpen) {
                    setIsCartOpen(false);
                    // Prevent actual navigation
                    event.preventDefault();
                }
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isCartOpen, setIsCartOpen]);

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

    // Checkout functionality removed - will be implemented later

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
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-[#8B6B4C] to-[#725939] text-white px-6 py-6">
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <ShoppingBag className="w-7 h-7" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight">Shopping Bag</h2>
                                        <p className="text-xs text-white/80 mt-0.5">
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
                                    className="w-32 h-32 bg-gradient-to-br from-[#8B6B4C]/10 to-[#725939]/10 rounded-full flex items-center justify-center mb-6"
                                >
                                    <ShoppingCart className="w-16 h-16 text-[#8B6B4C]" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500 text-center mb-6">
                                    Discover our exquisite collection of jewelry
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        router.push('/products');
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-[#8B6B4C] to-[#725939] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    Start Shopping
                                </motion.button>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-gray-50/50">
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
                                                className="group relative bg-white rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="relative flex-shrink-0">
                                                        <motion.img
                                                            whileHover={{ scale: 1.05 }}
                                                            src={item.images?.[0]?.url || item.image || '/placeholder-product.png'}
                                                            alt={item.name}
                                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-sm"
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-[#8B6B4C] transition-colors pr-16">
                                                            {item.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <p className="text-base sm:text-lg font-bold text-[#8B6B4C]">
                                                                {formatPrice(item.price)}
                                                            </p>
                                                            <span className="text-xs text-gray-400">each</span>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                                                <motion.button
                                                                    whileHover={{ backgroundColor: "#8B6B4C" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                                                                    className="p-2 hover:text-white transition-colors"
                                                                >
                                                                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                                </motion.button>
                                                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-sm min-w-[2.5rem] sm:min-w-[3rem] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <motion.button
                                                                    whileHover={{ backgroundColor: "#8B6B4C" }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                                                    className="p-2 hover:text-white transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                                </motion.button>
                                                            </div>
                                                            
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => removeFromCart(item.product)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Remove item"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="absolute top-4 right-4">
                                                    <p className="text-sm font-bold text-[#8B6B4C]">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Footer - Summary & Checkout */}
                                <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4 sm:py-5">
                                    {/* Savings Badge */}
                                    {calculateSavings() > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 bg-gradient-to-r from-[#8B6B4C]/10 to-[#725939]/10 border border-[#8B6B4C]/20 rounded-lg px-4 py-2.5 mb-4"
                                        >
                                            <Sparkles className="w-4 h-4 text-[#8B6B4C]" />
                                            <span className="text-sm font-medium text-[#725939]">
                                                You&apos;re saving {formatPrice(calculateSavings())} on this order!
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Price Breakdown */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-gray-900">{formatPrice(calculateSubtotal())}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span className="font-medium text-[#8B6B4C]">FREE</span>
                                        </div>
                                        {calculateSavings() > 0 && (
                                            <div className="flex justify-between text-sm text-[#8B6B4C]">
                                                <span>Savings</span>
                                                <span className="font-medium">-{formatPrice(calculateSavings())}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center mb-6 pt-3 border-t border-gray-200">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <motion.span 
                                            key={calculateTotal()}
                                            initial={{ scale: 1.2 }}
                                            animate={{ scale: 1 }}
                                            className="text-2xl font-bold text-[#8B6B4C]"
                                        >
                                            {formatPrice(calculateTotal())}
                                        </motion.span>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            router.push('/checkout');
                                        }}
                                        className="w-full bg-gradient-to-r from-[#8B6B4C] to-[#725939] text-white py-4 rounded-xl font-semibold hover:from-[#725939] hover:to-[#5D4A2E] transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}