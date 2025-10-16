import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
    // Reference to the original order
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    
    // Customer who initiated the return
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Return request details
    returnNumber: {
        type: String,
        unique: true,
        required: true
    },
    
    // Items being returned (subset of original order items)
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: String,
        // Return reason for each item
        returnReason: {
            type: String,
            enum: [
                'defective_product',
                'wrong_item_delivered',
                'product_damaged',
                'poor_quality',
                'not_as_described',
                'size_fitting_issue',
                'ordered_by_mistake',
                'better_price_available',
                'no_longer_needed',
                'delivery_delayed',
                'admin_initiated', // Added for admin-initiated returns
                'other'
            ],
            required: true
        },
        // Detailed reason provided by customer
        detailedReason: String,
        // Condition of item being returned
        itemCondition: {
            type: String,
            enum: ['unused', 'lightly_used', 'damaged', 'defective', 'unknown'], // Added 'unknown' for admin cases
            default: 'unused'
        }
    }],
    
    // Return status workflow
    status: {
        type: String,
        enum: [
            'requested',        // Customer initiated return
            'pending_approval', // Waiting for admin approval
            'approved',         // Return approved by admin
            'rejected',         // Return rejected by admin
            'pickup_scheduled', // Pickup scheduled with courier
            'picked_up',        // Item picked up from customer
            'in_transit',       // Item in transit to warehouse
            'received',         // Item received at warehouse
            'inspected',        // Item inspected for condition
            'approved_refund',  // Refund approved after inspection
            'rejected_refund',  // Refund rejected after inspection
            'refund_processed', // Refund completed
            'completed',        // Return process completed
            'cancelled'         // Return cancelled
        ],
        default: 'requested'
    },
    
    // Return policy compliance
    returnWindow: {
        orderDate: Date,
        returnRequestDate: {
            type: Date,
            default: Date.now
        },
        allowedReturnDays: {
            type: Number,
            default: 10 // 10 days for jewelry as per policy
        },
        isWithinWindow: {
            type: Boolean,
            default: true
        }
    },
    
    // Financial details
    refundDetails: {
        originalAmount: {
            type: Number,
            required: true
        },
        returnShippingCost: {
            type: Number,
            default: 0
        },
        restockingFee: {
            type: Number,
            default: 0
        },
        refundAmount: Number, // Final refund amount after deductions
        refundMethod: {
            type: String,
            enum: ['original_payment', 'bank_transfer', 'store_credit'],
            default: 'original_payment'
        },
        refundProcessedAt: Date,
        refundTransactionId: String
    },
    
    // Pickup and logistics
    pickup: {
        // Shiprocket integration
        shipmentId: String,
        awbCode: String,
        courier: String,
        trackingUrl: String,
        
        // Pickup scheduling
        scheduledDate: Date,
        scheduledTimeSlot: String,
        actualPickupDate: Date,
        
        // Pickup address (usually same as delivery address)
        address: {
            fullName: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            postalCode: String,
            country: { type: String, default: 'India' },
            phone: String
        },
        
        // Pickup status
        pickupStatus: {
            type: String,
            enum: ['pending', 'scheduled', 'attempted', 'completed', 'failed'],
            default: 'pending'
        },
        
        // Pickup instructions from customer
        specialInstructions: String
    },
    
    // Quality inspection at warehouse
    inspection: {
        inspectedBy: String, // Admin/staff member
        inspectedAt: Date,
        condition: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'damaged']
        },
        notes: String,
        photos: [String], // URLs to inspection photos
        approved: Boolean,
        rejectionReason: String
    },
    
    // Admin notes and communication
    adminNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Customer communication
    customerMessages: [{
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        isFromCustomer: {
            type: Boolean,
            default: true
        }
    }],
    
    // Return tracking
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: String
    }],
    
    // Policy and eligibility
    eligibility: {
        isEligible: {
            type: Boolean,
            default: true
        },
        eligibilityReason: String,
        checkedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        checkedAt: Date
    },
    
    // Return completion
    completedAt: Date,
    completionNotes: String,
    
    // Metadata
    source: {
        type: String,
        enum: ['website', 'mobile_app', 'customer_service', 'admin'],
        default: 'website'
    },
    
    // Customer satisfaction
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        submittedAt: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
returnSchema.index({ order: 1 });
returnSchema.index({ user: 1 });
// returnNumber already has unique index from field definition
returnSchema.index({ status: 1 });
returnSchema.index({ 'returnWindow.returnRequestDate': 1 });
returnSchema.index({ 'pickup.scheduledDate': 1 });

