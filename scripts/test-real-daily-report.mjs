import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env faylini yuklash
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { sendDailyReport } from '../lib/telegram.js';

console.log('Real ma\'lumotlardan kunlik hisobot tayyorlanmoqda...\n');

await connectDB();

// Kecha soat 20:00 dan bugun soat 20:00 gacha (O'zbekiston vaqti)
const now = new Date();
const uzbekNow = now; // setHours and toLocaleString below handle timezone

// Bugun soat 20:00 (Asia/Tashkent)
const endOfPeriod = new Date(uzbekNow);
// setHours ishlatganda ehtiyot bo'lish kerak, chunki u lokal vaqtni ishlatadi.
// Lekin bu script odatda serverda yoki UZ vaqti bilan sozlangan joyda ishlaydi.
// To'g'rirog'i, bizga aynan hozirgi kungi 20:00 kerak.
endOfPeriod.setHours(20, 0, 0, 0);

// Kecha soat 20:00
const startOfPeriod = new Date(endOfPeriod);
startOfPeriod.setDate(startOfPeriod.getDate() - 1);

console.log('Statistika yig\'ilmoqda...');
console.log(`Davr: ${startOfPeriod.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })} dan`);
console.log(`      ${endOfPeriod.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })} gacha\n`);

// Statistikani yig'ish (kecha 20:00 dan bugun 20:00 gacha)
// Admin hisobga olinmaydi
const [
  totalUsers,
  newUsersToday,
  newTeachersToday,
  newStudentsToday,
  activeUsers,
  totalTeachers,
  totalStudents,
  activeSubscriptions,
  trialSubscriptions,
  noSubscription
] = await Promise.all([
  User.countDocuments({ role: { $ne: 'admin' } }),
  User.countDocuments({
    role: { $ne: 'admin' },
    createdAt: { $gte: startOfPeriod, $lt: endOfPeriod }
  }),
  User.countDocuments({
    role: 'teacher',
    createdAt: { $gte: startOfPeriod, $lt: endOfPeriod }
  }),
  Student.countDocuments({
    createdAt: { $gte: startOfPeriod, $lt: endOfPeriod }
  }),
  User.countDocuments({
    role: { $ne: 'admin' },
    lastLogin: { $gte: startOfPeriod, $lt: endOfPeriod }
  }),
  User.countDocuments({ role: 'teacher' }),
  Student.countDocuments(),
  User.countDocuments({
    role: { $ne: 'admin' },
    subscriptionStatus: 'active',
    subscriptionEndDate: { $gte: new Date() }
  }),
  User.countDocuments({
    role: { $ne: 'admin' },
    subscriptionStatus: 'trial',
    trialStartDate: { $exists: true }
  }),
  User.countDocuments({
    role: { $ne: 'admin' },
    $or: [
      { subscriptionStatus: { $exists: false } },
      { subscriptionStatus: null },
      { subscriptionStatus: 'inactive' }
    ]
  })
]);

const stats = {
  totalUsers,
  newUsersToday,
  newTeachersToday,
  newStudentsToday,
  activeUsers,
  totalTeachers,
  totalStudents,
  activeSubscriptions,
  trialSubscriptions,
  noSubscription
};

console.log('\nReal statistika:');
console.log('================');
console.log(`Jami foydalanuvchilar: ${totalUsers}`);
console.log(`Bugun qo'shilgan: ${newUsersToday}`);
console.log(`  - O'qituvchilar: ${newTeachersToday}`);
console.log(`  - O'quvchilar: ${newStudentsToday}`);
console.log(`Faol foydalanuvchilar: ${activeUsers}`);
console.log(`Jami o'qituvchilar: ${totalTeachers}`);
console.log(`Jami o'quvchilar: ${totalStudents}`);
console.log(`Faol obuna: ${activeSubscriptions}`);
console.log(`Trial: ${trialSubscriptions}`);
console.log(`Obunasiz: ${noSubscription}`);
console.log('================\n');

console.log('Telegram ga yuborilmoqda...');

const result = await sendDailyReport(stats, startOfPeriod, endOfPeriod);

if (result) {
  console.log('\n✅ Real hisobot muvaffaqiyatli yuborildi!');
} else {
  console.log('\n❌ Hisobot yuborishda xatolik!');
}

process.exit(0);
