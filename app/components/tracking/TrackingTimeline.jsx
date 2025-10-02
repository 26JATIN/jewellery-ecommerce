"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function TrackingTimeline({ orderId, order }) {
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const createShipment = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/shipping/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            });

            if (!res.ok) throw new Error('Failed to create shipment');
            
            const data = await res.json();
            setTracking(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch tracking if we have shipping details
        if (order?.shipping?.shipmentId || order?.shipping?.awbCode) {
            const fetchTracking = async () => {
                try {
                    setLoading(true);
                    const endpoint = `/api/shipping/track/order/${orderId}`;
                    const res = await fetch(endpoint);
                    if (!res.ok) throw new Error('Failed to fetch tracking');
                    
                    const data = await res.json();
                    setTracking(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchTracking();
        }
    }, [orderId, order?.shipping]);

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

    // Show tracking info if available
    if (!tracking) return <div>Loading tracking information...</div>;

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-2">Shipment Details</h3>
                <div className="text-sm space-y-2">
                    <p>Status: <span className="font-medium">{order.shipping.status || 'Processing'}</span></p>
                    <p>AWB Number: <span className="font-medium">{order.shipping.awbCode}</span></p>
                    <p>Courier: <span className="font-medium">{order.shipping.courier}</span></p>
                    {order.shipping.estimatedDelivery && (
                        <p>Estimated Delivery: <span className="font-medium">
                            {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
                        </span></p>
                    )}
                </div>
            </div>

            {tracking?.tracking_data?.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-4">Tracking History</h3>
                    <div className="space-y-4">
                        {tracking.tracking_data.map((event, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="relative">
                                    <div className="h-4 w-4 rounded-full bg-[#8B6L4C]"></div>
                                    {index !== tracking.tracking.tracking_data.length - 1 && (
                                        <div className="absolute top-4 bottom-0 left-2 w-0.5 bg-gray-200"></div>
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-medium">{event.activity}</p>
                                    <p className="text-sm text-gray-600">{event.location}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(event.date).toLocaleString()}
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