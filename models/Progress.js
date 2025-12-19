/**
 * Progress Model
 * Tracks lesson completion and stars earned by students
 */
import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
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
    starsEarned: {
        type: Number,
        required: [true, 'Please provide stars earned'],
        min: [1, 'Stars must be at least 1'],
        max: [5, 'Stars cannot be more than 5']
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate progress entries
ProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

// Index for querying by student
ProgressSchema.index({ student: 1 });
ProgressSchema.index({ student: 1, completedAt: -1 });

// Index for querying by teacher
ProgressSchema.index({ teacher: 1 });

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
