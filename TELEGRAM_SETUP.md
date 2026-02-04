# Telegram Bot Sozlamalari

## O'rnatilgan funksiyalar

### 1. Ro'yxatdan o'tish xabarlari
Har safar yangi foydalanuvchi ro'yxatdan o'tganda avtomatik ravishda Telegram ga xabar yuboriladi.

**Xabar tarkibi:**
- Foydalanuvchi ismi
- Telefon raqami
- Roli (O'qituvchi/Admin)
- Email (agar mavjud bo'lsa)
- Ro'yxatdan o'tgan vaqt (O'zbekiston vaqti)

### 2. Kunlik hisobotlar
Har kuni soat 20:00 da (O'zbekiston vaqti) avtomatik hisobot yuboriladi.

**Hisobot tarkibi:**
- Jami foydalanuvchilar soni
- Bugun qo'shilgan yangi foydalanuvchilar
- Faol foydalanuvchilar
- O'qituvchilar soni
- O'quvchilar soni
- Darslar statistikasi
- O'yinlar statistikasi
- Mukofotlar statistikasi
- Yulduzlar statistikasi
- Obunalar holati

## Sozlash

### 1. .env faylida sozlamalar
```env
TELEGRAM_BOT_TOKEN=8123574882:AAH7h-BM2zInWdln4RwPVoYZfaOjqLbSkXI
TELEGRAM_CHAT_ID=-1003764341768
CRON_SECRET=bolajon-cron-secret-2024
```

**Muhim:** Bot kanalga xabar yuborishi uchun:
1. Botni kanalga admin sifatida qo'shing
2. Botga "Post messages" huquqini bering

### 2. Mahalliy muhitda ishga tushirish

Kunlik hisobotni qo'lda test qilish:
```bash
curl -H "Authorization: Bearer bolajon-cron-secret-2024" http://localhost:3007/api/cron/daily-report
```

### 3. Production muhitida

#### Vercel da
Vercel avtomatik ravishda `vercel.json` faylidagi cron sozlamalarini o'qiydi va har kuni soat 15:00 UTC (20:00 O'zbekiston vaqti) da ishga tushiradi.

#### VPS da
Cron job qo'shish:
```bash
crontab -e
```

Quyidagi qatorni qo'shing:
```
0 15 * * * curl -H "Authorization: Bearer bolajon-cron-secret-2024" https://bolajon.uz/api/cron/daily-report
```

## Test qilish

### Ro'yxatdan o'tish xabarini test qilish
Yangi foydalanuvchi ro'yxatdan o'tkazish orqali test qiling:
```bash
curl -X POST http://localhost:3007/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+998901234567",
    "password": "test123",
    "role": "teacher"
  }'
```

### Kunlik hisobotni test qilish
```bash
curl -H "Authorization: Bearer bolajon-cron-secret-2024" http://localhost:3007/api/cron/daily-report
```

## Xatoliklarni bartaraf etish

### Bot xabar yubormayapti
1. Bot tokenini tekshiring
2. Chat ID to'g'riligini tekshiring
3. Bot sizning chat ID ga xabar yuborish huquqiga ega ekanligini tekshiring
4. Botni `/start` buyrug'i bilan ishga tushiring

### Cron job ishlamayapti
1. CRON_SECRET to'g'riligini tekshiring
2. Vercel da cron sozlamalari to'g'ri ekanligini tekshiring
3. VPS da crontab sozlamalari to'g'ri ekanligini tekshiring

## Qo'shimcha ma'lumot

- Bot polling rejimida emas, faqat xabar yuborish uchun ishlatiladi
- Barcha vaqtlar O'zbekiston vaqti (UTC+5) da ko'rsatiladi
- Xatoliklar console ga yoziladi, lekin asosiy funksiyalarni to'xtatmaydi
