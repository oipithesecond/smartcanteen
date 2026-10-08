@echo off
title Stop Smart Canteen Services
echo ========================================================
echo       Stopping Smart Canteen Services (8000, 5005, 5173)
echo ========================================================
echo.

powershell -Command "foreach ($port in @(8000, 5005, 5173)) { $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue; if ($conns) { foreach ($c in $conns) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process on port ' + $port + ' (PID: ' + $c.OwningProcess + ')') } catch {} } } else { Write-Host ('No active process on port ' + $port) } }"

echo.
echo Finished shutting down services.
pause
