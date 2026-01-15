# Bolajon.uz - GitHub'ga push qilish scripti
# Bu scriptni ishga tushirishdan oldin Git o'rnatilganiga ishonch hosil qiling

Write-Host "🚀 Bolajon.uz ni GitHub'ga joylaymiz..." -ForegroundColor Green
Write-Host ""

# Git o'rnatilganini tekshirish
try {
    $gitVersion = git --version
    Write-Host "✅ Git topildi: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git o'rnatilmagan!" -ForegroundColor Red
    Write-Host "Git'ni https://git-scm.com/download/win dan yuklab oling" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Git'ni sozlaymiz..." -ForegroundColor Cyan

# Git user sozlamalari (o'zingiznikini kiriting)
$userName = Read-Host "Git user name kiriting (masalan: Ozodbek)"
$userEmail = Read-Host "Git email kiriting (masalan: ozodbek@example.com)"

git config --global user.name "$userName"
git config --global user.email "$userEmail"

Write-Host "✅ Git sozlandi" -ForegroundColor Green
Write-Host ""

# Git repository'ni boshlash
Write-Host "📦 Git repository'ni boshlaymiz..." -ForegroundColor Cyan

if (Test-Path .git) {
    Write-Host "⚠️  Git repository allaqachon mavjud" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Git repository boshlandi" -ForegroundColor Green
}

Write-Host ""

# Remote qo'shish
Write-Host "🔗 Remote repository qo'shamiz..." -ForegroundColor Cyan

$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' allaqachon mavjud: $remoteExists" -ForegroundColor Yellow
    $replace = Read-Host "Almashtirishni xohlaysizmi? (y/n)"
    if ($replace -eq "y") {
        git remote remove origin
        git remote add origin https://github.com/Lakodros-dev/Bolajon.git
        Write-Host "✅ Remote yangilandi" -ForegroundColor Green
    }
} else {
    git remote add origin https://github.com/Lakodros-dev/Bolajon.git
    Write-Host "✅ Remote qo'shildi" -ForegroundColor Green
}

Write-Host ""

# Barcha fayllarni qo'shish
Write-Host "📁 Fayllarni qo'shamiz..." -ForegroundColor Cyan
git add .
Write-Host "✅ Barcha fayllar qo'shildi" -ForegroundColor Green

Write-Host ""

# Commit qilish
Write-Host "💾 Commit qilamiz..." -ForegroundColor Cyan
git commit -m "Initial commit: Bolajon.uz platform with all features"
Write-Host "✅ Commit qilindi" -ForegroundColor Green

Write-Host ""

# Branch'ni main ga o'zgartirish
Write-Host "🌿 Branch'ni main ga o'zgartirish..." -ForegroundColor Cyan
git branch -M main
Write-Host "✅ Branch main ga o'zgartirildi" -ForegroundColor Green

Write-Host ""

# Push qilish
Write-Host "🚀 GitHub'ga push qilamiz..." -ForegroundColor Cyan
Write-Host "⚠️  GitHub username va password (yoki token) so'ralishi mumkin" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Muvaffaqiyatli! Loyihangiz GitHub'da!" -ForegroundColor Green
    Write-Host "🔗 https://github.com/Lakodros-dev/Bolajon" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push qilishda xatolik yuz berdi" -ForegroundColor Red
    Write-Host "GitHub'da repository yaratilganiga ishonch hosil qiling" -ForegroundColor Yellow
    Write-Host "Yoki GitHub Desktop'dan foydalaning: https://desktop.github.com/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tugadi! ✨" -ForegroundColor Green
