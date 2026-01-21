/**
 * Fix Admin User Only - Does NOT delete any data
 * Only updates admin phone number if needed
 */
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority';

async function fixAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Check current admin
        console.log('👤 Checking admin user...');
        const admin = await db.collection('users').findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        console.log(`Current admin phone: ${admin.phone}`);
        console.log(`Current admin name: ${admin.name}`);
        
        console.log('\n✅ Admin user exists!');
        console.log('\n📋 Login credentials:');
        console.log(`   Phone: ${admin.phone}`);
        console.log('   Password: Lakodros01');
        console.log('\n💡 Use these credentials to login to admin panel');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAdmin();
