# 🚀 VPS (Eskiz.uz) Deployment Guide

## Muammo: ChunkLoadError - 400 Bad Request

Bu xatolik VPS'da Next.js noto'g'ri ishga tushirilganda yoki cache muammosi bo'lganda yuzaga keladi.

## ✅ Tezkor yechim (VPS'da bajaring)

### 1. SSH orqali VPS'ga ulaning

```bash
ssh root@your-server-ip
# yoki
ssh username@your-server-ip
```

### 2. Loyiha papkasiga o'ting

```bash
cd /var/www/bolajon
# yoki sizning loyiha papkangiz
```

### 3. Cache'ni tozalang va qayta build qiling

```bash
# PM2'ni to'xtatish (agar ishlab turgan bo'lsa)
pm2 stop bolajon

# Cache'ni tozalash
rm -rf .next
rm -rf node_modules/.cache

# Qayta build qilish
npm run build

# PM2 orqali qayta ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save

# Yoki oddiy npm start
# npm start
```

### 4. Nginx'ni qayta yuklash

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 To'liq VPS sozlash

### 1. Node.js versiyasini tekshirish

```bash
node -v  # 18.x yoki 20.x bo'lishi kerak
npm -v
```

Agar eski versiya bo'lsa:
```bash
# Node.js 20.x o'rnatish
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. PM2 sozlamalari

`ecosystem.config.cjs` faylini tekshiring:

```javascript
module.exports = {
  apps: [{
    name: 'bolajon',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/bolajon',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

### 3. Nginx konfiguratsiyasi

`/etc/nginx/sites-available/bolajon` yoki `/etc/nginx/conf.d/bolajon.conf`:

```nginx
server {
    listen 80;
    server_name bolajoon.uz www.bolajoon.uz;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Next.js static files
    location /_next/static {
        alias /var/www/bolajon/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public static files
    location /static {
        alias /var/www/bolajon/public;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /500.html;
}
```

### 4. SSL (HTTPS) sozlash

```bash
# Certbot o'rnatish
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikat olish
sudo certbot --nginx -d bolajoon.uz -d www.bolajoon.uz

# Avtomatik yangilanish
sudo certbot renew --dry-run
```

---

## 🔄 Deployment scripti

VPS'da `/var/www/bolajon/deploy.sh` yarating:

```bash
#!/bin/bash

echo "🚀 Bolajon.uz deployment boshlandi..."

# Git'dan yangilanishlarni olish
echo "📥 Git pull..."
git pull origin main

# Dependencies o'rnatish
echo "📦 Dependencies o'rnatilmoqda..."
npm install --production

# Cache tozalash
echo "🧹 Cache tozalanmoqda..."
rm -rf .next
rm -rf node_modules/.cache

# Build qilish
echo "🔨 Build qilinmoqda..."
npm run build

# PM2'ni qayta ishga tushirish
echo "🔄 PM2 qayta ishga tushirilmoqda..."
pm2 restart bolajon

# Nginx'ni qayta yuklash
echo "🔄 Nginx qayta yuklanmoqda..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment tugadi!"
echo "🌐 Sayt: https://bolajoon.uz"
```

Scriptni executable qiling:
```bash
chmod +x deploy.sh
```

Ishga tushirish:
```bash
./deploy.sh
```

---

## 🐛 Xatoliklarni tekshirish

### PM2 logs

```bash
# Barcha loglarni ko'rish
pm2 logs bolajon

# Faqat xatoliklarni ko'rish
pm2 logs bolajon --err

# Real-time monitoring
pm2 monit
```

### Nginx logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application logs

```bash
# Loyiha papkasidagi logs
tail -f logs/err.log
tail -f logs/out.log
```

---

## 🔍 Muammolarni hal qilish

### 1. Port band bo'lsa

```bash
# 3000 portni ishlatayotgan jarayonni topish
sudo lsof -i :3000

# Jarayonni to'xtatish
sudo kill -9 <PID>
```

### 2. Disk to'lgan bo'lsa

```bash
# Disk joyini tekshirish
df -h

# Logs'ni tozalash
pm2 flush
sudo journalctl --vacuum-time=7d
```

### 3. Memory muammosi

```bash
# Memory holatini ko'rish
free -h

# PM2 memory limit
pm2 start ecosystem.config.cjs --max-memory-restart 500M
```

### 4. Build xatoligi

```bash
# Node.js versiyasini tekshirish
node -v

# Dependencies'ni qayta o'rnatish
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Monitoring

### PM2 monitoring

```bash
# Status
pm2 status

# Monitoring
pm2 monit

# Web dashboard
pm2 plus
```

### Nginx status

```bash
sudo systemctl status nginx
```

---

## 🔐 Xavfsizlik

### Firewall sozlash

```bash
# UFW o'rnatish
sudo apt-get install ufw

# Portlarni ochish
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# Firewall'ni yoqish
sudo ufw enable
```

### Environment variables

`.env` faylini to'g'ri sozlang:

```bash
# .env faylini tahrirlash
nano .env
```

```env
MONGODB_URI=mongodb://localhost:27017/bolajon-uz
JWT_SECRET=your-super-secret-key-change-this
NEXT_PUBLIC_APP_URL=https://bolajoon.uz
NODE_ENV=production
```

---

## 🚀 Avtomatik deployment (GitHub Actions)

`.github/workflows/deploy.yml` yarating:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/bolajon
            ./deploy.sh
```

---

## ✅ Deployment checklist

- [ ] Node.js 18.x yoki 20.x o'rnatilgan
- [ ] PM2 o'rnatilgan va sozlangan
- [ ] Nginx o'rnatilgan va sozlangan
- [ ] SSL sertifikat o'rnatilgan
- [ ] Environment variables to'g'ri sozlangan
- [ ] MongoDB ishlab turibdi
- [ ] Firewall sozlangan
- [ ] Logs papkasi mavjud
- [ ] Deploy script ishlaydi

---

## 🆘 Yordam

Agar muammo hal bo'lmasa:

1. PM2 logs'ni tekshiring: `pm2 logs bolajon`
2. Nginx logs'ni tekshiring: `sudo tail -f /var/log/nginx/error.log`
3. Build qayta qiling: `npm run build`
4. PM2'ni qayta ishga tushiring: `pm2 restart bolajon`
