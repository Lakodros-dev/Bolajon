# Bulk Upload Scripts - Rasmlar va Videolarni Avtomatik Yuklash

Bu scriptlar PDF dan darslar qo'shishda rasmlar va videolarni avtomatik yuklash va kichraytirish uchun ishlatiladi.

## 📋 Scripts

### 1. `bulk-upload-vocabulary-images.mjs`
Mavjud darslarga lug'at rasmlarini qo'shish uchun.

**Ishlatish:**
```bash
node scripts/bulk-upload-vocabulary-images.mjs
```

**Qanday ishlaydi:**
1. Script ichidagi `vocabularyUpdates` arrayini to'ldiring
2. Rasmlarni `./assets/images/` papkasiga joylashtiring
3. Script avtomatik rasmlarni kichraytiradi va MongoDB ga saqlaydi

**Misol:**
```javascript
const vocabularyUpdates = [
    {
        lessonOrder: 51,
        vocabularyImages: [
            { word: 'apple', imagePath: './assets/images/apple.jpg' },
            { word: 'banana', imagePath: './assets/images/banana.gif' },
        ]
    },
];
```

---

### 2. `auto-add-lessons-from-pdf.mjs`
PDF dan yangi darslar qo'shish uchun (rasmlar va videolar bilan).

**Ishlatish:**
```bash
node scripts/auto-add-lessons-from-pdf.mjs
```

**Qanday ishlaydi:**
1. Script ichidagi `lessonsData` arrayini to'ldiring
2. Rasmlarni `./assets/images/` papkasiga joylashtiring
3. Videolarni `./assets/videos/` papkasiga joylashtiring
4. Script avtomatik hamma narsani yuklaydi va darsni yaratadi

**Misol:**
```javascript
const lessonsData = [
    {
        order: 61,
        title: 'M - Alphabet',
        description: 'M harfi bilan boshlanadigan so\'zlar',
        videoPath: './assets/videos/lesson61.mp4', // Yoki videoUrl ishlatish mumkin
        level: 1,
        duration: 10,
        gameType: 'vocabulary',
        vocabulary: [
            {
                word: 'milk',
                translation: 'sut',
                imagePath: './assets/images/milk.jpg'
            },
            {
                word: 'moon',
                translation: 'oy',
                imagePath: './assets/images/moon.gif'
            }
        ]
    }
];
```

---

## 🖼️ Rasm Formatlari va Kichraytirish

### Qo'llab-quvvatlanadigan formatlar:
- **JPG/JPEG** → WebP ga o'giriladi (800x800px max)
- **PNG** → WebP ga o'giriladi (800x800px max)
- **GIF** → GIF saqlanadi, animatsiya saqlanadi (400x400px max)
- **WebP** → WebP saqlanadi, animatsiya saqlanadi (400x400px max)

### Avtomatik optimizatsiya:
- ✅ Rasmlar avtomatik kichraytiriladi
- ✅ GIF animatsiyasi saqlanadi
- ✅ WebP animatsiyasi saqlanadi
- ✅ 70-90% hajm tejaldi
- ✅ Sifat saqlanadi (85% quality)

---

## 🎥 Video Yuklash

Videolar uchun 2 usul:

### 1. Lokal fayl yuklash:
```javascript
videoPath: './assets/videos/lesson61.mp4'
```

### 2. URL ishlatish:
```javascript
videoUrl: 'https://youtube.com/watch?v=...'
```

**Eslatma:** Lokal videolar kichraytirilmaydi, faqat ko'chiriladi. Video siqish uchun alohida tool kerak (ffmpeg).

---

## 📁 Papka Strukturasi

