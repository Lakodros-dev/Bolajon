/**
 * Fix Users - Add missing subscription fields
 * Run with: node scripts/fix-users.mjs
 */
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Lakodros:Lakodros01@thebase.bx3mew2.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=TheBase';

async function fixUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Get all users
        const users = await db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users\n`);

        // Update each user
        for (const user of users) {
            console.log(`Updating: ${user.name} (${user.phone})`);
            
            const updateData = {};
            
            // Add subscriptionStatus if missing
            if (!user.subscriptionStatus) {
                updateData.subscriptionStatus = 'trial';
            }
            
            // Add trialStartDate if missing
            if (!user.trialStartDate) {
                updateData.trialStartDate = new Date();
            }
            
            // Add subscriptionEndDate if missing
            if (!user.subscriptionEndDate) {
                updateData.subscriptionEndDate = null;
            }
            
            // Add lastPaymentDate if missing
            if (!user.lastPaymentDate) {
                updateData.lastPaymentDate = null;
            }
            
            // Add onboardingCompleted if missing
            if (!user.onboardingCompleted) {
                updateData.onboardingCompleted = [];
            }

            if (Object.keys(updateData).length > 0) {
                await db.collection('users').updateOne(
                    { _id: user._id },
                    { $set: updateData }
                );
                console.log(`  ✅ Updated with:`, updateData);
            } else {
                console.log(`  ℹ️  Already has all fields`);
            }
            console.log('');
        }

        console.log('✅ All users updated!\n');

        // Verify
        console.log('Verifying users:');
        console.log('─────────────────────────────');
        const updatedUsers = await db.collection('users').find({}).toArray();
        updatedUsers.forEach(user => {
            console.log(`• ${user.name} (${user.phone})`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Subscription: ${user.subscriptionStatus || 'N/A'}`);
            console.log(`  Trial Start: ${user.trialStartDate || 'N/A'}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixUsers();
