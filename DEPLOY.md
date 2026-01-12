# Deployment Guide for Render.com

This guide provides comprehensive instructions for deploying the Employee Management System to Render.com using Docker.

## Deployment Options

### Option 1: Blueprint Deployment (Recommended - Easiest)

The easiest way to deploy is using Render's Blueprint feature with the included `render.yaml` file.

#### Steps:

1. **Fork or Push to GitHub**
   - Ensure your code is in a GitHub repository

2. **Deploy via Render Dashboard**
   - Log in to [Render.com](https://render.com)
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository
   - Select the repository containing this code
   - Render will automatically detect the `render.yaml` file
   - Review the services that will be created:
     - PostgreSQL Database (employee-management-db)
     - Backend API (employee-management-api)
     - Frontend Application (employee-management-frontend)

3. **Configure Secrets** (if needed)
   - The Blueprint will auto-generate `JWT_SECRET` and `SECRET_WORD`
   - You can customize these in the Render dashboard after deployment
   - Update `CORS_ORIGIN` if you want to restrict API access

4. **Deploy**
   - Click **Apply** to create all services
   - Render will:
     - Create the PostgreSQL database
     - Build and deploy the backend API
     - Build and deploy the frontend application
     - Link all services together automatically
   
   **Security Notes**:
   - The blueprint sets `CORS_ORIGIN=*` by default to allow initial deployment. For better security in production:
     - Go to backend service settings after deployment
     - Change `CORS_ORIGIN` to your specific frontend URL (e.g., `https://employee-management-frontend.onrender.com`)
     - Save and redeploy
   - Seeders are NOT run automatically in production for security. The default admin user will be created automatically by the application on first startup.
   - **IMPORTANT**: Change the default admin password (`admin@example.com / adminpassword`) immediately after first login!

5. **Wait for Deployment**
   - Initial deployment takes 5-10 minutes
   - Monitor progress in the Render dashboard
   - All services must show "Live" status

6. **Access Your Application**
   - Frontend URL: `https://employee-management-frontend.onrender.com` (or your custom name)
   - Backend API: `https://employee-management-api.onrender.com`
   - Default admin credentials:
     - Email: `admin@example.com`
     - Password: `adminpassword`

### Option 2: Manual Deployment

If you prefer more control, deploy each service manually:

#### Step 1: Deploy PostgreSQL Database

1. From Render dashboard, click **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `employee-management-db`
   - **Database**: `employee_db`
   - **Region**: Choose closest to your users
   - **Plan**: Free or Starter
3. Click **Create Database**
4. Copy the **Internal Database URL** (starts with `postgres://`)

#### Step 2: Deploy Backend API

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `employee-management-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Build Context**: `.`
   - **Health Check Path**: `/health`
   - **Plan**: Free or Starter

4. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=<internal-database-url-from-step-1>
   JWT_SECRET=<generate-secure-random-string>
   SECRET_WORD=<generate-secure-random-string>
   PORT=3000
   CORS_ORIGIN=*
   ```

   **Generate secrets**:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For SECRET_WORD
   ```

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)
7. Copy your backend URL (e.g., `https://employee-management-api.onrender.com`)

#### Step 3: Deploy Frontend Application

1. Click **New +** → **Web Service**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `employee-management-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Docker Build Context**: `./frontend`
   - **Plan**: Free or Starter

4. **Environment Variables**:
   ```
   VITE_API_URL=<backend-url-from-step-2>
   ```
   
   **Important**: Do not include trailing slash in VITE_API_URL
   Example: `https://employee-management-api.onrender.com`

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)

#### Step 4: Update CORS (if needed)

If you want to restrict API access to only your frontend:

1. Go to your backend service settings
2. Update environment variable:
   ```
   CORS_ORIGIN=https://employee-management-frontend.onrender.com
   ```
3. Save and redeploy

## Post-Deployment

### 1. Test the Application

- Visit your frontend URL
- Log in with default credentials:
  - Email: `admin@example.com`
  - Password: `adminpassword`
- Test key features:
  - View employees list
  - Create a new employee
  - Update employee information
  - Manage projects
  - Check notifications

### 2. Change Default Admin Password

**Important**: Change the default admin password immediately!

1. Log in as admin
2. Go to user settings/profile
3. Update the password
4. Or create a new admin user and delete the default one

