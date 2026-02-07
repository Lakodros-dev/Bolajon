# Payme Integratsiyasi - Bolajoon.uz

## 📋 Umumiy ma'lumot

Bolajoon.uz platformasiga Payme to'lov tizimi to'liq integratsiya qilindi. Foydalanuvchilar balanslarini Payme orqali xavfsiz va tezkor to'ldirishlari mumkin.

## 🔧 Sozlash

### 1. Payme Merchant Account

1. [https://merchant.paycom.uz](https://merchant.paycom.uz) saytiga kiring
2. Yangi merchant yarating yoki mavjudini tanlang
3. Quyidagi ma'lumotlarni oling:
   - **Merchant ID** (m_...)
   - **Secret Key** (test yoki production)

### 2. Environment Variables

`.env` fayliga quyidagi qiymatlarni qo'shing:

```env
# Payme Configuration
PAYME_MERCHANT_ID=your_merchant_id_here
PAYME_SECRET_KEY=your_secret_key_here
PAYME_ENDPOINT=https://checkout.paycom.uz/api
```

### 3. Callback URL sozlash

Payme merchant panelida callback URL ni sozlang:

```
https://bolajoon.uz/api/payme/callback
```

## 📁 Fayl tuzilmasi

```
├── lib/
│   └── payme.js                          # Payme kutubxonasi
├── app/
│   └── api/
│       └── payme/
│           ├── callback/
│           │   └── route.js              # Payme callback handler
│           ├── create-payment/
│           │   └── route.js              # To'lov yaratish
│           └── check-payment/
│               └── route.js              # To'lovni tekshirish
└── app/
    └── dashboard/
        └── profile/
            └── page.js                   # Frontend (Payme tugmasi)
```

## 🔄 Ishlash jarayoni

### 1. To'lov yaratish

```javascript
// Frontend
const response = await fetch('/api/payme/create-payment', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ amount: 10000 }) // so'mda
});

const { paymeUrl } = await response.json();
window.location.href = paymeUrl; // Payme ga yo'naltirish
```

### 2. Payme Callback

Payme quyidagi metodlarni chaqiradi:

- **CheckPerformTransaction** - To'lovni amalga oshirish mumkinligini tekshirish
- **CreateTransaction** - Tranzaksiya yaratish
- **PerformTransaction** - To'lovni amalga oshirish (balansni to'ldirish)
- **CancelTransaction** - To'lovni bekor qilish
- **CheckTransaction** - Tranzaksiya holatini tekshirish
- **GetStatement** - Tranzaksiyalar hisobotini olish

### 3. Balansni to'ldirish

To'lov muvaffaqiyatli bo'lganda:
1. Payme `PerformTransaction` metodini chaqiradi
2. Foydalanuvchi balansi avtomatik to'ldiriladi
3. Tranzaksiya ma'lumotlari `payme_transactions` kolleksiyasida saqlanadi

## 💾 Database Schema

### payme_transactions

```javascript
{
    paymeTransactionId: String,    // Payme tranzaksiya ID
    userId: String,                // Foydalanuvchi ID
    amount: Number,                // Summa (so'mda)
    state: Number,                 // Holat (1: yaratildi, 2: amalga oshirildi, -1/-2: bekor qilindi)
    createTime: Number,            // Yaratilgan vaqt (timestamp)
    performTime: Number,           // Amalga oshirilgan vaqt
    cancelTime: Number,            // Bekor qilingan vaqt
    reason: Number,                // Bekor qilish sababi
    createdAt: Date               // MongoDB timestamp
}
```

## 🔒 Xavfsizlik

1. **Signature Verification** - Har bir Payme so'rovi tekshiriladi
2. **Authorization Header** - Basic auth bilan himoyalangan
3. **Secret Key** - Faqat serverda saqlanadi
4. **Transaction Validation** - Har bir tranzaksiya tekshiriladi

## 🧪 Test rejimi

Test uchun Payme test kartalaridan foydalaning:

- **Karta raqami:** 8600 0000 0000 0000
- **Amal qilish muddati:** 03/99
- **SMS kod:** 666666

## 📊 Monitoring

Tranzaksiyalarni kuzatish:

```javascript
// MongoDB da
db.payme_transactions.find({ userId: "user_id" }).sort({ createdAt: -1 })

// Holatlar:
// 1  - Yaratildi
// 2  - Amalga oshirildi (muvaffaqiyatli)
// -1 - Bekor qilindi (yaratilgandan keyin)
// -2 - Qaytarildi (amalga oshirilgandan keyin)
```

## 🐛 Debugging

Callback xatolarini tekshirish:

```bash
# Server logs
tail -f logs/payme.log

# MongoDB logs
db.payme_transactions.find({ state: { $lt: 0 } })
```

## 📞 Qo'llab-quvvatlash

Muammolar yuzaga kelsa:

1. Payme merchant panelini tekshiring
2. Callback URL to'g'riligini tasdiqlang
3. Secret Key to'g'riligini tekshiring
4. Server loglarini ko'rib chiqing

## 🚀 Production ga o'tkazish

1. Test rejimidan production rejimiga o'ting
2. Production Secret Key ni oling
3. `.env` faylini yangilang
4. Callback URL ni production domenga o'zgartiring
5. SSL sertifikatini tekshiring (HTTPS majburiy)

## ✅ Checklist

- [ ] Payme merchant account yaratildi
- [ ] Merchant ID va Secret Key olindi
- [ ] `.env` fayli to'ldirildi
- [ ] Callback URL sozlandi
- [ ] Test to'lov amalga oshirildi
- [ ] Production ga o'tkazildi

## 📚 Qo'shimcha resurslar

- [Payme API Documentation](https://developer.help.paycom.uz/)
- [Payme Merchant Panel](https://merchant.paycom.uz)
- [Payme Test Cards](https://developer.help.paycom.uz/test-cards)
