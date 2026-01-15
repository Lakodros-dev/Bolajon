# Bolajon.uz 🎓

Bolalar uchun ingliz tili o'rgatish platformasi (5-9 yosh)

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Xususiyatlar

### O'qituvchilar uchun
- 📹 Video darslarni ko'rish va o'rganish
- 👨‍🎓 O'quvchilarni qo'shish va boshqarish
- ⭐ Darslarni yakunlash va yulduz berish (1-5 yulduz)
- 🎁 Sovg'alarni almashtirish
- 📊 Statistikani ko'rish
- 🎮 O'yinlarni o'ynash

### Admin uchun
- 👥 O'qituvchilarni boshqarish
- 📚 Darslarni qo'shish/tahrirlash/o'chirish
- 🎁 Sovg'alarni boshqarish
- 📈 Platforma statistikasi

### O'yinlar
- 🎈 **Pop the Balloon** - Sharlarni yorish (ranglarni o'rganish)
- 🧺 **Drop to Basket** - Savatga solish (sanash mashqi)
- 🏃 **Learn Verbs** - Fe'llarni o'rganish (harakatlar)
- 📖 **Vocabulary** - So'z boyligini oshirish

## 🚀 Texnologiyalar

- **Frontend:** Next.js 14 (App Router), Bootstrap 5, React Bootstrap
- **Backend:** Next.js API Routes
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **Deployment:** Vercel

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

### GitHub'ga joylash
Batafsil qo'llanma uchun [GITHUB_SETUP.md](GITHUB_SETUP.md) faylini ko'ring.

### Vercel'ga deploy qilish
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

Seed script ishga tushirgandan keyin:

| Role | Email | Parol |
|------|-------|-------|
| Admin | admin@bolajon.uz | admin123 |
| Teacher | teacher@bolajon.uz | teacher123 |

## 🎯 Asosiy funksiyalar

### Yulduz tizimi
1. O'qituvchi darsni o'tkazadi
2. O'quvchiga 1-5 yulduz beradi
3. Yulduzlar o'quvchi hisobiga qo'shiladi
4. Yulduzlar sovg'alarga almashtiriladi

### Obuna tizimi
- 7 kunlik bepul sinov davri
- Aktiv obuna holati
- Muddati tugagan holati
- Admin obunadan ozod

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
├── context/              # Auth & Data context
├── lib/                  # Utilities
├── middleware/           # Auth middleware
├── models/               # Mongoose models
├── public/               # Static files
└── scripts/              # Seed & migration scripts
```

## 🛠️ Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Seed database
node scripts/seed.mjs

# Fix trial dates (migration)
node scripts/fix-trial-dates.mjs
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Made with ❤️ for Bolajon.uz

---

**Note:** Bu loyiha 5-9 yoshli bolalarga ingliz tilini o'rgatish uchun maxsus ishlab chiqilgan.