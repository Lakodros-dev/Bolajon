import { sendRegistrationNotification } from '../lib/telegram.js';

// Test ma'lumotlari
const testUser = {
  name: 'Test Foydalanuvchi',
  phone: '+998901234567',
  role: 'teacher',
  email: 'test@example.com'
};

console.log('Ro\'yxatdan o\'tish xabarini yuborish...\n');
console.log('Test foydalanuvchi:', testUser);

const result = await sendRegistrationNotification(testUser);

if (result) {
  console.log('\n✅ Xabar muvaffaqiyatli yuborildi!');
  console.log('Kanalda quyidagi xabarni ko\'rishingiz kerak:');
  console.log('---');
  console.log('🎉 Yangi foydalanuvchi ro\'yxatdan o\'tdi!');
  console.log('👤 Ism: Test Foydalanuvchi');
  console.log('📱 Telefon: +998901234567');
  console.log('👥 Rol: O\'qituvchi');
  console.log('⏰ Vaqt: [hozirgi vaqt]');
} else {
  console.log('\n❌ Xabar yuborishda xatolik!');
  console.log('Tekshiring:');
  console.log('1. Bot tokeni to\'g\'ri');
  console.log('2. Kanal ID to\'g\'ri');
  console.log('3. Bot kanalga admin sifatida qo\'shilgan');
  console.log('4. Botga "Post messages" huquqi berilgan');
}
