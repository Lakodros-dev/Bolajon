@echo off
echo ========================================
echo Video fayllarni partiyalarda yuklash
echo ========================================
echo.
echo Videolar 10 tadan yuklash uchun
echo Agar xato bo'lsa, qayta boshlash oson
echo.

set VPS_USER=root
set VPS_HOST=185.196.214.76
set VPS_PATH=/var/www/bolajoon/public/video

set /a count=0
set /a batch=0

for %%f in (public\video\*.mp4) do (
    set /a count+=1
    set /a batch_num=count/10
    
    echo [!count!] Yuklanmoqda: %%~nxf
    scp "%%f" %VPS_USER%@%VPS_HOST%:%VPS_PATH%/
    
    if !ERRORLEVEL! NEQ 0 (
        echo Xato: %%~nxf yuklanmadi!
        echo Qayta urinmoqchimisiz? (Y/N)
        choice /C YN /N
        if !ERRORLEVEL! EQU 1 (
            scp "%%f" %VPS_USER%@%VPS_HOST%:%VPS_PATH%/
        )
    )
    
    set /a remainder=count%%10
    if !remainder! EQU 0 (
        echo.
        echo --- !count! ta video yuklandi ---
        echo.
    )
)

echo.
echo ========================================
echo Jami !count! ta video yuklandi!
echo ========================================

pause
