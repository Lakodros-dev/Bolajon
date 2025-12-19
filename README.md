# Bolajon.uz

Bolalar uchun ingliz tili o'rgatish platformasi (5-9 yosh)

## 🚀 Texnologiyalar

- **Frontend:** Next.js 14 (App Router), Bootstrap 5, React Bootstrap
- **Backend:** Next.js API Routes
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs

## 📦 O'rnatish

```bash
# Loyihani klonlash
git clone <repo-url>
cd bolajon-uz

# Paketlarni o'rnatish
npm install

# .env.local faylini yaratish
cp .env.local.example .env.local
# MONGODB_URI va JWT_SECRET ni o'zgartiring

# Ma'lumotlar bazasini to'ldirish
node scripts/seed.mjs

# Serverni ishga tushirish
npm run dev
```

## 🌐 Deployment (Vercel)

1. GitHub ga push qiling
2. Vercel.com da import qiling
3. Environment variables qo'shing:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Xavfsiz kalit (32+ belgi)
   - `NEXT_PUBLIC_APP_URL` - Sayt URL

```bash
# Production build
npm run build
npm start
```

## 🔐 Login ma'lumotlari

| Role | Email | Parol |
|------|-------|-------|
| Admin | admin@bolajon.uz | admin123 |
| Teacher | teacher@bolajon.uz | teacher123 |

## 🎮 O'yinlar

- **Pop the Balloon** - Sharlarni yorish (sonlarni o'rganish)
- **Drop to Basket** - Savatga solish (sanash mashqi)
- **Learn Verbs** - Fe'llarni o'rganish (harakatlar)

## 📁 Loyiha strukturasi

```
bolajon-uz/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin panel
│   ├── dashboard/        # Teacher dashboard
│   ├── games/            # O'yin sahifalari
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/           # React components
├── context/              # Auth context
├── lib/                  # Utilities
├── middleware/           # Auth middleware
├── models/               # Mongoose models
└── scripts/              # Seed scripts
```


## 🎯 Asosiy funksiyalar

### O'qituvchi uchun:
- Video darslarni ko'rish
- O'quvchilarni qo'shish va boshqarish
- Darslarni yakunlash va yulduz berish
- Sovg'alarni almashtirish
- Statistikani ko'rish
- O'yinlarni o'ynash

### Admin uchun:
- O'qituvchilarni boshqarish
- Darslarni qo'shish/tahrirlash/o'chirish
- Sovg'alarni boshqarish
- Platforma statistikasi

## 🌟 Yulduz tizimi

1. O'qituvchi darsni o'tkazadi
2. O'quvchiga 1-5 yulduz beradi
3. Yulduzlar o'quvchi hisobiga qo'shiladi
4. Yulduzlar sovg'alarga almashtiriladi

## 📱 Sahifalar

- `/` - Bosh sahifa
- `/login` - Kirish
- `/register` - Ro'yxatdan o'tish
- `/dashboard` - O'qituvchi paneli
- `/dashboard/lessons` - Darslar
- `/dashboard/students` - O'quvchilar
- `/dashboard/games` - O'yinlar
- `/dashboard/statistics` - Statistika
- `/dashboard/rewards` - Sovg'alar
- `/admin` - Admin paneli
- `/games/*` - O'yin sahifalari

---

Made with ❤️ for Bolajon.uz