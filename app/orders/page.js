"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }

        fetchOrders();
    }, [user, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/user');
            const data = await res.json();
            if (res.ok) {
                setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-8">My Orders</h1>
                
                {orders.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-medium text-gray-900">
                                                Order #{order._id.slice(-8)}
                                            </h2>
                                            <Link
                                                href={`/orders/${order._id}`}
                                                className="text-sm text-[#8B6B4C] hover:underline"
                                            >
                                                View order details
                                            </Link>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Placed on {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                <div className="border-t border-b border-gray-200 py-4 mb-4">
                                    {order.items.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center py-2">
                                            <div className="flex items-center">
                                                <div className="relative w-16 h-16">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover rounded"
                                                        sizes="(max-width: 64px) 100vw, 64px"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-medium">
                                                ₹{(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Information */}
                                {order.shipping && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-semibold mb-2 text-blue-800">Shipping Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {order.shipping.awb_code && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Tracking Number</p>
                                                    <p className="font-medium">{order.shipping.awb_code}</p>
                                                </div>
                                            )}
                                            {order.shipping.courier_name && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Courier</p>
                                                    <p className="font-medium">{order.shipping.courier_name}</p>
                                                </div>
                                            )}
                                            {order.shipping.current_status && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Shipping Status</p>
                                                    <p className="font-medium capitalize">{order.shipping.current_status.replace(/_/g, ' ')}</p>
                                                </div>
                                            )}
                                            {order.shipping.expected_delivery_date && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Expected Delivery</p>
                                                    <p className="font-medium">
                                                        {new Date(order.shipping.expected_delivery_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {order.shipping.tracking_url && (
                                            <div className="mt-3">
                                                <a 
                                                    href={order.shipping.tracking_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Track Your Order
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">
                                            Shipping Address
                                        </h3>
                                        <div className="text-sm text-gray-500">
                                            <p>{order.shippingAddress.fullName}</p>
                                            <p>{order.shippingAddress.addressLine1}</p>
                                            {order.shippingAddress.addressLine2 && (
                                                <p>{order.shippingAddress.addressLine2}</p>
                                            )}
                                            <p>
                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                            </p>
                                            <p>{order.shippingAddress.country}</p>
                                            <p>Phone: {order.shippingAddress.phone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-xl font-semibold text-gray-900">
                                            ₹{order.totalAmount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}