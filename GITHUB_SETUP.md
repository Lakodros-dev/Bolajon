# GitHub'ga joylash bo'yicha qo'llanma

## 1-usul: Git CLI orqali

### Git o'rnatish
1. [Git for Windows](https://git-scm.com/download/win) ni yuklab oling
2. O'rnatib bo'lgandan keyin, PowerShell yoki CMD'ni qayta oching

### GitHub'ga joylash
```bash
cd C:\Users\ozodb\Desktop\loyihalar\Bolajon

# Git'ni sozlash (birinchi marta)
git config --global user.name "Sizning ismingiz"
git config --global user.email "sizning@email.com"

# Repository'ni boshlash
git init

# Remote qo'shish
git remote add origin https://github.com/Lakodros-dev/Bolajon.git

# Barcha fayllarni qo'shish
git add .

# Commit qilish
git commit -m "Initial commit: Bolajon.uz platform with all features"

# GitHub'ga push qilish
git branch -M main
git push -u origin main
```

## 2-usul: GitHub Desktop (Eng oson)

1. [GitHub Desktop](https://desktop.github.com/) ni yuklab oling
2. GitHub hisobingizga kiring
3. File → Add Local Repository
4. `C:\Users\ozodb\Desktop\loyihalar\Bolajon` papkasini tanlang
5. "Create a repository" tugmasini bosing
6. Repository → Repository Settings → Remote
   - Name: `origin`
   - URL: `https://github.com/Lakodros-dev/Bolajon.git`
7. Commit message yozing: "Initial commit"
8. "Commit to main" tugmasini bosing
9. "Push origin" tugmasini bosing

## 3-usul: VS Code orqali

1. VS Code'da Bolajon papkasini oching
2. Source Control (Ctrl+Shift+G) ni bosing
3. "Initialize Repository" tugmasini bosing
4. Barcha fayllarni stage qiling (+)
5. Commit message yozing va commit qiling (✓)
6. Terminal'da:
```bash
git remote add origin https://github.com/Lakodros-dev/Bolajon.git
git branch -M main
git push -u origin main
```

## Muhim eslatmalar

- `.env` fayli GitHub'ga yuklanmaydi (xavfsizlik uchun)
- `.env.local.example` faylidan nusxa olib `.env` yarating
- `MONGODB_URI` va `JWT_SECRET` ni o'zgartiring
- `node_modules` va `.next` papkalari ham yuklanmaydi

## Vercel'ga deploy qilish

1. [Vercel](https://vercel.com) hisobingizga kiring
2. "Import Project" tugmasini bosing
3. GitHub repository'ni tanlang
4. Environment Variables qo'shing:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Xavfsiz kalit (32+ belgi)
   - `NEXT_PUBLIC_APP_URL` - Sayt URL
5. "Deploy" tugmasini bosing

## Keyingi o'zgarishlarni push qilish

```bash
git add .
git commit -m "O'zgarishlar tavsifi"
git push
```
