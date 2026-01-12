# GitHub Codespaces Configuration

This directory contains configuration for GitHub Codespaces, making it easy to develop this project in the cloud.

## Quick Start

When you open this repository in GitHub Codespaces, the dev container will automatically configure the environment.

### Starting the Application

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

2. Start all services with Docker Compose:
   ```bash
   docker compose --profile dev up
   ```

This will start:
- **Backend API** on port 3000 (automatically forwarded)
- **Frontend** on port 5173 (automatically forwarded)
- **PostgreSQL Database** (internal only)

### Port Forwarding

GitHub Codespaces automatically forwards ports 3000 and 5173:
- Port 3000: Backend API
- Port 5173: Frontend application

You can access these via the "Ports" tab in VS Code.

### Manual Setup (without Docker)

If you prefer to run services manually:

1. **Backend**:
   ```bash
   npm install
   npm run dev
   ```

2. **Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The backend will run on port 3000 and frontend on port 5173.

### Environment Variables

- The `.env.example` files are configured for localhost (port 3000 for backend)
- In Codespaces, ports are automatically forwarded, so `http://localhost:3000` works correctly
- No special configuration needed!

## Troubleshooting

### Backend connection refused

If you get `ERR_CONNECTION_REFUSED` errors:

1. Ensure the backend is running on port 3000 (check terminal output)
2. Check that `.env` file exists in the root directory with `PORT=3000`
3. Verify port 3000 is forwarded in the Ports tab
4. Check that `VITE_API_URL=http://localhost:3000` in `frontend/.env`

### CORS errors

If you see CORS errors in the browser:
1. Check `CORS_ORIGIN` in backend `.env` file
2. For development, you can set `CORS_ORIGIN=*` to allow all origins
3. Or set it to your Codespaces frontend URL

### Database connection issues

When using Docker Compose:
- Database runs inside Docker network as `db`
- Backend connects via `DB_HOST=db` (from `.env`)
- No need to expose database port to host
