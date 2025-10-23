import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        category: String,
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            default: null
        },
        // Variant support
        variantId: {
            type: String,
            default: null
        },
        selectedVariant: {
            sku: String,
            optionCombination: {
                type: Map,
                of: String
            },
            price: {
                mrp: Number,
                costPrice: Number,
                sellingPrice: Number
            }
        }
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
    coupon: {
        code: {
            type: String,
            uppercase: true
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        originalTotal: {
            type: Number
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
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
    refundDetails: {
        refundAmount: Number,
        refundDate: Date,
        refundMethod: String,
        refundReason: String,
        refundType: String,
        razorpayRefundId: String,
        returnId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Return'
        }
    },
    shipping: {
        shipmentId: String,
        shiprocketOrderId: String,  // sr_order_id from webhook
        awbCode: String,
        awbAssignedDate: Date,
        scheduledPickupDate: Date,
        estimatedDelivery: Date,
        courier: String,
        trackingUrl: String,
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'pending_courier', 'pending_balance'],
            default: 'pending'
        },
        currentLocation: String,
        eta: Date,
        trackingHistory: [{
            activity: String,
            location: String,
            timestamp: Date,
            statusCode: String,
            statusLabel: String,
            scanStatus: String
        }],
        lastUpdateAt: Date,
        errorMessage: String
    },
    // Inventory management log
    inventoryLog: [{
        action: {
            type: String,
            enum: ['reserve', 'restore'],
            required: true
        },
        reason: String, // 'payment_failed', 'refund', 'order_cancelled'
        totalItemsReserved: Number,
        totalItemsRestored: Number,
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: [{
            productId: mongoose.Schema.Types.ObjectId,
            productName: String,
            sku: String,
            quantityReserved: Number,
            quantityRestored: Number,
            previousStock: Number,
            newStock: Number
        }],
        errors: mongoose.Schema.Types.Mixed
    }]
}, {
    timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);