class ShiprocketAPI {
    constructor() {
        this.baseUrl = 'https://apiv2.shiprocket.in/v1';
        this.token = null;
    }

    async authenticate() {
        if (this.token) return this.token;

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
            return this.token;
        } catch (error) {
            console.error('Shiprocket authentication failed:', error);
            throw error;
        }
    }

    async trackByAWB(awbCode) {
        if (!this.token) await this.authenticate();

        try {
            const response = await fetch(
                `${this.baseUrl}/external/courier/track/awb/${awbCode}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Tracking failed');

            return data;
        } catch (error) {
            console.error('AWB tracking failed:', error);
            throw error;
        }
    }

    async trackByShipmentId(shipmentId) {
        if (!this.token) await this.authenticate();

        try {
            const response = await fetch(
                `${this.baseUrl}/external/courier/track/shipment/${shipmentId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Tracking failed');

            return data;
        } catch (error) {
            console.error('Shipment tracking failed:', error);
            throw error;
        }
    }
}

const shiprocket = new ShiprocketAPI();
export { shiprocket };