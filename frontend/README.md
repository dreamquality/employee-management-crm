# Employee Management Frontend

A modern, responsive React application built with Vite, Shadcn UI, and Tailwind CSS that provides a complete user interface for the Employee Management API.

## Features

- 🔐 **Authentication**: Login and registration with JWT tokens
- 👥 **Employee Management**: 
  - View employees list with search and pagination
  - View detailed employee information
  - Create new employees (admin only)
  - Edit employee details
  - Delete employees (admin only)
- 🔔 **Notifications**: View and manage system notifications
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Built with Shadcn UI components and Tailwind CSS
- 🚀 **Fast**: Powered by Vite for lightning-fast development and build times

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Next-generation frontend tooling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Shadcn UI**: Beautiful, accessible component library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful icon library
- **date-fns**: Modern date utility library

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

   **Note for Docker Compose**: When using Docker Compose, environment variables are read from the **root** `.env` file (not `frontend/.env`). The root `.env.example` is already configured correctly with `http://localhost:3000`. No changes needed.
   
   **Note for Manual Setup**: The `frontend/.env` file is only used when running the frontend manually (without Docker). Create it with `cp .env.example .env` when running `npm run dev` directly.
   
   **Note for GitHub Codespaces**: Use `http://localhost:3000` - Codespaces automatically forwards ports, so this will work correctly.

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:

```bash
npm run build
```

The built files will be in the `dist` directory.

Preview the production build:

```bash
npm run preview
```

## Docker

### Build Docker Image

```bash
docker build -t employee-management-frontend .
```

### Run Docker Container

```bash
docker run -p 80:80 employee-management-frontend
```

The application will be available at `http://localhost`

## Default Credentials

For testing, you can use the default admin account:
- **Email**: `admin1@example.com`
- **Password**: `adminpassword`

## License

MIT License
