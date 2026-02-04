@echo off
echo ========================================
echo Video fayllarni VPS ga yuklash
echo ========================================
echo.

set VPS_USER=root
set VPS_HOST=185.196.214.76
set VPS_PATH=/var/www/bolajoon/public/video

echo Video fayllar yuklanmoqda...
echo Bu jarayon uzoq davom etishi mumkin (3GB)
echo.

scp -r public\video\*.mp4 %VPS_USER%@%VPS_HOST%:%VPS_PATH%/

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Barcha videolar muvaffaqiyatli yuklandi!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Xato: Videolar yuklanmadi!
    echo ========================================
)

pause
