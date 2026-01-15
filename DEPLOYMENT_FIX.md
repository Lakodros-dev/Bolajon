# 🔧 Deployment Muammosini Hal Qilish

## Muammo: ChunkLoadError - 400 Bad Request

Bu xatolik production'da chunk fayllar to'g'ri yuklanmayotganini bildiradi.

## ✅ Yechimlar

### 1. Vercel'da Redeploy qilish (Eng oson)

1. **Vercel Dashboard'ga kiring:**
   - https://vercel.com/dashboard

2. **Bolajon loyihasini toping**

3. **Deployments tab'ga o'ting**

4. **Eng oxirgi deployment'ni toping va:**
   - "..." (3 nuqta) tugmasini bosing
   - "Redeploy" ni tanlang
   - "Redeploy" tugmasini bosing

✅ Bu cache'ni tozalab, qayta deploy qiladi.

---

### 2. Local'da qayta build qilish

PowerShell'da:

```powershell
cd C:\Users\ozodb\Desktop\loyihalar\Bolajon

# Cache'ni tozalash
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# Qayta build qilish
npm run build
```

Yoki script orqali:
```powershell
.\rebuild-and-deploy.ps1
```

---

### 3. Vercel CLI orqali deploy qilish

```powershell
# Vercel CLI o'rnatish (agar o'rnatilmagan bo'lsa)
npm install -g vercel

# Login qilish
vercel login

# Deploy qilish
vercel --prod
```

---

### 4. GitHub orqali avtomatik deploy

Agar Vercel GitHub bilan bog'langan bo'lsa:

```powershell
# O'zgarishlarni commit qiling
git add .
git commit -m "Fix: Rebuild to resolve chunk loading error"
git push

# Vercel avtomatik deploy qiladi
```

---

### 5. Vercel Environment Variables tekshirish

Vercel Dashboard'da:

1. **Project Settings → Environment Variables**
2. Quyidagi o'zgaruvchilar mavjudligini tekshiring:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`

3. Agar yo'q bo'lsa, qo'shing va redeploy qiling

---

### 6. Build Settings tekshirish

Vercel Dashboard → Project Settings → General:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` yoki `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x yoki 20.x

---

## 🔍 Xatolikni tekshirish

### Browser Console'da:

1. F12 bosing (Developer Tools)
2. Console tab'ga o'ting
3. Xatolikni ko'ring
4. Network tab'da failed request'larni tekshiring

### Vercel Logs'da:

1. Vercel Dashboard → Deployments
2. Oxirgi deployment'ni oching
3. "Build Logs" va "Function Logs" ni tekshiring

---

## 🚨 Agar muammo davom etsa

### Cache'ni butunlay tozalash:

```powershell
# Node modules'ni o'chirish
Remove-Item -Recurse -Force node_modules

# Package-lock'ni o'chirish
Remove-Item package-lock.json

# Qayta o'rnatish
npm install

# Build qilish
npm run build
```

### Vercel'da "Clear Cache and Redeploy":

1. Vercel Dashboard → Deployments
2. Oxirgi deployment → "..." → "Redeploy"
3. ✅ "Use existing Build Cache" ni **o'chiring**
4. "Redeploy" tugmasini bosing

---

## 📝 Keyingi deployment'lar uchun

### .gitignore'da quyidagilar mavjudligini tekshiring:

```
/.next/
/node_modules/
.env
.env*.local
```

### Build qilishdan oldin:

```powershell
# Har doim cache'ni tozalang
npm run build
```

---

## ✅ Muvaffaqiyatli deployment belgisi

- ✅ Barcha sahifalar yuklanadi
- ✅ Console'da xatolik yo'q
- ✅ O'yinlar ishlaydi
- ✅ Login/Register ishlaydi

---

## 🆘 Yordam

Agar muammo hal bo'lmasa:

1. Vercel Support: https://vercel.com/support
2. Next.js Docs: https://nextjs.org/docs
3. GitHub Issues: https://github.com/Lakodros-dev/Bolajon/issues
