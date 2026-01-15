# 🚨 VPS Tezkor Tuzatish - bolajoon.uz

## Muammo: 503 Service Unavailable va Connection Timeout

Server ishlamayapti yoki to'xtagan.

---

## ✅ TEZKOR YECHIM (5 daqiqa)

### 1. SSH orqali serverga ulaning

```bash
ssh root@your-server-ip
# yoki
ssh username@bolajoon.uz
```

### 2. Loyiha papkasiga o'ting

```bash
cd /var/www/bolajon
# yoki
cd /home/username/bolajon
```

### 3. PM2 statusni tekshiring

```bash
pm2 status
```

**Agar "stopped" yoki "errored" bo'lsa:**

```bash
# PM2'ni qayta ishga tushirish
pm2 restart bolajon

# Yoki to'liq qayta boshlash
pm2 delete bolajon
pm2 start ecosystem.config.cjs
pm2 save
```

**Agar PM2 o'rnatilmagan bo'lsa:**

```bash
# PM2 o'rnatish
npm install -g pm2

# Ishga tushirish
pm2 start npm --name "bolajon" -- start
pm2 save
pm2 startup
```

### 4. Nginx statusni tekshiring

```bash
sudo systemctl status nginx
```

**Agar to'xtagan bo'lsa:**

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Port tekshirish

```bash
# 3000 port ishlab turganini tekshirish
sudo lsof -i :3000

# Agar bo'sh bo'lsa, Next.js ishlamayapti
# PM2'ni qayta ishga tushiring
pm2 restart bolajon
```

---

## 🔧 TO'LIQ QAYTA DEPLOY

Agar yuqoridagilar ishlamasa:

```bash
cd /var/www/bolajon

# 1. PM2'ni to'xtatish
pm2 stop bolajon

# 2. Cache tozalash
rm -rf .next
rm -rf node_modules/.cache

# 3. Dependencies o'rnatish (agar kerak bo'lsa)
npm install --production

# 4. Build qilish
npm run build

# 5. PM2'ni ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save

# 6. Nginx'ni qayta yuklash
sudo systemctl reload nginx
```

---

## 🔍 XATOLIKLARNI TOPISH

### PM2 Logs

```bash
# Real-time logs
pm2 logs bolajon

# Oxirgi 100 qator
pm2 logs bolajon --lines 100

# Faqat xatoliklar
pm2 logs bolajon --err
```

### Nginx Logs

```bash
# Error logs
sudo tail -f /var/log/nginx/error.log

# Access logs
sudo tail -f /var/log/nginx/access.log
```

### Port band bo'lsa

```bash
# 3000 portni ishlatayotgan jarayonni topish
sudo lsof -i :3000

# Jarayonni to'xtatish
sudo kill -9 <PID>

# PM2'ni qayta ishga tushirish
pm2 restart bolajon
```

---

## 📋 TEKSHIRISH

### 1. PM2 ishlayaptimi?

```bash
pm2 status
# "online" bo'lishi kerak
```

### 2. Port ochiqmi?

```bash
curl http://localhost:3000
# HTML qaytishi kerak
```

### 3. Nginx ishlayaptimi?

```bash
sudo systemctl status nginx
# "active (running)" bo'lishi kerak
```

### 4. Sayt ochilayaptimi?

```bash
curl -I https://bolajoon.uz
# 200 OK qaytishi kerak
```

---

## 🚨 AGAR HECH NARSA ISHLAMASA

### Variant 1: Node.js qayta o'rnatish

```bash
# Node.js versiyasini tekshirish
node -v

# Agar eski versiya bo'lsa (18.x yoki 20.x kerak)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Variant 2: MongoDB tekshirish

```bash
# MongoDB ishlab turganini tekshirish
sudo systemctl status mongod

# Agar to'xtagan bo'lsa
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Variant 3: Disk to'lgan

```bash
# Disk joyini tekshirish
df -h

# Agar to'lgan bo'lsa, logs tozalash
pm2 flush
sudo journalctl --vacuum-time=7d
rm -rf /var/www/bolajon/.next/cache
```

### Variant 4: Memory muammosi

```bash
# Memory tekshirish
free -h

# Swap qo'shish (agar yo'q bo'lsa)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🎯 ECOSYSTEM.CONFIG.CJS

Agar fayl yo'q bo'lsa, yarating:

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
    merge_logs: true,
    max_memory_restart: '500M'
  }]
}
```

---

## 🌐 NGINX CONFIG

`/etc/nginx/sites-available/bolajon`:

```nginx
server {
    listen 80;
    server_name bolajoon.uz www.bolajoon.uz;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Aktivlashtirish:

```bash
sudo ln -s /etc/nginx/sites-available/bolajon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ MUVAFFAQIYAT BELGISI

```bash
# 1. PM2 online
pm2 status
# bolajon | online

# 2. Port ochiq
curl http://localhost:3000
# HTML qaytadi

# 3. Nginx ishlayapti
sudo systemctl status nginx
# active (running)

# 4. Sayt ochiladi
curl -I https://bolajoon.uz
# HTTP/1.1 200 OK
```

---

## 📞 YORDAM

Agar hali ham ishlamasa, quyidagi ma'lumotlarni yuboring:

```bash
# System info
uname -a
node -v
npm -v

# PM2 status
pm2 status
pm2 logs bolajon --lines 50 --err

# Nginx status
sudo nginx -t
sudo systemctl status nginx

# Disk va Memory
df -h
free -h

# Port
sudo lsof -i :3000
```

---

## 🔄 AVTOMATIK RESTART

PM2'ni avtomatik restart qilish:

```bash
# Startup script yaratish
pm2 startup

# Hozirgi holatni saqlash
pm2 save

# Server qayta ishga tushganda avtomatik ishga tushadi
```

---

## 🎉 TAYYOR!

Saytni tekshiring: **https://bolajoon.uz**

Agar ishlasa:
- ✅ Login qiling
- ✅ Dashboard'ni tekshiring
- ✅ O'yinlarni sinab ko'ring
