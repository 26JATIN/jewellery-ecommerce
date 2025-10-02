"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import AddressForm from '../components/checkout/AddressForm';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import RazorpayScript from '../components/RazorpayScript';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [shippingData, setShippingData] = useState(null);

    const handleCheckout = async (shippingAddress) => {
        try {
            setShippingData(shippingAddress); // Store shipping data
            setLoading(true);

            const totalAmount = cartItems.reduce((total, item) => 
                total + item.price * item.quantity, 0
            );

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
                    totalAmount
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

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <RazorpayScript />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <AddressForm onSubmit={handleCheckout} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <CheckoutSummary />
                    </div>
                </div>
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B6B4C]"></div>
                    </div>
                )}
            </div>
        </div>
    );
}