import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ExcelJS from 'exceljs';

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

async function exportUsersFeb6Excel() {
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

        // Faqat 6-fevral kunini filter qilish
        const filteredUsers = users.filter(user => {
            const dateObj = new Date(user.createdAt);
            dateObj.setHours(dateObj.getHours() + 5);
            return dateObj.getDate() === 6 && dateObj.getMonth() === 1; // 6-fevral
        });
        
        console.log(`📊 6-fevral kuni: ${filteredUsers.length} ta foydalanuvchi\n`);

        if (filteredUsers.length === 0) {
            console.log('❌ 6-fevral 2026 kuni ro\'yxatdan o\'tgan foydalanuvchilar topilmadi');
            return;
        }

        // Excel workbook yaratish
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('6-Fevral 2026', {
            properties: { tabColor: { argb: 'FF00FF00' } }
        });

        // Sarlavha qo'shish
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'RO\'YXATDAN O\'TGAN FOYDALANUVCHILAR - 6-FEVRAL 2026';
        titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 30;

        // Ma'lumot qo'shish
        worksheet.mergeCells('A2:F2');
        const infoCell = worksheet.getCell('A2');
        infoCell.value = `Jami: ${filteredUsers.length} ta foydalanuvchi`;
        infoCell.font = { size: 12, bold: true };
        infoCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(2).height = 25;

        // Ustun sarlavhalari
        const headerRow = worksheet.getRow(3);
        headerRow.values = ['№', 'Ism-Familya', 'Telefon raqam', 'Rol', 'Ro\'yxatdan o\'tgan sana', 'Ro\'yxatdan o\'tgan vaqt'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        // Border qo'shish
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Ma'lumotlarni qo'shish
        filteredUsers.forEach((user, index) => {
            const dateObj = new Date(user.createdAt);
            dateObj.setHours(dateObj.getHours() + 5);
            
            const date = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
            const time = dateObj.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
            
            const row = worksheet.addRow([
                index + 1,
                user.name,
                user.phone,
                user.role === 'admin' ? 'Admin' : 'O\'qituvchi',
                date,
                time
            ]);

            // Qator rangini o'zgartirish (har ikkinchi qator)
            if (index % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF2F2F2' }
                };
            }

            // Border qo'shish
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // Ism ustunini chapga tekislash
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
        });

        // Ustun kengliklarini sozlash
        worksheet.getColumn(1).width = 8;   // №
        worksheet.getColumn(2).width = 30;  // Ism
        worksheet.getColumn(3).width = 18;  // Telefon
        worksheet.getColumn(4).width = 15;  // Rol
        worksheet.getColumn(5).width = 20;  // Sana
        worksheet.getColumn(6).width = 20;  // Vaqt

        // Faylni saqlash
        const fileName = 'users-6-fevral-2026.xlsx';
        const filePath = join(__dirname, '..', fileName);
        
        await workbook.xlsx.writeFile(filePath);

        console.log('✅ Excel fayl yaratildi!\n');
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
exportUsersFeb6Excel();
