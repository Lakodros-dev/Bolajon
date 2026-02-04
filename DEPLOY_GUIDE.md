# VPS Deploy Qo'llanma

## Muammo
Loyiha hajmi 4.77GB, asosan:
- `public/video` - 3GB
- `uploads` - 1.2GB  
- `node_modules` - 546MB

## Yechim
Faqat kod fayllarini yuklash, video/rasmlar VPS da allaqachon mavjud.

## Deploy usullari

### 1. Linux/Mac (Bash)
```bash
chmod +x deploy/deploy-optimized.sh
./deploy/deploy-optimized.sh
```

### 2. Windows (PowerShell)
```powershell
.\deploy\deploy-code-only.ps1
```

### 3. Qo'lda (rsync)
```bash
# Faqat kod fayllarini yuklash
rsync -avz --exclude-from='.deployignore' \
  -e ssh \
  . root@185.196.214.76:/var/www/bolajoon/

# VPS da
ssh root@185.196.214.76
cd /var/www/bolajoon
npm install --production
npm run build
pm2 restart bolajoon
```

## Deploy hajmi
- **To'liq loyiha**: 4.77GB
- **Faqat kod**: ~50-100MB
- **VPS da build**: ~600MB (node_modules + .next)

## VPS da mavjud fayllar
Quyidagi fayllar VPS da allaqachon mavjud, qayta yuklanmaydi:
- `/var/www/bolajoon/public/video/` - barcha video fayllar
- `/var/www/bolajoon/uploads/` - yuklangan fayllar

## Deploy jarayoni
1. ✅ Mahalliy kod o'zgarishlari
2. ✅ Faqat kod fayllarini VPS ga yuklash (~50MB)
3. ✅ VPS da `npm install` (dependencies)
4. ✅ VPS da `npm run build` (production build)
5. ✅ PM2 restart (ilova qayta ishga tushirish)

## Xavfsizlik
- `.env` fayl yuklanadi (VPS da alohida sozlash kerak)
- Video/rasm fayllar saqlanadi
- `node_modules` qayta o'rnatiladi

## Tezlik
- **Avvalgi**: 4.77GB yuklash (~30-60 daqiqa)
- **Hozir**: 50MB yuklash (~1-2 daqiqa)

## Qo'shimcha
Agar yangi video qo'shish kerak bo'lsa:
```bash
# Faqat yangi videolarni yuklash
scp public/video/NEW_VIDEO.mp4 root@185.196.214.76:/var/www/bolajoon/public/video/
```
