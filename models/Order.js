import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        image: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        selectedVariant: {
            name: String,
            value: String,
            price: Number,
            image: String
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
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
        pincode: {
            type: String,
            required: true
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true,
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'],
        default: 'pending'
    },
    // Razorpay payment fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
    // Refund fields
    razorpayRefundId: String,
    refundStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: null
    },
    refundAmount: Number,
    refundDate: Date,
    // Shiprocket integration fields
    shiprocketOrderId: String,
    shiprocketShipmentId: String,
    awbCode: String,
    courierName: String,
    trackingUrl: String,
    estimatedDeliveryDate: String,
    notes: String
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before validation
orderSchema.pre('validate', async function(next) {
    if (this.isNew && !this.orderNumber) {
        try {
            const count = await mongoose.model('Order').countDocuments();
            this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating order number:', error);
        }
    }
    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