// Pre-save middleware to generate return number
returnSchema.pre('save', async function(next) {
    if (this.isNew && !this.returnNumber) {
        try {
            // Use this.constructor to avoid circular reference
            const count = await this.constructor.countDocuments();
            this.returnNumber = `RET${Date.now()}${String(count + 1).padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating return number:', error);
            // Fallback to timestamp-based number
            this.returnNumber = `RET${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        }
    }
    
    // Update status history
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            updatedBy: this.modifiedBy || null
        });
    }
    
    next();
});

// Virtual for return age in days
returnSchema.virtual('returnAge').get(function() {
    const now = new Date();
    const requestDate = this.returnWindow.returnRequestDate;
    return Math.floor((now - requestDate) / (1000 * 60 * 60 * 24));
});

// Virtual for eligibility check
returnSchema.virtual('isCurrentlyEligible').get(function() {
    if (!this.eligibility.isEligible) return false;
    
    const daysSinceOrder = Math.floor(
        (this.returnWindow.returnRequestDate - this.returnWindow.orderDate) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceOrder <= this.returnWindow.allowedReturnDays;
});

// Methods
returnSchema.methods.updateStatus = function(newStatus, updatedBy, note = '') {
    this.status = newStatus;
    this.modifiedBy = updatedBy;
    
    if (note) {
        this.statusHistory[this.statusHistory.length - 1].note = note;
    }
    
    // Set completion date for final statuses
    if (['completed', 'cancelled', 'refund_processed'].includes(newStatus)) {
        this.completedAt = new Date();
    }
    
    return this.save();
};

returnSchema.methods.calculateRefundAmount = function() {
    const originalAmount = this.refundDetails.originalAmount;
    const returnShippingCost = this.refundDetails.returnShippingCost || 0;
    const restockingFee = this.refundDetails.restockingFee || 0;
    
    this.refundDetails.refundAmount = Math.max(0, originalAmount - returnShippingCost - restockingFee);
    return this.refundDetails.refundAmount;
};

returnSchema.methods.canBeReturned = function() {
    const now = new Date();
    const orderDate = this.returnWindow.orderDate;
    const daysSinceOrder = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    
    return daysSinceOrder <= this.returnWindow.allowedReturnDays && this.eligibility.isEligible;
};

// Static methods
returnSchema.statics.getReturnPolicyForCategory = function(category) {
    // Define return policy based on product category
    const policies = {
        'jewelry': { days: 10, allowedReasons: ['defective_product', 'wrong_item_delivered', 'not_as_described', 'size_fitting_issue'] },
        'electronics': { days: 7, allowedReasons: ['defective_product', 'wrong_item_delivered', 'not_as_described'] },
        'clothing': { days: 15, allowedReasons: ['size_fitting_issue', 'not_as_described', 'defective_product', 'wrong_item_delivered'] },
        'default': { days: 10, allowedReasons: ['defective_product', 'wrong_item_delivered', 'not_as_described'] }
    };
    
    return policies[category] || policies.default;
};

returnSchema.statics.getPendingReturns = function() {
    return this.find({
        status: { $in: ['requested', 'pending_approval', 'approved', 'pickup_scheduled'] }
    }).populate('order user').sort({ createdAt: -1 });
};

export default mongoose.models.Return || mongoose.model('Return', returnSchema);