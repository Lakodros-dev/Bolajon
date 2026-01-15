# 🚀 GitHub'ga Push qilish - Qadamma-qadam qo'llanma

## Tezkor yo'l: PowerShell Script

1. PowerShell'ni **Administrator** sifatida oching
2. Bolajon papkasiga o'ting:
```powershell
cd C:\Users\ozodb\Desktop\loyihalar\Bolajon
```

3. Script'ni ishga tushiring:
```powershell
.\push-to-github.ps1
```

Agar xatolik chiqsa:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\push-to-github.ps1
```

---

## Qo'lda bajariladigan usul

### 1. Git o'rnatish (agar o'rnatilmagan bo'lsa)

1. https://git-scm.com/download/win ga o'ting
2. "Download for Windows" tugmasini bosing
3. Yuklab olingan faylni ishga tushiring
4. Barcha default sozlamalarni qoldiring va "Next" bosing
5. O'rnatish tugagandan keyin PowerShell'ni **qayta oching**

### 2. Git'ni sozlash

PowerShell'da:
```powershell
cd C:\Users\ozodb\Desktop\loyihalar\Bolajon

# O'zingizning ma'lumotlaringizni kiriting
git config --global user.name "Ozodbek"
git config --global user.email "ozodbek@example.com"
```

### 3. Repository'ni boshlash

```powershell
# Git repository'ni boshlash
git init

# Remote qo'shish
git remote add origin https://github.com/Lakodros-dev/Bolajon.git
```

### 4. Fayllarni qo'shish va commit qilish

```powershell
# Barcha fayllarni qo'shish
git add .

# Commit qilish
git commit -m "Initial commit: Bolajon.uz platform"
```

### 5. GitHub'ga push qilish

```powershell
# Branch'ni main ga o'zgartirish
git branch -M main

# Push qilish
git push -u origin main
```

**Eslatma:** GitHub username va password (yoki Personal Access Token) so'raladi.

---

## GitHub Desktop orqali (ENG OSON)

1. **GitHub Desktop'ni yuklab oling:**
   - https://desktop.github.com/

2. **O'rnating va GitHub hisobingizga kiring**

3. **Repository qo'shing:**
   - File → Add Local Repository
   - `C:\Users\ozodb\Desktop\loyihalar\Bolajon` ni tanlang

4. **Publish qiling:**
   - "Publish repository" tugmasini bosing
   - Repository name: `Bolajon`
   - ✅ Keep this code private (agar private bo'lishini xohlasangiz)
   - "Publish repository" tugmasini bosing

✅ **Tayyor!**

---

## Muammolar va yechimlar

### ❌ "git is not recognized"
**Yechim:** Git o'rnatilmagan. Yuqoridagi 1-qadamni bajaring.

### ❌ "remote origin already exists"
**Yechim:**
```powershell
git remote remove origin
git remote add origin https://github.com/Lakodros-dev/Bolajon.git
```

### ❌ "failed to push some refs"
**Yechim:** GitHub'da repository yaratilganiga ishonch hosil qiling:
1. https://github.com/Lakodros-dev/Bolajon ga o'ting
2. Agar repository yo'q bo'lsa, GitHub'da yangi repository yarating

### ❌ "Authentication failed"
**Yechim:** Personal Access Token yarating:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Scope: `repo` ni belgilang
4. Token'ni nusxalang
5. Push qilganda password o'rniga token'ni kiriting

---

## Keyingi o'zgarishlarni push qilish

```powershell
cd C:\Users\ozodb\Desktop\loyihalar\Bolajon

git add .
git commit -m "O'zgarishlar tavsifi"
git push
```

---

## Yordam kerakmi?

- GitHub Desktop: https://desktop.github.com/
- Git Documentation: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com/
