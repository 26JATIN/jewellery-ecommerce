import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addresses: [{
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: false
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
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Create indexes for better query performance
userSchema.index({ phone: 1 }, { unique: true }); // Unique phone index
userSchema.index({ email: 1 }, { sparse: true }); // Sparse index for optional email
userSchema.index({ isAdmin: 1 }); // For admin queries
userSchema.index({ isActive: 1 }); // For active user queries
userSchema.index({ createdAt: -1 }); // For user listing by registration date

export default mongoose.models.User || mongoose.model('User', userSchema);