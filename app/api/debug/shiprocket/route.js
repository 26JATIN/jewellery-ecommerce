import { NextResponse } from 'next/server';
import { shiprocket } from '@/lib/shiprocket';

export async function POST() {
    try {
        // Test with minimal valid data according to Shiprocket docs
        const testOrderData = {
            order_id: "TEST-" + Date.now(),
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "Primary",
            
            // Billing Address
            billing_customer_name: "Test",
            billing_last_name: "Customer",
            billing_address: "123 Test Street",
            billing_address_2: "",
            billing_city: "Delhi",
            billing_pincode: "110001",
            billing_state: "Delhi",
            billing_country: "India",
            billing_email: "test@example.com",
            billing_phone: "6230378893",
            
            // Shipping Address (explicit)
            shipping_is_billing: false,
            shipping_customer_name: "Test",
            shipping_last_name: "Customer", 
            shipping_address: "123 Test Street",
            shipping_address_2: "",
            shipping_city: "Delhi",
            shipping_pincode: "110001",
            shipping_state: "Delhi",
            shipping_country: "India",
            shipping_email: "test@example.com",
            shipping_phone: "6230378893",
            
            // Order Items
            order_items: [{
                name: "Test Product",
                sku: "TEST-SKU",
                units: 1,
                selling_price: 100,
                discount: 0,
                tax: 0,
                hsn: 711319
            }],
            
            // Payment and Pricing
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: 100,
            
            // Package Details
            length: 10,
            breadth: 10,
            height: 5,
            weight: 0.5
        };

        console.log('Testing minimal Shiprocket payload:', JSON.stringify(testOrderData, null, 2));

        const response = await shiprocket.makeRequest('/external/orders/create/adhoc', {
            method: 'POST',
            body: testOrderData
        });

        return NextResponse.json({
            success: true,
            message: 'Test order created successfully',
            data: response
        });
    } catch (error) {
        console.error('Shiprocket test error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                details: 'Failed to create test order'
            },
            { status: 500 }
        );
    }
}