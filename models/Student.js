/**
 * Student Model
 * Children who are taught by teachers (they don't log in)
 */
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide student name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    age: {
        type: Number,
        required: [true, 'Please provide student age'],
        min: [5, 'Age must be at least 5'],
        max: [9, 'Age cannot be more than 9']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide teacher ID']
    },
    stars: {
        type: Number,
        default: 0,
        min: [0, 'Stars cannot be negative']
    },
    avatar: {
        type: String,
        default: ''
    },
    parentName: {
        type: String,
        default: ''
    },
    parentPhone: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
StudentSchema.index({ teacher: 1 });
StudentSchema.index({ teacher: 1, isActive: 1 });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
