"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import TrackingTimeline from '@/app/components/tracking/TrackingTimeline';
import Link from 'next/link';

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) throw new Error('Failed to fetch order');
                const data = await res.json();
                setOrder(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const createShipment = async () => {
        try {
            const res = await fetch('/api/shipping/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            });

            if (!res.ok) throw new Error('Failed to create shipment');
            
            const updatedOrder = await res.json();
            setOrder(updatedOrder);
        } catch (error) {
            console.error('Error creating shipment:', error);
            alert('Failed to create shipment. Please try again.');
        }
    };

    const ShippingActions = () => {
        if (!order.shipping?.shipmentId) {
            return (
                <button
                    onClick={createShipment}
                    className="mt-4 bg-[#8B6L4C] text-white px-6 py-2 rounded-md hover:bg-[#725939] transition-colors"
                >
                    Create Shipment
                </button>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-gray-50">
                <div className="max-w-4xl mx-auto p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-24 bg-gray-50">
                <div className="max-w-4xl mx-auto p-6">
                    <h1 className="text-2xl font-bold text-red-600">Order not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-semibold">Order #{orderId.slice(-8)}</h1>
                            <p className="text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${
                            order.shipping?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.shipping?.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {order.shipping?.status || 'Processing'}
                        </div>
                    </div>
                </div>

                {/* Shipping Tracking */}
                {order.shipping && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Tracking Number</p>
                                    <p className="font-medium">{order.shipping.trackingNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Courier</p>
                                    <p className="font-medium">{order.shipping.courier}</p>
                                </div>
                            </div>

                            {/* Current Status */}
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-600">Current Status</p>
                                <p className="font-medium">{order.shipping.currentStatus}</p>
                                {order.shipping.currentLocation && (
                                    <p className="text-sm text-gray-600">
                                        Location: {order.shipping.currentLocation}
                                    </p>
                                )}
                            </div>

                            {/* Tracking Timeline */}
                            {order.shipping.trackingHistory && (
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-3">Tracking History</h3>
                                    <div className="space-y-4">
                                        {order.shipping.trackingHistory.map((event, index) => (
                                            <div 
                                                key={index} 
                                                className="flex items-start"
                                            >
                                                <div className="mr-4 mt-1">
                                                    <div className="h-4 w-4 rounded-full bg-[#8B6B4C]"></div>
                                                    {index !== order.shipping.trackingHistory.length - 1 && (
                                                        <div className="h-full w-0.5 bg-gray-200 ml-2"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{event.activity}</p>
                                                    <p className="text-sm text-gray-600">{event.location}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(event.date).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Track Button */}
                            {order.shipping.trackingUrl && (
                                <div className="mt-4">
                                    <a
                                        href={order.shipping.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-[#8B6B4C] text-white px-6 py-2 rounded-md hover:bg-[#725939] transition-colors"
                                    >
                                        Track Package
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Create Shipment Button */}
                        {!order.shipping?.shipmentId && (
                            <div className="mt-4 border-t pt-4">
                                <ShippingActions />
                            </div>
                        )}
                    </div>
                )}

                {/* Tracking Timeline Component */}
                {order.shipping && (
                    <TrackingTimeline 
                        orderId={order._id}
                        awbCode={order.shipping.awbCode}
                        shipmentId={order.shipping.shipmentId}
                    />
                )}

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item._id} className="py-4 flex items-center">
                                <div className="relative h-20 w-20">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover rounded"
                                        sizes="80px"
                                    />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                                <p className="font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Add this right after the total amount display */}
                    <div className="mt-6 flex justify-end">
                        <Link
                            href={`/orders/${order._id}`}
                            className="inline-flex items-center px-4 py-2 bg-[#8B6B4C] text-white rounded-md hover:bg-[#725939] transition-colors"
                        >
                            <span>View Order Details</span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 ml-2" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7" 
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}