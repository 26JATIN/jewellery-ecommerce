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

/**
 * Process refund through Razorpay
 * @param {string} paymentId - Razorpay payment ID to refund
 * @param {number} amount - Amount to refund (in INR, will be converted to paise)
 * @param {object} options - Additional refund options
 * @returns {Promise<object>} Razorpay refund object
 */
export const processRefund = async (paymentId, amount, options = {}) => {
    try {
        if (!paymentId) {
            throw new Error('Payment ID is required for refund');
        }

        if (!amount || amount <= 0) {
            throw new Error('Valid refund amount is required');
        }

        const instance = getRazorpayInstance();
        
        const refundData = {
            amount: Math.round(amount * 100), // Convert to paise
            speed: options.speed || 'normal', // 'normal' or 'optimum'
            notes: options.notes || {},
            receipt: options.receipt || `refund_${Date.now()}`
        };

        console.log('Processing Razorpay refund:', {
            paymentId,
            amount: refundData.amount / 100,
            speed: refundData.speed
        });

        const refund = await instance.payments.refund(paymentId, refundData);
        
        console.log('Razorpay refund successful:', {
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount / 100
        });

        return refund;
    } catch (error) {
        console.error('Razorpay refund failed:', {
            paymentId,
            amount,
            error: error.message,
            details: error.error || error
        });
        throw error;
    }
};

/**
 * Fetch refund status from Razorpay
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<object>} Refund details
 */
export const getRefundStatus = async (refundId) => {
    try {
        const instance = getRazorpayInstance();
        const refund = await instance.refunds.fetch(refundId);
        return refund;
    } catch (error) {
        console.error('Failed to fetch refund status:', error);
        throw error;
    }
};

/**
 * Get all refunds for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Refunds list
 */
export const getPaymentRefunds = async (paymentId) => {
    try {
        const instance = getRazorpayInstance();
        const refunds = await instance.payments.fetchMultipleRefund(paymentId);
        return refunds;
    } catch (error) {
        console.error('Failed to fetch payment refunds:', error);
        throw error;
    }
};