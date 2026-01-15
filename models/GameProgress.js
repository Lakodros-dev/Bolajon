/**
 * GameProgress Model
 * Tracks game completion per student per lesson
 */
import mongoose from 'mongoose';

const GameProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Please provide student ID']
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: [true, 'Please provide lesson ID']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide teacher ID']
    },
    gameWon: {
        type: Boolean,
        default: false
    },
    wonAt: {
        type: Date,
        default: null
    },
    attempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate entries
GameProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

// Index for querying by student
GameProgressSchema.index({ student: 1 });

export default mongoose.models.GameProgress || mongoose.model('GameProgress', GameProgressSchema);
