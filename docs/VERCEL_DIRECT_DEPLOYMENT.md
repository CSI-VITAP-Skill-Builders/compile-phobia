# Direct Vercel Deployment Guide

## Single Vercel Deployment (Both Frontend & Backend)

Deploy **entire application** to Vercel using serverless functions for the backend.

---

## 🚀 Deployment Steps

### Step 1: Prepare Repository
```bash
git add .
git commit -m "[deploy] configure Vercel deployment for frontend and backend"
git push origin main
```

### Step 2: Create Vercel Account
- Visit: https://vercel.com
- Sign up with GitHub account
- Authorize Vercel to access your repositories

### Step 3: Import Project to Vercel
1. Go to: https://vercel.com/dashboard
2. Click: **"Add New..."** → **"Project"**
3. Select: **"Import Git Repository"**
4. Search: **"compile-phobia"**
5. Click: **"Import"**

### Step 4: Configure Project Settings
On Vercel import screen:

**Project Name**: `compile-phobia`

**Framework**: `Vite`

**Root Directory**: Leave blank (Vercel auto-detects)

**Build Command**: `cd devsync-frontend && npm run build`

**Output Directory**: `devsync-frontend/dist`

### Step 5: Add Environment Variables
Click **"Environment Variables"** and add:

| Key | Value | Scope |
|-----|-------|-------|
| `GITHUB_TOKEN` | Your GitHub personal access token | Production |
| `VITE_API_BASE_URL` | `https://your-domain.vercel.app` | Production |
| `NODE_ENV` | `production` | Production |

**How to get GITHUB_TOKEN:**
1. Go to: https://github.com/settings/tokens
2. Click: **"Generate new token (classic)"**
3. Select scopes: `repo`, `user`, `public_repo`
4. Copy token (appears once!)
5. Paste in Vercel environment variables

### Step 6: Deploy
1. Click: **"Deploy"**
2. Wait 2-5 minutes for build and deployment
3. View logs in real-time
4. Once complete, your app is live! 🎉

---

## 📝 Configuration Files

### `vercel.json` (Already Configured)
- Version: 2
- Frontend build: Vite (dist directory)
- Backend: Serverless functions in `/api`
- Routes: `/api/*` → serverless functions, `/*` → frontend SPA

### `api/index.js` (Created for You)
Express app configured as Vercel serverless function:
- ✅ CORS enabled
- ✅ JSON parsing
- ✅ GitHub API integration
- ✅ Rate limiting
- ✅ Error handling
- ✅ All core endpoints

### `.vercelignore` (Excludes Unnecessary Files)
- Reduces deployment size
- Faster builds
- Excludes: node_modules, docs, Docker files, etc.

---

