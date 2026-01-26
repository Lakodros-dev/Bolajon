# Videolarni VPS ga yuklash yo'riqnomasi

## Muammo
- `public/video/` papkasida 4.45 GB video bor
- GitHub bitta push uchun max 2 GB qabul qiladi
- Git push timeout beradi (HTTP 408)

## Yechim: Videolarni to'g'ridan VPS ga yuklash

### 1-usul: WinSCP (Windows uchun eng oson)

1. **WinSCP yuklab oling**: https://winscp.net/eng/download.php

2. **VPS ga ulaning**:
   - Host: `bolajoon.uz` yoki VPS IP manzili
   - Port: `22`
   - Username: VPS username (masalan: `root` yoki `ubuntu`)
   - Password: VPS parol

3. **Videolarni yuklang**:
   - Chap tomonda: `C:\Users\ozodb\Desktop\loyihalar\Bolajon\public\video`
   - O'ng tomonda: `/var/www/bolajon/public/video`
   - Barcha videolarni drag & drop qiling

### 2-usul: SCP command (PowerShell)

```powershell
# Bitta video yuklash
scp "public/video/51 Complate.mp4" username@bolajoon.uz:/var/www/bolajon/public/video/

# Barcha videolarni yuklash
scp public/video/*.mp4 username@bolajoon.uz:/var/www/bolajon/public/video/
```

### 3-usul: rsync (tezroq, davom ettirish mumkin)

```powershell
# rsync o'rnatish kerak (Windows uchun Git Bash ishlatish mumkin)
rsync -avz --progress public/video/*.mp4 username@bolajoon.uz:/var/www/bolajon/public/video/
```

## VPS da tekshirish

SSH orqali VPS ga kiring va tekshiring:

```bash
ssh username@bolajoon.uz

# Video papkasiga o'ting
cd /var/www/bolajon/public/video

# Videolar sonini tekshiring
ls -1 *.mp4 | wc -l

# Hajmini tekshiring
du -sh .

# Ruxsatlarni to'g'rilang
chmod 644 *.mp4
chown www-data:www-data *.mp4
```

## Git da videolarni ignore qilish

Videolar VPS da bo'lgandan keyin, Git da ignore qiling:

```bash
# .gitignore ga qo'shing
echo "/public/video/*.mp4" >> .gitignore

# Git cache dan o'chiring
git rm --cached public/video/*.mp4

# Commit qiling
git commit -m "Remove videos from Git, uploaded to VPS directly"
git push origin main
```

## Natija

✅ Videolar VPS da: `/var/www/bolajon/public/video/`
✅ URL: `https://bolajoon.uz/video/51 Complate.mp4`
✅ VideoPlayer avtomatik `/api/video/` ga yo'naltiradi
✅ Git repository kichik qoladi
✅ Keyingi deploymentlar tez bo'ladi

## Eslatma

- 51-100 darslar uchun video URL lar allaqachon MongoDB ga qo'shilgan
- Videolar VPS ga yuklangandan keyin darhol ishlaydi
- Yangi videolarni ham shu usul bilan yuklash mumkin
