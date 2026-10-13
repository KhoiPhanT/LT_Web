@echo off
chcp 65001 >nul
echo ===================================================
echo   DANG KHOI DONG CLIENT 2 (NEXT.JS - PORT 3001)
echo   BACKEND PROXY (PORT 8089)
echo ===================================================
cd /d "%~dp0client2"

echo Dang khoi chay Next.js Dev Server tren port 3001...
npx next dev -p 3001
pause
