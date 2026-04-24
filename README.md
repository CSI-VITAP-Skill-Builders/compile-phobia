# Compile Phobia Latest

Integrated full-stack project with:
- Backend: Node.js + Express API
- Frontend: React + Vite dashboard
- Data source: GitHub REST API

## Folder Structure

- backend
- devsync-frontend

## What Works

- Fetch repository details for any public repo using owner/repo format
- Fetch GitHub profile details from a profile URL or username
- Fetch top contributors and recent commits
- Frontend and backend integrated through Vite proxy
- Backend routes support both default and dynamic owner/repo usage
- Backend can resolve repo and profile inputs through one endpoint

## Backend API

Base URL in local development: http://localhost:5000

Routes:
- GET /
- GET /health
- GET /resolve
- GET /repo
- GET /repo/:owner/:repo
- GET /contributors
- GET /contributors/:owner/:repo
- GET /commits
- GET /commits/:owner/:repo
- GET /dashboard/:owner/:repo

Notes:
- Default routes use facebook/react when owner/repo is not provided.
- Dynamic routes return 404 for missing repos and 429 for GitHub rate limit responses.
- /resolve accepts a full GitHub URL, a repo path, a profile URL, or a username.

## Run Locally

### 1) Start backend

- cd backend
- npm install
- npm run dev

Backend runs on http://localhost:5000

### 2) Start frontend

- cd devsync-frontend
- npm install
- npm run dev

Frontend runs on http://localhost:5173

## Integration Details

Frontend uses /api prefixed routes. Vite proxies /api to backend at http://localhost:5000.

Examples used by frontend:
- /api/resolve?input=https://github.com/Sathvik2005
- /api/repo/facebook/react
- /api/contributors/facebook/react
- /api/commits/facebook/react

## Optional Environment Variables

Backend:
- GITHUB_API (default: https://api.github.com)

Frontend:
- VITE_API_BASE_URL (optional override, default: /api)

## Example Input

In the frontend search box, enter:
- facebook/react
- microsoft/TypeScript
- vercel/next.js
- https://github.com/Sathvik2005
- Sathvik2005
