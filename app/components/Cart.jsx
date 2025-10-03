"use client";
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Cart() {
    const router = useRouter();
    const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, loading } = useCart();

    const calculateTotal = () => {
        return (cartItems || []).reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 backdrop-blur-sm bg-black/30 z-[100]"
                    />
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[101]"
                    >
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Shopping Cart</h2>
                                <button 
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B6B4C]"></div>
                                </div>
                            ) : cartItems.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-gray-500">Your cart is empty</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="space-y-6">
                                        {cartItems.map((item) => (
                                            <div 
                                                key={item._id || item.product} 
                                                className="flex gap-4 border-b pb-4"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">${item.price}</p>
                                                    <div className="flex items-center mt-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="mx-2">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {cartItems.length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <button 
                                        onClick={handleCheckout}
                                        className="w-full mt-4 bg-[#8B6B4C] text-white py-3 rounded hover:bg-[#725939] transition-colors"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}