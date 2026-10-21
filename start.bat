@echo off
setlocal
title Planify - Local Launcher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  echo.
  echo Planify did not start. Review the error above.
  pause
  exit /b 1
)
echo Check the new service windows for application logs.
endlocal
