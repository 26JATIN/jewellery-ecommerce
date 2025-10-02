import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: String,
            required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    payment: {
        id: String,
        orderId: String,
        signature: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        paidAt: Date
    },
    shipping: {
        shipmentId: String,
        awbCode: String,
        courier: String,
        trackingUrl: String,
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        currentLocation: String,
        eta: Date,
        trackingHistory: [{
            activity: String,
            location: String,
            timestamp: Date,
            statusCode: String
        }],
        lastUpdateAt: Date
    }
}, {
    timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);