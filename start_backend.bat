@echo off
setlocal
cd /d "%~dp0"
set "COMPOSE_ENV="
if exist .env.backend.local set COMPOSE_ENV=--env-file .env.backend.local
docker compose %COMPOSE_ENV% up -d --wait mysql_db
if errorlevel 1 exit /b 1
docker compose %COMPOSE_ENV% exec -T mysql_db sh -c "MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql --default-character-set=utf8mb4 -uroot" < backend2\src\main\resources\database\init.sql
if errorlevel 1 exit /b 1
docker compose %COMPOSE_ENV% up -d --build --wait backend2_servlet
if errorlevel 1 exit /b 1
for /f "delims=" %%a in ('docker compose %COMPOSE_ENV% port backend2_servlet 8080') do echo Giao dien JSP: http://%%a/
