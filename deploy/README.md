# Bolajon.uz VPS Deployment

## Quick Deploy

SSH ga ulaning va quyidagi buyruqlarni ketma-ket bajaring:

```bash
# 1. SSH ga ulaning
ssh root@95.130.227.30

# 2. Git o'rnating (agar yo'q bo'lsa)
apt update && apt install -y git

# 3. Deploy skriptlarini yuklab oling
cd /root
git clone https://github.com/Lakodros-dev/Bolajon.git temp-deploy
cd temp-deploy/deploy

# 4. Skriptlarni executable qiling
chmod +x *.sh

# 5. VPS ni sozlang (Node.js, PM2, Nginx)
./setup-vps.sh

# 6. MongoDB URI ni kiriting
nano /var/www/bolajon/.env.local

# 7. Ilovani ishga tushiring
./start-app.sh

# 8. Nginx ni sozlang
./nginx-config.sh

# 9. SSL sertifikat oling
./ssl-setup.sh

# 10. Temp papkani o'chiring
cd /root && rm -rf temp-deploy
```

## Manual Commands

```bash
# App statusini ko'rish
pm2 status

# Loglarni ko'rish
pm2 logs bolajon

# Ilovani qayta ishga tushirish
pm2 restart bolajon

# Yangilash (GitHub dan)
cd /var/www/bolajon
git pull
npm install
npm run build
pm2 restart bolajon
```

## Environment Variables

`/var/www/bolajon/.env.local` faylida:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bolajon
JWT_SECRET=your-super-secret-key-change-this
NEXT_PUBLIC_APP_NAME=Bolajon.uz
NEXT_PUBLIC_APP_URL=https://bolajoon.uz
```