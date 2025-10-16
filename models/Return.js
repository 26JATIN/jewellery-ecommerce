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
        unique: true
        // Not marked as required since it's auto-generated in pre-save hook
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
        orderItemId: String, // Track which specific order item this return is for
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
        deliveryDate: Date,
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
            enum: ['pending', 'scheduled', 'attempted', 'completed', 'failed', 'not_required'],
            default: 'pending'
        },
        
        // Pickup instructions from customer
        specialInstructions: String,
        
        // Tracking details
        currentLocation: String,
        lastUpdateAt: Date,
        deliveredToWarehouse: Date,
        trackingHistory: [{
            activity: String,
            location: String,
            timestamp: Date,
            statusCode: String
        }]
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
returnSchema.index({ order: 1 });
returnSchema.index({ user: 1 });
// returnNumber already has unique index from field definition
returnSchema.index({ status: 1 });
returnSchema.index({ 'returnWindow.returnRequestDate': 1 });
returnSchema.index({ 'pickup.scheduledDate': 1 });

// Compound indexes for common query patterns
returnSchema.index({ user: 1, status: 1 }); // User returns filtered by status
returnSchema.index({ user: 1, createdAt: -1 }); // User's recent returns
returnSchema.index({ status: 1, createdAt: -1 }); // Admin dashboard queries
returnSchema.index({ 'pickup.pickupStatus': 1, 'pickup.scheduledDate': 1 }); // Pickup scheduling
returnSchema.index({ order: 1, createdAt: -1 }); // Order return history

// Compound unique index to prevent duplicate active returns for same order
// This prevents race conditions when creating multiple returns simultaneously
returnSchema.index(
    { order: 1, status: 1 }, 
    { 
        unique: true,
        partialFilterExpression: { 
            status: { 
                $nin: ['cancelled', 'completed'] 
            } 
        },
        name: 'unique_active_return_per_order'
    }
);

// Pre-save middleware to generate return number
returnSchema.pre('save', async function(next) {
    if (this.isNew && !this.returnNumber) {
        try {
            // Get the model from the connection to avoid circular reference
            const ReturnModel = mongoose.model('Return');
            const count = await ReturnModel.countDocuments();
            this.returnNumber = `RET${Date.now()}${String(count + 1).padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating return number:', error);
            // Fallback to timestamp-based number with more entropy
            this.returnNumber = `RET${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        }
    }
    
    // Ensure returnNumber is always set
    if (!this.returnNumber) {
        this.returnNumber = `RET${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
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
    
    // Use delivery date if available, otherwise use order date
    const referenceDate = this.returnWindow.deliveryDate || this.returnWindow.orderDate;
    const daysSinceDelivery = Math.floor(
        (this.returnWindow.returnRequestDate - referenceDate) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceDelivery <= this.returnWindow.allowedReturnDays;
});

// State machine for valid status transitions
const VALID_TRANSITIONS = {
    requested: ['pending_approval', 'approved', 'rejected', 'cancelled'],
    pending_approval: ['approved', 'rejected', 'cancelled'],
    approved: ['pickup_scheduled', 'cancelled'],
    rejected: [], // Terminal state
    pickup_scheduled: ['picked_up', 'cancelled'],
    picked_up: ['in_transit'],
    in_transit: ['received'],
    received: ['inspected'],
    inspected: ['approved_refund', 'rejected_refund'],
    approved_refund: ['refund_processed'],
    rejected_refund: [], // Terminal state
    refund_processed: ['completed'],
    completed: [], // Terminal state
    cancelled: [] // Terminal state
};

// Methods
returnSchema.methods.updateStatus = function(newStatus, updatedBy, note = '') {
    const currentStatus = this.status;
    
    // Validate state transition
    if (!VALID_TRANSITIONS[currentStatus]) {
        throw new Error(`Invalid current status: ${currentStatus}`);
    }
    
    if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
        throw new Error(
            `Invalid status transition: Cannot move from "${currentStatus}" to "${newStatus}". ` +
            `Valid transitions: ${VALID_TRANSITIONS[currentStatus].join(', ') || 'none (terminal state)'}`
        );
    }
    
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

// Check if a status transition is valid
returnSchema.methods.canTransitionTo = function(newStatus) {
    const currentStatus = this.status;
    return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

// Get all valid next statuses
returnSchema.methods.getValidNextStatuses = function() {
    return VALID_TRANSITIONS[this.status] || [];
};

returnSchema.methods.calculateRefundAmount = function() {
    const originalAmount = this.refundDetails.originalAmount;
    const returnShippingCost = this.refundDetails.returnShippingCost || 0;
    const restockingFee = this.refundDetails.restockingFee || 0;
    
    // Validate amounts
    if (originalAmount <= 0) {
        throw new Error('Original amount must be greater than 0');
    }
    
    if (returnShippingCost < 0 || restockingFee < 0) {
        throw new Error('Shipping cost and restocking fee cannot be negative');
    }
    
    if (returnShippingCost + restockingFee > originalAmount) {
        throw new Error('Total deductions cannot exceed original amount');
    }
    
    this.refundDetails.refundAmount = Math.max(0, originalAmount - returnShippingCost - restockingFee);
    return this.refundDetails.refundAmount;
};

// Validate refund details before processing
returnSchema.methods.validateRefundDetails = function() {
    const { originalAmount, refundAmount, returnShippingCost = 0, restockingFee = 0 } = this.refundDetails;
    
    const errors = [];
    
    if (!originalAmount || originalAmount <= 0) {
        errors.push('Invalid original amount');
    }
    
    if (refundAmount === undefined || refundAmount === null) {
        errors.push('Refund amount not calculated');
    }
    
    if (refundAmount > originalAmount) {
        errors.push('Refund amount cannot exceed original amount');
    }
    
    if (refundAmount < 0) {
        errors.push('Refund amount cannot be negative');
    }
    
    const expectedRefund = originalAmount - returnShippingCost - restockingFee;
    if (Math.abs(refundAmount - expectedRefund) > 0.01) { // Allow 1 paisa tolerance for rounding
        errors.push(`Refund amount mismatch. Expected: ${expectedRefund}, Got: ${refundAmount}`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

returnSchema.methods.canBeReturned = function() {
    const now = new Date();
    const referenceDate = this.returnWindow.deliveryDate || this.returnWindow.orderDate;
    const daysSinceDelivery = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= this.returnWindow.allowedReturnDays && this.eligibility.isEligible;
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