import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    password: String,
    role: String,
    balance: Number,
    isActive: Boolean,
    subscriptionStatus: String,
    trialStartDate: Date
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createTestUser() {
    try {
        console.log('🔌 MongoDB ga ulanish...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // Test user yaratish
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const testUser = new User({
            name: 'Test User Payme',
            phone: '+998901234567',
            password: hashedPassword,
            role: 'teacher',
            balance: 0,
            isActive: true,
            subscriptionStatus: 'trial',
            trialStartDate: new Date()
        });

        await testUser.save();

        console.log('✅ Test user yaratildi!\n');
        console.log('═'.repeat(60));
        console.log(`User ID:  ${testUser._id.toString()}`);
        console.log(`Ism:      ${testUser.name}`);
        console.log(`Telefon:  ${testUser.phone}`);
        console.log(`Parol:    test123`);
        console.log(`Rol:      ${testUser.role}`);
        console.log('═'.repeat(60));
        console.log('\n📤 Shu User ID ni Shohjahonga yuboring:\n');
        console.log(`   ${testUser._id.toString()}\n`);

    } catch (error) {
        if (error.code === 11000) {
            console.log('⚠️  Test user allaqachon mavjud. Mavjud userni topish...\n');
            const existingUser = await User.findOne({ phone: '+998901234567' });
            if (existingUser) {
                console.log('═'.repeat(60));
                console.log(`User ID:  ${existingUser._id.toString()}`);
                console.log(`Ism:      ${existingUser.name}`);
                console.log(`Telefon:  ${existingUser.phone}`);
                console.log('═'.repeat(60));
                console.log('\n📤 Shu User ID ni Shohjahonga yuboring:\n');
                console.log(`   ${existingUser._id.toString()}\n`);
            }
        } else {
            console.error('❌ Xatolik:', error);
        }
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB ulanishi yopildi');
    }
}

createTestUser();
