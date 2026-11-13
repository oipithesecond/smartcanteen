@echo off
title Stop Smart Canteen Services
echo ========================================================
echo       Stopping Smart Canteen Services (8000, 5005, 5173)
echo ========================================================
echo.

echo Terminating service windows and closing MongoDB connections...
taskkill /FI "WINDOWTITLE eq Smart Canteen - ML Service*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Smart Canteen - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Smart Canteen - Frontend*" /T /F >nul 2>&1

powershell -NoProfile -Command "foreach ($port in @(8000, 5005, 5173)) { $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conns) { foreach ($c in $conns) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('  - Port ' + $port + ': Stopped process (PID: ' + $c.OwningProcess + ')') } catch {} } } else { Write-Host ('  - Port ' + $port + ': No active process') } }"

echo.
echo Finished shutting down all services and closing database connections.
pause
