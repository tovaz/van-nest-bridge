# van-nest-bridge Installer Script
# Uso: Ejecuta este script con PowerShell como administrador

function Show-Menu {
    Clear-Host
    Write-Host "==============================="
    Write-Host "  van-nest-bridge - Instalador"
    Write-Host "==============================="
    Write-Host "1. Instalar"
    Write-Host "2. Desinstalar"
    Write-Host "3. Boot at start (autoarranque)"
    Write-Host "4. Salir"
}

function Check-Node {
    $node = Get-Command node -ErrorAction SilentlyContinue
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $node -or -not $npm) {
        Write-Host "Node.js o npm no están instalados. Instalando Node.js LTS..."
        $nodeInstaller = "node-lts.msi"
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi" -OutFile $nodeInstaller
        Start-Process msiexec.exe -Wait -ArgumentList "/I $nodeInstaller /quiet"
        Remove-Item $nodeInstaller
        $env:Path += ";$($env:ProgramFiles)\nodejs"
    }
}

function Install-App {
    $dir = Join-Path $PSScriptRoot "van-nest-bridge"
    if (Test-Path $dir) {
        Write-Host "El directorio ya existe. Eliminando para reinstalar..."
        Remove-Item $dir -Recurse -Force
    }
    Write-Host "Clonando el repositorio..."
    git clone --branch main https://github.com/tovaz/van-nest-bridge $dir
    if (!(Test-Path $dir)) {
        Write-Host "Error: No se pudo clonar el repositorio."
        return
    }
    Push-Location $dir
    Check-Node
    Write-Host "Instalando dependencias npm..."
    npm install
    if (Test-Path "package.json") {
        $pkg = Get-Content package.json | ConvertFrom-Json
        if ($pkg.scripts.build) {
            Write-Host "Ejecutando build..."
            npm run build
        }
    }
    Pop-Location
    Write-Host "Instalación completada."
}

function Uninstall-App {
    $dir = Join-Path $PSScriptRoot "van-nest-bridge"
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "Directorio eliminado."
    } else {
        Write-Host "No hay instalación previa."
    }
    Unregister-Startup
}

function Register-Startup {
    $dir = Join-Path $PSScriptRoot "van-nest-bridge"
    $taskName = "van-nest-bridge-startup"
    $action = "cmd /c cd /d `"$dir`" && npm start"
    $exists = schtasks /Query /TN $taskName 2>$null
    if ($LASTEXITCODE -eq 0) {
        schtasks /Delete /TN $taskName /F | Out-Null
    }
    schtasks /Create /SC ONLOGON /RL HIGHEST /TN $taskName /TR "$action" /F
    Write-Host "Arranque automático configurado."
}

function Unregister-Startup {
    $taskName = "van-nest-bridge-startup"
    $exists = schtasks /Query /TN $taskName 2>$null
    if ($LASTEXITCODE -eq 0) {
        schtasks /Delete /TN $taskName /F | Out-Null
        Write-Host "Tarea de arranque eliminada."
    }
}

while ($true) {
    Show-Menu
    $opt = Read-Host "Selecciona una opción (1-4)"
    switch ($opt) {
        1 { Install-App; Pause }
        2 { Uninstall-App; Pause }
        3 { Register-Startup; Pause }
        4 { break }
        default { Write-Host "Opción inválida."; Pause }
    }
}
