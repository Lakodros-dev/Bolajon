# Bolajon.uz 🎓

Bolalar uchun ingliz tili o'rgatish platformasi (5-9 yosh)

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-blue)](https://socket.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Xususiyatlar

### O'qituvchilar uchun
- 📹 Video darslarni ko'rish va o'rganish
- 👨‍🎓 O'quvchilarni qo'shish va boshqarish
- ⭐ Darslarni yakunlash va yulduz berish (1-5 yulduz)
- 🎁 Sovg'alarni almashtirish
- 📊 Statistikani ko'rish
- 🎮 O'yinlarni o'ynash
- 🔄 Real-time yangilanishlar (Socket.IO)

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
- **Backend:** Next.js API Routes, Custom Server
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.IO 4.8
- **Cache:** Redis (optional, falls back to in-memory)
- **Auth:** JWT + bcryptjs
- **Validation:** Zod
- **Logging:** Winston
- **Rate Limiting:** Express Rate Limit
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
# MONGODB_URI, JWT_SECRET va boshqa sozlamalarni o'zgartiring

# Ma'lumotlar bazasini to'ldirish
node scripts/seed.mjs

# Serverni ishga tushirish
npm run dev
```

## 🔧 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/bolajon-uz

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1825d

# App
NEXT_PUBLIC_APP_URL=http://localhost:3007
PORT=3007

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
NODE_ENV=development

# Payme
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_secret_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Cron
CRON_SECRET=your-cron-secret
```

## � Deployment (Vercel)

### 1. GitHub'ga joylash
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel'ga deploy qilish
1. Vercel.com da import qiling
2. Environment variables qo'shing
3. Build command: `npm run build`
4. Start command: `npm start`

### 3. Redis sozlash (optional)
- [Upstash](https://upstash.com) yoki [Redis Cloud](https://redis.com) dan bepul Redis oling
- `REDIS_URL` ni environment variables ga qo'shing

## � Login ma'lumotlari

Seed script ishga tushirgandan keyin:

| Role | Email | Parol |
|------|-------|-------|
| Admin | admin@bolajon.uz | admin123 |
| Teacher | teacher@bolajon.uz | teacher123 |

## 🎯 Asosiy funksiyalar

### Real-time Updates (Socket.IO)
- O'quvchi qo'shilganda darhol ko'rinadi
- Yulduz berilganda darhol yangilanadi
- Dashboard statistikasi real-time
- Barcha o'zgarishlar darhol ko'rsatiladi

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

## � Loyiha strukturasi

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
├── hooks/                # Custom hooks (useSocket)
├── lib/                  # Utilities
│   ├── auth.js          # JWT utilities
│   ├── mongodb.js       # DB connection
│   ├── redis.js         # Redis cache
│   ├── socket.js        # Socket.IO server
│   ├── logger.js        # Winston logger
│   ├── validation.js    # Zod schemas
│   └── rateLimit.js     # Rate limiting
├── middleware/           # Auth middleware
├── models/               # Mongoose models
├── public/               # Static files
├── scripts/              # Seed & migration scripts
├── server.js             # Custom server (Socket.IO)
└── logs/                 # Log files
```

## 🛠️ Scripts

```bash
# Development server (with Socket.IO)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Seed database
node scripts/seed.mjs

# Setup cron jobs
npm run cron
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Zod)
- ✅ Rate limiting
- ✅ Structured logging
- ✅ Redis cache (optional)
- ✅ Socket.IO authentication
- ✅ HTTPS (Vercel default)

## 📊 Performance Optimizations

- ✅ Redis caching
- ✅ Database indexing
- ✅ Lean queries
- ✅ Aggregation pipelines
- ✅ Real-time updates (no polling)
- ✅ Code splitting
- ✅ Image optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Made with ❤️ for Bolajon.uz

---

**Note:** Bu loyiha 5-9 yoshli bolalarga ingliz tilini o'rgatish uchun maxsus ishlab chiqilgan.