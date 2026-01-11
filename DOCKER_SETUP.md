# Docker Compose CI Configuration

## Overview

This document explains the refactored docker-compose.yml configuration for CI-ready, fully isolated container orchestration.

## Key Changes

### 1. Docker Networking
- **Replaced localhost references** with service names:
  - App is accessible as `http://app:3000`
  - Frontend is accessible as `http://frontend:5173`
  - Updated `CORS_ORIGIN` to use `http://frontend:5173`
  - Updated `VITE_API_URL` to use `http://app:3000`

### 2. Environment Variables
- Created `.env.example` and `.env.test.example` files
- All secrets and configuration moved to env files
- Used `env_file` in docker-compose instead of hardcoded values
- Maintained NODE_ENV separation for dev and test

### 3. Health Checks & Startup Order
- Added `/health` endpoint to app.js (returns `{"status": "ok"}`)
- Added healthcheck to app service using wget
- Updated depends_on with `condition: service_healthy`
- Prevents race conditions in CI

### 4. CI Isolation
- **Removed DB port mapping** (5432:5432) - internal communication only
- Containers communicate exclusively via Docker network
- Tests do not depend on host machine services

### 5. Profiles
Three profiles configured:
- **dev**: app, frontend, db (local development)
- **ci**: app, db, test (continuous integration)
- **e2e**: app, frontend, db, playwright (end-to-end tests)

### 6. Test Execution
- Test container runs once and exits with proper exit code
- Created `entrypoint-test.sh` for test database setup
- Properly handles database creation and migrations

### 7. Migrations
- Created `entrypoint.sh` for app service
- Runs database migrations before app start
- Cleaner separation of concerns

## Setup Instructions

### First Time Setup

1. **Copy environment files:**
```bash
cp .env.example .env
cp .env.test.example .env.test
cp .env.e2e.example .env.e2e  # For E2E tests
```

2. **Update values in .env, .env.test, and .env.e2e** (especially secrets for production):
   - JWT_SECRET
   - SECRET_WORD
   - Database credentials

**Important:** 
- `.env` is for local development (browser runs on host, uses localhost URLs)
- `.env.test` is for CI tests (no frontend, API tests only)
- `.env.e2e` is for E2E tests (playwright runs in Docker, uses service names)

### Running Different Profiles

#### Development (app + frontend + db)
```bash
docker compose --profile dev up
```

#### CI Tests (app + db + test)
```bash
docker compose --profile ci up --abort-on-container-exit --exit-code-from test
```

#### E2E Tests (app + frontend + db + playwright)
```bash
docker compose --profile e2e up --abort-on-container-exit --exit-code-from playwright
```

#### All services
```bash
docker compose --profile dev --profile ci --profile e2e up
```

## Service Details

### App Service
- **Port**: 3000
- **Healthcheck**: GET /health
- **Entrypoint**: Runs migrations before starting
- **Profiles**: dev, ci, e2e

### Frontend Service
- **Port**: 5173
- **Depends on**: app (with healthcheck)
- **Profiles**: dev, e2e

### DB Service
- **Port**: Internal only (no host mapping)
- **Healthcheck**: pg_isready
- **Profiles**: dev, ci, e2e

### Test Service
- **Entrypoint**: Sets up test database and runs migrations
- **Command**: npm run test
- **Exits**: Automatically after tests complete
- **Profiles**: ci

### Playwright Service
- **Command**: npm run test:e2e (requires configuration)
- **Depends on**: app (healthy), frontend (started)
- **Profiles**: e2e
- **Note**: Requires adding `"test:e2e": "playwright test"` to frontend/package.json

**To enable E2E tests:**
1. Install Playwright: `cd frontend && npm install -D @playwright/test`
2. Add script to frontend/package.json: `"test:e2e": "playwright test"`
3. Update command in docker-compose.yml: `command: npm run test:e2e`

## GitHub Actions Integration

Example workflow for CI:

```yaml
name: CI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create environment files
        run: |
          cp .env.test.example .env.test
          cp .env.example .env
      
      - name: Run tests
        run: |
          docker compose --profile ci up --abort-on-container-exit --exit-code-from test
      
      - name: Clean up
        if: always()
        run: docker compose --profile ci down -v
```

## Network Communication

All inter-container communication uses service names:
- Frontend → App: `http://app:3000`
- App → DB: `db:5432`
- Tests → App: `http://app:3000`
- Tests → DB: `db:5432`

No services bind to host network except through explicit port mappings.

## Troubleshooting

### Test container exits immediately
Ensure `.env.test` file exists and contains correct values.

### App healthcheck fails
- Check that app started successfully: `docker compose logs app`
- Verify /health endpoint is accessible: `docker compose exec app wget -O- http://localhost:3000/health`

### Database connection errors
- Ensure DB service is healthy: `docker compose ps`
- Check service names are used (not localhost)
- Verify env files contain correct credentials

### Frontend can't reach backend
- Ensure VITE_API_URL=http://app:3000 in .env
- Check app service is healthy before frontend starts

## Benefits

1. **CI-Ready**: No host dependencies, fully isolated
2. **Profile-based**: Run only what you need
3. **Healthchecks**: Proper startup ordering
4. **Security**: Secrets in env files, not in docker-compose
5. **Maintainable**: Clear separation with entrypoint scripts
6. **Network Isolation**: Services communicate via Docker network only
