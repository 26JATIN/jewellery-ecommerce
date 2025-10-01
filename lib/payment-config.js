const paymentConfig = {
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    }
};

export default paymentConfig;