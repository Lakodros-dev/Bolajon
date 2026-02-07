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

async function exportUsersFeb5Excel() {
    try {
        console.log('🔌 MongoDB ga ulanish...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // 2026 yil 5-fevral kuni (00:00:00 dan 23:59:59 gacha) - O'zbekiston vaqti (UTC+5)
        const startDate = new Date('2026-02-04T19:00:00.000Z'); // 05/02/2026 00:00 O'zbekiston vaqti
        const endDate = new Date('2026-02-05T18:59:59.999Z');   // 05/02/2026 23:59 O'zbekiston vaqti

        console.log('📅 Qidiruv sanasi: 5-fevral 2026 (O\'zbekiston vaqti)');
        console.log(`   Boshlanish: 05/02/2026 00:00:00`);
        console.log(`   Tugash: 05/02/2026 23:59:59\n`);

        // 5-fevral kuni ro'yxatdan o'tgan foydalanuvchilarni topish
        const users = await User.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: 1 }).lean();

        // Faqat 5-fevral kunini filtrlash
        const filteredUsers = users.filter(user => {
            const dateObj = new Date(user.createdAt);
            dateObj.setHours(dateObj.getHours() + 5);
            return dateObj.getDate() === 5 && dateObj.getMonth() === 1; // 5-fevral
        });

        console.log(`📊 Topilgan foydalanuvchilar: ${filteredUsers.length}\n`);

        if (filteredUsers.length === 0) {
            console.log('❌ 5-fevral 2026 kuni ro\'yxatdan o\'tgan foydalanuvchilar topilmadi');
            return;
        }

        // Excel workbook yaratish
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('5-Fevral 2026');

        // Sarlavha qo'shish
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = '5-FEVRAL 2026 KUNI RO\'YXATDAN O\'TGAN FOYDALANUVCHILAR';
        titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 30;

        // Ustun sarlavhalari
        worksheet.getRow(2).values = ['№', 'Ism', 'Telefon', 'Rol', 'Sana', 'Vaqt'];
        
        // Sarlavha stilini sozlash
        worksheet.getRow(2).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF5B9BD5' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        worksheet.getRow(2).height = 25;

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

            // Qator stilini sozlash
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                
                // Raqam ustunini markazga
                if (colNumber === 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    cell.alignment = { vertical: 'middle' };
                }

                // Juft qatorlarni rangga bo'yash
                if (index % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE7E6E6' }
                    };
                }
            });
            row.height = 20;
        });

        // Ustun kengliklarini sozlash
        worksheet.getColumn(1).width = 8;   // №
        worksheet.getColumn(2).width = 30;  // Ism
        worksheet.getColumn(3).width = 18;  // Telefon
        worksheet.getColumn(4).width = 15;  // Rol
        worksheet.getColumn(5).width = 15;  // Sana
        worksheet.getColumn(6).width = 12;  // Vaqt

        // Jami qatorini qo'shish
        const totalRow = worksheet.addRow(['', '', '', '', 'JAMI:', filteredUsers.length]);
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFD966' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            if (colNumber >= 5) {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
        });
        totalRow.height = 25;

        // Fayl nomini yaratish
        const fileName = 'users-5-fevral-2026.xlsx';
        const filePath = join(__dirname, '..', fileName);

        // Faylga yozish
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
        console.log(`\n✅ Jami: ${filteredUsers.length} ta foydalanuvchi (5-fevral 2026)\n`);

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB ulanishi yopildi');
    }
}

// Scriptni ishga tushirish
exportUsersFeb5Excel();
