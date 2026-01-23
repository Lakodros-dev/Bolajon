import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=Bolajon';

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    subscriptionStatus: String,
    trialStartDate: Date,
    subscriptionEndDate: Date,
    createdAt: Date
}, { timestamps: true });

UserSchema.methods.getDaysRemaining = function () {
    if (this.role === 'admin') return 999;

    const now = new Date();
    let endDate;

    if (this.subscriptionStatus === 'trial') {
        if (!this.trialStartDate) {
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkSubscriptions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'teacher' });
        
        console.log('\n=== SUBSCRIPTION STATUS ===\n');
        console.log(`Current Date: ${new Date().toISOString()}\n`);
        
        for (const user of users) {
            const daysRemaining = user.getDaysRemaining();
            const trialEnd = new Date(user.trialStartDate);
            trialEnd.setDate(trialEnd.getDate() + 7);
            
            console.log(`Name: ${user.name}`);
            console.log(`Phone: ${user.phone}`);
            console.log(`Status: ${user.subscriptionStatus}`);
            console.log(`Trial Start: ${user.trialStartDate?.toISOString()}`);
            console.log(`Trial End: ${trialEnd.toISOString()}`);
            console.log(`Days Remaining: ${daysRemaining}`);
            console.log(`Created At: ${user.createdAt?.toISOString()}`);
            console.log('---\n');
        }

        await mongoose.connection.close();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSubscriptions();
