export const validateShiprocketToken = async () => {
    try {
        const response = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
            headers: {
                'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};