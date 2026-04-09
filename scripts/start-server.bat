@echo off
REM Obtener la ruta absoluta de la carpeta superior (raíz de la app)
pushd "%~dp0.."
set APPDIR=%CD%
popd

set SCRIPTS_DIR=%~dp0
set PIDFILE=%SCRIPTS_DIR%\server.pid


REM Si el servidor está iniciado, detenerlo primero
if exist "%PIDFILE%" (
    set /p PID=<"%PIDFILE%"
    tasklist /FI "PID eq !PID!" | find "!PID!" > nul
    if errorlevel 1 (
        echo El archivo PID existe pero el proceso no esta activo. Limpiando...
        del "%PIDFILE%"
    ) else (
        echo El servidor ya estaba iniciado. Deteniendo proceso anterior [PID: !PID!]...
        taskkill /PID !PID! /F
        timeout /t 3 > nul 
        del "%PIDFILE%"
        echo Proceso anterior detenido.
    )
)

cd /d "%APPDIR%"
start "" /b node dist/main.js > "%SCRIPTS_DIR%\server.log" 2>&1

REM Esperar hasta 100 segundos a que el proceso node aparezca y guardar el PID
set RETRIES=3
set PID_FOUND=
for /l %%i in (1,1,%RETRIES%) do (
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /NH') do (
        set PID_FOUND=1
        echo %%a > "%PIDFILE%"
        echo Servidor iniciado [PID: %%a]
        echo No cierre la ventana para mantener el servidor corriendo.
        exit /b 0
    )
    timeout /t 10 > nul
)
if not defined PID_FOUND (
    echo No se pudo obtener el PID.
    exit /b 1
)