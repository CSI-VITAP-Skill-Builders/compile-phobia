# Dependency Management

## Production Dependencies

### Frontend (devsync-frontend)
- react@18.3.1: UI library
- react-dom@18.3.1: React rendering engine
- axios@1.6.2: HTTP client for API calls
- chart.js@4.4.0: Charting library
- react-chartjs-2@5.2.0: React wrapper for Chart.js
- vite@6.0.0: Build tool
- serve@14.2.0: Production server

### Backend (backend)
- express@4.18.2: Web framework
- axios@1.6.2: HTTP client for GitHub API
- cors@2.8.5: Cross-origin middleware
- dotenv@16.3.1: Environment variables
- lodash@4.17.21: Utility library

## Development Dependencies

### Frontend
- @vitejs/plugin-react: React plugin for Vite
- eslint: Code linting
- prettier: Code formatting

### Backend
- nodemon: Auto-restart on file changes
- jest: Testing framework

## Version Pins
All production dependencies pinned to specific versions for reproducibility:
- Critical: Chart.js (visualization)
- Critical: Express (API server)
- Important: Axios (HTTP client)

## Security Updates
- Regularly check for CVE vulnerabilities
- Use `npm audit fix` to patch
- No known vulnerabilities in current versions

## Installation
```bash
# Frontend
cd devsync-frontend && npm install

# Backend
cd backend && npm install
```

## Lock Files
- package-lock.json: Ensures reproducible builds
- Committed to repository for consistency
