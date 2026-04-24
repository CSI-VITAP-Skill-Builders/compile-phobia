# Compile Phobia Latest

Full-stack GitHub analytics project built with:
- Backend: Node.js + Express
- Frontend: React + Vite
- Data source: GitHub REST API

The app supports both:
- Repository input like `facebook/react`
- GitHub profile input like `https://github.com/Sathvik2005`

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd devsync-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Production build

```bash
cd devsync-frontend
npm run build
```

## Frontend Integration

The frontend accepts a GitHub repo path, repo URL, profile URL, or username and calls the backend through Vite proxy at `/api`.

## Backend Endpoints

### Input resolution
- `GET /resolve`

### Repository info and analytics
- `GET /repo-info`
- `GET /contributors`
- `GET /contributors-analysis`
- `GET /commits`
- `GET /commit-frequency`
- `GET /commit-quality`
- `GET /burst-activity`
- `GET /repo-health`
- `GET /issues`
- `GET /leaderboard`
- `GET /inactive-contributors`
- `GET /contribution-distribution`
- `GET /weekly-report`
- `GET /file-activity`
- `GET /pull-requests`
- `GET /issue-resolution`
- `GET /code-churn`
- `GET /consistency-score`
- `GET /peak-time`
- `GET /module-ownership`
- `GET /new-contributors`
- `GET /trend`
- `GET /issue-commit-link`
- `GET /risk-analysis`
- `GET /productivity`

### Compatibility routes
- `GET /repo`
- `GET /repo/:owner/:repo`
- `GET /contributors/:owner/:repo`
- `GET /commits/:owner/:repo`
- `GET /dashboard/:owner/:repo`
- `GET /user/:username`
- `GET /user/:username/repos`

## Environment Variables

Backend:
- `GITHUB_API` - optional GitHub API base URL
- `GITHUB_TOKEN` or `GH_TOKEN` - optional token to reduce rate limiting

Frontend:
- `VITE_API_BASE_URL` - optional backend base path, defaults to `/api`

## Notes

- The backend defaults to `facebook/react` when no repo is provided.
- Profile input returns user profile data and recent public repositories.
- Repo analytics endpoints require repo input in `owner/repo` form or a GitHub repo URL.
- The project is build-ready and can be deployed after setting the environment variables above.
