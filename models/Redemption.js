/**
 * Redemption Model
 * Tracks reward redemptions by students
 */
import mongoose from 'mongoose';

const RedemptionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Please provide student ID']
    },
    rewardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reward',
        required: [true, 'Please provide reward ID']
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide teacher ID']
    },
    starsCost: {
        type: Number,
        required: [true, 'Please provide stars cost']
    },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
    },
    redeemedAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for querying by student
RedemptionSchema.index({ studentId: 1 });

// Index for querying by teacher
RedemptionSchema.index({ teacherId: 1 });

export default mongoose.models.Redemption || mongoose.model('Redemption', RedemptionSchema);
