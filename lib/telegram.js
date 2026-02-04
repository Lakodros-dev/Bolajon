import TelegramBot from 'node-telegram-bot-api';
import ExcelJS from 'exceljs';
import User from '../models/User.js';
import Student from '../models/Student.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8123574882:AAH7h-BM2zInWdln4RwPVoYZfaOjqLbSkXI';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003764341768';

let bot = null;

// Bot ni ishga tushirish
function initBot() {
  if (!bot && TELEGRAM_BOT_TOKEN) {
    try {
      bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
    } catch (error) {
      console.error('Telegram bot xatosi:', error);
    }
  }
  return bot;
}

// Xabar yuborish
export async function sendTelegramMessage(message) {
  try {
    const telegramBot = initBot();
    if (!telegramBot) {
      console.error('Telegram bot ishga tushmadi');
      return false;
    }

    await telegramBot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML'
    });
    return true;
  } catch (error) {
    console.error('Telegram xabar yuborishda xato:', error);
    return false;
  }
}

// Ro'yxatdan o'tish xabari
export async function sendRegistrationNotification(user) {
  const now = new Date();
  const uzbekTime = new Date(now.getTime() + (5 * 60 * 60 * 1000)); // UTC+5
  
  const message = `
🎉 <b>Yangi foydalanuvchi ro'yxatdan o'tdi!</b>

👤 <b>Ism:</b> ${user.name || 'Noma\'lum'}
📱 <b>Telefon:</b> ${user.phone || 'Noma\'lum'}
👥 <b>Rol:</b> ${user.role === 'teacher' ? 'O\'qituvchi' : user.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
📧 <b>Email:</b> ${user.email || 'Yo\'q'}
⏰ <b>Vaqt:</b> ${uzbekTime.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
  `.trim();

  return await sendTelegramMessage(message);
}

// Kunlik hisobot
export async function sendDailyReport(stats, startOfPeriod, endOfPeriod) {
  const now = new Date();
  const uzbekTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  
  const dateStr = uzbekTime.toLocaleDateString('uz-UZ', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Tashkent' 
  });
  
  const message = `
📊 <b>KUNLIK HISOBOT</b>
📅 ${dateStr}

🆕 <b>Bugun RO'YXATDAN O'TDI</b>
🎓 O'quvchilar: ${stats.newStudentsToday || 0} ta
👨‍🏫 O'qituvchilar: ${stats.newTeachersToday || 0} ta
🟢 Faol: ${stats.activeUsers || 0} ta

💳 <b>OBUNALAR</b>
✅ Faol obuna: ${stats.activeSubscriptions || 0} ta
🎁 Trial: ${stats.trialSubscriptions || 0} ta
⏸️ Obunasiz: ${stats.noSubscription || 0} ta

📈 <b>UMUMIY</b>
👥 Jami: ${stats.totalUsers || 0} ta
🎓 O'quvchilar: ${stats.totalStudents || 0} ta
👨‍🏫 O'qituvchilar: ${stats.totalTeachers || 0} ta
  `.trim();

  try {
    const telegramBot = initBot();
    if (!telegramBot) {
      console.error('Telegram bot ishga tushmadi');
      return false;
    }

    // API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bolajoon.uz';
    const excelUrl = `${apiUrl}/api/export/daily-report?date=${now.toISOString()}`;
    
    // Xabarni tugma bilan yuborish
    await telegramBot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Excel yuklab olish',
              url: excelUrl
            }
          ]
        ]
      }
    });

    return true;
  } catch (error) {
    console.error('Telegram xabar yuborishda xato:', error);
    return false;
  }
}

