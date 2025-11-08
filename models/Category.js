import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    productsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
categorySchema.index({ slug: 1 }, { unique: true }); // Unique slug index
categorySchema.index({ name: 1 }, { unique: true }); // Unique name index
categorySchema.index({ isActive: 1, sortOrder: 1 }); // For active category listings sorted
categorySchema.index({ isActive: 1, productsCount: -1 }); // For popular categories

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
    if (this.isModified('name') && this.name) {
        // Generate slug: lowercase, replace non-alphanumeric with hyphens, remove multiple hyphens, trim hyphens from ends
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
        
        // Ensure we have a valid slug
        if (!this.slug) {
            this.slug = 'category-' + Date.now();
        }
    }
    next();
});

// Cascade delete: Remove associated subcategories and products when category is deleted
categorySchema.pre('findOneAndDelete', async function(next) {
    try {
        const category = await this.model.findOne(this.getFilter());
        if (category) {
            // Import models here to avoid circular dependencies
            const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory');
            const Product = mongoose.models.Product || mongoose.model('Product');
            
            // Get all subcategories for this category
            const subcategories = await Subcategory.find({ category: category._id });
            const subcategoryIds = subcategories.map(sub => sub._id);
            
            // Delete all products associated with this category (by category name)
            await Product.deleteMany({ category: category.name });
            
            // Delete all products associated with subcategories
            if (subcategoryIds.length > 0) {
                await Product.deleteMany({ subcategory: { $in: subcategoryIds } });
            }
            
            // Delete all subcategories
            await Subcategory.deleteMany({ category: category._id });
            
            console.log(`Cascade delete: Removed ${subcategories.length} subcategories and their products for category "${category.name}"`);
        }
        next();
    } catch (error) {
        console.error('Error in cascade delete:', error);
        next(error);
    }
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);