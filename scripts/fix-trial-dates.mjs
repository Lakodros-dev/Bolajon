/**
 * Fix Trial Start Dates
 * Updates users who don't have trialStartDate set
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
}

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    subscriptionStatus: String,
    trialStartDate: Date,
    createdAt: Date
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixTrialDates() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users with trial status but no trialStartDate
        const usersToFix = await User.find({
            subscriptionStatus: 'trial',
            $or: [
                { trialStartDate: null },
                { trialStartDate: { $exists: false } }
            ]
        });

        console.log(`\n📊 Found ${usersToFix.length} users to fix`);

        if (usersToFix.length === 0) {
            console.log('✅ All users have valid trial dates');
            await mongoose.connection.close();
            return;
        }

        // Update each user
        for (const user of usersToFix) {
            // Use createdAt as trialStartDate
            const trialStartDate = user.createdAt || new Date();
            
            await User.updateOne(
                { _id: user._id },
                { $set: { trialStartDate } }
            );

            console.log(`✅ Fixed ${user.name} (${user.phone}) - Trial starts: ${trialStartDate.toLocaleDateString()}`);
        }

        console.log(`\n✅ Successfully fixed ${usersToFix.length} users`);
        
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixTrialDates();
