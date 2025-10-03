"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import AdminLayout from '@/app/components/AdminLayout';

import withAdminAuth from '@/app/components/withAdminAuth';

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user?.isAdmin) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const createShipment = async (orderId) => {
        try {
            const res = await fetch('/api/shipping/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, automate: true })
            });

            if (res.ok) {
                await fetchOrders(); // Refresh orders
                alert('Shipment created successfully!');
            } else {
                const error = await res.json();
                alert(`Failed to create shipment: ${error.error}`);
            }
        } catch (error) {
            console.error('Failed to create shipment:', error);
            alert('Failed to create shipment');
        }
    };

    const updateTracking = async (orderId) => {
        try {
            const res = await fetch(`/api/shipping/track/${orderId}`, {
                method: 'POST'
            });

            if (res.ok) {
                await fetchOrders(); // Refresh orders
                alert('Tracking updated successfully!');
            } else {
                alert('Failed to update tracking');
            }
        } catch (error) {
            console.error('Failed to update tracking:', error);
            alert('Failed to update tracking');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (order.shipping?.awbCode && order.shipping.awbCode.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6B4C]"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Shipping
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{order._id.slice(-8)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {order.items.length} item(s)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.shippingAddress.fullName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.shippingAddress.phone}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.payment?.status || 'pending'}
                                                </span>
                                                {order.payment?.paidAt && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {new Date(order.payment.paidAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                {order.shipping?.awbCode ? (
                                                    <>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.shipping.awbCode}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.shipping.courier}
                                                        </div>
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.shipping.status)}`}>
                                                            {formatStatus(order.shipping.status)}
                                                        </span>
                                                        {order.shipping.currentLocation && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {order.shipping.currentLocation}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : order.shipping?.shipmentId ? (
                                                    <div className="text-sm text-yellow-600">
                                                        Shipment Created
                                                        <br />
                                                        <span className="text-xs">ID: {order.shipping.shipmentId}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Not shipped</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{order.totalAmount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col gap-2">
                                                {!order.shipping?.shipmentId && order.payment?.status === 'completed' && (
                                                    <button
                                                        onClick={() => createShipment(order._id)}
                                                        className="text-[#8B6B4C] hover:text-[#725939] bg-[#8B6B4C]/10 hover:bg-[#8B6B4C]/20 px-3 py-1 rounded text-xs"
                                                    >
                                                        Create Shipment
                                                    </button>
                                                )}
                                                {order.shipping?.awbCode && (
                                                    <button
                                                        onClick={() => updateTracking(order._id)}
                                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-xs"
                                                    >
                                                        Update Tracking
                                                    </button>
                                                )}
                                                {order.shipping?.trackingUrl && (
                                                    <a
                                                        href={order.shipping.trackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-xs"
                                                    >
                                                        Track
                                                    </a>
                                                )}
                                                <a
                                                    href={`/admin/orders/${order._id}`}
                                                    className="text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded text-xs"
                                                >
                                                    View Details
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">No orders found</div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {orders.filter(o => o.payment?.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Paid Orders</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.filter(o => o.shipping?.awbCode).length}
                        </div>
                        <div className="text-sm text-gray-600">Shipped Orders</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">
                            ₹{orders.reduce((sum, o) => sum + (o.payment?.status === 'completed' ? o.totalAmount : 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                </div>
            </div>
        </AdminLayout>
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

function formatStatus(status) {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export default withAdminAuth(AdminOrdersPage);