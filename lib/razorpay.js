import Razorpay from 'razorpay';

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {object} notes - Additional notes for the order
 * @returns {Promise<object>} Razorpay order object
 */
export async function createRazorpayOrder(amount, currency = 'INR', notes = {}) {
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes,
        };

        const order = await razorpayInstance.orders.create(options);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw new Error('Failed to create payment order');
    }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(orderId + '|' + paymentId)
        .digest('hex');
    
    return generated_signature === signature;
}

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
export async function fetchPaymentDetails(paymentId) {
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
}

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in smallest currency unit (optional, full refund if not specified)
 * @returns {Promise<object>} Refund object
 */
export async function createRefund(paymentId, amount = null) {
    try {
        const options = amount ? { amount: Math.round(amount * 100) } : {};
        const refund = await razorpayInstance.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error('Error creating refund:', error);
        throw new Error('Failed to create refund');
    }
}
