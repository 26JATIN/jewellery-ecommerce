import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'Blog excerpt is required'],
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    featuredImage: {
        url: String,
        publicId: String,
        alt: String
    },
    images: [{
        url: String,
        publicId: String,
        alt: String,
        caption: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['jewellery-care', 'fashion-trends', 'buying-guide', 'company-news', 'lifestyle', 'other'],
        default: 'other'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number, // in minutes
        default: 5
    },
    seo: {
        metaTitle: {
            type: String,
            maxlength: 60
        },
        metaDescription: {
            type: String,
            maxlength: 160
        },
        keywords: [String]
    }
}, {
    timestamps: true
});

// Indexes for better query performance
// Note: slug index is already created by unique: true constraint
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ category: 1, isPublished: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });


// Generate slug from title before saving
blogSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Set publishedAt when first published
    if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Calculate read time based on content (assuming 200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.trim().split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 200);
    }
    
    next();
});

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
    return this.publishedAt ? this.publishedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
