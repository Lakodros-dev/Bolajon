# VPS ma'lumotlari
$VPS_USER = "root"
$VPS_HOST = "164.68.109.208"
$VPS_PATH = "/var/www/bolajoon/public/video"
$LOCAL_PATH = "public/video"

Write-Host "🔍 VPS da qaysi videolar bor ekanligini tekshiryapman..." -ForegroundColor Cyan

# VPS dagi videolar ro'yxatini olish
$remoteVideos = ssh ${VPS_USER}@${VPS_HOST} "ls /var/www/bolajoon/public/video/*.mp4 2>/dev/null | xargs -n 1 basename"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ VPS ga ulanib bo'lmadi" -ForegroundColor Red
    exit 1
}

$remoteVideosList = $remoteVideos -split "`n" | Where-Object { $_ -ne "" }
Write-Host "✅ VPS da $($remoteVideosList.Count) ta video bor" -ForegroundColor Green
Write-Host ""

# Local videolar ro'yxati
$localVideos = Get-ChildItem -Path $LOCAL_PATH -Filter "*.mp4"
Write-Host "📊 Local da $($localVideos.Count) ta video bor" -ForegroundColor Cyan
Write-Host ""

# Qolgan videolarni topish
$remainingVideos = @()
foreach ($video in $localVideos) {
    if ($remoteVideosList -notcontains $video.Name) {
        $remainingVideos += $video
    }
}

if ($remainingVideos.Count -eq 0) {
    Write-Host "🎉 Barcha videolar allaqachon yuklangan!" -ForegroundColor Green
    exit 0
}

Write-Host "📤 Yuklash kerak: $($remainingVideos.Count) ta video" -ForegroundColor Yellow
Write-Host ""

$currentVideo = 0
foreach ($video in $remainingVideos) {
    $currentVideo++
    $percentage = [math]::Round(($currentVideo / $remainingVideos.Count) * 100, 2)
    
    Write-Host "[$currentVideo/$($remainingVideos.Count)] ($percentage%) Yuklanmoqda: $($video.Name)" -ForegroundColor Yellow
    
    $remotePath = "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/$($video.Name)"
    
    # SCP orqali yuklash
    scp "$($video.FullName)" $remotePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Yuklandi" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Xatolik - qayta urinib ko'ring" -ForegroundColor Red
        Write-Host "   Buyruq: scp `"$($video.FullName)`" $remotePath" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "🎉 Tugadi!" -ForegroundColor Green
