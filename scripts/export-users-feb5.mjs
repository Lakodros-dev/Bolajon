import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function exportUsersFeb5() {
    try {
        console.log('🔌 MongoDB ga ulanish...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // 2026 yil 5-fevral kuni (00:00:00 dan 23:59:59 gacha) - O'zbekiston vaqti (UTC+5)
        // UTC vaqtiga o'tkazish uchun 5 soat ayiramiz
        const startDate = new Date('2026-02-04T19:00:00.000Z'); // 05/02/2026 00:00 O'zbekiston vaqti
        const endDate = new Date('2026-02-05T18:59:59.999Z');   // 05/02/2026 23:59 O'zbekiston vaqti

        console.log('📅 Qidiruv sanasi: 5-fevral 2026');
        console.log(`   Boshlanish: ${startDate.toLocaleString('uz-UZ')}`);
        console.log(`   Tugash: ${endDate.toLocaleString('uz-UZ')}\n`);

        // 5-fevral kuni ro'yxatdan o'tgan foydalanuvchilarni topish
        const users = await User.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: 1 }).lean();

        console.log(`📊 Topilgan foydalanuvchilar: ${users.length}\n`);

        if (users.length === 0) {
            console.log('❌ 5-fevral 2026 kuni ro\'yxatdan o\'tgan foydalanuvchilar topilmadi');
            return;
        }

        console.log('═'.repeat(100));
        console.log('№  | ISM                          | TELEFON          | ROL        | RO\'YXATDAN O\'TGAN SANA VA VAQT');
        console.log('═'.repeat(100));

        users.forEach((user, index) => {
            const num = String(index + 1).padEnd(3);
            const name = (user.name || 'N/A').padEnd(28);
            const phone = (user.phone || 'N/A').padEnd(16);
            const role = (user.role === 'admin' ? 'Admin' : 'O\'qituvchi').padEnd(10);
            const date = new Date(user.createdAt).toLocaleString('uz-UZ', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            console.log(`${num} | ${name} | ${phone} | ${role} | ${date}`);
        });

        console.log('═'.repeat(100));
        console.log(`\n✅ Jami: ${users.length} ta foydalanuvchi\n`);

        // CSV formatda ham chiqarish
        console.log('\n📄 CSV FORMAT:\n');
        console.log('№,Ism,Telefon,Rol,Ro\'yxatdan o\'tgan sana,Ro\'yxatdan o\'tgan vaqt');
        users.forEach((user, index) => {
            const dateObj = new Date(user.createdAt);
            const date = dateObj.toLocaleDateString('uz-UZ');
            const time = dateObj.toLocaleTimeString('uz-UZ', { hour12: false });
            console.log(`${index + 1},"${user.name}","${user.phone}","${user.role === 'admin' ? 'Admin' : 'O\'qituvchi'}","${date}","${time}"`);
        });

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB ulanishi yopildi');
    }
}

// Scriptni ishga tushirish
exportUsersFeb5();
