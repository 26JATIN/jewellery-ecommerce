import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
    returnNumber: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        quantity: Number,
        reason: String
    }],
    status: {
        type: String,
        enum: ['requested', 'pickup_scheduled', 'in_transit', 'returned_to_seller', 'received', 'completed', 'cancelled'],
        default: 'requested'
    },
    shiprocketReturnId: String,
    shiprocketReturnAwb: String,
    shiprocketReturnShipmentId: String,
    courierName: String,
    trackingUrl: String,
    estimatedPickupDate: String,
    // Bank details for refund
    refundDetails: {
        accountName: String,
        accountNumber: String,
        ifsc: String,
        bankName: String,
    },
    refundRequestedAt: Date,
    refundProcessedAt: Date,
    refundSucceeded: {
        type: Boolean,
        default: false
    },
    notes: String,
}, { timestamps: true });

// Indexes
returnSchema.index({ returnNumber: 1 }, { unique: true });
returnSchema.index({ userId: 1, createdAt: -1 });
returnSchema.index({ orderId: 1 });

// Generate return number before validation
returnSchema.pre('validate', async function(next) {
    if (this.isNew && !this.returnNumber) {
        try {
            const count = await mongoose.model('Return').countDocuments();
            this.returnNumber = `RET${Date.now()}${String(count + 1).padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating return number:', error);
        }
    }
    next();
});

export default mongoose.models.Return || mongoose.model('Return', returnSchema);
