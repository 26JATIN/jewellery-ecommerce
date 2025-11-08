import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String, // For video thumbnails
        default: ''
    },
    alt: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Create indexes for better query performance
gallerySchema.index({ isActive: 1, order: 1 }); // For listing active gallery items sorted
gallerySchema.index({ mediaType: 1, isActive: 1 }); // For filtering by media type
gallerySchema.index({ tags: 1 }); // For tag-based searches

export default mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
