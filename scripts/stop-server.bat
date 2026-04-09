@echo off
REM Script para detener el servidor Node.js usando PIDFILE
setlocal
set APPDIR=%~dp0..
set APPDIR=%APPDIR:~0,-1%
set PIDFILE=%APPDIR%\server.pid

if not exist "%PIDFILE%" (
    echo El servidor no está iniciado.
    exit /b 1
)
set /p PID=<"%PIDFILE%"
taskkill /PID %PID% /F
if exist "%PIDFILE%" del "%PIDFILE%"
echo Servidor detenido.
endlocal