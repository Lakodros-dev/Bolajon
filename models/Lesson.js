/**
 * Lesson Model
 * Video lessons created by admin for teachers to use
 */
import mongoose from 'mongoose';

const VocabularySchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        trim: true
    },
    translation: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    }
}, { _id: true });

const LessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide lesson title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide lesson description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    videoUrl: {
        type: String,
        required: [true, 'Please provide video URL']
    },
    thumbnail: {
        type: String,
        default: ''
    },
    level: {
        type: Number,
        required: [true, 'Please provide lesson level'],
        min: [1, 'Level must be at least 1'],
        max: [10, 'Level cannot be more than 10']
    },
    duration: {
        type: Number, // Duration in minutes
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    vocabulary: {
        type: [VocabularySchema],
        default: []
    },
    // Game type for this lesson
    gameType: {
        type: String,
        enum: ['none', 'vocabulary', 'catch-the-number', 'pop-the-balloon', 'drop-to-basket', 'shopping-basket', 'movements'],
        default: 'vocabulary'
    }
}, {
    timestamps: true
});

// Index for sorting by level and order
LessonSchema.index({ level: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
