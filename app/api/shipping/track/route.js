import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import Order from '@/models/Order';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Check if user is admin
        await connectDB();
        const user = await User.findById(decoded.userId);
        if (!user?.isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { orderId } = await req.json();
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Create Shiprocket order data
        const shipmentData = {
            order_id: order._id.toString(),
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "Primary",
            billing_customer_name: order.shippingAddress.fullName,
            billing_address: order.shippingAddress.addressLine1,
            billing_address_2: order.shippingAddress.addressLine2 || "",
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.postalCode,
            billing_state: order.shippingAddress.state,
            billing_country: order.shippingAddress.country,
            billing_phone: order.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: order.items.map(item => ({
                name: item.name,
                sku: item._id.toString(),
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 0
            })),
            payment_method: "Prepaid",
            sub_total: order.totalAmount,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        // Make request to Shiprocket API
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
            },
            body: JSON.stringify(shipmentData)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Shiprocket API Error:', data);
            throw new Error(data.message || 'Failed to create shipment');
        }

        // Update order with shipping details
        const shippingUpdate = {
            shipmentId: data.shipment_id,
            awbCode: data.awb_code,
            courier: data.courier_name,
            trackingUrl: `https://shiprocket.co/tracking/${data.awb_code}`,
            status: 'processing',
            createdAt: new Date()
        };

        order.shipping = shippingUpdate;
        await order.save();

        return NextResponse.json({
            success: true,
            order: order,
            shipping: shippingUpdate
        });
    } catch (error) {
        console.error('Shipping creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create shipment' },
            { status: 500 }
        );
    }
}