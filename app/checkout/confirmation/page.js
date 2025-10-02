"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OrderConfirmationContent() {
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

                    {order && order.shipping && (
                        <div className="mt-6 border-t pt-6">
                            <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium">Tracking Number:</span>{' '}
                                    {order.shipping.trackingNumber}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Courier:</span>{' '}
                                    {order.shipping.courier}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Status:</span>{' '}
                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        {order.shipping.status}
                                    </span>
                                </p>
                                {order.shipping.trackingUrl && (
                                    <a
                                        href={order.shipping.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-[#8B6B4C] hover:underline"
                                    >
                                        Track Package →
                                    </a>
                                )}
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

// Wrap the main component with Suspense
export default function OrderConfirmationPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen pt-24 bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            }
        >
            <OrderConfirmationContent />
        </Suspense>
    );
}