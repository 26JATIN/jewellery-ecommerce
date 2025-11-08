import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    image: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    // Variant support
    variantId: {
        type: String, // Store variant ID as string since it's stored as subdocument ID
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
        },
        images: [{
            url: String,
            alt: String,
            isPrimary: Boolean
        }]
    },
    cartKey: {
        type: String, // Unique key for cart item (productId_variantId or just productId)
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

// Create indexes for better query performance
cartSchema.index({ user: 1 }); // For finding cart by user
cartSchema.index({ 'items.product': 1 }); // For product-based cart queries
cartSchema.index({ updatedAt: -1 }); // For cleanup of old carts

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);