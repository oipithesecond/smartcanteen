@echo off
title Smart Canteen Launcher
echo ========================================================
echo       Starting Smart Canteen Full-Stack System
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"

echo [1/3] Launching ML Microservice (FastAPI on Port 8000)...
pushd "%SCRIPT_DIR%ml_service"
start "Smart Canteen - ML Service (Port 8000)" cmd /k "echo Starting ML Service... && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
popd

ping -n 4 127.0.0.1 >nul

echo [2/3] Launching Backend Gateway & MongoDB Atlas (Port 5005)...
pushd "%SCRIPT_DIR%backend"
start "Smart Canteen - Backend API (Port 5005)" cmd /k "echo Starting Backend Server with MongoDB Atlas... && npm start"
popd

ping -n 4 127.0.0.1 >nul

echo [3/3] Launching Frontend Dashboard (Vite on Port 5173)...
pushd "%SCRIPT_DIR%frontend"
start "Smart Canteen - Frontend (Port 5173)" cmd /k "echo Starting Frontend Dev Server... && npm run dev"
popd

ping -n 4 127.0.0.1 >nul

echo.
echo All services and database are launching!
echo  - ML Service:      http://localhost:8000
echo  - Backend API:     http://localhost:5005
echo  - Database Target: MongoDB Atlas (smartcanteen)
echo  - Database Health: http://localhost:5005/api/db-health
echo  - Frontend UI:     http://localhost:5173
echo.
echo Opening browser to http://localhost:5173...
start http://localhost:5173

pause
