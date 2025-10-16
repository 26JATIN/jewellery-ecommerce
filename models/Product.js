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
    costPrice: {
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
    }]
}, {
    timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);