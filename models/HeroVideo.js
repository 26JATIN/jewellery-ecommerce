import mongoose from 'mongoose';

const heroVideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
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
    duration: {
        type: Number, // Duration in seconds
        default: 0
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Create index for ordering
heroVideoSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.HeroVideo || mongoose.model('HeroVideo', heroVideoSchema);
