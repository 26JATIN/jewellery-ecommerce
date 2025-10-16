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
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
heroVideoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create index for ordering
heroVideoSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.HeroVideo || mongoose.model('HeroVideo', heroVideoSchema);
