import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

async function exportUsersFeb6() {
    try {
        console.log('🔌 MongoDB ga ulanish...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // 2026 yil 6-fevral kuni (00:00:00 dan 23:59:59 gacha) - O'zbekiston vaqti (UTC+5)
        const startDate = new Date('2026-02-05T19:00:00.000Z'); // 06/02/2026 00:00 O'zbekiston vaqti
        const endDate = new Date('2026-02-06T18:59:59.999Z');   // 06/02/2026 23:59 O'zbekiston vaqti

        console.log('📅 Qidiruv sanasi: 6-fevral 2026 (O\'zbekiston vaqti)');
        console.log(`   Boshlanish: 06/02/2026 00:00:00`);
        console.log(`   Tugash: 06/02/2026 23:59:59\n`);

        // 6-fevral kuni ro'yxatdan o'tgan foydalanuvchilarni topish
        const users = await User.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: 1 }).lean();

        console.log(`📊 Topilgan foydalanuvchilar: ${users.length}`);
        
        // Faqat 6-fevral kunini filter qilish
        const filteredUsers = users.filter(user => {
            const dateObj = new Date(user.createdAt);
            dateObj.setHours(dateObj.getHours() + 5);
            return dateObj.getDate() === 6 && dateObj.getMonth() === 1; // 6-fevral
        });
        
        console.log(`📊 6-fevral kuni: ${filteredUsers.length} ta\n`);

        if (filteredUsers.length === 0) {
            console.log('❌ 6-fevral 2026 kuni ro\'yxatdan o\'tgan foydalanuvchilar topilmadi');
            return;
        }

        // CSV fayl yaratish
        const csvContent = [
            '№,Ism,Telefon,Rol,Ro\'yxatdan o\'tgan sana,Ro\'yxatdan o\'tgan vaqt',
            ...filteredUsers.map((user, index) => {
                // UTC vaqtini O'zbekiston vaqtiga o'tkazish (+5 soat)
                const dateObj = new Date(user.createdAt);
                dateObj.setHours(dateObj.getHours() + 5);
                
                const date = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
                const time = dateObj.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
                
                return `${index + 1},"${user.name}","${user.phone}","${user.role === 'admin' ? 'Admin' : 'O\'qituvchi'}","${date}","${time}"`;
            })
        ].join('\n');

        // Fayl nomini yaratish
        const fileName = 'users-6-fevral-2026.csv';
        const filePath = join(__dirname, '..', fileName);

        // Faylga yozish
        fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8'); // BOM qo'shish Excel uchun

        console.log('✅ CSV fayl yaratildi!\n');
        console.log(`📁 Fayl joylashuvi: ${filePath}`);
        console.log(`📄 Fayl nomi: ${fileName}\n`);

        // Konsolga ham chiqarish
        console.log('═'.repeat(100));
        console.log('№  | ISM                          | TELEFON          | ROL        | RO\'YXATDAN O\'TGAN SANA VA VAQT');
        console.log('═'.repeat(100));

        filteredUsers.forEach((user, index) => {
            const dateObj = new Date(user.createdAt);
            dateObj.setHours(dateObj.getHours() + 5);
            
            const num = String(index + 1).padEnd(3);
            const name = (user.name || 'N/A').padEnd(28);
            const phone = (user.phone || 'N/A').padEnd(16);
            const role = (user.role === 'admin' ? 'Admin' : 'O\'qituvchi').padEnd(10);
            const date = dateObj.toLocaleString('uz-UZ', {
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
        console.log(`\n✅ Jami: ${filteredUsers.length} ta foydalanuvchi (6-fevral 2026)\n`);

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB ulanishi yopildi');
    }
}

// Scriptni ishga tushirish
exportUsersFeb6();
