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
    Write-Host "4. Deinstalar Boot at start (autoarranque)"
    Write-Host "5. Salir"
}

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

function Check-Git {
    if (Get-Command git -ErrorAction SilentlyContinue) { return }
    Write-Host "Git no está instalado. Instalando Git..."
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        winget install --id Git.Git -e --source winget --silent
        Refresh-Path
    } else {
        try {
            $release = Invoke-RestMethod -Uri "https://api.github.com/repos/git-for-windows/git/releases/latest" -UseBasicParsing
            $asset = $release.assets | Where-Object { $_.name -match "Git-.*-64-bit\.exe$" } | Select-Object -First 1
            if (-not $asset) { throw "No se encontró el instalador de Git en la API." }
            $gitInstaller = Join-Path $env:TEMP "git-installer.exe"
            Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $gitInstaller -UseBasicParsing
            Start-Process -FilePath $gitInstaller -ArgumentList "/VERYSILENT /NORESTART" -Wait
            Remove-Item $gitInstaller -ErrorAction SilentlyContinue
            Refresh-Path
        } catch {
            Write-Host "Error al instalar Git: $_"
            Write-Host "Instala Git manualmente desde https://git-scm.com y vuelve a ejecutar el script."
            exit 1
        }
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        $env:Path += ";$($env:ProgramFiles)\Git\cmd"
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Error: Git no se pudo instalar. Instálalo manualmente desde https://git-scm.com"
        exit 1
    }
}

function Check-Node {
    if ((Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm -ErrorAction SilentlyContinue)) { return }
    Write-Host "Node.js o npm no están instalados. Instalando Node.js LTS..."
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        winget install --id OpenJS.NodeJS.LTS -e --source winget --silent
        Refresh-Path
    } else {
        try {
            $nodeInstaller = Join-Path $env:TEMP "node-lts.msi"
            $nodeVersion = (Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json" -UseBasicParsing | Where-Object { $_.lts } | Select-Object -First 1).version
            Invoke-WebRequest -Uri "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-x64.msi" -OutFile $nodeInstaller -UseBasicParsing
            Start-Process msiexec.exe -Wait -ArgumentList "/I `"$nodeInstaller`" /quiet"
            Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
            Refresh-Path
        } catch {
            Write-Host "Error al instalar Node.js: $_"
            Write-Host "Instala Node.js manualmente desde https://nodejs.org y vuelve a ejecutar el script."
            exit 1
        }
    }
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $env:Path += ";$($env:ProgramFiles)\nodejs"
    }
}

function Install-App {
    $dir = Join-Path $PSScriptRoot "van-nest-bridge"
    if (Test-Path $dir) {
        Write-Host "El directorio ya existe. Eliminando para reinstalar..."
        Remove-Item $dir -Recurse -Force
    }
    Check-Git
    Write-Host "Clonando el repositorio..."
    git clone --branch main https://github.com/tovaz/van-nest-bridge $dir
    if (!(Test-Path $dir)) {
        Write-Host "Error: No se pudo clonar el repositorio."
        return
    }
    # Copiar el archivo .env si existe en la raíz
    $envSource = Join-Path $PSScriptRoot ".env"
    $envDest = Join-Path $dir ".env"
    if (Test-Path $envSource) {
        Copy-Item $envSource $envDest -Force
        Write-Host "Archivo .env copiado al repositorio."
    } else {
        Write-Host "Advertencia: No se encontró archivo .env en la raíz para copiar."
    }
    Push-Location $dir
    Check-Node
    Write-Host "Instalando dependencias npm (usando --legacy-peer-deps)..."
    npm install --legacy-peer-deps
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
    $action = 'powershell -WindowStyle Hidden -Command "Start-Process node -ArgumentList ''dist/main'' -WindowStyle Hidden -WorkingDirectory ''{0}''"' -f $dir
    $exists = schtasks /Query /TN $taskName 2>$null
    if ($LASTEXITCODE -eq 0) {
        schtasks /Delete /TN $taskName /F | Out-Null
    }
    schtasks /Create /SC ONLOGON /RL HIGHEST /TN $taskName /TR "$action" /F
    Write-Host "Arranque automático configurado."
    # Iniciar la app inmediatamente después de registrar el autoarranque
    Write-Host "Iniciando la app inmediatamente..."
    Start-Process -FilePath "node" -ArgumentList "dist/main" -WorkingDirectory $dir -WindowStyle Hidden
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
    $opt = Read-Host "Selecciona una opción (1-5)"
    switch ($opt) {
        1 { Install-App; Pause }
        2 { Uninstall-App; Pause }
        3 { Register-Startup; Pause }
        4 { Unregister-Startup; Pause }
        5 { break }
        default { Write-Host "Opción inválida."; Pause }
    }
}
