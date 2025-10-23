"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '../../../components/AdminLayout';
import withAdminAuth from '../../../components/withAdminAuth';
import Link from 'next/link';

function AdminOrderDetailsPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            console.log('Fetching order with ID:', orderId);
            const res = await fetch(`/api/admin/orders/${orderId}`);
            console.log('API Response status:', res.status);
            
            if (res.ok) {
                const data = await res.json();
                console.log('Order data received:', data);
                setOrder(data);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Failed to fetch order:', res.status, errorData);
                alert(`Failed to fetch order: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            alert(`Error fetching order: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const updateOrderStatus = async (newStatus) => {
        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
                alert('Order status updated successfully!');
            } else {
                alert('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error updating order status');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
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

    if (!order) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                    <Link href="/admin/orders" className="text-[#8B6B4C] hover:underline">
                        ← Back to Orders
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <Link href="/admin/orders" className="text-[#8B6B4C] hover:underline text-sm mb-2 inline-block">
                            ← Back to Orders
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order._id.slice(-8)}
                        </h1>
                        <p className="text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    
                    {/* Status Update */}
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                        </span>
                        <select
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(e.target.value)}
                            disabled={updating}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B6B4C] focus:border-transparent"
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item._id} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                            
                                            {/* Category and Subcategory */}
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span>{item.category}</span>
                                                {item.subcategory && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{item.subcategory}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Variant Information */}
                                            {item.selectedVariant ? (
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        Variant SKU: {item.selectedVariant.sku}
                                                    </p>
                                                    {item.selectedVariant.optionCombination && 
                                                     Object.keys(item.selectedVariant.optionCombination).length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(item.selectedVariant.optionCombination).map(([key, value]) => (
                                                                <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Product ID: {item.product}
                                                </p>
                                            )}

                                            <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                        
                                        <div className="text-right">
                                            {/* Variant Pricing Details */}
                                            {item.selectedVariant?.price ? (
                                                <div className="space-y-1">
                                                    <p className="font-medium text-green-600">₹{item.selectedVariant.price.sellingPrice}</p>
                                                    <div className="text-xs text-gray-500">
                                                        <p>MRP: ₹{item.selectedVariant.price.mrp}</p>
                                                        <p>Cost: ₹{item.selectedVariant.price.costPrice}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900 pt-1 border-t">
                                                        Total: ₹{(item.selectedVariant.price.sellingPrice * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-medium">₹{item.price}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Order Summary */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>₹{(() => {
                                            const itemsTotal = order.items.reduce((sum, item) => {
                                                const itemPrice = item.selectedVariant?.price?.sellingPrice || item.price;
                                                return sum + (itemPrice * item.quantity);
                                            }, 0);
                                            return itemsTotal.toFixed(2);
                                        })()}</span>
                                    </div>
                                    {order.coupon && order.coupon.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Coupon Discount ({order.coupon.code}):</span>
                                            <span>-₹{order.coupon.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.shippingCost > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping:</span>
                                            <span>₹{order.shippingCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                        <span>Total:</span>
                                        <span>₹{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{order.shippingAddress.phone}</p>
                                </div>
                                {order.shippingAddress.email && (
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{order.shippingAddress.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                                <p className="pt-2">📞 {order.shippingAddress.phone}</p>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.payment?.status || 'pending'}
                                    </span>
                                </div>
                                {order.payment?.method && (
                                    <div>
                                        <p className="text-sm text-gray-500">Method</p>
                                        <p className="font-medium capitalize">{order.payment.method}</p>
                                    </div>
                                )}
                                {order.payment?.razorpayPaymentId && (
                                    <div>
                                        <p className="text-sm text-gray-500">Payment ID</p>
                                        <p className="font-mono text-sm">{order.payment.razorpayPaymentId}</p>
                                    </div>
                                )}
                                {order.payment?.paidAt && (
                                    <div>
                                        <p className="text-sm text-gray-500">Paid At</p>
                                        <p className="text-sm">{formatDate(order.payment.paidAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Information */}
                        {order.shipping && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                                <div className="space-y-3">
                                    {order.shipping.awbCode && (
                                        <div>
                                            <p className="text-sm text-gray-500">AWB Code</p>
                                            <p className="font-mono text-sm">{order.shipping.awbCode}</p>
                                        </div>
                                    )}
                                    {order.shipping.courier && (
                                        <div>
                                            <p className="text-sm text-gray-500">Courier</p>
                                            <p className="font-medium">{order.shipping.courier}</p>
                                        </div>
                                    )}
                                    {order.shipping.status && (
                                        <div>
                                            <p className="text-sm text-gray-500">Shipping Status</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.shipping.status)}`}>
                                                {order.shipping.status.charAt(0).toUpperCase() + order.shipping.status.slice(1)}
                                            </span>
                                        </div>
                                    )}
                                    {order.shipping.trackingUrl && (
                                        <div>
                                            <a
                                                href={order.shipping.trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#8B6B4C] hover:underline text-sm"
                                            >
                                                Track Package →
                                            </a>
                                        </div>
                                    )}
                                    {order.shipping.estimatedDelivery && (
                                        <div>
                                            <p className="text-sm text-gray-500">Estimated Delivery</p>
                                            <p className="text-sm">{formatDate(order.shipping.estimatedDelivery)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default withAdminAuth(AdminOrderDetailsPage);