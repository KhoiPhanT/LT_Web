@echo off
chcp 65001 >nul
echo ===================================================
echo   DANG KHOI DONG BACKEND 2 (JAVA SERVER - PORT 8088)
echo ===================================================
cd /d "%~dp0backend2"

if not exist "bin" mkdir bin
echo Dang bien dich source code Java...
javac -encoding UTF-8 -d bin src\main\java\com\hihihaha\gara\AppServer.java

if %ERRORLEVEL% equ 0 (
    echo [OK] Bien dich thanh cong! Dang khoi chay server...
    java -cp bin com.hihihaha.gara.AppServer
) else (
    echo [LOI] Bien dich that bai! Vui long kiem tra JDK 21.
    pause
)
