"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                const data = await res.json();
                if (res.ok) {
                    setOrder(data);
                }
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {status === 'success' ? (
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-green-600">Payment Successful!</h1>
                            <p className="mt-2 text-gray-600">Thank you for your purchase</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold text-red-600">Payment Failed</h1>
                            <p className="mt-2 text-gray-600">Please try again or contact support</p>
                        </div>
                    )}

                    {order && (
                        <div className="mt-8">
                            <h2 className="text-lg font-medium mb-4">Order Details</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item._id} className="flex justify-between">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="text-[#8B6B4C] hover:underline"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}