# ⚡ VPS'da Tezkor Muammoni Hal Qilish

## 🚨 ChunkLoadError - 400 Bad Request

Bu xatolikni hal qilish uchun VPS'da quyidagi buyruqlarni bajaring:

---

## 🔧 Tezkor yechim (5 daqiqa)

### 1. SSH orqali VPS'ga ulaning

```bash
ssh root@your-server-ip
```

### 2. Loyiha papkasiga o'ting

```bash
cd /var/www/bolajon
```

### 3. Tezkor tuzatish scriptini ishga tushiring

```bash
# Script'ni yuklab oling (agar yo'q bo'lsa)
chmod +x deploy/quick-fix.sh

# Ishga tushiring
./deploy/quick-fix.sh
```

**YO'Q!** Script yo'q bo'lsa, qo'lda bajaring:

```bash
# PM2'ni to'xtatish
pm2 stop bolajon

# Cache'ni tozalash
rm -rf .next
rm -rf node_modules/.cache

# Qayta build qilish
npm run build

# PM2'ni qayta ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save

# Nginx'ni qayta yuklash
sudo systemctl reload nginx
```

### 4. Tekshirish

```bash
# PM2 status
pm2 status

# Logs
pm2 logs bolajon --lines 50

# Saytni tekshirish
curl -I https://bolajoon.uz
```

---

## 📋 Batafsil qadamlar

### Agar yuqoridagi yechim ishlamasa:

#### 1. Node.js versiyasini tekshiring

```bash
node -v  # 18.x yoki 20.x bo'lishi kerak
```

Agar eski versiya bo'lsa:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Dependencies'ni qayta o'rnating

```bash
cd /var/www/bolajon

# Node modules'ni o'chirish
rm -rf node_modules
rm -rf package-lock.json

# Qayta o'rnatish
npm install --production

# Build qilish
npm run build
```

#### 3. PM2'ni to'liq qayta sozlang

```bash
# PM2'ni to'xtatish va o'chirish
pm2 stop bolajon
pm2 delete bolajon

# Qayta ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### 4. Nginx konfiguratsiyasini tekshiring

```bash
# Nginx config'ni test qilish
sudo nginx -t

# Agar xatolik bo'lsa, config'ni yangilang
sudo nano /etc/nginx/sites-available/bolajon

# Nginx'ni qayta ishga tushirish
sudo systemctl restart nginx
```

---

## 🔍 Xatoliklarni topish

### PM2 logs

```bash
# Real-time logs
pm2 logs bolajon

# Oxirgi 100 qator
pm2 logs bolajon --lines 100

# Faqat xatoliklar
pm2 logs bolajon --err
```

### Nginx logs

```bash
# Error logs
sudo tail -f /var/log/nginx/bolajon_error.log

# Access logs
sudo tail -f /var/log/nginx/bolajon_access.log
```

### Disk joyini tekshirish

```bash
df -h
```

Agar disk to'lgan bo'lsa:
```bash
# Logs'ni tozalash
pm2 flush
sudo journalctl --vacuum-time=7d

# .next cache'ni o'chirish
rm -rf /var/www/bolajon/.next/cache
```

---

## 🚀 To'liq qayta deploy qilish

Agar hech narsa ishlamasa:

```bash
cd /var/www/bolajon

# 1. PM2'ni to'xtatish
pm2 stop bolajon

# 2. Hamma narsani tozalash
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 3. Git'dan yangi kod olish
git pull origin main

# 4. Dependencies o'rnatish
npm install --production

# 5. Build qilish
npm run build

# 6. PM2'ni ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save

# 7. Nginx'ni qayta yuklash
sudo systemctl reload nginx
```

---

## ✅ Muvaffaqiyat belgisi

Saytni brauzerda oching: https://bolajoon.uz

- ✅ Sahifa yuklanadi
- ✅ Console'da xatolik yo'q (F12 bosing)
- ✅ O'yinlar ishlaydi
- ✅ Login/Register ishlaydi

---

## 🆘 Hali ham ishlamasa?

### 1. PM2 statusni tekshiring

```bash
pm2 status
```

Agar "errored" yoki "stopped" bo'lsa:
```bash
pm2 logs bolajon --err --lines 50
```

### 2. Port band bo'lsa

```bash
# 3000 portni ishlatayotgan jarayonni topish
sudo lsof -i :3000

# Jarayonni to'xtatish
sudo kill -9 <PID>

# PM2'ni qayta ishga tushirish
pm2 restart bolajon
```

### 3. Environment variables tekshirish

```bash
# .env faylini tekshirish
cat /var/www/bolajon/.env

# Kerakli o'zgaruvchilar:
# MONGODB_URI=...
# JWT_SECRET=...
# NEXT_PUBLIC_APP_URL=https://bolajoon.uz
# NODE_ENV=production
```

### 4. MongoDB tekshirish

```bash
# MongoDB ishlab turganini tekshirish
sudo systemctl status mongod

# Agar to'xtagan bo'lsa
sudo systemctl start mongod
```

---

## 📞 Yordam

Agar muammo hal bo'lmasa, quyidagi ma'lumotlarni yuboring:

```bash
# System info
uname -a
node -v
npm -v

# PM2 status
pm2 status
pm2 logs bolajon --lines 50

# Nginx status
sudo nginx -t
sudo systemctl status nginx

# Disk space
df -h

# Memory
free -h
```

---

## 🎯 Keyingi safar uchun

Deployment scriptini ishlatish:

```bash
cd /var/www/bolajon
./deploy/deploy.sh
```

Bu avtomatik ravishda:
- Git pull qiladi
- Dependencies o'rnatadi
- Cache tozalaydi
- Build qiladi
- PM2'ni qayta ishga tushiradi
- Nginx'ni qayta yuklaydi