### 3. Set Up Auto-Deploy (Optional)

Enable automatic deployments for continuous delivery:

1. Go to each service settings in Render
2. Enable **Auto-Deploy** from your main branch
3. Every push to the branch will trigger a new deployment

### 4. Monitor Your Services

- Check logs in Render dashboard
- Set up monitoring/alerting (Render provides basic monitoring)
- Monitor database size (Free tier has 1GB limit)

## Important Notes

### Free Tier Limitations

- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Cold Start**: First request after inactivity takes 30-50 seconds
- **Database**: Free PostgreSQL is not backed up automatically
- **Bandwidth**: Limited monthly bandwidth

### Security Best Practices

1. **Never commit `.env` files** - Use Render's environment variables
2. **Use strong secrets** - Generate random JWT_SECRET and SECRET_WORD
3. **Change default credentials** - Update admin password immediately
4. **Restrict CORS** - Set specific origin instead of `*` in production
5. **Enable HTTPS** - Render provides free SSL automatically

### Database Backups

- Free tier databases are not backed up
- Consider upgrading to paid plan for automatic backups
- Or set up manual backup strategy using `pg_dump`

### Custom Domains

You can add custom domains to your services:

1. Go to service settings
2. Click **Custom Domains**
3. Add your domain
4. Configure DNS records as instructed
5. Render provides free SSL for custom domains

## Troubleshooting

### Database Connection Issues

**Symptoms**: Backend fails to start, connection errors in logs

**Solutions**:
1. Verify `DATABASE_URL` is set correctly (use Internal URL, not External)
2. Check database is in "Available" status
3. Ensure backend and database are in the same region
4. Check database logs for connection attempts

### Frontend Can't Connect to Backend

**Symptoms**: API requests fail, CORS errors in browser console

**Solutions**:
1. Verify `VITE_API_URL` is set correctly (no trailing slash)
2. Check backend is running (visit `/health` endpoint)
3. Update `CORS_ORIGIN` in backend to include frontend URL
4. Clear browser cache and rebuild frontend

### Build Failures

**Symptoms**: Deployment fails during build

**Solutions**:
1. Check build logs in Render dashboard
2. Verify all dependencies are in `package.json`
3. Ensure Dockerfile path is correct
4. Check Docker build context is set correctly
5. Try building locally: `docker build -t test .`

### Migration Failures

**Symptoms**: Backend starts but database errors occur

**Solutions**:
1. Check entrypoint.sh is executable
2. Verify migrations ran successfully in logs
3. Check database permissions
4. Manual migration: Connect to database and run migrations

### Service Won't Start

**Symptoms**: Service shows "Build succeeded" but never reaches "Live"

**Solutions**:
1. Check application logs for errors
2. Verify health check endpoint (`/health`) is responding
3. Check PORT environment variable is set to 3000
4. Verify application binds to `0.0.0.0` not `localhost`

### Performance Issues

**Symptoms**: Slow response times, timeouts

**Solutions**:
1. Upgrade from free tier (removes spin-down)
2. Use same region for all services
3. Optimize database queries
4. Enable connection pooling
5. Add caching layer (Redis)

## Environment Variables Reference

### Backend API

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode | `production` | Yes |
| DATABASE_URL | PostgreSQL connection string | `postgres://user:pass@host/db` | Yes |
| JWT_SECRET | Secret for JWT tokens | `random-32-char-string` | Yes |
| SECRET_WORD | Secret for admin registration | `random-32-char-string` | Yes |
| PORT | Application port | `3000` | Yes |
| CORS_ORIGIN | Allowed CORS origins | `*` or `https://your-frontend.com` | No |

### Frontend Application

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| VITE_API_URL | Backend API URL | `https://your-api.onrender.com` | Yes |

## Scaling Considerations

### When to Upgrade from Free Tier

Consider upgrading when:
- You need always-on services (no spin-down)
- You require faster performance
- You need database backups
- You exceed bandwidth limits
- You need multiple workers

### Recommended Upgrades

1. **Backend**: Starter plan ($7/month) - Always on, better performance
2. **Database**: Starter plan ($7/month) - Backups, better performance
3. **Frontend**: Can stay on free tier (static site)

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

## Support

For issues specific to this application, create an issue in the GitHub repository.
For Render platform issues, contact [Render Support](https://render.com/support).
