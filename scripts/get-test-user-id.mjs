import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    _id: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function getTestUserId() {
    try {
        console.log('🔌 MongoDB ga ulanish...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // Birinchi foydalanuvchini olish
        const user = await User.findOne({ role: 'teacher' }).lean();

        if (!user) {
            console.log('❌ Foydalanuvchi topilmadi');
            return;
        }

        console.log('📋 Test uchun foydalanuvchi ma\'lumotlari:\n');
        console.log('═'.repeat(60));
        console.log(`User ID:  ${user._id.toString()}`);
        console.log(`Ism:      ${user.name}`);
        console.log(`Telefon:  ${user.phone}`);
        console.log(`Rol:      ${user.role}`);
        console.log('═'.repeat(60));
        console.log('\n✅ Shu User ID ni Payme test kassasiga yuboring!\n');

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB ulanishi yopildi');
    }
}

getTestUserId();
