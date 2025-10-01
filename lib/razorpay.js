import Razorpay from 'razorpay';

const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        console.error('Environment variables:', {
            key_id: !!key_id,
            key_secret: !!key_secret
        });
        throw new Error('Razorpay credentials are not configured');
    }

    return new Razorpay({
        key_id,
        key_secret
    });
};

export const createPaymentOrder = async (amount) => {
    try {
        const instance = getRazorpayInstance();
        
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `order_${Date.now()}`,
            payment_capture: 1
        };

        const order = await instance.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        throw error;
    }
};