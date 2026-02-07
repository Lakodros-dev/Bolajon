import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

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

async function exportUsersToExcel() {
    try {
        console.log('🔌 MongoDB ga ulanish...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        // 2026 yil 4-fevral kuni (00:00:00 dan 23:59:59 gacha)
        const startDate = new Date('2026-02-04T00:00:00.000Z');
        const endDate = new Date('2026-02-04T23:59:59.999Z');

        console.log('📅 Qidiruv sanasi: 4-fevral 2026\n');

        // 4-fevral kuni ro'yxatdan o'tgan foydalanuvchilarni topish
        const users = await User.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: 1 }).lean();

        console.log(`📊 Topilgan foydalanuvchilar: ${users.length}\n`);

        if (users.length === 0) {
            console.log('❌ 4-fevral 2026 kuni ro\'yxatdan o\'tgan foydalanuvchilar topilmadi');
            return;
        }

        // Excel fayl yaratish
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('4-Fevral 2026 Ro\'yxat', {
            properties: { tabColor: { argb: 'FF00FF00' } }
        });

        // Sarlavha qo'shish
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = '4-FEVRAL 2026 KUNI RO\'YXATDAN O\'TGAN FOYDALANUVCHILAR';
        titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 30;

        // Statistika qo'shish
        worksheet.mergeCells('A2:F2');
        const statsCell = worksheet.getCell('A2');
        statsCell.value = `Jami: ${users.length} ta foydalanuvchi`;
        statsCell.font = { size: 12, bold: true };
        statsCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(2).height = 25;

        // Bo'sh qator
        worksheet.getRow(3).height = 10;

        // Ustun sarlavhalari
        const headerRow = worksheet.getRow(4);
        const headers = ['№', 'ISM-FAMILYA', 'TELEFON RAQAM', 'ROL', 'RO\'YXATDAN O\'TGAN SANA', 'RO\'YXATDAN O\'TGAN VAQT'];
        
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF70AD47' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        headerRow.height = 25;

        // Ma'lumotlarni qo'shish
        users.forEach((user, index) => {
            const rowIndex = index + 5;
            const row = worksheet.getRow(rowIndex);
            
            const dateObj = new Date(user.createdAt);
            const date = dateObj.toLocaleDateString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const time = dateObj.toLocaleTimeString('uz-UZ', { 
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
            });

            const rowData = [
                index + 1,
                user.name || 'N/A',
                user.phone || 'N/A',
                user.role === 'admin' ? 'Administrator' : 'O\'qituvchi',
                date,
                time
            ];

            rowData.forEach((value, colIndex) => {
                const cell = row.getCell(colIndex + 1);
                cell.value = value;
                cell.alignment = { 
                    vertical: 'middle', 
                    horizontal: colIndex === 0 ? 'center' : 'left' 
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                };
                
                // Alternativ rang
                if (index % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' }
                    };
                }
            });
            
            row.height = 20;
        });

        // Ustun kengliklarini sozlash
        worksheet.getColumn(1).width = 8;   // №
        worksheet.getColumn(2).width = 30;  // ISM-FAMILYA
        worksheet.getColumn(3).width = 18;  // TELEFON
        worksheet.getColumn(4).width = 15;  // ROL
        worksheet.getColumn(5).width = 20;  // SANA
        worksheet.getColumn(6).width = 20;  // VAQT

        // Desktop papkasiga saqlash
        const desktopPath = join(homedir(), 'Desktop');
        const fileName = 'Royxatdan_Otganlar_4-Fevral-2026.xlsx';
        const filePath = join(desktopPath, fileName);

        await workbook.xlsx.writeFile(filePath);

        console.log('✅ Excel fayl muvaffaqiyatli yaratildi!');
        console.log(`📁 Fayl joylashuvi: ${filePath}`);
        console.log(`📊 Jami: ${users.length} ta foydalanuvchi\n`);

    } catch (error) {
        console.error('❌ Xatolik:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB ulanishi yopildi');
    }
}

// Scriptni ishga tushirish
exportUsersToExcel();
