/**
 * User Model (Teachers & Admins)
 * Handles authentication for teachers and administrators
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    plainPassword: {
        type: String,
        default: '',
        select: false // Don't return by default for security
    },
    role: {
        type: String,
        enum: ['admin', 'teacher'],
        default: 'teacher'
    },
    avatar: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Subscription fields
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'expired'],
        default: 'trial'
    },
    trialStartDate: {
        type: Date,
        default: () => new Date()
    },
    subscriptionEndDate: {
        type: Date,
        default: null
    },
    lastPaymentDate: {
        type: Date,
        default: null
    },
    // Onboarding tracking - which pages user has seen the guide
    onboardingCompleted: {
        type: [String],
        default: []
    },
    // Balance for payments
    balance: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Check if subscription is valid
UserSchema.methods.isSubscriptionValid = function () {
    if (this.role === 'admin') return true;

    const now = new Date();

    // Check trial period (7 days)
    if (this.subscriptionStatus === 'trial') {
        const trialEnd = new Date(this.trialStartDate);
        trialEnd.setDate(trialEnd.getDate() + 7);
        return now < trialEnd;
    }

    // Check active subscription
    if (this.subscriptionStatus === 'active' && this.subscriptionEndDate) {
        return now < new Date(this.subscriptionEndDate);
    }

    return false;
};

// Get days remaining
UserSchema.methods.getDaysRemaining = function () {
    if (this.role === 'admin') return 999;

    const now = new Date();
    let endDate;

    if (this.subscriptionStatus === 'trial') {
        if (!this.trialStartDate) {
            // If trialStartDate is missing, set it to now
            this.trialStartDate = new Date();
        }
        endDate = new Date(this.trialStartDate);
        endDate.setDate(endDate.getDate() + 7);
    } else if (this.subscriptionStatus === 'active' && this.subscriptionEndDate) {
        endDate = new Date(this.subscriptionEndDate);
    } else {
        return 0;
    }

    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
};

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    // Save plain password before hashing
    if (this.password && !this.password.startsWith('$2')) {
        this.plainPassword = this.password;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
