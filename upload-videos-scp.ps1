# VPS ma'lumotlarini kiriting
$VPS_USER = "root"
$VPS_HOST = "164.68.109.208"
$VPS_PATH = "/var/www/bolajoon/public/video"
$LOCAL_PATH = "public/video"

Write-Host "🚀 Videolarni VPS ga yuklash boshlandi..." -ForegroundColor Green
Write-Host ""

# Barcha videolarni sanash
$videos = Get-ChildItem -Path $LOCAL_PATH -Filter "*.mp4"
$totalVideos = $videos.Count
$currentVideo = 0

Write-Host "📊 Jami videolar: $totalVideos ta" -ForegroundColor Cyan
Write-Host ""

foreach ($video in $videos) {
    $currentVideo++
    $percentage = [math]::Round(($currentVideo / $totalVideos) * 100, 2)
    
    Write-Host "[$currentVideo/$totalVideos] ($percentage%) Yuklanmoqda: $($video.Name)" -ForegroundColor Yellow
    
    # SCP orqali yuklash
    $remotePath = "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/$($video.Name)"
    
    # scp buyrug'i (OpenSSH kerak)
    scp "$($video.FullName)" $remotePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Yuklandi" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Xatolik" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "🎉 Barcha videolar yuklandi!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Keyingi qadamlar:" -ForegroundColor Cyan
Write-Host "1. VPS ga SSH orqali kiring"
Write-Host "2. cd /var/www/bolajon"
Write-Host "3. node scripts/fix-lesson-numbers.mjs"
Write-Host "4. node scripts/update-videos-51-100.mjs"
