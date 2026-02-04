# Video Fayllarni VPS ga Yuklash

## Video ma'lumotlari
- **Jami videolar**: ~100 ta
- **Hajm**: ~3GB
- **Format**: MP4

## Yuklash usullari

### 1. Oddiy usul (SCP)
Barcha videolarni bir vaqtda yuklash:
```cmd
upload-videos.bat
```

**Afzalliklari:**
- Oddiy va tez
- Barcha fayllar bir vaqtda

**Kamchiliklari:**
- Agar xato bo'lsa, qaytadan boshlash kerak
- Progress ko'rinmaydi

---

### 2. Rsync usuli (Tavsiya etiladi)
Faqat yangi/o'zgargan fayllarni yuklash:
```cmd
upload-videos-rsync.bat
```

**Afzalliklari:**
- Tezroq (faqat yangi fayllar)
- Progress ko'rsatadi
- Xato bo'lsa, qaytadan davom ettiradi
- Xavfsizroq

**Kamchiliklari:**
- Rsync o'rnatilgan bo'lishi kerak

---

### 3. Partiyalarda yuklash
10 tadan yuklash (xato bo'lsa oson qayta boshlash):
```cmd
upload-videos-batch.bat
```

**Afzalliklari:**
- Xato bo'lsa, faqat o'sha faylni qayta yuklash
- Har bir faylni ko'rish mumkin
- To'xtatib, keyin davom ettirish mumkin

**Kamchiliklari:**
- Sekinroq

---

## Qo'lda yuklash

### Bitta video yuklash:
```cmd
scp public\video\51.mp4 root@185.196.214.76:/var/www/bolajoon/public/video/
```

### Barcha videolar:
```cmd
scp -r public\video\*.mp4 root@185.196.214.76:/var/www/bolajoon/public/video/
```

### Rsync bilan:
```cmd
rsync -avz --progress public/video/ root@185.196.214.76:/var/www/bolajoon/public/video/
```

---

## VPS da tekshirish

SSH orqali VPS ga kiring:
```bash
ssh root@185.196.214.76
```

Videolarni tekshirish:
```bash
cd /var/www/bolajoon/public/video
ls -lh *.mp4 | wc -l  # Videolar soni
du -sh .               # Jami hajm
```

---

## Maslahatlar

1. **Rsync usulini ishlating** - eng yaxshi variant
2. **Internet tezligini tekshiring** - 3GB yuklash vaqti:
   - 10 Mbps: ~40 daqiqa
   - 50 Mbps: ~8 daqiqa
   - 100 Mbps: ~4 daqiqa

3. **Xato bo'lsa:**
   - Internet ulanishini tekshiring
   - VPS ishlab turganini tekshiring
   - SSH kalitlari to'g'ri ekanligini tekshiring

4. **Katta hajm uchun:**
   - Tunda yuklang (internet tezroq)
   - Partiyalarda yuklang
   - Rsync ishlatib, keyin davom ettiring
