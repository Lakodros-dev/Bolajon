@echo off
echo VPS ga deploy boshlandi...

set VPS_USER=root
set VPS_HOST=185.196.214.76
set VPS_PATH=/var/www/bolajoon

echo Fayllar yuklanmoqda...

scp -r ^
  app ^
  components ^
  context ^
  lib ^
  middleware ^
  models ^
  public/icons ^
  scripts ^
  package.json ^
  package-lock.json ^
  next.config.mjs ^
  jsconfig.json ^
  .env ^
  vercel.json ^
  %VPS_USER%@%VPS_HOST%:%VPS_PATH%/

if %ERRORLEVEL% NEQ 0 (
    echo Xato: Fayllar yuklanmadi!
    pause
    exit /b 1
)

echo VPS da build qilinmoqda...

ssh %VPS_USER%@%VPS_HOST% "cd %VPS_PATH% && npm install --production && npm run build && pm2 restart bolajoon || pm2 start npm --name bolajoon -- start && pm2 save"

if %ERRORLEVEL% EQU 0 (
    echo Deploy muvaffaqiyatli tugadi!
    echo Sayt: https://bolajoon.uz
) else (
    echo Xato: Build qilishda muammo!
)

pause
