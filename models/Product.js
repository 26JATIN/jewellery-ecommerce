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
    price: {
        type: Number,
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
    image: {
        type: String,
        required: true
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
        default: 22, // 22K, 18K, etc.
        enum: [10, 14, 18, 22, 24]
    },
    makingChargePercent: {
        type: Number,
        default: 15 // Making charge percentage
    },
    isDynamicPricing: {
        type: Boolean,
        default: false // Enable dynamic pricing based on live gold rates
    },
    fixedMakingCharge: {
        type: Number,
        default: 0 // Fixed making charge (alternative to percentage)
    },
    stoneValue: {
        type: Number,
        default: 0 // Value of diamonds/stones (not affected by gold price)
    },
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