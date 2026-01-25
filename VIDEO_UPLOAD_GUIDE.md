# 51-60 Darslar uchun Video Yuklash Yo'riqnomasi

## Muammo
Localhost da `public/video/` papkasida videolar bor, lekin production server (bolajoon.uz) da yo'q.

## Sabab
- `public/video/` papkasidagi ko'pchilik videolar bo'sh (0 bayt)
- Faqat 2ta video bor: 52_complate.mp4 (34.68 MB) va 60_complate.mp4 (16 MB)
- Git orqali bo'sh fayllar yuklanmaydi

## Yechim 1: Admin Paneldan Video Yuklash (Tavsiya qilinadi)

### Qadamlar:
1. https://bolajoon.uz/admin/lessons ga kiring
2. Har bir darsni tahrirlang (Edit tugmasi)
3. Video faylini yuklang
4. Davomiylik avtomatik aniqlanadi
5. Saqlang

### 51-60 Darslar Ro'yxati:

| # | Dars ID | Nomi | Video Holati |
|---|---------|------|--------------|
| 51 | 69757b2b0e4097490d6299f5 | Takrorlash 47-51 | ❌ Bo'sh (0 MB) |
| 52 | 69757b2b0e4097490d6299f6 | I can - Men qila olaman | ✅ Mavjud (34.68 MB) |
| 53 | 69757b2c0e4097490d6299f7 | I can - Gaplar | ❌ Bo'sh (0 MB) |
| 54 | 69757b2c0e4097490d6299f8 | Breakfast - Nonushta | ❌ Bo'sh (0 MB) |
| 55 | 69757b2d0e4097490d6299f9 | K - Alphabet | ❌ Bo'sh (0 MB) |
| 56 | 69757b2d0e4097490d6299fa | Takrorlash 52-56 | ❌ Bo'sh (0 MB) |
| 57 | 69757b2e0e4097490d6299fb | It's a - Bu nimadir | ❌ Bo'sh (0 MB) |
| 58 | 69757b2e0e4097490d6299fc | Numbers 26-30 - Raqamlar | ❌ Bo'sh (0 MB) |
| 59 | 69757b2f0e4097490d6299fd | What is red? - Qaysi qizil? | ❌ Bo'sh (0 MB) |
| 60 | 69757b2f0e4097490d6299fe | L - Alphabet | ✅ Mavjud (16 MB) |

### Admin Panel Linklar:
- Dars 51: https://bolajoon.uz/admin/lessons/69757b2b0e4097490d6299f5/edit
- Dars 52: https://bolajoon.uz/admin/lessons/69757b2b0e4097490d6299f6/edit
- Dars 53: https://bolajoon.uz/admin/lessons/69757b2c0e4097490d6299f7/edit
- Dars 54: https://bolajoon.uz/admin/lessons/69757b2c0e4097490d6299f8/edit
- Dars 55: https://bolajoon.uz/admin/lessons/69757b2d0e4097490d6299f9/edit
- Dars 56: https://bolajoon.uz/admin/lessons/69757b2d0e4097490d6299fa/edit
- Dars 57: https://bolajoon.uz/admin/lessons/69757b2e0e4097490d6299fb/edit
- Dars 58: https://bolajoon.uz/admin/lessons/69757b2e0e4097490d6299fc/edit
- Dars 59: https://bolajoon.uz/admin/lessons/69757b2f0e4097490d6299fd/edit
- Dars 60: https://bolajoon.uz/admin/lessons/69757b2f0e4097490d6299fe/edit

## Yechim 2: Haqiqiy Videolarni Git orqali Yuklash

Agar sizda haqiqiy video fayllar bo'lsa:

1. Videolarni `public/video/` papkasiga qo'ying
2. Git ga qo'shing:
```bash
git add public/video/*.mp4
git commit -m "51-60 darslar videolarini qo'shish"
git push origin main
```

3. Production serverda deploy qiling:
```bash
ssh your-server
cd /var/www/bolajon
./deploy/deploy.sh
```

## Yechim 3: SCP orqali To'g'ridan-to'g'ri Yuklash

Agar videolar juda katta bo'lsa:

```bash
scp public/video/*.mp4 user@bolajoon.uz:/var/www/bolajon/public/video/
```

## Eslatma
- Admin paneldan yuklangan videolar `uploads/videos/` papkasiga tushadi
- `public/video/` dan yuklangan videolar static file sifatida serve qilinadi
- Ikkalasi ham `/api/video/[filename]` orqali ishlaydi
- Video streaming Range request ni qo'llab-quvvatlaydi
