@echo off
setlocal
rem Process-only execution policy; no machine or user setting is modified.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap.ps1"
if errorlevel 1 (
  echo Falha ao iniciar. Confira a mensagem acima e o guia de uso.
  pause
  exit /b 1
)
endlocal
