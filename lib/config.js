const config = {
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    },
    mongodb: {
        uri: process.env.MONGODB_URI
    },
    jwt: {
        secret: process.env.JWT_SECRET
    }
};

export default config;