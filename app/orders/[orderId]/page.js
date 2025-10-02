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
                        <div className={`px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                        </div>
                    </div>
                </div>

                {/* Order Status and Shipping Info */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Info */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                                        {formatStatus(order.status)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment:</span>
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.payment?.status || 'pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-medium">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Shipping Information</h3>
                            {order.shipping?.awb_code || order.shipping?.awbCode ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">AWB Code:</span>
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {order.shipping.awb_code || order.shipping.awbCode}
                                        </span>
                                    </div>
                                    {(order.shipping.courier_name || order.shipping.courier) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Courier:</span>
                                            <span className="font-medium">{order.shipping.courier_name || order.shipping.courier}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping Status:</span>
                                        <span className={`px-2 py-1 rounded text-sm ${getShippingStatusColor(order.shipping.current_status || order.shipping.status)}`}>
                                            {formatShippingStatus(order.shipping.current_status || order.shipping.status)}
                                        </span>
                                    </div>
                                    {order.shipping.expected_delivery_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Expected Delivery:</span>
                                            <span className="text-sm font-medium text-green-600">
                                                {new Date(order.shipping.expected_delivery_date).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {(order.shipping.last_location || order.shipping.currentLocation) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Location:</span>
                                            <span className="text-sm">{order.shipping.last_location || order.shipping.currentLocation}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex gap-2">
                                            {order.shipping.tracking_url && (
                                                <a
                                                    href={order.shipping.tracking_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-2 bg-[#8B6B4C] text-white text-sm rounded-md hover:bg-[#725939] transition-colors"
                                                >
                                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Track Live
                                                </a>
                                            )}
                                            
                                            {(order.shipping.awb_code || order.shipping.awbCode) && (
                                                <a
                                                    href={`https://shiprocket.in/tracking/${order.shipping.awb_code || order.shipping.awbCode}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    Shiprocket
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : order.shipping?.shipmentId || order.shipping?.shipment_id ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-yellow-800 font-medium">Shipment Created</p>
                                            <p className="text-yellow-700 text-sm">
                                                Shipment ID: {order.shipping.shipmentId || order.shipping.shipment_id}
                                            </p>
                                            <p className="text-yellow-600 text-sm">
                                                Waiting for courier assignment and AWB generation...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <div>
                                            <p className="text-gray-800 font-medium">Preparing for Shipment</p>
                                            <p className="text-gray-600 text-sm">
                                                {order.payment?.status === 'completed' 
                                                    ? 'Payment confirmed. Shipment will be created shortly.'
                                                    : 'Shipment will be created after payment confirmation.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Shiprocket Details Section */}
                {(order.shipping?.awb_code || order.shipping?.awbCode || order.shipping?.shipmentId) && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
                            <svg className="mr-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Shiprocket Tracking Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Order Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-mono">{order._id.slice(-8)}</span>
                                    </div>
                                    {order.shipping?.shipmentId && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipment ID:</span>
                                            <span className="font-mono">{order.shipping.shipmentId}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order Date:</span>
                                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Information */}
                            {(order.shipping?.awb_code || order.shipping?.awbCode) && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-3">Shipping Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">AWB Code:</span>
                                            <span className="font-mono font-medium">
                                                {order.shipping.awb_code || order.shipping.awbCode}
                                            </span>
                                        </div>
                                        {order.shipping.courier_name && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Courier:</span>
                                                <span className="font-medium">{order.shipping.courier_name}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs ${getShippingStatusColor(order.shipping.current_status || order.shipping.status)}`}>
                                                {formatShippingStatus(order.shipping.current_status || order.shipping.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Information */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-3">Delivery Details</h3>
                                <div className="space-y-2 text-sm">
                                    {order.shipping?.expected_delivery_date ? (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Expected:</span>
                                            <span className="font-medium text-green-700">
                                                {new Date(order.shipping.expected_delivery_date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Expected:</span>
                                            <span className="text-gray-500">Calculating...</span>
                                        </div>
                                    )}
                                    
                                    {order.shipping?.last_location && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Location:</span>
                                            <span className="text-right text-xs">{order.shipping.last_location}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Address:</span>
                                        <span className="text-right text-xs">
                                            {order.shippingAddress.city}, {order.shippingAddress.state}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-3">
                                {order.shipping?.tracking_url && (
                                    <a
                                        href={order.shipping.tracking_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-[#8B6B4C] text-white rounded-md hover:bg-[#725939] transition-colors"
                                    >
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Track Real-time
                                    </a>
                                )}
                                
                                {(order.shipping?.awb_code || order.shipping?.awbCode) && (
                                    <a
                                        href={`https://shiprocket.in/tracking/${order.shipping.awb_code || order.shipping.awbCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Shiprocket Portal
                                    </a>
                                )}

                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tracking Timeline Component */}
                <TrackingTimeline 
                    orderId={order._id}
                    order={order}
                />

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
                                    ₹{(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
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

// Helper functions
function getStatusColor(status) {
    switch (status?.toLowerCase()) {
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'shipped':
            return 'bg-blue-100 text-blue-800';
        case 'processing':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getShippingStatusColor(status) {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered')) {
        return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('out for delivery') || statusLower.includes('dispatched')) {
        return 'bg-blue-100 text-blue-800';
    } else if (statusLower.includes('in transit') || statusLower.includes('shipped')) {
        return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('picked') || statusLower.includes('pickup')) {
        return 'bg-purple-100 text-purple-800';
    } else if (statusLower.includes('cancelled') || statusLower.includes('rto')) {
        return 'bg-red-100 text-red-800';
    } else {
        return 'bg-gray-100 text-gray-800';
    }
}

function formatStatus(status) {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

function formatShippingStatus(status) {
    if (!status) return 'Pending';
    
    // Handle common Shiprocket status formats
    const formatted = status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    
    return formatted;
}