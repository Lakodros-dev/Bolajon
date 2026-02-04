# Windows uchun optimallashtirilgan deploy script
# Faqat kod fayllarini yuklaydi (video/rasmlar yuq)

$VPS_USER = "root"
$VPS_HOST = "185.196.214.76"
$VPS_PATH = "/var/www/bolajoon"

Write-Host "VPS ga optimallashtirilgan deploy boshlandi..." -ForegroundColor Green

# Vaqtinchalik papka
$TEMP_DIR = "deploy_temp_$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

Write-Host "Kerakli fayllar nusxalanmoqda..." -ForegroundColor Yellow

# Nusxalanadigan papkalar
$folders = @(
    "app",
    "components", 
    "context",
    "lib",
    "middleware",
    "models",
    "public/icons",
    "public/book",
    "scripts"
)

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "  Nusxalanmoqda: $folder" -ForegroundColor Cyan
        $dest = Join-Path $TEMP_DIR $folder
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Copy-Item -Path "$folder\*" -Destination $dest -Recurse -Force
    }
}

# Asosiy fayllar
$files = @(
    "package.json",
    "package-lock.json",
    "next.config.mjs",
    "jsconfig.json",
    ".env",
    "vercel.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  Nusxalanmoqda: $file" -ForegroundColor Cyan
        Copy-Item -Path $file -Destination $TEMP_DIR -Force
    }
}

# public papkadagi kichik fayllar
Write-Host "  Nusxalanmoqda: public (faqat kichik fayllar)" -ForegroundColor Cyan
New-Item -ItemType Directory -Path "$TEMP_DIR\public" -Force | Out-Null
Copy-Item -Path "public\*.png" -Destination "$TEMP_DIR\public" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public\*.json" -Destination "$TEMP_DIR\public" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public\*.txt" -Destination "$TEMP_DIR\public" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "public\sw.js" -Destination "$TEMP_DIR\public" -Force -ErrorAction SilentlyContinue

# Hajmni hisoblash
$size = (Get-ChildItem -Path $TEMP_DIR -Recurse | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($size / 1MB, 2)
Write-Host "Deploy hajmi: $sizeMB MB" -ForegroundColor Green

# SCP orqali yuklash
Write-Host "VPS ga yuklanmoqda..." -ForegroundColor Yellow
scp -r "$TEMP_DIR\*" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Xato: VPS ga yuklashda muammo!" -ForegroundColor Red
    Remove-Item -Path $TEMP_DIR -Recurse -Force
    exit 1
}

# Vaqtinchalik papkani o'chirish
Write-Host "Vaqtinchalik fayllar tozalanmoqda..." -ForegroundColor Yellow
Remove-Item -Path $TEMP_DIR -Recurse -Force

# VPS da build qilish
Write-Host "VPS da build qilinmoqda..." -ForegroundColor Yellow
$sshCommand = @"
cd $VPS_PATH
echo 'Dependencies o''rnatilmoqda...'
npm install --production
echo 'Build qilinmoqda...'
npm run build
echo 'PM2 restart...'
pm2 restart bolajoon 2>/dev/null || pm2 start npm --name bolajoon -- start
pm2 save
echo 'Tugadi!'
"@

ssh "${VPS_USER}@${VPS_HOST}" $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deploy muvaffaqiyatli tugadi!" -ForegroundColor Green
    Write-Host "Sayt: https://bolajoon.uz" -ForegroundColor Cyan
} else {
    Write-Host "Xato: VPS da build qilishda muammo!" -ForegroundColor Red
    exit 1
}
