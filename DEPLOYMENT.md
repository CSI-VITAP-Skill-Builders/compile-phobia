# 🚀 Compile Phobia - Deployment Guide

## Project Overview

**Compile Phobia** is a comprehensive GitHub Intelligence Dashboard that analyzes repositories and user profiles with advanced analytics and insights.

### 🎯 5 Amazing Features

1. **Repository Comparison Tool** - Side-by-side analytics comparison between 2 repositories
2. **Code Quality Scorecard** - AI-powered quality score with comprehensive metrics
3. **Contributor Timeline** - Visual bar chart of top contributors and their activity
4. **Language Distribution** - Pie chart showing primary programming language
5. **Smart Recommendations** - AI-powered insights and actionable recommendations

## Tech Stack

### Backend
- **Node.js** v21 (LTS)
- **Express.js** 4.18 - REST API framework
- **Axios** - GitHub API client
- **CORS** - Cross-origin support
- **dotenv** - Environment variable management

### Frontend
- **React** 18.3 - UI framework
- **Vite** 6.0 - Build tool (super fast)
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Deployment Environments
- **Docker** - Container orchestration
- **Docker Compose** - Local development
- **Render/Railway/Fly.io** - Production deployment (choose one)

## Prerequisites

Before deployment, ensure you have:
- GitHub Personal Access Token (get from https://github.com/settings/tokens)
- Docker & Docker Compose installed (for containerized deployment)
- Node.js v21+ (for non-containerized deployment)
- Git configured

## 📦 Local Development Setup

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/CSI-VITAP-Skill-Builders/compile-phobia.git
cd compile-phobia

# Create .env file with your GitHub token
echo "GITHUB_TOKEN=ghp_your_token_here" > .env

# Start services with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/rate-limit
```

### Option 2: Manual Setup (Development)

```bash
# Backend setup
cd backend
npm install
echo "GITHUB_TOKEN=ghp_your_token_here" > .env
npm run dev

# In another terminal - Frontend setup
cd devsync-frontend
npm install
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

## 🌐 Production Deployment

### Option 1: Render.com (Easiest)

#### Backend Deployment
1. Push code to GitHub
2. Go to https://render.com/dashboard
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: `compile-phobia-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     ```
     GITHUB_TOKEN=ghp_your_token_here
     NODE_ENV=production
     ```
6. Click "Create Web Service"

#### Frontend Deployment
1. Build the frontend:
   ```bash
   cd devsync-frontend
   npm run build
   ```
2. Go to https://render.com/dashboard
3. Click "New" → "Static Site"
4. Connect your GitHub repo
5. Configure:
   - **Name**: `compile-phobia-frontend`
   - **Build Command**: `cd devsync-frontend && npm run build`
   - **Publish Directory**: `devsync-frontend/dist`
   - **Environment Variables**:
     ```
     VITE_API_BASE_URL=https://compile-phobia-backend.onrender.com/api
     ```
6. Click "Create Static Site"

### Option 2: Railway.app

1. Go to https://railway.app
2. Click "New Project"
3. Connect GitHub repo
4. Add services for backend and frontend
5. Configure environment variables
6. Deploy

### Option 3: Fly.io

```bash
# Install flyctl
brew install flyctl  # macOS
# or download from https://fly.io/docs/getting-started/installing-flyctl/

# Login to Fly.io
flyctl auth login

# Create new app
flyctl apps create compile-phobia-backend

# Set secrets
flyctl secrets set GITHUB_TOKEN=ghp_your_token_here

# Deploy
flyctl deploy
```

## 🐳 Docker Deployment

### Build Docker Images

```bash
# Backend
docker build -t compile-phobia-backend:latest ./backend

# Frontend
docker build -t compile-phobia-frontend:latest ./devsync-frontend
```

### Run with Docker Compose

```bash
# Create .env file
echo "GITHUB_TOKEN=ghp_your_token_here" > .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Push to Docker Registry

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag compile-phobia-backend:latest yourusername/compile-phobia-backend:latest
docker tag compile-phobia-frontend:latest yourusername/compile-phobia-frontend:latest

# Push images
docker push yourusername/compile-phobia-backend:latest
docker push yourusername/compile-phobia-frontend:latest
```

## 🔐 Environment Variables

### Backend (.env)
```env
# GitHub API Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_API=https://api.github.com

# Server Configuration
NODE_ENV=production
PORT=5000
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## 📊 Endpoints Documentation

### Analytics Endpoints

All endpoints accept `?input=owner/repo` or query parameters.

```
GET  /api/repo-info                    - Repository information
GET  /api/contributors                 - List of contributors
GET  /api/contributors-analysis        - Detailed contributor analysis
GET  /api/commits                      - Recent commits
GET  /api/commit-frequency             - Commit frequency trends
GET  /api/commit-quality               - Code quality metrics
GET  /api/burst-activity               - Activity bursts detection
GET  /api/repo-health                  - Overall repository health
GET  /api/issues                       - Open/closed issues
GET  /api/leaderboard                  - Contributor leaderboard
GET  /api/inactive-contributors        - Inactive contributor list
GET  /api/contribution-distribution    - Contribution percentages
GET  /api/weekly-report                - Weekly activity report
GET  /api/file-activity                - File modification patterns
GET  /api/pull-requests                - PR statistics
GET  /api/issue-resolution             - Issue resolution metrics
GET  /api/code-churn                   - Code churn analysis
GET  /api/consistency-score            - Consistency metric
GET  /api/peak-time                    - Peak activity time
GET  /api/module-ownership             - Module responsibility
GET  /api/new-contributors             - Recently joined contributors
GET  /api/trend                        - Repository trending status
GET  /api/issue-commit-link            - Issue-to-commit correlation
GET  /api/risk-analysis                - Risk assessment
GET  /api/productivity                 - Team productivity metrics
```

## 🧪 Testing

### Frontend Testing
```bash
cd devsync-frontend
npm run build  # Build production version
npm run preview  # Preview production build
```

### Backend Testing
```bash
cd backend
# Test rate-limit endpoint
curl http://localhost:5000/rate-limit

# Test repo endpoint
curl "http://localhost:5000/api/repo-info?input=facebook/react"

# Test contributors
curl "http://localhost:5000/api/contributors?input=facebook/react"
```

## 📈 Performance Optimization

### Frontend
- ✅ Vite for ultra-fast builds (2.34s)
- ✅ Code-split with React
- ✅ Chart.js for efficient visualization
- ✅ Responsive design optimized for all devices
- ✅ Gzip compression (122.48 kB → 2.75 kB CSS)

### Backend
- ✅ In-memory caching with 5-minute TTL
- ✅ Fallback caching on rate-limit errors
- ✅ Express middleware optimization
- ✅ CORS pre-flight handling
- ✅ Connection pooling for GitHub API

## 🔧 Troubleshooting

### GitHub API Rate Limiting
**Problem**: "API rate limit exceeded"

**Solution 1**: Add GitHub token to `.env`
```env
GITHUB_TOKEN=ghp_your_token_here
```

**Solution 2**: Wait for rate limit reset (shown in `/rate-limit` endpoint)

**Solution 3**: Implement request queue (Enterprise feature)

### CORS Issues
**Problem**: "Access to XMLHttpRequest blocked by CORS"

**Solution**: Ensure `VITE_API_BASE_URL` points to correct backend URL

### Docker Build Failures
**Problem**: "docker: command not found"

**Solution**: Install Docker Desktop from https://www.docker.com/products/docker-desktop

## 📱 Responsive Design

The application is fully responsive:
- ✅ Desktop (1200px+): Full 2-column layout
- ✅ Tablet (768px-1023px): Optimized grid layout
- ✅ Mobile (< 768px): Single-column stacked layout
- ✅ Small phones (< 480px): Simplified UI with smaller fonts

## 🎨 Features Showcase

### Repository Dashboard
- 🎯 Quick stats (Stars, Forks, Issues, Language)
- 📊 Code Quality Scorecard (0-100)
- 📈 Top Contributors Chart
- 💡 Smart Recommendations
- 🔄 Side-by-side Comparison Tool

### User Profile Dashboard
- 👤 User information and bio
- 📊 Follower/Following stats
- 📦 Recent public repositories
- 🔗 Direct GitHub profile link

### Analytics Features
- 📉 Commit frequency trends
- 🔥 Activity burst detection
- 👥 Contributor distribution
- 📝 Issue resolution metrics
- ⏰ Peak activity times

## 📝 License

This project is part of the CSI-VITAP Skill Builders program.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and commit message format:

```
[type] description
```

Types: `feature`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`

Example: `[feature] add repository comparison tool`

## 📞 Support

For issues or questions:
1. Check the GitHub Issues page
2. Review this deployment guide
3. Contact the development team

---

**Happy Deploying! 🚀**

Last updated: April 2026
