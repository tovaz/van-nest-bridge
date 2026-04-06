
# Manual de instalación y configuración
## van-nest-bridge

---

## Descripción del proyecto

**van-nest-bridge** es una aplicación desarrollada en Node.js con NestJS, diseñada para almacenar logs de forma persistente en archivos dentro del sistema. Utiliza la librería **winston** para la gestión avanzada de logs, permitiendo rotación automática, limpieza y optimización de los archivos de registro según tamaño, antigüedad y nivel de detalle configurables.

El sistema es totalmente configurable mediante un panel de administración web protegido con autenticación básica. Desde este panel puedes:
- Cambiar la ubicación y formato de los archivos de log.
- Ajustar el nivel de detalle (info, warn, error, etc.).
- Definir la política de retención y rotación de logs (tamaño máximo, días de conservación, etc.).
- Modificar las credenciales de acceso del administrador.

Esto permite adaptar el comportamiento del sistema de logs a las necesidades de cada entorno, asegurando la persistencia y limpieza automática de los registros.

---

## 1. Funcionamiento del archivo .env

El archivo `.env` contiene variables de entorno necesarias para que la aplicación funcione correctamente. Estas variables se leen al iniciar la app y definen parámetros como el puerto, credenciales de administrador y configuración de logs.

**Variables típicas:**
- `PORT`: Puerto donde se ejecuta el servidor (ej: 3000)
- `HOST`: Dirección IP de escucha (ej: 127.0.0.1)
- `LOG_DIR`: Carpeta donde se guardan los logs
- `LOG_FILE_PATTERN`, `LOG_DATE_PATTERN`, `LOG_LEVEL`, `LOG_MAX_SIZE`, `LOG_MAX_FILES`: Configuración avanzada de logs
- `ADMIN_USER`, `ADMIN_PASS`: Usuario y contraseña para acceso de administrador (cámbialos en producción)

**Ejemplo de .env:**
```
PORT=3000
HOST=127.0.0.1
LOG_DIR=./logs
LOG_FILE_PATTERN=app-%DATE%.log
LOG_DATE_PATTERN=YYYY-MM-DD
LOG_LEVEL=info
LOG_MAX_SIZE=20m
LOG_MAX_FILES=30d
ADMIN_USER=admin
ADMIN_PASS=changeme
```

**Uso:**
- Copia `.env.example` a `.env` y personaliza los valores.
- Si falta o es inválida alguna variable, la app no arrancará (validación automática).

---

## 2. Script de instalación: install-van-nest-bridge.ps1

Este script automatiza la instalación, desinstalación y configuración de arranque de la app en Windows.

**Opciones del menú:**
1. Instalar:  
   - Instala Git y Node.js si no están presentes.
   - Clona el repositorio en una subcarpeta.
   - Instala dependencias y construye la app.
2. Desinstalar:  
   - Elimina la carpeta de la app y la tarea de arranque automático.
3. Boot at start (autoarranque):  
   - Configura la app para que se inicie automáticamente al iniciar sesión en Windows.
4. Deinstalar Boot at start:  
   - Elimina la tarea de autoarranque.
5. Salir:  
   - Cierra el script.

**Requisitos:**
- Ejecutar como administrador.
- Conexión a internet para descargar dependencias.

**Pasos de uso:**
1. Ejecuta el script con PowerShell como administrador.
2. Selecciona la opción 1 para instalar.
3. Copia y personaliza el archivo `.env` según tus necesidades.
4. Usa la opción 3 para activar el arranque automático si lo deseas.

---

**¡Listo!**
