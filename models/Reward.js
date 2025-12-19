/**
 * Reward Model
 * Rewards that students can redeem with their stars
 */
import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide reward title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        default: ''
    },
    cost: {
        type: Number,
        required: [true, 'Please provide reward cost in stars'],
        min: [1, 'Cost must be at least 1 star']
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['toy', 'book', 'game', 'certificate', 'other'],
        default: 'other'
    },
    stock: {
        type: Number,
        default: -1 // -1 means unlimited
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for sorting by cost
RewardSchema.index({ cost: 1 });

export default mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
