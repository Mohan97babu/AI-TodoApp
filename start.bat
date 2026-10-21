@echo off
chcp 65001 >nul
title Planify - AI Todo & Study Architect Launcher

echo ===============================================================================
echo   🚀 Starting Planify | AI Todo Planner & Dev Assistant
echo   Model: Qwen 3 (1.7B) Grounded in GeeksforGeeks, W3Schools, TPointTech
echo ===============================================================================
echo.

:: 1. Launch Local Model Gateway Server (E:\model) on Port 8000
echo [1/3] Starting Local Model Server on http://localhost:8000 (Serving Qwen 3)...
start "Local Model Gateway (:8000)" cmd /c "cd /d E:\model && python run_server.py --host 0.0.0.0 --port 8000 --no-browser"

:: Wait 3 seconds for gateway startup
timeout /t 3 /nobreak >nul

:: 2. Launch Spring Boot Backend on Port 8082
echo [2/3] Starting Spring Boot Backend on http://localhost:8082...
set "JAVA_HOME=C:\Program Files\Android\openjdk\jdk-21.0.8"
start "Planify Spring Boot Backend (:8082)" cmd /c "cd /d "%~dp0backend" && ..\tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=h2"

:: Wait 3 seconds for backend initialization
timeout /t 3 /nobreak >nul

:: 3. Launch React Frontend on Port 5174
echo [3/3] Starting React Frontend on http://localhost:5174...
start "Planify React Frontend (:5174)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

:: Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
start http://localhost:5174/

echo.
echo ===============================================================================
echo   ✅ All Planify services launched successfully!
echo   - Frontend:      http://localhost:5174/
echo   - Backend REST:  http://localhost:8082/api
echo   - Local Model:   http://localhost:8000/v1 (Qwen 3 1.7B)
echo ===============================================================================
echo.
pause
