# 🚀 Vercel Deployment Guide for Compile Phobia

This guide provides comprehensive instructions for deploying your Compile Phobia application to Vercel.

## 📋 Prerequisites

- GitHub account with repository pushed
- Vercel account (free at https://vercel.com)
- GitHub Personal Access Token (get from https://github.com/settings/tokens)

## 🎯 Deployment Options

### **Option 1: Deploy Frontend Only (Easiest - 5 minutes)**

Best for: Connecting to an existing backend URL

#### Step 1: Prepare Your Frontend
```bash
cd devsync-frontend
npm install
npm run build
```

#### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select "GitHub" and connect your repo
4. Choose `CSI-VITAP-Skill-Builders/compile-phobia`
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `devsync-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.com` (or your backend domain)
7. Click "Deploy" 🎉

#### Step 3: Configure Backend URL

After deployment, go to Project Settings → Environment Variables and update:
- `VITE_API_BASE_URL`: Point to your backend (Render, Railway, etc.)

---

### **Option 2: Deploy Both Frontend + Backend (Recommended for Full Stack)**

Best for: Complete end-to-end deployment

#### Option 2A: Backend on Railway.app, Frontend on Vercel

##### Deploy Backend to Railway:

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Node.js backend
5. Add Environment:
   - **GITHUB_TOKEN**: Your GitHub token
   - **NODE_ENV**: `production`
   - **PORT**: `5000`
6. Deploy and get your backend URL (e.g., `https://compile-phobia-api.up.railway.app`)

##### Deploy Frontend to Vercel:

1. Follow "Option 1" steps above
2. Set `VITE_API_BASE_URL` to your Railway backend URL

#### Option 2B: Backend on Render.com, Frontend on Vercel

##### Deploy Backend to Render:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repo
4. Configure:
   - **Name**: `compile-phobia-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `node backend/server.js`
   - **Environment**: Add `GITHUB_TOKEN`
5. Deploy and get URL

##### Deploy Frontend to Vercel:

1. Follow "Option 1" steps
2. Use Render backend URL in `VITE_API_BASE_URL`

---

### **Option 3: Full Stack on Vercel (Advanced)**

Requires: Vercel Pro plan for serverless functions

1. Go to https://vercel.com/new
2. Import your repository
3. Configure:
   - **Framework**: Custom (monorepo)
   - **Build Command**: `npm run build --prefix devsync-frontend`
   - **Output Directory**: `devsync-frontend/dist`
4. Configure API Routes:
   - Vercel API routes for backend endpoints
   - Set base URL to `/api`
5. Add environment variables
6. Deploy

---

## ⚙️ Environment Variables Setup

### For Frontend (Vercel Project Settings)

```
VITE_API_BASE_URL = https://your-backend-url.com
```

### For Backend (Railway/Render/Vercel)

```
GITHUB_TOKEN = ghp_xxxxxxxxxxxxxxxxxxxx
PORT = 5000
NODE_ENV = production
CORS_ORIGIN = https://your-frontend-url.vercel.app
```

---

## 🔑 Getting Your GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: `compile-phobia-api`
4. Select scopes:
   - ✅ `public_repo`
   - ✅ `read:user`
5. Generate and copy the token
6. Add to your backend environment variables as `GITHUB_TOKEN`

⚠️ **Keep this token secret!** Never commit it to GitHub.

---

## ✅ Verification Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render/custom)
- [ ] `VITE_API_BASE_URL` configured in frontend
- [ ] `GITHUB_TOKEN` configured in backend
- [ ] `CORS_ORIGIN` includes your frontend URL
- [ ] Frontend loads without errors
- [ ] API calls work (check browser console)
- [ ] GitHub analytics render correctly

---

## 🐛 Troubleshooting

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solution**:
1. Update backend `CORS_ORIGIN` to include your frontend domain
2. Example: `https://compile-phobia.vercel.app`
3. Redeploy backend

### 401 GitHub Token Error

**Problem**: `401 Bad credentials`

**Solution**:
1. Verify token is valid: https://github.com/settings/tokens
2. Check token has `public_repo` scope
3. Update environment variable in your deployment platform
4. Redeploy

### Blank Frontend

**Problem**: Frontend loads but shows blank page

**Solution**:
1. Check browser console for errors
2. Verify `VITE_API_BASE_URL` is correct
3. Test API URL directly: `https://your-backend.com/api/repo-info?input=facebook/react`
4. Check backend logs

### Build Failures

**Problem**: Deployment fails during build

**Solution**:
```bash
# Test build locally
cd devsync-frontend
npm install
npm run build

# Check for errors
npm run lint
```

If local build works, try:
1. Clear Vercel cache: Project Settings → Git → Clear build cache
2. Redeploy

### API Timeouts

**Problem**: API calls time out

**Solution**:
1. Check backend is running
2. Increase timeout in frontend (axios config)
3. Check GitHub API rate limits: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`

---

## 📊 Performance Tips

1. **Enable Caching**: Backend caches GitHub API responses for 5 minutes
2. **Use Personal Token**: Increases GitHub API rate limit to 5000/hour
3. **Lazy Load Charts**: Frontend loads visualizations on demand
4. **CDN Benefits**: Vercel uses Vercel Edge Network for fast delivery

---

## 🔗 Useful Links

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **GitHub API**: https://docs.github.com/en/rest
- **Vite Build Guide**: https://vitejs.dev/guide/build.html

---

## 📱 Testing Your Deployment

### Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Search for a repository: `facebook/react`
3. Check all 5 features load:
   - Repository Comparison
   - Code Quality Scorecard
   - Contributor Timeline
   - Language Distribution
   - Smart Recommendations

### Test API

```bash
# From your backend domain
curl "https://your-backend.com/api/repo-info?input=facebook/react"

# Should return JSON with repo data
```

---

## 🚀 Next Steps

1. **Monitor Performance**: Check Vercel Analytics
2. **Set Up Monitoring**: Add error tracking (Sentry, etc.)
3. **Enable HTTPS**: Vercel does this automatically
4. **Scale**: Upgrade plan if needed
5. **Custom Domain**: Add your domain in Vercel Settings

---

**Questions?** Check the main README.md or open an issue on GitHub!
