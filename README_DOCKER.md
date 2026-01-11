# Docker-Compose Refactoring - Quick Reference

## 🎯 What Was Done

Refactored docker-compose.yml to be **CI-ready** and **fully isolated** with minimal changes.

## 🚀 Quick Start

```bash
# 1. Copy environment files
cp .env.example .env
cp .env.test.example .env.test
cp .env.e2e.example .env.e2e

# 2. Run development environment
docker compose --profile dev up

# 3. Access services
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - API Docs: http://localhost:3000/api-docs
```

## 📋 Available Profiles

### Development (`dev`)
```bash
docker compose --profile dev up
```
**Services:** app, frontend, db  
**Use for:** Local development with hot reload

### CI Testing (`ci`)
```bash
docker compose --profile ci up --abort-on-container-exit --exit-code-from test
```
**Services:** app, db, test  
**Use for:** Automated testing in CI/CD pipelines

### E2E Testing (`e2e`)
```bash
docker compose --profile e2e up --abort-on-container-exit --exit-code-from playwright
```
**Services:** app, frontend, db, playwright  
**Use for:** End-to-end testing (requires playwright setup)

## 📚 Documentation

| File | Description |
|------|-------------|
| **DOCKER_SETUP.md** | Complete setup guide and usage instructions |
| **DOCKER_CHANGES.md** | Detailed explanation of each change |
| **DOCKER_SUMMARY.md** | Before/after comparison and examples |
| **README_DOCKER.md** | This quick reference |

## ✅ Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Secrets** | Hardcoded | In .env files |
| **DB Port** | Exposed (5432) | Internal only |
| **Health Check** | None | /health endpoint |
| **Migrations** | Inline commands | Entrypoint scripts |
| **Profiles** | None | dev, ci, e2e |
| **Networking** | Mixed | Environment-specific |

## 🔧 Common Tasks

### Run Tests Locally
```bash
# API tests
docker compose --profile ci up --abort-on-container-exit --exit-code-from test

# Clean up
docker compose --profile ci down -v
```

### Access Database
```bash
# DB is not exposed to host, use exec
docker compose exec db psql -U postgres -d my_database
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
```

### Rebuild After Changes
```bash
docker compose build --no-cache
docker compose --profile dev up
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "no configuration file provided" | Run: `cp .env.example .env` |
| Services don't start | Add profile: `--profile dev` |
| Can't connect to DB | Use `docker compose exec db psql` |
| Health check fails | Check: `docker compose logs app` |
| CORS errors | Check `CORS_ORIGIN` in .env |

## 🔐 Security Notes

- **Never commit** `.env`, `.env.test`, or `.env.e2e` files
- Change `JWT_SECRET` and `SECRET_WORD` for production
- Database is not exposed to host network
- All secrets are in environment files

## 📦 What's Included

### New Files
- ✅ `entrypoint.sh` - App migration script
- ✅ `entrypoint-test.sh` - Test DB setup
- ✅ `.env.example` - Dev environment template
- ✅ `.env.test.example` - Test environment template
- ✅ `.env.e2e.example` - E2E environment template
- ✅ Documentation files

### Modified Files
- ✅ `docker-compose.yml` - Profiles, env_file, health checks
- ✅ `Dockerfile` - Entrypoint support
- ✅ `app.js` - /health endpoint
- ✅ `.gitignore` - Added .env.e2e

## 🎓 Learn More

- Read **DOCKER_SETUP.md** for detailed setup instructions
- Read **DOCKER_CHANGES.md** to understand each change
- Read **DOCKER_SUMMARY.md** for complete before/after comparison

## 💡 Tips

- Always use profiles: `--profile dev`, `--profile ci`, or `--profile e2e`
- Environment files are required - copy from examples first
- DB is internal only - use `docker compose exec` to access
- Health checks ensure proper startup order
- Tests exit automatically with proper exit codes

---

**Need help?** Check the troubleshooting section or read the detailed docs.
