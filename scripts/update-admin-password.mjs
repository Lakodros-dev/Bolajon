/**
 * Update Admin Password Only
 * Run with: node scripts/update-admin-password.mjs
 * SAFE: Only updates admin password, doesn't touch any other data
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority';

async function updateAdminPassword() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Find admin user
        const admin = await db.collection('users').findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        console.log('👤 Admin topildi:');
        console.log(`   Ism: ${admin.name}`);
        console.log(`   Telefon: ${admin.phone}`);
        console.log(`   Role: ${admin.role}\n`);

        // Hash new password
        const newPassword = 'Lakodros01';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update only password field
        await db.collection('users').updateOne(
            { _id: admin._id },
            { $set: { password: hashedPassword } }
        );

        console.log('✅ Admin paroli yangilandi!\n');
        console.log('📋 Login ma\'lumotlari:');
        console.log(`   Telefon: ${admin.phone}`);
        console.log(`   Parol: ${newPassword}\n`);
        console.log('⚠️  Boshqa hech qanday ma\'lumot o\'zgartirilmadi!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Xatolik:', error);
        process.exit(1);
    }
}

updateAdminPassword();
