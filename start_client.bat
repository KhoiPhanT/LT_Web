@echo off
setlocal
cd /d "%~dp0"
set "COMPOSE_ENV="
if exist .env.backend.local set COMPOSE_ENV=--env-file .env.backend.local
for /f "delims=" %%a in ('docker compose %COMPOSE_ENV% port backend2_servlet 8080') do echo Giao dien JSP: http://%%a/
echo JSP chay cung Tomcat. Neu chua khoi dong, chay start_backend.bat.
