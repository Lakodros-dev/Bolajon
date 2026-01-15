# Bolajon.uz - Rebuild va Deploy Script
# Bu script cache'ni tozalab, qayta build qiladi

Write-Host "🧹 Cache'ni tozalaymiz..." -ForegroundColor Cyan

# .next papkasini o'chirish
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ .next papkasi o'chirildi" -ForegroundColor Green
} else {
    Write-Host "⚠️  .next papkasi topilmadi" -ForegroundColor Yellow
}

# node_modules/.cache ni o'chirish
if (Test-Path node_modules/.cache) {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ node_modules/.cache o'chirildi" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Qayta build qilamiz..." -ForegroundColor Cyan
Write-Host ""

# Build qilish
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build muvaffaqiyatli!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Endi Vercel'ga deploy qiling:" -ForegroundColor Cyan
    Write-Host "   1. GitHub'ga push qiling (agar qilmagan bo'lsangiz)" -ForegroundColor Yellow
    Write-Host "   2. Vercel avtomatik deploy qiladi" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Yoki qo'lda:" -ForegroundColor Yellow
    Write-Host "   vercel --prod" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Build xatolik bilan yakunlandi" -ForegroundColor Red
    Write-Host "Xatolikni tekshiring va qayta urinib ko'ring" -ForegroundColor Yellow
}
