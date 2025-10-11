"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AddressForm from '../components/checkout/AddressForm';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import CouponCode from '../components/CouponCode';
import RazorpayScript from '../components/RazorpayScript';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const { user, triggerLoginModal } = useAuth();
    const [loading, setLoading] = useState(false);
    const [shippingData, setShippingData] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [originalTotal, setOriginalTotal] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);

    // Calculate totals
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setOriginalTotal(total);
        
        if (appliedCoupon) {
            setFinalTotal(appliedCoupon.finalTotal);
        } else {
            setFinalTotal(total);
        }
    }, [cartItems, appliedCoupon]);

    // Redirect to home if user not authenticated
    useEffect(() => {
        if (!user) {
            triggerLoginModal();
            router.push('/');
        }
    }, [user, router, triggerLoginModal]);

    const handleCouponApplied = (couponData) => {
        setAppliedCoupon(couponData);
    };

    const handleCouponRemoved = () => {
        setAppliedCoupon(null);
    };

    const handleCheckout = async (shippingAddress) => {
        try {
            setShippingData(shippingAddress); // Store shipping data
            setLoading(true);

            const totalAmount = finalTotal; // Use final total after coupon discount

            // Create order first
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cartItems,
                    shippingAddress,
                    paymentMethod: 'razorpay',
                    totalAmount,
                    coupon: appliedCoupon ? {
                        code: appliedCoupon.couponCode,
                        discountAmount: appliedCoupon.discountAmount,
                        originalTotal: appliedCoupon.originalTotal
                    } : null
                }),
            });

            const orderData = await orderRes.json();
            
            if (!orderRes.ok) {
                throw new Error(orderData.error || 'Failed to create order');
            }

            // Initialize Razorpay with order data
            await initializeRazorpay(orderData._id, totalAmount, shippingAddress);

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to process order. Please try again.');
            setLoading(false);
        }
    };

    const initializeRazorpay = async (orderId, amount, shippingAddress) => {
        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    amount: Number(amount) // Ensure amount is a number
                }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // This should be available
                amount: data.amount,
                currency: data.currency || 'INR',
                name: "Jewellery Store",
                description: "Payment for Order #" + orderId,
                order_id: data.id,
                handler: async (response) => {
                    await handlePaymentSuccess(response, orderId);
                },
                prefill: {
                    name: shippingAddress.fullName,
                    contact: shippingAddress.phone,
                },
                theme: {
                    color: "#8B6B4C",
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            // Verify Razorpay is loaded
            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded');
            }

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Razorpay initialization error:', error);
            setLoading(false);
            alert('Payment initialization failed. Please try again.');
        }
    };

    const handlePaymentSuccess = async (response, orderId) => {
        try {
            setLoading(true);
            const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                }),
            });

            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'Payment verification failed');
            }

            await clearCart();
            router.push(`/checkout/confirmation?orderId=${orderId}&status=success`);
        } catch (error) {
            console.error('Payment verification error:', error);
            router.push(`/checkout/confirmation?orderId=${orderId}&status=failed`);
        } finally {
            setLoading(false);
        }
    };

    // Don't render checkout if user is not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 pt-4 md:pt-6 lg:pt-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
                    <p className="text-gray-600 mb-6">Please log in to continue with checkout</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B6B4C] mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-4 md:pt-6 lg:pt-8 pb-12">
            <RazorpayScript />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Checkout
                    </h1>
                    <p className="text-gray-600">Complete your order securely</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Address Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <AddressForm onSubmit={handleCheckout} />
                        </div>
                    </div>

                    {/* Right Column - Summary & Coupon */}
                    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                        {/* Coupon Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <CouponCode 
                                cartItems={cartItems.map(item => ({
                                    productId: item.id,
                                    name: item.name,
                                    price: item.price,
                                    quantity: item.quantity,
                                    category: item.category
                                }))}
                                onCouponApplied={handleCouponApplied}
                                onCouponRemoved={handleCouponRemoved}
                                appliedCoupon={appliedCoupon}
                            />
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
                            <CheckoutSummary 
                                appliedCoupon={appliedCoupon}
                                originalTotal={originalTotal}
                                finalTotal={finalTotal}
                            />
                        </div>

                        {/* Security Badge */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-green-900">Secure Checkout</p>
                                    <p className="text-xs text-green-700">Your payment info is safe with us</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#D4AF76]"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <svg className="w-6 h-6 text-[#8B6B4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">Processing your order...</p>
                                    <p className="text-sm text-gray-600 mt-1">Please wait while we secure your payment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}