import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create compound index for category + slug uniqueness
subcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

// Additional indexes for better query performance
subcategorySchema.index({ category: 1, isActive: 1, order: 1 }); // For listing subcategories by category
subcategorySchema.index({ isActive: 1 }); // For active subcategory queries
subcategorySchema.index({ slug: 1 }); // For slug-based lookups
subcategorySchema.index({ name: 1 }); // For name-based searches

// Pre-save hook to generate slug from name
subcategorySchema.pre('save', async function(next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Cascade delete: Remove associated products when subcategory is deleted
subcategorySchema.pre('findOneAndDelete', async function(next) {
    try {
        const subcategory = await this.model.findOne(this.getFilter());
        if (subcategory) {
            // Import Product model here to avoid circular dependencies
            const Product = mongoose.models.Product || mongoose.model('Product');
            
            // Delete all products associated with this subcategory
            const result = await Product.deleteMany({ subcategory: subcategory._id });
            
            console.log(`Cascade delete: Removed ${result.deletedCount} products for subcategory "${subcategory.name}"`);
        }
        next();
    } catch (error) {
        console.error('Error in subcategory cascade delete:', error);
        next(error);
    }
});

export default mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
