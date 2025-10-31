"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import AdminLayout from '@/app/components/AdminLayout';
import withAdminAuth from '@/app/components/withAdminAuth';
import { ChevronLeft, ChevronRight, Search, Filter, Package, Truck, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const { user } = useAuth();
    const ordersPerPage = 20;

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

    // Manual shipment creation removed - fully automated after payment
    // Shipments are created automatically via orderAutomationService

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

    // Manual sync from Shiprocket (for when webhooks don't trigger)
    const syncTrackingFromShiprocket = async (orderId, orderNumber) => {
        if (!confirm(`Force sync tracking status from Shiprocket for order #${orderNumber}?\n\nThis will fetch the latest status directly from Shiprocket API.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/orders/${orderId}/sync-tracking`, {
                method: 'POST'
            });

            const data = await res.json();

            if (res.ok && data.success) {
                await fetchOrders(); // Refresh orders
                alert(`✅ Tracking synced!\n\nPrevious: ${data.data.previousStatus}\nNew: ${data.data.newStatus}\nStatus: ${data.data.statusLabel}`);
            } else if (res.ok && !data.success) {
                // Successful API call but no updates (e.g., shipment too new)
                alert(`ℹ️ No updates available\n\nCurrent Status: ${data.data.currentStatus}\n\n${data.data.shiprocketMessage}\n\n${data.data.hint || ''}`);
            } else {
                alert(`Failed to sync tracking:\n${data.message || data.error}`);
            }
        } catch (error) {
            console.error('Failed to sync tracking:', error);
            alert('Failed to sync tracking from Shiprocket');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (order.shipping?.awbCode && order.shipping.awbCode.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

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
            <div className="space-y-4 md:space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders Management</h1>
                    <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                        Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length}
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by ID, name, or AWB..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Filter Dropdown for Mobile */}
                        <div className="relative sm:hidden">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent flex items-center justify-between bg-white"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm">{filter === 'all' ? 'All Orders' : formatStatus(filter)}</span>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform ${showFilterDropdown ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {showFilterDropdown && (
                                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setFilter(status);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                                                filter === status ? 'bg-[#8B6B4C] bg-opacity-10 text-[#8B6B4C] font-medium' : ''
                                            } ${status === 'all' ? 'rounded-t-lg' : ''} ${status === 'cancelled' ? 'rounded-b-lg' : ''}`}
                                        >
                                            {status === 'all' ? 'All Orders' : formatStatus(status)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter Select for Desktop */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="hidden sm:block px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent min-w-[160px]"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Active Filters Badge */}
                    {(filter !== 'all' || searchTerm) && (
                        <div className="flex flex-wrap gap-2">
                            {filter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B6B4C] bg-opacity-10 text-[#8B6B4C] text-sm rounded-full">
                                    {formatStatus(filter)}
                                    <button onClick={() => setFilter('all')} className="hover:text-[#6B4B3C]">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                    Search: &quot;{searchTerm}&quot;
                                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                    {currentOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            {/* Order Header */}
                            <div className="bg-gradient-to-r from-[#8B6B4C] to-[#6B4B3C] px-4 py-3 text-white flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">#{order._id.slice(-8)}</div>
                                    <div className="text-xs opacity-90">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">₹{order.totalAmount}</div>
                                    <div className="text-xs opacity-90">{order.items.length} item(s)</div>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-4 space-y-3">
                                {/* Customer Info */}
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <Package className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{order.shippingAddress.fullName}</div>
                                        <div className="text-sm text-gray-600">{order.shippingAddress.phone}</div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {order.shippingAddress.city}, {order.shippingAddress.state}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {formatStatus(order.status)}
                                    </span>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.payment?.status || 'pending'}
                                    </span>
                                </div>

                                {/* Shipping Info */}
                                {order.shipping?.awbCode ? (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="flex items-start gap-2">
                                            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">AWB: {order.shipping.awbCode}</div>
                                                <div className="text-xs text-gray-600">{order.shipping.courier}</div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.shipping.status)}`}>
                                                    {formatStatus(order.shipping.status)}
                                                </span>
                                                {order.shipping.currentLocation && (
                                                    <div className="text-xs text-gray-500 mt-1">📍 {order.shipping.currentLocation}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : order.shipping?.shipmentId ? (
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <div className="text-sm font-medium text-yellow-800">Shipment Created</div>
                                        <div className="text-xs text-yellow-600 mt-1">Shipment ID: {order.shipping.shipmentId}</div>
                                        {order.shipping.shiprocketOrderId && (
                                            <div className="text-xs text-yellow-600">SR Order: {order.shipping.shiprocketOrderId}</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Not shipped yet
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                    {!order.shipping?.shipmentId && order.payment?.status === 'completed' && (
                                        <div className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg flex items-center gap-2 flex-1">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Auto-creating shipment...
                                        </div>
                                    )}
                                    {order.shipping?.shipmentId && (
                                        <button
                                            onClick={() => syncTrackingFromShiprocket(order._id, order._id.slice(-8))}
                                            className="flex-1 text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Sync Status
                                        </button>
                                    )}
                                    {order.shipping?.awbCode && (
                                        <button
                                            onClick={() => updateTracking(order._id)}
                                            className="flex-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            Update Tracking
                                        </button>
                                    )}
                                    {order.shipping?.trackingUrl && (
                                        <a
                                            href={order.shipping.trackingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-center"
                                        >
                                            Track Package
                                        </a>
                                    )}
                                    <a
                                        href={`/admin/orders/${order._id}`}
                                        className="flex-1 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-center"
                                    >
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Shipping
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    #{order._id.slice(-8)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
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
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                                            <div className="max-w-xs">
                                                {order.shipping?.awbCode ? (
                                                    <>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            AWB: {order.shipping.awbCode}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.shipping.courier}
                                                        </div>
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.shipping.status)} mt-1`}>
                                                            {formatStatus(order.shipping.status)}
                                                        </span>
                                                        {order.shipping.currentLocation && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                📍 {order.shipping.currentLocation}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : order.shipping?.shipmentId ? (
                                                    <div className="text-sm text-yellow-600">
                                                        Shipment Created
                                                        <br />
                                                        <span className="text-xs">Shipment ID: {order.shipping.shipmentId}</span>
                                                        {order.shipping.shiprocketOrderId && (
                                                            <>
                                                                <br />
                                                                <span className="text-xs">SR Order ID: {order.shipping.shiprocketOrderId}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Not shipped</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col gap-2">
                                                {!order.shipping?.shipmentId && order.payment?.status === 'completed' && (
                                                    <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded flex items-center gap-1">
                                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                                        Auto-creating...
                                                    </div>
                                                )}
                                                {order.shipping?.shipmentId && (
                                                    <button
                                                        onClick={() => syncTrackingFromShiprocket(order._id, order._id.slice(-8))}
                                                        className="text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                                                    >
                                                        🔄 Sync Status
                                                    </button>
                                                )}
                                                {order.shipping?.awbCode && (
                                                    <button
                                                        onClick={() => updateTracking(order._id)}
                                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                                                    >
                                                        Update Tracking
                                                    </button>
                                                )}
                                                {order.shipping?.trackingUrl && (
                                                    <a
                                                        href={order.shipping.trackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded text-xs font-semibold transition-colors text-center"
                                                    >
                                                        Track
                                                    </a>
                                                )}
                                                <a
                                                    href={`/admin/orders/${order._id}`}
                                                    className="text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded text-xs font-semibold transition-colors text-center"
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
                </div>

                {/* No Orders Found */}
                {filteredOrders.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <div className="text-gray-500 text-lg font-medium">No orders found</div>
                        <div className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</div>
                    </div>
                )}

                {/* Pagination */}
                {filteredOrders.length > 0 && totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Page Info */}
                            <div className="text-sm text-gray-600">
                                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border transition-all ${
                                        currentPage === 1
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#8B6B4C]'
                                    }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Page Numbers */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {getPageNumbers().map((pageNum, index) => (
                                        pageNum === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`min-w-[40px] px-3 py-2 rounded-lg border transition-all font-medium ${
                                                    currentPage === pageNum
                                                        ? 'bg-[#8B6B4C] text-white border-[#8B6B4C] shadow-sm'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#8B6B4C]'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ))}
                                </div>

                                {/* Mobile Page Indicator */}
                                <div className="sm:hidden px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium">
                                    {currentPage} / {totalPages}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border transition-all ${
                                        currentPage === totalPages
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#8B6B4C]'
                                    }`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Jump to Page (Desktop) */}
                            <div className="hidden md:flex items-center gap-2">
                                <label className="text-sm text-gray-600">Go to:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const page = parseInt(e.target.value);
                                        if (page >= 1 && page <= totalPages) {
                                            paginate(page);
                                        }
                                    }}
                                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-lg shadow-sm border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-blue-900">{orders.length}</div>
                        <div className="text-xs md:text-sm text-blue-700 font-medium">Total Orders</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-lg shadow-sm border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-green-900">
                            {orders.filter(o => o.payment?.status === 'completed').length}
                        </div>
                        <div className="text-xs md:text-sm text-green-700 font-medium">Paid Orders</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-6 rounded-lg shadow-sm border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                            <Truck className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-purple-900">
                            {orders.filter(o => o.shipping?.awbCode).length}
                        </div>
                        <div className="text-xs md:text-sm text-purple-700 font-medium">Shipped Orders</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 md:p-6 rounded-lg shadow-sm border border-amber-200 col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-xl md:text-3xl font-bold text-amber-900">
                            ₹{orders.reduce((sum, o) => sum + (o.payment?.status === 'completed' ? o.totalAmount : 0), 0).toLocaleString()}
                        </div>
                        <div className="text-xs md:text-sm text-amber-700 font-medium">Total Revenue</div>
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