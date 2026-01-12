# Render Deployment Guide

This guide provides quick instructions for deploying the Employee Management CRM to Render using Docker.

## Quick Deploy (Recommended)

### Option 1: Using render.yaml Blueprint (Easiest)

1. **Prerequisites**:
   - Render account
   - Code pushed to GitHub

2. **Deploy Steps**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository
   - Select repository with `render.yaml`
   - Click **Apply**
   - Wait for all services to deploy (5-10 minutes)

3. **Access Application**:
   - Find frontend URL in dashboard
   - Login with: `admin1@example.com` / `adminpassword`
   - **Change password immediately!**

### Option 2: Manual Docker Deployment

#### Step 1: Create PostgreSQL Database
- **New +** → **PostgreSQL**
- Name: `employee-management-db`
- Region: Choose closest
- Plan: Free (or paid for backups)
- Copy **Internal Database URL**

#### Step 2: Deploy Backend API
- **New +** → **Web Service**
- Runtime: **Docker**
- Dockerfile Path: `./Dockerfile`
- Docker Context: `.`

**Environment Variables**:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=<internal-db-url-from-step-1>
JWT_SECRET=<generate-random-string>
SECRET_WORD=<generate-random-string>
CORS_ORIGIN=<will-set-after-frontend>
```

Generate secrets:
```bash
openssl rand -base64 32
```

Copy backend URL after deployment.

#### Step 3: Deploy Frontend
- **New +** → **Web Service**
- Runtime: **Docker**
- Root Directory: `frontend`
- Dockerfile Path: `./frontend/Dockerfile`
- Docker Context: `./frontend`

**Environment Variables**:
```
VITE_API_URL=<backend-url-from-step-2>
```

Copy frontend URL after deployment.

#### Step 4: Update CORS
- Go to backend service
- Update `CORS_ORIGIN` with frontend URL
- Manual redeploy backend

## What Gets Deployed

### Services Created
1. **PostgreSQL Database** (Free tier)
   - Database name: `employee_db`
   - Auto-configured connection

2. **Backend API** (Docker container)
   - Node.js 20 application
   - Auto-runs migrations on startup
   - Health check at `/health`
   - Port: 3000

3. **Frontend** (Docker container with Nginx)
   - React SPA with Vite
   - Served by Nginx
   - Port: 80

### Automatic Features
- ✅ Database migrations run automatically
- ✅ Health checks configured
- ✅ Auto-deploy on git push (if enabled)
- ✅ HTTPS/SSL certificates (automatic)
- ✅ Internal service networking

## Configuration Files

### render.yaml
Defines infrastructure as code:
- PostgreSQL database
- Backend web service (Docker)
- Frontend web service (Docker)
- Environment variables
- Auto-generated secrets

### Dockerfiles
- `./Dockerfile` - Backend (Node.js + Express)
- `./frontend/Dockerfile` - Frontend (Vite + Nginx)

### Entrypoint Script
- `./entrypoint.sh` - Runs migrations before app starts

## Post-Deployment Checklist

- [ ] Application loads in browser
- [ ] Can log in with default credentials
- [ ] Change admin password
- [ ] Test creating/editing employees
- [ ] Verify backend logs for errors
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Upgrade to paid tier for database backups (recommended)

## Environment Variables Reference

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL URL | Auto-set by Render |
| `JWT_SECRET` | JWT signing key | Random 32+ chars |
| `SECRET_WORD` | Admin registration | Random string |
| `CORS_ORIGIN` | Frontend URL | `https://your-app.onrender.com` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-api.onrender.com` |

## Troubleshooting

### Build Fails
- Check Dockerfile paths are correct
- Verify `package.json` exists
- Review build logs in Render dashboard

### Database Connection Errors
- Verify `DATABASE_URL` is set (auto-set by Render)
- Check database service is running
- Ensure using **Internal** database URL

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct (no trailing slash)
- Check `CORS_ORIGIN` matches frontend URL
- Confirm backend is running and healthy

### Migration Errors
- Check backend logs for specific errors
- Verify database is accessible
- Ensure `entrypoint.sh` is executable

### Service Slow to Respond (Free Tier)
- Free services spin down after 15 min inactivity
- First request takes 30-50 seconds
- Consider paid tier for always-on

## Updating Your Deployment

### Automatic (if auto-deploy enabled)
```bash
git add .
git commit -m "Update application"
git push origin main
```
Render automatically rebuilds and redeploys.

### Manual
1. Go to service in Render dashboard
2. Click **Manual Deploy**
3. Select **Deploy latest commit**

### Rolling Back
1. Go to service in dashboard
2. Click **Deploy** tab
3. Select previous deployment
4. Click **Redeploy**

## Cost Considerations

### Free Tier
- **Database**: 90 days free, no backups, 1GB storage
- **Web Services**: Unlimited, spins down after 15 min
- **Bandwidth**: 100 GB/month

### Upgrade Recommendations
- **Database**: $7/month for Starter (backups + more storage)
- **Web Services**: $7/month for Starter (always-on + more resources)

## Security Best Practices

1. ✅ Change default admin password immediately
2. ✅ Use strong, random `JWT_SECRET` and `SECRET_WORD`
3. ✅ Never commit `.env` files to git
4. ✅ Enable Render's web application firewall (paid plans)
5. ✅ Regularly update dependencies
6. ✅ Monitor logs for suspicious activity
7. ✅ Set up database backups (paid tier)

## Support

- **Render Docs**: https://render.com/docs
- **Render Support**: dashboard → Help
- **Project Issues**: GitHub repository issues
- **Render Community**: community.render.com

## Additional Resources

- [Render Blueprint Docs](https://render.com/docs/infrastructure-as-code)
- [Docker on Render](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
