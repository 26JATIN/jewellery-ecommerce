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

    // ============= REVERSE PICKUP / RETURNS FUNCTIONALITY =============

    // Create Reverse Pickup Order for Returns
    async createReversePickup(returnData) {
        const reversePickupData = {
            order_id: returnData.returnNumber,
            order_date: returnData.returnDate,
            pickup_location: "Primary", // Your default pickup location
            
            // Customer details (where to pick up from)
            billing_customer_name: returnData.customer.name || '',
            billing_last_name: returnData.customer.lastName || '',
            billing_address: returnData.customer.address || '',
            billing_address_2: returnData.customer.address2 || '',
            billing_city: returnData.customer.city || '',
            billing_pincode: returnData.customer.pincode || '',
            billing_state: returnData.customer.state || '',
            billing_country: returnData.customer.country || 'India',
            billing_email: returnData.customer.email || '',
            billing_phone: returnData.customer.phone || '',
            
            // Shipping details (your warehouse - where items should be delivered)
            shipping_is_billing: false,
            shipping_customer_name: "Jewellery Store Returns",
            shipping_last_name: "Team",
            shipping_address: process.env.WAREHOUSE_ADDRESS || "Your Warehouse Address",
            shipping_address_2: process.env.WAREHOUSE_ADDRESS_2 || "",
            shipping_city: process.env.WAREHOUSE_CITY || "Your City",
            shipping_pincode: process.env.WAREHOUSE_PINCODE || "110001",
            shipping_state: process.env.WAREHOUSE_STATE || "Your State",
            shipping_country: "India",
            shipping_email: process.env.WAREHOUSE_EMAIL || "returns@yourstore.com",
            shipping_phone: process.env.WAREHOUSE_PHONE || "9999999999",
            
            // Return items
            order_items: returnData.items.map(item => ({
                name: item.name || 'Return Item',
                sku: `RET-${item.sku || 'ITEM'}`,
                units: parseInt(item.quantity) || 1,
                selling_price: parseFloat(item.price) || 0,
                discount: 0,
                tax: 0,
                hsn: 711319 // HSN for jewelry
            })),
            
            // Payment details for reverse pickup
            payment_method: "Prepaid", // Returns are typically prepaid by merchant
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: parseFloat(returnData.totalValue) || 0,
            
            // Package dimensions
            length: parseFloat(returnData.dimensions?.length) || 15,
            breadth: parseFloat(returnData.dimensions?.breadth) || 10,
            height: parseFloat(returnData.dimensions?.height) || 5,
            weight: parseFloat(returnData.weight) || 0.5,
            
            // Special instructions for reverse pickup
            reseller_name: "Return Pickup",
            company_name: "Jewellery Store Returns"
        };

        console.log('Creating reverse pickup with data:', JSON.stringify(reversePickupData, null, 2));

        // Validate required fields for reverse pickup
        const requiredFields = [
            'billing_customer_name', 'billing_address', 'billing_city', 
            'billing_pincode', 'billing_state', 'billing_phone',
            'shipping_customer_name', 'shipping_address', 'shipping_city',
            'shipping_pincode', 'shipping_state', 'shipping_phone'
        ];

        for (const field of requiredFields) {
            if (!reversePickupData[field] || reversePickupData[field].trim() === '') {
                throw new Error(`Missing required field for reverse pickup: ${field}`);
            }
        }

        return await this.makeRequest('/external/orders/create/return', {
            method: 'POST',
            body: reversePickupData
        });
    }

    // Create Forward Order for Reverse Pickup (Alternative method)
    async createForwardOrderForReturn(returnData) {
        // Some logistics providers require creating a forward order 
        // from customer to warehouse for returns
        return await this.createOrder(returnData);
    }

    // Schedule Return Pickup
    async scheduleReturnPickup(returnShipmentId, pickupDate) {
        return await this.makeRequest('/external/courier/generate/pickup', {
            method: 'POST',
            body: {
                shipment_id: Array.isArray(returnShipmentId) ? returnShipmentId : [returnShipmentId],
                pickup_date: pickupDate || new Date().toISOString().split('T')[0]
            }
        });
    }

    // Get Return Tracking
    async trackReturnByAWB(awbCode) {
        return await this.trackByAWB(awbCode);
    }

    // Get Return Tracking by Shipment ID
    async trackReturnByShipmentId(shipmentId) {
        return await this.trackByShipmentId(shipmentId);
    }

    // Cancel Return Pickup
    async cancelReturnPickup(awbCodes) {
        return await this.cancelShipment(awbCodes);
    }

    // Request RTO (Return to Origin) for existing shipment
    async requestRTO(awbCode, reason = 'Customer return request') {
        return await this.makeRequest('/external/orders/cancel/shipment/awbs', {
            method: 'POST',
            body: {
                awbs: Array.isArray(awbCode) ? awbCode : [awbCode],
                comment: reason
            }
        });
    }

    // Get Available Couriers for Return
    async getReturnCouriers(fromPincode, toPincode, weight) {
        return await this.getAvailableCouriers(fromPincode, toPincode, weight, 0);
    }

    // Assign Courier for Return
    async assignReturnCourier(shipmentId, courierId) {
        return await this.assignAWB(shipmentId, courierId);
    }
}

const shiprocket = new ShiprocketAPI();
export { shiprocket };