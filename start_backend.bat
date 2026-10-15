@echo off
rem Khởi: nạp seed MySQL; Lợi: khởi động Servlet và cấu hình OTP trên Windows.
setlocal
cd /d "%~dp0"
docker compose up -d --wait mysql_db
if errorlevel 1 exit /b 1
docker compose exec -T mysql_db sh -c "MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql --default-character-set=utf8mb4 -uroot" < backend2\src\main\resources\database\init.sql
if errorlevel 1 exit /b 1
docker compose up -d --build --wait backend2_servlet
if errorlevel 1 exit /b 1
if "%BACKEND_HOST_PORT%"=="" set BACKEND_HOST_PORT=8089
echo Servlet API: http://localhost:%BACKEND_HOST_PORT%/api/v1/health