```
project/
├── assets/
│   ├── images/          # Rasmlarni bu yerga joylashtiring
│   │   ├── apple.jpg
│   │   ├── banana.gif
│   │   └── milk.webp
│   └── videos/          # Videolarni bu yerga joylashtiring
│       ├── lesson61.mp4
│       └── lesson62.mp4
├── uploads/
│   ├── images/          # Yuklangan rasmlar (avtomatik yaratiladi)
│   └── videos/          # Yuklangan videolar (avtomatik yaratiladi)
└── scripts/
    ├── bulk-upload-vocabulary-images.mjs
    ├── auto-add-lessons-from-pdf.mjs
    └── BULK_UPLOAD_README.md
```

---

## 🚀 Qadamma-qadam Yo'riqnoma

### Yangi darslar qo'shish:

1. **Papkalarni yarating:**
```bash
mkdir -p assets/images
mkdir -p assets/videos
```

2. **Fayllarni joylashtiring:**
   - Rasmlarni `assets/images/` ga
   - Videolarni `assets/videos/` ga

3. **Script ni tahrirlang:**
   - `auto-add-lessons-from-pdf.mjs` ni oching
   - `lessonsData` arrayini to'ldiring

4. **Script ni ishga tushiring:**
```bash
node scripts/auto-add-lessons-from-pdf.mjs
```

5. **Natijani tekshiring:**
   - MongoDB da darslar paydo bo'ladi
   - Admin panelda ko'rinadi
   - O'yinlarda ishlaydi

---

### Mavjud darslarga rasmlar qo'shish:

1. **Rasmlarni joylashtiring:**
```bash
# Rasmlarni assets/images/ ga ko'chiring
```

2. **Script ni tahrirlang:**
   - `bulk-upload-vocabulary-images.mjs` ni oching
   - `vocabularyUpdates` arrayini to'ldiring

3. **Script ni ishga tushiring:**
```bash
node scripts/bulk-upload-vocabulary-images.mjs
```

---

## ⚠️ Muhim Eslatmalar

1. **Dars order raqami unique bo'lishi kerak** - agar mavjud bo'lsa, o'tkazib yuboriladi
2. **Rasm va video yo'llari to'g'ri bo'lishi kerak** - aks holda o'tkazib yuboriladi
3. **MongoDB connection kerak** - `.env` faylda `MONGODB_URI` bo'lishi kerak
4. **sharp va sharp-gif2 kutubxonalari o'rnatilgan bo'lishi kerak**

---

## 🔧 Troubleshooting

### Xatolik: "Cannot find package 'sharp'"
```bash
npm install sharp sharp-gif2
```

### Xatolik: "MONGODB_URI not found"
`.env` faylni tekshiring:
```
MONGODB_URI=mongodb+srv://...
```

### Xatolik: "Image file not found"
Rasm yo'lini tekshiring:
```javascript
imagePath: './assets/images/apple.jpg' // To'g'ri yo'l
```

---

## 📊 Misol Output

```
🚀 Auto Add Lessons from PDF Script

Connecting to MongoDB...
✅ Connected!

📚 Dars 61: M - Alphabet
   📹 Video yuklanmoqda...
      ✅ Video yuklandi: 15.3MB
   📖 2 ta lug'at so'zi...
      🔤 "milk" - "sut"
      ✅ Yuklandi: 245.2KB → 45.8KB (81% tejaldi)
      🔤 "moon" - "oy"
      ✅ Yuklandi: 1.2MB → 156.3KB (87% tejaldi)
   ✅ Dars muvaffaqiyatli qo'shildi!

✅ Script yakunlandi!
📊 STATISTIKA:
   Qo'shildi: 1
   O'tkazib yuborildi: 0
   Jami: 1

👋 MongoDB dan uzildi
```

---

## 🎯 Kelajak Rejalar

- [ ] PDF dan avtomatik lug'at ajratib olish (OCR)
- [ ] Video siqish (ffmpeg integratsiyasi)
- [ ] Bulk delete funksiyasi
- [ ] CSV/Excel dan import
- [ ] Rasm URL dan yuklash (internet dan)

---

**Muallif:** Bolajon Development Team  
**Sana:** 2025-01-25  
**Versiya:** 1.0.0
