@echo off
setlocal enabledelayedexpansion
pushd "%~dp0.."
set APP_DIR=%CD%
popd
set SCRIPT_DIR=%APP_DIR%\scripts
set PIDFILE=%SCRIPT_DIR%\server.pid

REM --- Funciones para registro de inicio automático ---
set TASKNAME=van-nest-logger-startup
set STARTCMD=powershell -WindowStyle Hidden -Command "Start-Process node -ArgumentList 'dist/main.js' -WindowStyle Hidden -WorkingDirectory '%SCRIPT_DIR%'"

if "%1"=="" goto :menu
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="status" goto :status
if "%1"=="register-startup" goto :register_startup
if "%1"=="unregister-startup" goto :unregister_startup
goto :help

:menu
echo =============================
echo van-nest-logger - Control
echo =============================
echo 1. Iniciar servidor
echo 2. Detener servidor
echo 3. Estado del servidor
echo 4. Registrar inicio automatico
echo 5. Quitar inicio automatico
echo 6. Salir
set /p opt=Selecciona una opcion [1-6]: 
if "%opt%"=="1" goto :start
if "%opt%"=="2" goto :stop
if "%opt%"=="3" goto :status
if "%opt%"=="4" goto :register_startup
if "%opt%"=="5" goto :unregister_startup
goto :eof

:start
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

cd /d "%APP_DIR%"
start "" /b node "%APP_DIR%\\dist\\main.js" > "%PIDFILE:server.pid=server.log%" 2>&1
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
)
goto :wait_menu

:stop
if not exist "%PIDFILE%" (
    echo El servidor no esta iniciado.
    goto :wait_menu
)
set /p PID=<"%PIDFILE%"
taskkill /PID %PID% /F
del "%PIDFILE%"
echo Servidor detenido.
goto :wait_menu

:status
if not exist "%PIDFILE%" (
    echo El servidor no esta iniciado.
    goto :wait_menu
)
set /p PID=<"%PIDFILE%"
tasklist /FI "PID eq %PID%" | find "%PID%" > nul
if errorlevel 1 (
    echo El servidor no esta corriendo.
    del "%PIDFILE%"
) else (
    echo El servidor esta corriendo [PID: %PID%].
)
goto :wait_menu

:pause_if_menu
if "%1"=="" pause
goto :eof

:register_startup
REM Elimina tarea previa si existe
SCHTASKS /Query /TN %TASKNAME% >nul 2>&1
if %ERRORLEVEL%==0 SCHTASKS /Delete /TN %TASKNAME% /F >nul
SCHTASKS /Create /SC ONLOGON /RL HIGHEST /TN %TASKNAME% /TR "%STARTCMD%" /F
echo Arranque automatico registrado.
goto :wait_menu

:unregister_startup
SCHTASKS /Query /TN %TASKNAME% >nul 2>&1
if %ERRORLEVEL%==0 (
    SCHTASKS /Delete /TN %TASKNAME% /F >nul
    echo Arranque automatico eliminado.
) else (
    echo No hay tarea de arranque registrada.
)
goto :wait_menu

:help
echo Uso: server-control.bat [start^|stop^|status^|register-startup^|unregister-startup]
endlocal

:wait_menu
if "%1"=="" (
    set /p _wait="Presione cualquier tecla para regresar al menu, o presione q para salir: "
    if /i "%_wait%"=="q" exit /b
    goto :menu
)
goto :eof