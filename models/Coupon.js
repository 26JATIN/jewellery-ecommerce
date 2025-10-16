import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minimumOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },
    maximumDiscountAmount: {
        type: Number,
        default: null, // null means no maximum limit
        min: 0
    },
    validFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited usage
        min: 1
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    userUsageLimit: {
        type: Number,
        default: 1, // How many times a single user can use this coupon
        min: 1
    },
    applicableCategories: [{
        type: String,
        enum: ['Diamond', 'Gold', 'Silver', 'Wedding', 'Vintage', 'Contemporary', 'Traditional']
    }],
    excludedCategories: [{
        type: String,
        enum: ['Diamond', 'Gold', 'Silver', 'Wedding', 'Vintage', 'Contemporary', 'Traditional']
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    firstTimeUserOnly: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        discountApplied: Number
    }]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for faster lookups
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function() {
    const now = new Date();
    return this.isActive && 
           this.validFrom <= now && 
           this.validUntil >= now &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
    if (!this.isCurrentlyValid) return false;
    
    const userUsageCount = this.usageHistory.filter(
        usage => usage.userId.toString() === userId.toString()
    ).length;
    
    return userUsageCount < this.userUsageLimit;
};

// Method to calculate discount for given cart
couponSchema.methods.calculateDiscount = function(cartItems, cartTotal) {
    if (!this.isCurrentlyValid) {
        return { valid: false, error: 'Coupon is not valid' };
    }

    if (cartTotal < this.minimumOrderValue) {
        return { 
            valid: false, 
            error: `Minimum order value of ₹${this.minimumOrderValue} required` 
        };
    }

    // Check category restrictions
    if (this.applicableCategories.length > 0) {
        const hasApplicableItems = cartItems.some(item => 
            this.applicableCategories.includes(item.category)
        );
        if (!hasApplicableItems) {
            return { 
                valid: false, 
                error: `Coupon only applicable to ${this.applicableCategories.join(', ')} items` 
            };
        }
    }

    if (this.excludedCategories.length > 0) {
        const eligibleTotal = cartItems
            .filter(item => !this.excludedCategories.includes(item.category))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (eligibleTotal === 0) {
            return { 
                valid: false, 
                error: `Coupon not applicable to ${this.excludedCategories.join(', ')} items` 
            };
        }
        cartTotal = eligibleTotal;
    }

    let discountAmount = 0;
    
    if (this.discountType === 'percentage') {
        discountAmount = (cartTotal * this.discountValue) / 100;
        
        // Apply maximum discount limit if set
        if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
            discountAmount = this.maximumDiscountAmount;
        }
    } else {
        discountAmount = this.discountValue;
        
        // Don't allow discount to exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }
    }

    return {
        valid: true,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        finalTotal: cartTotal - discountAmount,
        discountType: this.discountType,
        discountValue: this.discountValue
    };
};

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);