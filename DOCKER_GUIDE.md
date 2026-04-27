# Docker Deployment Configuration

## Services

### Backend Service
- **Image**: Node 21 Alpine
- **Port**: 5000
- **Health Check**: /rate-limit endpoint
- **Environment**: GITHUB_TOKEN, NODE_ENV=production
- **Build**: Multi-stage optimized
- **Dependencies**: Only production deps included

### Frontend Service
- **Image**: Node 21 Alpine (builder) → serve runtime
- **Port**: 3000
- **Health Check**: / endpoint
- **Build**: npm run build
- **Runtime**: serve package with SPA configuration

## Docker Compose
- **Network**: compile-phobia-net (bridge)
- **Services**: 2 (backend + frontend)
- **Health Checks**: 30s interval, 10s timeout
- **Environment Variables**: Passed from .env file
- **Startup Order**: Dependencies managed by compose

## .dockerignore
Optimized for minimal layer size:
- node_modules
- npm-debug.log
- .git
- .env
- .env.local

## Build & Run
```bash
docker-compose up --build
```

## Environment Variables Required
- GITHUB_TOKEN: GitHub API token (5000 requests/hour)
- VITE_API_BASE_URL: Backend API URL (default: http://localhost:5000)
- NODE_ENV: production or development
