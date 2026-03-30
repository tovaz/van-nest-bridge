# van-nest-bridge

A local log ingestion system built with Node.js, NestJS, and TypeScript. Uses `winston` and `winston-daily-rotate-file` to provide robust, automatic daily log rotation.

## Features

- **Ingestion Endpoint**: `POST /log` endpoint for structured log entries.
- **Admin Configuration**: `GET /admin/config` to safely view log configuration.
- **Localhost Bound**: The server binds exclusively to `127.0.0.1`.
- **Pre-Flight Guards**: `LocalOnlyGuard` drops any request not originating from `127.0.0.1` or `::1`.
- **Basic Auth Security**: Admin routes are protected using Basic Authentication.
- **Validation First**: Uses `class-validator` to ensure data integrity at the edge.
- **Auto-Rotation**: Log files are rotated daily and kept per retention policies.

## Prerequisites

- Node.js (>= 18)
- npm

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy the example environment file and customize it.
   ```bash
   cp .env.example .env
   ```
   *Make sure you change `ADMIN_PASS` in your `.env` file.*

3. **Start the server:**
   ```bash
   # Development watch mode
   npm run start:dev

   # Production build & run
   npm run build
   npm run start:prod
   ```

## Usage Examples

### 1. Ingesting Logs

Send a structured JSON object to the server. You can omit context and meta if not needed.

```bash
curl -X POST http://127.0.0.1:3000/log \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "User login successful",
    "context": "AuthService",
    "meta": { "userId": 42, "ip": "192.168.1.10" }
  }'
```

The log will appear in `./logs/app-[YYYY-MM-DD].log`.

### 2. Admin Interface (Config check)

Uses Basic Auth. Default user/pass from `.env.example` is `admin:changeme`.

```bash
curl -u admin:changeme http://127.0.0.1:3000/admin/config
```

Valid response:
```json
{
  "port": 3000,
  "host": "127.0.0.1",
  "logDir": "./logs",
  "logFilePattern": "app-%DATE%.log",
  "logDatePattern": "YYYY-MM-DD",
  "logLevel": "info",
  "logMaxSize": "20m",
  "logMaxFiles": "30d"
}
```

Attempting this without `-u` returns a `401 Unauthorized`.

## Architecture & Scalability

The application uses standard NestJS modular architecture.
- **Infrastructure:** `LoggerModule` wraps Winston and abstracts its implementation. It is a `@Global()` module.
- **Feature Modules:** `LogsModule` and `AdminModule` encapsulate routes, validations (DTOs), and services.
- **Common:** Reusable interceptors, decorators, and guards (`LocalOnlyGuard`, `BasicAuthGuard`).

**Future Scaling:**
1. **Adding Middlewares/Guards to Logger:** Just append to `@UseGuards()` in `LogController`.
2. **Changing Authentication:** Replace `BasicAuthGuard` checks with DB lookups or JWT verification.
3. **Log Shipping:** Add a new transport in `infrastructure/logger/winston.config.ts` (e.g., Elasticsearch, Datadog) and Winston will broadcast there too.
