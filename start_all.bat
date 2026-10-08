@echo off
title Smart Canteen Launcher
echo ========================================================
echo       Starting Smart Canteen Full-Stack System
echo ========================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/3] Launching ML Microservice (FastAPI on Port 8000)...
start "Smart Canteen - ML Service (Port 8000)" cmd /k "cd /d "%SCRIPT_DIR%ml_service" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Launching Backend Gateway (Express on Port 5005)...
start "Smart Canteen - Backend (Port 5005)" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Launching Frontend Dashboard (Vite on Port 5173)...
start "Smart Canteen - Frontend (Port 5173)" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo All 3 services are launching!
echo  - ML Service:   http://localhost:8000
echo  - Backend API:  http://localhost:5005
echo  - Frontend UI:  http://localhost:5173
echo.
echo Opening browser to http://localhost:5173...
start http://localhost:5173

pause