## 🔗 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           vercel.com/your-domain                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │   Frontend (React + Vite)              │   │
│  │   - HTML/CSS/JS (CDN cached)           │   │
│  │   - SPA routing (client-side)          │   │
│  │   - Port: 443 (HTTPS)                  │   │
│  └────────────────────────────────────────┘   │
│                    ↓↑                          │
│  ┌────────────────────────────────────────┐   │
│  │   Backend (Express Serverless)         │   │
│  │   - API routes (/api/*)                │   │
│  │   - GitHub integration                 │   │
│  │   - Automatic scaling                  │   │
│  │   - Cold start: ~500ms                 │   │
│  └────────────────────────────────────────┘   │
│                    ↓↑                          │
│  ┌────────────────────────────────────────┐   │
│  │   GitHub API                           │   │
│  │   - Repository data                    │   │
│  │   - Contributor info                   │   │
│  │   - Rate limit: 5000 req/hour          │   │
│  └────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ Available Endpoints

Once deployed, access these endpoints:

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /api/health` | Health check | `https://your-domain.vercel.app/api/health` |
| `GET /api/rate-limit` | GitHub rate limit | `https://your-domain.vercel.app/api/rate-limit` |
| `GET /api/resolve?input=facebook/react` | Resolve input | `https://your-domain.vercel.app/api/resolve?input=facebook/react` |
| `GET /api/repo-info?owner=facebook&repo=react` | Repository info | `https://your-domain.vercel.app/api/repo-info?owner=facebook&repo=react` |
| `GET /api/repo-health?owner=facebook&repo=react` | Quality score | `https://your-domain.vercel.app/api/repo-health?owner=facebook&repo=react` |
| `GET /api/contributors?owner=facebook&repo=react` | Contributors | `https://your-domain.vercel.app/api/contributors?owner=facebook&repo=react` |
| `/` | Frontend SPA | `https://your-domain.vercel.app` |

---

## 🎯 Features Available

All 5 features work immediately after deployment:

✅ **Repository Comparison Tool**
- Side-by-side metrics comparison
- Powered by: `/api/repo-info`, `/api/repo-health`

✅ **Code Quality Scorecard**
- 0-100 AI-generated score
- Powered by: `/api/repo-health`

✅ **Contributor Timeline**
- Top 10 contributors chart
- Powered by: `/api/contributors`

✅ **Language Distribution**
- Pie chart visualization
- Powered by: `/api/repo-info`

✅ **Smart Recommendations Engine**
- AI-generated insights
- Powered by: `/api/repo-health`, `/api/contributors`

---

## 🔐 Security

### Environment Variables
- `GITHUB_TOKEN` is **never exposed** to frontend
- Stored securely in Vercel
- Only available in serverless functions

### CORS
- Enabled for your domain only
- Prevents unauthorized API access
- Configured in `api/index.js`

### Rate Limiting
- GitHub API: 5000 requests/hour with token
- Implement caching to reduce calls
- Check: `GET /api/rate-limit`

---

## 📊 Monitoring

### Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: **compile-phobia**
3. View tabs:
   - **Deployments**: Deployment history
   - **Analytics**: Traffic and performance
   - **Logs**: Real-time request logs
   - **Settings**: Configuration

### Common Metrics
- **Build time**: ~30-60 seconds
- **Function cold start**: ~500ms
- **Average response**: <500ms
- **Uptime SLA**: 99.95%

---

## ⚙️ Troubleshooting

### Build Fails
```
Error: Cannot find module 'backend/githubAnalytics'
```
**Solution**: Ensure `backend/githubAnalytics.js` exists and is committed to Git.

### API Returns 404
```
Error: API endpoint not found
```
**Solution**: Check endpoint URL format. Must be `/api/endpoint`.

### Environment Variables Not Working
```
Error: GITHUB_TOKEN is undefined
```
**Solution**: 
1. Go to Vercel project settings
2. Add environment variables
3. Redeploy project

### Slow Performance
- GitHub API is slow: Use caching
- Consider: Render, Railway for backend-only
- Monitor: Vercel Analytics dashboard

---

## 🚀 Advanced Configuration

### Custom Domain
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain
3. Update DNS records (provided by Vercel)
4. SSL auto-provisioned (free)

### Environment Variable Overrides
For different deployments (staging, production):
```json
"env": {
  "GITHUB_TOKEN": {
    "production": "@github_token_prod",
    "preview": "@github_token_preview"
  }
}
```

### Function Configuration
Edit `vercel.json`:
```json
"functions": {
  "api/index.js": {
    "maxDuration": 60,
    "memory": 1024
  }
}
```
- `maxDuration`: 10-900 seconds (based on plan)
- `memory`: 128-3008 MB (Pro plan required for max)

---

## 📦 Deployment Checklist

- [ ] GitHub repository created and public
- [ ] All code committed and pushed
- [ ] Vercel account created
- [ ] GitHub token generated
- [ ] Project imported to Vercel
- [ ] Environment variables set:
  - [ ] GITHUB_TOKEN
  - [ ] VITE_API_BASE_URL
  - [ ] NODE_ENV
- [ ] Build command verified
- [ ] Deploy initiated
- [ ] Build successful (check logs)
- [ ] Frontend loads at deployed URL
- [ ] API endpoints responding
- [ ] All 5 features working

---

## 🎉 Success Indicators

✅ **Deployment Complete When:**
1. Vercel shows "Ready" status
2. Can visit: `https://your-domain.vercel.app`
3. Frontend loads without errors
4. API responds: `GET /api/health`
5. Can search GitHub repositories
6. All 5 features working

---

## 📞 Support

**Vercel Documentation**: https://vercel.com/docs
**GitHub API Docs**: https://docs.github.com/en/rest
**Project Repo**: https://github.com/CSI-VITAP-Skill-Builders/compile-phobia

---

## 🔄 Deployment Flow

```
Git Push
   ↓
GitHub Webhook
   ↓
Vercel Detects Change
   ↓
Build Phase (1-2 min)
   │
   ├─ Install dependencies
   ├─ Build frontend (Vite)
   └─ Bundle serverless functions
   ↓
Deploy Phase (<1 min)
   │
   ├─ Upload static files to CDN
   ├─ Deploy API functions
   └─ Update DNS
   ↓
Ready 🎉
   ↓
Live at: https://your-domain.vercel.app
```

---

**Last Updated**: 2024
**Status**: ✅ Ready for Deployment
