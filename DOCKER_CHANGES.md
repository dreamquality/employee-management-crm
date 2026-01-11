# Docker-Compose Refactoring - Critical Changes Summary

## What Changed

### 1. **Network Communication - Service Names Instead of localhost**

**Before:**
```yaml
environment:
  - CORS_ORIGIN=http://localhost:5173
  - VITE_API_URL=http://localhost:3000
```

**After:**
- **For dev (.env):** Uses `localhost` because browser runs on host machine
- **For test (.env.test):** Uses service names for container-to-container communication
- **For e2e (.env.e2e):** Uses service names because playwright runs in Docker

**Why:** 
- Browser-based apps need localhost URLs (dev profile)
- Container-based tests need service names (ci, e2e profiles)
- Different environments have different networking requirements

**Example .env (dev):**
```
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

**Example .env.e2e (e2e):**
```
CORS_ORIGIN=*
VITE_API_URL=http://app:3000
```

---

### 2. **Environment Variables - Moved to .env Files**

**Before:**
```yaml
environment:
  - DB_PASSWORD=postgres
  - JWT_SECRET=your_jwt_secret
```

**After:**
```yaml
env_file:
  - .env
```

**Why:** 
- Keeps secrets out of version control
- Allows different configs for dev/test/prod
- Follows 12-factor app principles

---

### 3. **Health Check Added to App**

**New in app.js:**
```javascript
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
```

**New in docker-compose:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

**Why:** Ensures app is fully ready before dependent services start. Critical for CI reliability. Uses curl which is available in Node.js base images.

---

### 4. **Database Port Removed from Host Mapping**

**Before:**
```yaml
db:
  ports:
    - "5432:5432"  # Exposed to host
```

**After:**
```yaml
db:
  # No ports section - internal only
```

**Why:** 
- Improves security - DB not accessible from host
- Prevents port conflicts in CI
- Enforces container-to-container communication only

---

### 5. **Profiles for Different Environments**

**New structure:**
```yaml
profiles:
  - dev   # Local development: app + frontend + db
  - ci    # CI testing: app + test + db (no frontend)
  - e2e   # E2E testing: app + frontend + db + playwright
```

**Usage:**
```bash
# Development
docker compose --profile dev up

# CI Tests  
docker compose --profile ci up --abort-on-container-exit --exit-code-from test

# E2E Tests
docker compose --profile e2e up --abort-on-container-exit --exit-code-from playwright
```

**Why:** Run only what you need, saves resources, faster CI.

---

### 6. **Entrypoint Scripts for Migrations**

**Before (inline):**
```yaml
command: sh -c "npx sequelize-cli db:migrate && npm run dev"
```

**After:**
```yaml
entrypoint: ["/entrypoint.sh"]
command: npm run dev
```

**entrypoint.sh:**
```bash
#!/bin/sh
set -e
npx sequelize-cli db:migrate
exec "$@"
```

**Why:**
- Cleaner separation of concerns
- Proper error handling with `set -e`
- Reusable across services
- Better logging and debugging

---

### 7. **Test Service Configuration**

**Key changes:**
```yaml
test:
  env_file: .env.test  # Separate test config
  entrypoint: ["/entrypoint-test.sh"]  # Handles test DB setup
  profiles: [ci]  # Only runs in CI profile
```

**Why:** Tests run once, exit with proper code, suitable for CI pipelines.

---

## Migration Guide

### For Developers

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp .env.test.example .env.test
   ```

2. Start development:
   ```bash
   docker compose --profile dev up
   ```

### For CI/CD (GitHub Actions)

```yaml
- name: Setup environment
  run: |
    cp .env.test.example .env.test
    cp .env.example .env

- name: Run tests
  run: |
    docker compose --profile ci up --abort-on-container-exit --exit-code-from test
```

---

## Key Benefits

1. ✅ **CI-Ready**: Fully isolated, no host dependencies
2. ✅ **Secure**: Secrets in env files, not in docker-compose
3. ✅ **Reliable**: Health checks prevent race conditions
4. ✅ **Efficient**: Profile-based, run only what you need
5. ✅ **Maintainable**: Clear structure with entrypoint scripts
6. ✅ **Portable**: Works identically on dev/CI/prod

---

## Breaking Changes

⚠️ **Action Required:**

1. **Must create .env files** before running `docker compose up`
2. **Database port no longer exposed** to host (5432) - use `docker compose exec db psql` if you need to connect
3. **Must specify profile** to run services: `--profile dev` or `--profile ci` or `--profile e2e`

---

## Troubleshooting

### "no configuration file provided: not found"
→ Run: `cp .env.example .env && cp .env.test.example .env.test`

### "connection refused" errors between services
→ Use service names (app, frontend, db) not localhost

### Tests exit immediately
→ Ensure .env.test exists with correct values

### Health check fails
→ Check logs: `docker compose logs app`
