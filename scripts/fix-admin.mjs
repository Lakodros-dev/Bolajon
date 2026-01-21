/**
 * Fix Admin Login - Update password only
 * Run with: node scripts/fix-admin.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority';

async function fixAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Find admin user
        console.log('🔍 Searching for admin user...');
        const admin = await db.collection('users').findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        console.log('✅ Admin found:');
        console.log(`   Name: ${admin.name}`);
        console.log(`   Phone: ${admin.phone}`);
        console.log(`   Role: ${admin.role}\n`);

        // Update password
        console.log('🔐 Updating admin password...');
        const newPassword = await bcrypt.hash('Lakodros01', 10);
        
        await db.collection('users').updateOne(
            { _id: admin._id },
            { $set: { password: newPassword } }
        );

        console.log('✅ Password updated successfully!\n');
        console.log('📋 Admin Login Credentials:');
        console.log('─────────────────────────────');
        console.log(`   Phone: ${admin.phone}`);
        console.log(`   Password: Lakodros01`);
        console.log('─────────────────────────────\n');

        // Check lessons count
        const lessonsCount = await db.collection('lessons').countDocuments();
        console.log(`📚 Lessons in database: ${lessonsCount}`);

        if (lessonsCount === 0) {
            console.log('⚠️  WARNING: No lessons found! You may need to add lessons.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAdmin();
