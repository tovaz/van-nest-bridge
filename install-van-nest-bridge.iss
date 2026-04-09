[Setup]
AppName=van-nest-logger
AppVersion=1.0
DefaultDirName={pf}\van-nest-logger
DefaultGroupName=van-nest-logger
OutputDir=.
OutputBaseFilename=van-nest-logger-setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
; Icono del instalador (usa un archivo .ico, convierte install.svg a .ico si es necesario)
SetupIconFile="public\\icons\\install.ico"

[Files]
; Copia todo el contenido de la carpeta raíz del proyecto
; Source: "*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

; Carpetas necesarias
Source: "dist\\*"; DestDir: "{app}\\dist"; Flags: recursesubdirs createallsubdirs
Source: "node_modules\\*"; DestDir: "{app}\\node_modules"; Flags: recursesubdirs createallsubdirs
Source: "public\\*"; DestDir: "{app}\\public"; Flags: recursesubdirs createallsubdirs
Source: "requerimientos\\*"; DestDir: "{app}\\requerimientos"; Flags: recursesubdirs createallsubdirs
Source: "scripts\\*"; DestDir: "{app}\\scripts"; Flags: recursesubdirs createallsubdirs
Source: "src\\views\\*"; DestDir: "{app}\\src\\views"; Flags: recursesubdirs createallsubdirs

; Archivos individuales
Source: ".env"; DestDir: "{app}"; Flags: ignoreversion
Source: "database.sqlite"; DestDir: "{app}"; Flags: ignoreversion
Source: "install-van-nest-bridge.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "manual-instalacion-van-nest-bridge.pdf"; DestDir: "{app}"; Flags: ignoreversion

; Incluye los iconos convertidos a .ico
Source: "public\\icons\\install.ico"; DestDir: "{app}\\icons"; Flags: ignoreversion
Source: "public\\icons\\log-icon.ico"; DestDir: "{app}\\icons"; Flags: ignoreversion

[Run]
; Instala Node.js si no está instalado
Filename: "msiexec.exe"; Parameters: "/i ""{app}\requerimientos\node-v24.14.1-x64.msi"" /quiet"; StatusMsg: "Instalando Node.js..."; Check: not IsNodeInstalled; Flags: runhidden

[Tasks]
Name: "desktopicon"; Description: "Crear acceso directo en el escritorio"; GroupDescription: "Accesos directos:"


[UninstallRun]
; Detener el servidor antes de desinstalar
Filename: "{app}\scripts\stop-server.bat"; Flags: runhidden
; Desinstalar Node.js (busca el producto por nombre, puede requerir ajuste si cambia la versión)
; Filename: "msiexec.exe"; Parameters: "/x {app}\requerimientos\node-v24.14.1-x64.msi /quiet"; Flags: runhidden


[Icons]
Name: "{group}\\Iniciar servidor van-nest-logger"; Filename: "{app}\\scripts\\start-server.bat"; IconFilename: "{app}\\icons\\log-icon.ico"
Name: "{group}\\Detener servidor van-nest-logger"; Filename: "{app}\\scripts\\stop-server.bat"; IconFilename: "{app}\\icons\\log-icon.ico"
Name: "{group}\\Control servidor van-nest-logger"; Filename: "{app}\\scripts\\server-control.bat"; IconFilename: "{app}\\icons\\log-icon.ico"
Name: "{userdesktop}\\Control servidor van-nest-logger"; Filename: "{app}\\scripts\\server-control.bat"; Tasks: desktopicon; IconFilename: "{app}\\icons\\log-icon.ico"

[Code]
function IsNodeInstalled: Boolean;
var
  ErrorCode: Integer;
begin
  Result := (Exec('node', '-v', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode));
end;