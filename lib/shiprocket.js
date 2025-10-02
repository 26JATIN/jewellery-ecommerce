
class ShiprocketAPI {
    constructor() {
        this.baseUrl = 'https://apiv2.shiprocket.in/v1';
        this.token = null;
        this.tokenExpiry = null;
    }

    async authenticate() {
        try {
            // Check if token exists and is not expired
            if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.token;
            }

            const response = await fetch(`${this.baseUrl}/external/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: process.env.SHIPROCKET_EMAIL,
                    password: process.env.SHIPROCKET_PASSWORD
                }),
                cache: 'no-store' // Disable caching for authentication
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Authentication failed');
            }

            const data = await response.json();
            this.token = data.token;
            // Set token expiry to 23 hours (Shiprocket tokens last 24 hours)
            this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
            return this.token;
        } catch (error) {
            console.error('Shiprocket authentication failed:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        if (!this.token) {
            await this.authenticate();
        }

        try {
            const response = await fetch(`${this.baseUrl}/external/orders/create/adhoc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create order');
            }

            return await response.json();
        } catch (error) {
            console.error('Shiprocket order creation failed:', error);
            throw error;
        }
    }

    async trackOrder(shipmentId) {
        if (!this.token) {
            await this.authenticate();
        }

        try {
            const response = await fetch(`${this.baseUrl}/external/courier/track/shipment/${shipmentId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to track order');
            }

            return await response.json();
        } catch (error) {
            console.error('Shiprocket tracking failed:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const shiprocket = new ShiprocketAPI();
export { shiprocket };