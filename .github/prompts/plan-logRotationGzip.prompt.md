# Plan: Log Rotation con GZIP y Subcarpetas (Log4j-style)

**TL;DR**: Añadir 2 campos nuevos (`logZippedArchive` y `logArchiveDirPattern`) a toda la cadena: entidad SQLite → Winston → DTOs → servicio → vista. Ya tienes `zippedArchive: false` preparado en `winston.config.ts` y el evento `rotate` listo para mover archivos.

---

**Pasos**

### Fase 1 — Modelo de datos
1. `src/infrastructure/logger/logger-config.entity.ts` — Añadir dos columnas al final de la clase:
   - `logZippedArchive: boolean` con `default: false`
   - `logArchiveDirPattern: string` con `default: ''` (vacío = sin subcarpeta)
   - TypeORM con `synchronize: true` migrará la BD automáticamente

### Fase 2 — Lógica Winston
2. `src/infrastructure/logger/winston.config.ts` — Cuatro cambios:
   - Añadir `logZippedArchive: boolean` y `logArchiveDirPattern: string` al interfaz `WinstonConfigPayload`
   - Añadir una función simple `formatDatePattern(pattern)` que reemplaza `YYYY`, `MM`, `DD` con la fecha actual (sin dependencias extras)
   - Cambiar `zippedArchive: false` → `zippedArchive: config.logZippedArchive`
   - En el evento `rotate`: si `logArchiveDirPattern` no está vacío, calcular la subcarpeta con `formatDatePattern()`, crearla y mover el archivo rotado (ya `.gz` si está comprimido) con `fs.renameSync`

### Fase 3 — Seed inicial desde `.env`
3. `src/infrastructure/logger/config-store.service.ts` — En `ensureConfigExists()`, añadir:
   - `logZippedArchive` con valor de `LOG_ZIPPED_ARCHIVE` del env o `false`
   - `logArchiveDirPattern` con valor de `LOG_ARCHIVE_DIR_PATTERN` del env o `''`

### Fase 4 — DTOs
4. `src/modules/admin/dto/update-config.dto.ts` — Añadir:
   - `@Transform @IsBoolean() logZippedArchive: boolean` (el `Transform` convierte el string `'true'` del formulario HTML a boolean real)
   - `@IsString() @IsOptional() logArchiveDirPattern: string`
5. `src/modules/admin/dto/config-response.dto.ts` — Añadir los 2 campos al DTO de respuesta

### Fase 5 — Servicio Admin
6. `src/modules/admin/services/admin.service.ts` — En la llamada a `reloadConfig()` dentro de `updateConfig()`, pasar los 2 campos nuevos: `logZippedArchive` y `logArchiveDirPattern`

### Fase 6 — Vista Dashboard
7. `src/views/admin/dashboard.hbs` — Dos cambios:
   - **HTML**: Añadir al grid existente un checkbox `#logZippedArchive` (con `{{#if config.logZippedArchive}}checked{{/if}}`) y un input text `#logArchiveDirPattern` con placeholder `YYYY-MM`
   - **JS payload**: Incluir `logZippedArchive: document.getElementById('logZippedArchive').checked` y `logArchiveDirPattern: document.getElementById('logArchiveDirPattern').value`
   NOTA: Para esta vista quisiera mover a una seccion aparte "Rotacion" que incluya los campos que influyen en la rotacion de logs.

---

**Verificación**
1. Arrancar y abrir `/admin` → los 2 campos nuevos deben aparecer en el formulario
2. Activar compresión, guardar, generar logs y verificar archivos `.gz` al rotar
3. Configurar `logArchiveDirPattern: YYYY-MM`, forzar rotación (reduciendo `logMaxSize` a algo pequeño) y verificar que los `.gz` se mueven a la subcarpeta `logs/2026-04/`
4. Dejar `logArchiveDirPattern` vacío → los archivos deben quedar en el directorio raíz de logs sin subcarpetas

---

**Decisiones**
- Sin dependencias nuevas de npm (la función de formato de fecha se hace con `Date` nativo)
- `logArchiveDirPattern` vacío = comportamiento anterior (sin subcarpetas)
- La compresión `.gz` la hace `winston-daily-rotate-file` internamente; el `renameSync` solo mueve el archivo ya comprimido a la subcarpeta correspondiente
