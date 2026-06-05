@echo off
chcp 65001 >nul
title TeamTodo

echo ==============================
echo   TeamTodo Starting...
echo ==============================

start "backend" /min cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload"

timeout /t 4 /nobreak >nul

start "frontend" /min cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 4 /nobreak >nul

start "" http://localhost:5173

echo.
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo   Press any key to stop all services...
pause >nul

taskkill /fi "WINDOWTITLE eq backend" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq frontend" /f >nul 2>&1
