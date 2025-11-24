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
    // Metal type filter - simpler than category selection
    applicableMetalType: {
        type: String,
        enum: ['all', 'gold', 'silver'],
        default: 'all'
    },
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
couponSchema.methods.calculateDiscount = async function(cartItems, cartTotal) {
    if (!this.isCurrentlyValid) {
        return { valid: false, error: 'Coupon is not valid' };
    }

    if (cartTotal < this.minimumOrderValue) {
        return { 
            valid: false, 
            error: `Minimum order value of ₹${this.minimumOrderValue} required` 
        };
    }

    // Check metal type restrictions (simpler than category-based)
    if (this.applicableMetalType && this.applicableMetalType !== 'all') {
        console.log('Checking metal type restriction:', this.applicableMetalType);
        console.log('Cart items metal types:', cartItems.map(item => ({ name: item.name, metalType: item.metalType })));
        
        const hasApplicableItems = cartItems.some(item => {
            // Check if item's metal type matches coupon's metal type
            // Products have metalType field (e.g., 'gold', 'silver')
            const matches = item.metalType && item.metalType.toLowerCase() === this.applicableMetalType.toLowerCase();
            console.log(`Item "${item.name}": metalType="${item.metalType}" matches=${matches}`);
            return matches;
        });
        
        console.log('Has applicable items:', hasApplicableItems);
        
        if (!hasApplicableItems) {
            return { 
                valid: false, 
                error: `Coupon only applicable to ${this.applicableMetalType} jewelry` 
            };
        }
        
        // Calculate total only from applicable items
        cartTotal = cartItems
            .filter(item => item.metalType && item.metalType.toLowerCase() === this.applicableMetalType.toLowerCase())
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
        console.log('Filtered cart total:', cartTotal);
            
        if (cartTotal === 0) {
            return { 
                valid: false, 
                error: `Coupon only applicable to ${this.applicableMetalType} jewelry` 
            };
        }
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