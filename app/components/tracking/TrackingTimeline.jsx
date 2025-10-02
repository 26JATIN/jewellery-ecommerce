"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function TrackingTimeline({ orderId, order: initialOrder }) {
    const [order, setOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const createShipment = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/shipping/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, automate: true })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create shipment');
            }
            
            const data = await res.json();
            
            // Refresh order data after shipment creation
            await fetchOrderData();
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderData = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            }
        } catch (err) {
            console.error('Failed to fetch order data:', err);
        }
    };

    const updateTracking = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/shipping/track/${orderId}`, {
                method: 'POST'
            });

            if (res.ok) {
                await fetchOrderData();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-refresh tracking data if we have shipping details
        if (order?.shipping?.awbCode) {
            const interval = setInterval(() => {
                updateTracking();
            }, 5 * 60 * 1000); // Update every 5 minutes

            return () => clearInterval(interval);
        }
    }, [order?.shipping?.awbCode]);

    if (loading) return <div className="animate-pulse">Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    // If no shipping info exists, show create shipment button only for admin
    if (!order?.shipping?.shipmentId && !order?.shipping?.awbCode) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">Shipping</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {user?.isAdmin 
                        ? "Shipping label needs to be created"
                        : "Your order will be shipped soon"
                    }
                </p>
                {user?.isAdmin && (
                    <button
                        onClick={createShipment}
                        disabled={loading}
                        className="bg-[#8B6B4C] text-white px-4 py-2 rounded hover:bg-[#725939] disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Shipping Label'}
                    </button>
                )}
            </div>
        );
    }

    // Show tracking info
    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">Shipment Details</h3>
                    {order?.shipping?.awbCode && (
                        <button
                            onClick={updateTracking}
                            disabled={loading}
                            className="text-sm text-[#8B6B4C] hover:text-[#725939] disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Refresh'}
                        </button>
                    )}
                </div>
                
                <div className="text-sm space-y-2">
                    <p>Status: <span className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(order?.status)}`}>
                        {formatStatus(order?.status)}
                    </span></p>
                    
                    {order?.shipping?.awbCode && (
                        <>
                            <p>AWB Number: <span className="font-medium font-mono">{order.shipping.awbCode}</span></p>
                            <p>Courier: <span className="font-medium">{order.shipping.courier}</span></p>
                            {order.shipping.trackingUrl && (
                                <p>
                                    <a 
                                        href={order.shipping.trackingUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[#8B6B4C] hover:underline"
                                    >
                                        Track on {order.shipping.courier} website →
                                    </a>
                                </p>
                            )}
                        </>
                    )}
                    
                    {order?.shipping?.eta && (
                        <p>Estimated Delivery: <span className="font-medium">
                            {new Date(order.shipping.eta).toLocaleDateString()}
                        </span></p>
                    )}
                    
                    {order?.shipping?.currentLocation && (
                        <p>Current Status: <span className="font-medium">{order.shipping.currentLocation}</span></p>
                    )}
                    
                    {order?.shipping?.lastUpdateAt && (
                        <p className="text-xs text-gray-500">
                            Last updated: {new Date(order.shipping.lastUpdateAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            {order?.shipping?.trackingHistory?.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-4">Tracking History</h3>
                    <div className="space-y-4">
                        {order.shipping.trackingHistory
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .map((event, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="relative">
                                    <div className={`h-4 w-4 rounded-full ${index === 0 ? 'bg-[#8B6B4C]' : 'bg-gray-300'}`}></div>
                                    {index !== order.shipping.trackingHistory.length - 1 && (
                                        <div className="absolute top-4 left-2 w-0.5 h-8 bg-gray-200"></div>
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-medium">{event.activity}</p>
                                    {event.location && (
                                        <p className="text-sm text-gray-600">{event.location}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatStatus(status) {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
}