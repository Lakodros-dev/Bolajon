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
export async function sendTelegramMessage(message, options = {}) {
  try {
    const telegramBot = initBot();
    if (!telegramBot) {
      console.error('Telegram bot ishga tushmadi');
      return false;
    }

    await telegramBot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      ...options
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
  const uzbekTime = now; // toLocaleString handles the timezone conversion

  const message = `
🎉 <b>Yangi foydalanuvchi ro'yxatdan o'tdi!</b>

👤 <b>Ism:</b> ${user.name || 'Noma\'lum'}
📱 <b>Telefon:</b> ${user.phone || 'Noma\'lum'}
👥 <b>Rol:</b> ${user.role === 'teacher' ? 'O\'qituvchi' : user.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
⏰ <b>Vaqt:</b> ${uzbekTime.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
  `.trim();

  return await sendTelegramMessage(message);
}

// Hujjat yuborish (Excel va boshqalar)
export async function sendTelegramDocument(buffer, fileName, caption) {
  try {
    const telegramBot = initBot();
    if (!telegramBot) {
      console.error('Telegram bot ishga tushmadi');
      return false;
    }

    await telegramBot.sendDocument(TELEGRAM_CHAT_ID, buffer, {
      caption: caption || 'Hujjat'
    }, {
      filename: fileName,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    return true;
  } catch (error) {
    console.error('Telegram hujjat yuborishda xato:', error);
    return false;
  }
}

// Kunlik hisobot
export async function sendDailyReport(stats, startOfPeriod, endOfPeriod) {
  const now = new Date();
  const uzbekTime = now;

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

    // Xabarni tugma bilan yuborish
    // callback_data ishlatamiz, bu foydalanuvchini saytga olib o'tmaydi
    await telegramBot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Excel faylini yuborish',
              callback_data: `export_excel_${now.toISOString()}`
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
export async function generateExcelReport(startOfPeriod, endOfPeriod, stats) {
  const users = await User.find({ role: { $ne: 'admin' } })
    .select('name phone role subscriptionStatus subscriptionEndDate trialStartDate createdAt lastLogin')
    .sort({ createdAt: -1 })
    .lean();

  const students = await Student.find()
    .select('name phone teacherId createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const workbook = new ExcelJS.Workbook();

  // Style config
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }, // Dark blue
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const cellStyle = {
    alignment: { vertical: 'middle', horizontal: 'left' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // 1. O'qituvchilar sheet
  const teachersSheet = workbook.addWorksheet('O\'qituvchilar');
  teachersSheet.columns = [
    { header: '№', key: 'index', width: 5 },
    { header: 'Ism', key: 'name', width: 30 },
    { header: 'Telefon', key: 'phone', width: 20 },
    { header: 'Obuna holati', key: 'subscription', width: 15 },
    { header: 'Obuna tugashi', key: 'endDate', width: 20 },
    { header: 'Ro\'yxatdan o\'tgan', key: 'createdAt', width: 20 },
    { header: 'Oxirgi kirish', key: 'lastLogin', width: 20 }
  ];

  // Header styling
  teachersSheet.getRow(1).eachCell(cell => { cell.style = headerStyle; cell.height = 25; });

  const teachers = users.filter(u => u.role === 'teacher');
  teachers.forEach((teacher, idx) => {
    const row = teachersSheet.addRow({
      index: idx + 1,
      name: teacher.name,
      phone: teacher.phone,
      subscription: teacher.subscriptionStatus === 'active' ? '✅ Faol' :
        teacher.subscriptionStatus === 'trial' ? '🎁 Trial' : '❌ Obunasiz',
      endDate: teacher.subscriptionEndDate ?
        new Date(teacher.subscriptionEndDate).toLocaleDateString('uz-UZ') : '-',
      createdAt: new Date(teacher.createdAt).toLocaleDateString('uz-UZ'),
      lastLogin: teacher.lastLogin ?
        new Date(teacher.lastLogin).toLocaleDateString('uz-UZ') : '-'
    });

    row.eachCell(cell => { cell.style = cellStyle; });
    if (idx % 2 === 0) {
      row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; });
    }
  });

  // 2. O'quvchilar sheet
  const studentsSheet = workbook.addWorksheet('O\'quvchilar');
  studentsSheet.columns = [
    { header: '№', key: 'index', width: 5 },
    { header: 'Ism', key: 'name', width: 30 },
    { header: 'Telefon', key: 'phone', width: 20 },
    { header: 'Ro\'yxatdan o\'tgan', key: 'createdAt', width: 20 }
  ];

  studentsSheet.getRow(1).eachCell(cell => { cell.style = headerStyle; cell.height = 25; });

  students.forEach((student, idx) => {
    const row = studentsSheet.addRow({
      index: idx + 1,
      name: student.name,
      phone: student.phone,
      createdAt: new Date(student.createdAt).toLocaleDateString('uz-UZ')
    });
    row.eachCell(cell => { cell.style = cellStyle; });
    if (idx % 2 === 0) {
      row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; });
    }
  });

  // 3. Statistika sheet
  const statsSheet = workbook.addWorksheet('Statistika');

  // Dashboard Header
  statsSheet.mergeCells('A1:C1');
  const titleCell = statsSheet.getCell('A1');
  titleCell.value = 'KUNLIK HISOBOT VA KORSATKICHLAR';
  titleCell.style = {
    font: { bold: true, size: 16, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };
  statsSheet.getRow(1).height = 40;

  statsSheet.mergeCells('A2:C2');
  const periodCell = statsSheet.getCell('A2');
  periodCell.value = `Davr: ${startOfPeriod.toLocaleDateString('uz-UZ')} - ${endOfPeriod.toLocaleDateString('uz-UZ')}`;
  periodCell.style = {
    font: { italic: true },
    alignment: { horizontal: 'center' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  };

  // Section Headers
  const sectionHeaderStyle = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } },
    border: { bottom: { style: 'medium' } }
  };

  const addStatRow = (rowNum, label, value, isNew = false) => {
    const row = statsSheet.getRow(rowNum);
    row.getCell(1).value = label;
    row.getCell(2).value = value;
    row.getCell(1).style = { font: { bold: true }, ...cellStyle };
    row.getCell(2).style = { ...cellStyle, alignment: { horizontal: 'center' } };
    if (isNew) {
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    }
    return rowNum + 1;
  };

  let currentRow = 4;

  statsSheet.getRow(currentRow).getCell(1).value = 'BUGUN RO\'YXATDAN O\'TDI';
  statsSheet.getRow(currentRow).getCell(1).style = sectionHeaderStyle;
  statsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
  currentRow++;

  currentRow = addStatRow(currentRow, 'Yangi o\'qituvchilar', stats.newTeachersToday, true);
  currentRow = addStatRow(currentRow, 'Yangi o\'quvchilar', stats.newStudentsToday, true);
  currentRow = addStatRow(currentRow, 'Bugun faol foydalanuvchilar', stats.activeUsers, true);
  currentRow++;

  statsSheet.getRow(currentRow).getCell(1).value = 'OBUNALAR HOLATI';
  statsSheet.getRow(currentRow).getCell(1).style = sectionHeaderStyle;
  statsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
  currentRow++;

  currentRow = addStatRow(currentRow, 'Faol obunalar', stats.activeSubscriptions);
  currentRow = addStatRow(currentRow, 'Trial (sinov) obunalar', stats.trialSubscriptions);
  currentRow = addStatRow(currentRow, 'Obunasiz foydalanuvchilar', stats.noSubscription);
  currentRow++;

  statsSheet.getRow(currentRow).getCell(1).value = 'UMUMIY STATISTIKA';
  statsSheet.getRow(currentRow).getCell(1).style = sectionHeaderStyle;
  statsSheet.mergeCells(`A${currentRow}:C${currentRow}`);
  currentRow++;

  currentRow = addStatRow(currentRow, 'Jami foydalanuvchilar', stats.totalUsers);
  currentRow = addStatRow(currentRow, 'Jami o\'qituvchilar', stats.totalTeachers);
  currentRow = addStatRow(currentRow, 'Jami o\'quvchilar', stats.totalStudents);

  statsSheet.getColumn(1).width = 35;
  statsSheet.getColumn(2).width = 15;

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
