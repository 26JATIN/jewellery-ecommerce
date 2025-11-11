import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        default: null
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    // Primary image URL (single image for backward compatibility with existing data)
    image: {
        type: String,
        required: false // Made optional since we have images array
    },
    stock: {
        type: Number,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Dynamic pricing fields
    goldWeight: {
        type: Number,
        default: 0 // Weight in grams
    },
    goldPurity: {
        type: Number,
        default: 22, // 22K is most common in India
        enum: [18, 20, 22, 24]
    },
    // Silver specifications
    silverWeight: {
        type: Number,
        default: 0 // Weight in grams
    },
    silverPurity: {
        type: Number,
        default: 999, // Only 999 purity supported
        enum: [999]
    },
    makingChargePercent: {
        type: Number,
        default: 15 // Making charge percentage
    },
    isDynamicPricing: {
        type: Boolean,
        default: false // Enable dynamic pricing based on live metal rates
    },
    fixedMakingCharge: {
        type: Number,
        default: 0 // Fixed making charge (alternative to percentage)
    },
    stoneValue: {
        type: Number,
        default: 0 // Value of diamonds/stones (not affected by metal price)
    },
    // Metal type specification
    metalType: {
        type: String,
        enum: ['gold', 'silver', 'mixed'],
        default: 'gold'
    },
    // Tags for target audience
    tags: [{
        type: String,
        enum: ['Men', 'Women', 'Kids'],
    }],
    // Enhanced stone/gem specifications
    stones: [{
        type: {
            type: String,
            enum: ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Amethyst', 'Topaz', 'Garnet', 'Opal', 'Turquoise', 'Other'],
            default: 'Diamond'
        },
        quality: {
            type: String,
            enum: ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'AAA', 'AA', 'A', 'B', 'Natural', 'Synthetic'],
            default: 'VS1'
        },
        weight: {
            type: Number,
            default: 0 // Weight in carats for diamonds/gems, pieces for pearls
        },
        pricePerUnit: {
            type: Number,
            default: 0 // Price per carat/piece
        },
        totalValue: {
            type: Number,
            default: 0 // Calculated value (weight * pricePerUnit)
        },
        color: {
            type: String,
            default: 'Colorless' // Diamond: Colorless, Near Colorless, etc. Ruby: Red, etc.
        },
        cut: {
            type: String,
            enum: ['Round', 'Princess', 'Emerald', 'Asscher', 'Oval', 'Marquise', 'Pear', 'Heart', 'Cushion', 'Radiant', 'Cabochon', 'Other'],
            default: 'Round'
        },
        setting: {
            type: String,
            enum: ['Prong', 'Bezel', 'Channel', 'Pave', 'Halo', 'Tension', 'Cluster', 'Other'],
            default: 'Prong'
        }
    }],
    pricingMethod: {
        type: String,
        enum: ['fixed', 'dynamic'],
        default: 'fixed'
    },
    discountPercent: {
        type: Number,
        default: 0, // Discount percentage for dynamic pricing (MRP - discount% = Selling Price)
        min: 0,
        max: 100
    },
    lastPriceUpdate: {
        type: Date,
        default: Date.now
    },
    priceHistory: [{
        date: Date,
        goldPrice: Number,
        calculatedPrice: Number,
        finalPrice: Number
    }],
    
    // Product Variants System
    hasVariants: {
        type: Boolean,
        default: false // If true, use variants for inventory, if false use main stock
    },
    
    // Variant Options (e.g., Size, Color, Stone Color, etc.)
    variantOptions: [{
        name: {
            type: String,
            required: true // e.g., "Size", "Color", "Stone Color"
        },
        displayName: {
            type: String,
            required: true // e.g., "Ring Size", "Stone Color"
        },
        type: {
            type: String,
            enum: ['select', 'color', 'size'],
            default: 'select'
        },
        required: {
            type: Boolean,
            default: true // If user must select this option
        },
        values: [{
            name: {
                type: String,
                required: true // e.g., "6", "7", "8" or "Red", "Blue"
            },
            displayName: {
                type: String,
                required: true // e.g., "Size 6", "Ruby Red"
            },
            colorCode: {
                type: String, // For color options: "#FF0000"
                default: null
            },
            priceAdjustment: {
                type: Number,
                default: 0 // Additional price for this option
            },
            isAvailable: {
                type: Boolean,
                default: true
            }
        }]
    }],
    
    // Product Variants (combinations of options)
    variants: [{
        sku: {
            type: String,
            required: true
            // Note: Unique constraint removed to avoid conflicts with non-variant products
        },
        optionCombination: {
            type: Object,
            default: {} // e.g., {"Size": "6", "Color": "Red"}
        },
        price: {
            mrp: Number,
            sellingPrice: Number
        },
        stock: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        images: [{
            url: String,
            alt: String,
            isPrimary: Boolean,
            order: Number
        }],
        // Weight adjustments for variants (if applicable)
        weightAdjustment: {
            gold: { type: Number, default: 0 },
            silver: { type: Number, default: 0 }
        }
    }],
    
    // Total stock across all variants (computed field)
    totalStock: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ isActive: 1, subcategory: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, sellingPrice: 1 });
productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ category: 1, isActive: 1, createdAt: -1 }); // Compound index for category listings
productSchema.index({ subcategory: 1, isActive: 1, createdAt: -1 }); // Compound index for subcategory listings
productSchema.index({ isActive: 1, stock: 1 }); // For stock filtering
productSchema.index({ isDynamicPricing: 1, metalType: 1 }); // For dynamic pricing queries
productSchema.index({ tags: 1, isActive: 1 }); // For tag-based filtering
// Note: sku unique index is already defined in schema field definition above

// Middleware to calculate total stock
productSchema.pre('save', function(next) {
    if (this.hasVariants && this.variants && this.variants.length > 0) {
        this.totalStock = this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
    } else {
        this.totalStock = this.stock || 0;
    }
    next();
});

// Method to get available variants
productSchema.methods.getAvailableVariants = function() {
    if (!this.hasVariants) return null;
    return this.variants.filter(variant => variant.isActive && variant.stock > 0);
};

// Method to find variant by options
productSchema.methods.findVariantByOptions = function(options) {
    if (!this.hasVariants) return null;
    return this.variants.find(variant => {
        const combination = variant.optionCombination || {};
        return Object.keys(options).every(key => 
            combination[key] === options[key]
        );
    });
};

// Method to check if product is in stock
productSchema.methods.isInStock = function(variantId = null) {
    if (this.hasVariants) {
        if (variantId) {
            const variant = this.variants.id(variantId);
            return variant && variant.isActive && variant.stock > 0;
        }
        return this.variants.some(variant => variant.isActive && variant.stock > 0);
    }
    return this.isActive && this.stock > 0;
};

export default mongoose.models.Product || mongoose.model('Product', productSchema);