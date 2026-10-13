@echo off
chcp 65001 >nul
echo ===================================================
echo   DANG KHOI DONG CLIENT 2 (NEXT.JS - PORT 3000)
echo ===================================================
cd /d "%~dp0client2"

echo Dang khoi chay Next.js Dev Server...
npx next dev -p 3000
pause
