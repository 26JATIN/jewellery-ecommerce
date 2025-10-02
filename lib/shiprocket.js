class ShiprocketAPI {
    constructor() {
        this.baseUrl = 'https://apiv2.shiprocket.in/v1';
        this.token = null;
        this.tokenExpiry = null;
    }

    async authenticate() {
        // Check if token is still valid
        if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await fetch(`${this.baseUrl}/external/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: process.env.SHIPROCKET_EMAIL,
                    password: process.env.SHIPROCKET_PASSWORD
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Authentication failed');

            this.token = data.token;
            // Token typically expires in 10 days, set expiry to 9 days for safety
            this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
            
            return this.token;
        } catch (error) {
            console.error('Shiprocket authentication failed:', error);
            throw error;
        }
    }

    async makeRequest(endpoint, options = {}) {
        if (!this.token) await this.authenticate();

        const { method = 'GET', body, retries = 1 } = options;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                        ...options.headers
                    },
                    body: body ? JSON.stringify(body) : undefined
                });

                const data = await response.json();

                // If token expired, re-authenticate and retry
                if (response.status === 401 && attempt < retries) {
                    this.token = null;
                    this.tokenExpiry = null;
                    await this.authenticate();
                    continue;
                }

                if (!response.ok) {
                    console.error('Shiprocket API Error:', {
                        status: response.status,
                        statusText: response.statusText,
                        endpoint: endpoint,
                        data: data
                    });
                    throw new Error(data.message || data.error || `API call failed with status ${response.status}`);
                }

                return data;
            } catch (error) {
                if (attempt === retries) throw error;
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    // Create Order/Shipment
    async createOrder(orderData) {
        // Ensure all required fields are present and properly formatted
        const shipmentData = {
            order_id: orderData.orderId,
            order_date: orderData.orderDate,
            pickup_location: "Rajpura_Store",
            
            // Billing address (required)
            billing_customer_name: orderData.customer.name || '',
            billing_last_name: orderData.customer.lastName || '',
            billing_address: orderData.customer.address || '',
            billing_address_2: orderData.customer.address2 || '',
            billing_city: orderData.customer.city || '',
            billing_pincode: orderData.customer.pincode || '',
            billing_state: orderData.customer.state || '',
            billing_country: orderData.customer.country || 'India',
            billing_email: orderData.customer.email || '',
            billing_phone: orderData.customer.phone || '',
            
            // Shipping address (required even if same as billing)
            shipping_is_billing: false, // Set to false to provide explicit shipping details
            shipping_customer_name: orderData.customer.name || '',
            shipping_last_name: orderData.customer.lastName || '',
            shipping_address: orderData.customer.address || '',
            shipping_address_2: orderData.customer.address2 || '',
            shipping_city: orderData.customer.city || '',
            shipping_pincode: orderData.customer.pincode || '',
            shipping_state: orderData.customer.state || '',
            shipping_country: orderData.customer.country || 'India',
            shipping_email: orderData.customer.email || '',
            shipping_phone: orderData.customer.phone || '',
            
            // Order details
            order_items: orderData.items.map(item => ({
                name: item.name || 'Product',
                sku: item.sku || 'SKU-001',
                units: parseInt(item.quantity) || 1,
                selling_price: parseFloat(item.price) || 0,
                discount: 0,
                tax: 0,
                hsn: 711319 // Default HSN for jewelry
            })),
            
            // Payment and charges
            payment_method: orderData.paymentMethod === "COD" ? "COD" : "Prepaid",
            shipping_charges: parseFloat(orderData.shippingCharges) || 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: parseFloat(orderData.discount) || 0,
            sub_total: parseFloat(orderData.subtotal) || 0,
            
            // Package dimensions
            length: parseFloat(orderData.dimensions.length) || 10,
            breadth: parseFloat(orderData.dimensions.breadth) || 10,
            height: parseFloat(orderData.dimensions.height) || 5,
            weight: parseFloat(orderData.weight) || 0.5
        };

        console.log('Creating Shiprocket order with data:', JSON.stringify(shipmentData, null, 2));

        // Validate critical fields before sending
        const requiredFields = [
            'billing_customer_name', 'billing_address', 'billing_city', 
            'billing_pincode', 'billing_state', 'billing_phone',
            'shipping_customer_name', 'shipping_address', 'shipping_city',
            'shipping_pincode', 'shipping_state', 'shipping_phone'
        ];

        for (const field of requiredFields) {
            if (!shipmentData[field] || shipmentData[field].trim() === '') {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        return await this.makeRequest('/external/orders/create/adhoc', {
            method: 'POST',
            body: shipmentData
        });
    }

    // Get Available Couriers
    async getAvailableCouriers(pickupPostcode, deliveryPostcode, weight, codAmount = 0) {
        const params = new URLSearchParams({
            pickup_postcode: pickupPostcode,
            delivery_postcode: deliveryPostcode,
            weight: weight,
            cod: codAmount > 0 ? 1 : 0
        });

        return await this.makeRequest(`/external/courier/serviceability/?${params}`);
    }

    // Assign AWB (Air Waybill)
    async assignAWB(shipmentId, courierId) {
        return await this.makeRequest('/external/courier/assign/awb', {
            method: 'POST',
            body: {
                shipment_id: shipmentId,
                courier_id: courierId
            }
        });
    }

    // Generate Pickup Request
    async generatePickup(shipmentIds) {
        return await this.makeRequest('/external/courier/generate/pickup', {
            method: 'POST',
            body: {
                shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
            }
        });
    }

    // Track by AWB Code
    async trackByAWB(awbCode) {
        return await this.makeRequest(`/external/courier/track/awb/${awbCode}`);
    }

    // Track by Shipment ID
    async trackByShipmentId(shipmentId) {
        return await this.makeRequest(`/external/courier/track/shipment/${shipmentId}`);
    }

    // Get All Orders
    async getOrders(page = 1, perPage = 50) {
        const params = new URLSearchParams({
            page: page,
            per_page: perPage
        });

        return await this.makeRequest(`/external/orders?${params}`);
    }

    // Cancel Shipment
    async cancelShipment(awbCodes) {
        return await this.makeRequest('/external/orders/cancel/shipment/awbs', {
            method: 'POST',
            body: {
                awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes]
            }
        });
    }

    // Generate Label
    async generateLabel(shipmentIds) {
        return await this.makeRequest('/external/courier/generate/label', {
            method: 'POST',
            body: {
                shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
            }
        });
    }

    // Generate Invoice
    async generateInvoice(orderIds) {
        return await this.makeRequest('/external/orders/print/invoice', {
            method: 'POST',
            body: {
                ids: Array.isArray(orderIds) ? orderIds : [orderIds]
            }
        });
    }

    // Get NDR (Non-Delivery Report)
    async getNDR(awbCode) {
        return await this.makeRequest(`/external/ndr?awb=${awbCode}`);
    }

    // Update NDR Action
    async updateNDRAction(awbCode, action, comment = '') {
        return await this.makeRequest('/external/ndr/action', {
            method: 'POST',
            body: {
                awb: awbCode,
                action: action, // 're-attempt', 'return'
                comment: comment
            }
        });
    }
}

const shiprocket = new ShiprocketAPI();
export { shiprocket };