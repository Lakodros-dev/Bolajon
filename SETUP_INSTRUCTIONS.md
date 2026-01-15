# Bolajon.uz - Sozlash qo'llanmasi

## 1. MongoDB Atlas sozlash

### Connection String formati:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bolajon-uz?retryWrites=true&w=majority
```

### .env.local faylini yangilash:
1. `.env.local` faylini oching
2. `MONGODB_URI` qatorini MongoDB Atlas connection string bilan almashtiring
3. `<username>` va `<password>` ni o'z ma'lumotlaringiz bilan almashtiring

## 2. Development serverni ishga tushirish

```bash
npm run dev
```

## 3. Ma'lumotlar bazasini to'ldirish

```bash
node scripts/seed.mjs
```

Bu quyidagilarni yaratadi:
- Admin: admin@bolajon.uz / admin123
- Teacher: teacher@bolajon.uz / teacher123
- 10 ta namuna dars
- 5 ta namuna sovg'a

## 4. Kirish

- Admin: http://localhost:3000/login
  - Email: admin@bolajon.uz
  - Parol: admin123

- Teacher: http://localhost:3000/login
  - Email: teacher@bolajon.uz
  - Parol: teacher123

## Muammolar

### MongoDB ulanish xatosi:
- MongoDB Atlas'da IP Address whitelist tekshiring
- Connection string to'g'riligini tekshiring
- Username va parol to'g'riligini tekshiring

### Port band:
```bash
# 3000 portni bo'shatish
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Production deployment

Vercel uchun:
1. GitHub'ga push qiling
2. Vercel'da import qiling
3. Environment variables qo'shing:
   - MONGODB_URI
   - JWT_SECRET
   - NEXT_PUBLIC_APP_URL