// Excel hisobot yaratish
async function generateExcelReport(startOfPeriod, endOfPeriod, stats) {
  // Barcha foydalanuvchilarni olish (admin bundan mustasno)
  const users = await User.find({ role: { $ne: 'admin' } })
    .select('name phone role subscriptionStatus subscriptionEndDate trialStartDate createdAt lastLogin')
    .lean();

  const students = await Student.find()
    .select('name phone teacherId createdAt')
    .lean();

  // Excel fayl yaratish
  const workbook = new ExcelJS.Workbook();
  
  // O'qituvchilar sheet
  const teachersSheet = workbook.addWorksheet('O\'qituvchilar');
  teachersSheet.columns = [
    { header: 'Ism', key: 'name', width: 25 },
    { header: 'Telefon', key: 'phone', width: 15 },
    { header: 'Obuna holati', key: 'subscription', width: 15 },
    { header: 'Obuna tugashi', key: 'endDate', width: 20 },
    { header: 'Ro\'yxatdan o\'tgan', key: 'createdAt', width: 20 },
    { header: 'Oxirgi kirish', key: 'lastLogin', width: 20 }
  ];

  const teachers = users.filter(u => u.role === 'teacher');
  teachers.forEach(teacher => {
    teachersSheet.addRow({
      name: teacher.name,
      phone: teacher.phone,
      subscription: teacher.subscriptionStatus === 'active' ? 'Faol' : 
                   teacher.subscriptionStatus === 'trial' ? 'Trial' : 'Obunasiz',
      endDate: teacher.subscriptionEndDate ? 
               new Date(teacher.subscriptionEndDate).toLocaleDateString('uz-UZ') : '-',
      createdAt: new Date(teacher.createdAt).toLocaleDateString('uz-UZ'),
      lastLogin: teacher.lastLogin ? 
                 new Date(teacher.lastLogin).toLocaleDateString('uz-UZ') : '-'
    });
  });

  // O'quvchilar sheet
  const studentsSheet = workbook.addWorksheet('O\'quvchilar');
  studentsSheet.columns = [
    { header: 'Ism', key: 'name', width: 25 },
    { header: 'Telefon', key: 'phone', width: 15 },
    { header: 'Ro\'yxatdan o\'tgan', key: 'createdAt', width: 20 }
  ];

  students.forEach(student => {
    studentsSheet.addRow({
      name: student.name,
      phone: student.phone,
      createdAt: new Date(student.createdAt).toLocaleDateString('uz-UZ')
    });
  });

  // Statistika sheet
  const statsSheet = workbook.addWorksheet('Statistika');
  statsSheet.columns = [
    { header: 'Ko\'rsatkich', key: 'label', width: 30 },
    { header: 'Qiymat', key: 'value', width: 15 }
  ];

  statsSheet.addRow({ label: 'Davr', value: `${startOfPeriod.toLocaleDateString('uz-UZ')} - ${endOfPeriod.toLocaleDateString('uz-UZ')}` });
  statsSheet.addRow({ label: '', value: '' });
  statsSheet.addRow({ label: 'BUGUN RO\'YXATDAN O\'TDI', value: '' });
  statsSheet.addRow({ label: 'O\'qituvchilar', value: stats.newTeachersToday });
  statsSheet.addRow({ label: 'O\'quvchilar', value: stats.newStudentsToday });
  statsSheet.addRow({ label: 'Faol', value: stats.activeUsers });
  statsSheet.addRow({ label: '', value: '' });
  statsSheet.addRow({ label: 'OBUNALAR', value: '' });
  statsSheet.addRow({ label: 'Faol obuna', value: stats.activeSubscriptions });
  statsSheet.addRow({ label: 'Trial', value: stats.trialSubscriptions });
  statsSheet.addRow({ label: 'Obunasiz', value: stats.noSubscription });
  statsSheet.addRow({ label: '', value: '' });
  statsSheet.addRow({ label: 'UMUMIY', value: '' });
  statsSheet.addRow({ label: 'Jami foydalanuvchilar', value: stats.totalUsers });
  statsSheet.addRow({ label: 'O\'qituvchilar', value: stats.totalTeachers });
  statsSheet.addRow({ label: 'O\'quvchilar', value: stats.totalStudents });

  // Excel faylni buffer ga yozish
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
