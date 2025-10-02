import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const cookieStore = cookies();
        const token = await cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderId } = await req.json();
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Format order data for Shiprocket
        const shiprocketOrder = {
            order_id: order._id,
            order_date: order.createdAt,
            pickup_location: "Primary",
            billing_customer_name: order.shippingAddress.fullName,
            billing_address: order.shippingAddress.addressLine1,
            billing_address_2: order.shippingAddress.addressLine2,
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.postalCode,
            billing_state: order.shippingAddress.state,
            billing_country: order.shippingAddress.country,
            billing_phone: order.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: order.items.map(item => ({
                name: item.name,
                sku: item._id,
                units: item.quantity,
                selling_price: item.price,
            })),
            payment_method: "prepaid",
            sub_total: order.totalAmount,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        const shipment = await shiprocket.createOrder(shiprocketOrder);

        // Update order with shipping details
        order.shipping = {
            shipmentId: shipment.shipment_id,
            trackingNumber: shipment.awb_code,
            courier: shipment.courier_name,
            status: 'Processing',
            trackingUrl: shipment.tracking_url
        };

        await order.save();

        return NextResponse.json(order);
    } catch (error) {
        console.error('Shipping creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create shipment' },
            { status: 500 }
        );
    }
}