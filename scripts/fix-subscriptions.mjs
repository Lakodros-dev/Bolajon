import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=Bolajon';

async function fixSubscriptions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.connection.collection('users');
        
        // Find all users without subscription fields
        const usersToFix = await User.find({
            $or: [
                { subscriptionStatus: { $exists: false } },
                { trialStartDate: { $exists: false } }
            ]
        }).toArray();

        console.log(`Found ${usersToFix.length} users to fix\n`);

        for (const user of usersToFix) {
            // Use createdAt as trialStartDate
            const trialStartDate = user.createdAt || new Date();
            
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        subscriptionStatus: 'trial',
                        trialStartDate: trialStartDate,
                        subscriptionEndDate: null
                    }
                }
            );

            console.log(`Fixed: ${user.name} - Trial starts: ${trialStartDate.toISOString()}`);
        }

        console.log('\nDone!');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixSubscriptions();
