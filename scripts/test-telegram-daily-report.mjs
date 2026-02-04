import { sendDailyReport } from '../lib/telegram.js';

// Test statistika ma'lumotlari
const testStats = {
  totalUsers: 150,
  newUsersToday: 5,
  activeUsers: 45,
  totalTeachers: 12,
  totalStudents: 138,
  totalLessons: 150,
  lessonsCompletedToday: 78,
  gamesPlayedToday: 234,
  rewardsRedeemedToday: 15,
  starsEarnedToday: 456,
  activeSubscriptions: 120,
  trialSubscriptions: 30
};

console.log('Kunlik hisobotni yuborish...\n');
console.log('Test statistika:', testStats);

const result = await sendDailyReport(testStats);

if (result) {
  console.log('\n✅ Hisobot muvaffaqiyatli yuborildi!');
  console.log('Kanalda quyidagi hisobotni ko\'rishingiz kerak:');
  console.log('---');
  console.log('📊 KUNLIK HISOBOT');
  console.log('📅 [bugungi sana]');
  console.log('');
  console.log('👥 Foydalanuvchilar:');
  console.log('   • Jami: 150');
  console.log('   • Bugun qo\'shilgan: 5');
  console.log('   • Faol: 45');
  console.log('');
  console.log('👨‍🏫 O\'qituvchilar: 12');
  console.log('👨‍🎓 O\'quvchilar: 138');
  console.log('');
  console.log('📚 Darslar:');
  console.log('   • Jami: 150');
  console.log('   • Bugun bajarilgan: 78');
  console.log('');
  console.log('🎮 O\'yinlar:');
  console.log('   • Bugun o\'ynalgan: 234');
  console.log('');
  console.log('🎁 Mukofotlar:');
  console.log('   • Bugun sotib olingan: 15');
  console.log('');
  console.log('⭐ Yulduzlar:');
  console.log('   • Bugun to\'plangan: 456');
  console.log('');
  console.log('💰 Obunalar:');
  console.log('   • Faol: 120');
  console.log('   • Sinov: 30');
} else {
  console.log('\n❌ Hisobot yuborishda xatolik!');
  console.log('Tekshiring:');
  console.log('1. Bot tokeni to\'g\'ri');
  console.log('2. Kanal ID to\'g\'ri');
  console.log('3. Bot kanalga admin sifatida qo\'shilgan');
  console.log('4. Botga "Post messages" huquqi berilgan');
}
