# Vercel Deployment Guide

## Frontend Deployment (Vercel)

### Setup Steps

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Connect GitHub account

2. **Environment Variables**
   - Set `VITE_API_BASE_URL` to production backend URL
   - Example: `https://api.yourdomain.com`

3. **Build Settings**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

4. **Deployment**
   - Automatic deployment on main branch push
   - Preview deployments on PR creation
   - Custom domain support

### Configuration File (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "devsync-frontend/dist",
  "env": {
    "VITE_API_BASE_URL": "@api_base_url"
  },
  "regions": ["sfo1"],
  "functions": {
    "api/**": {
      "runtime": "nodejs20.x",
      "memory": 1024
    }
  }
}
```

## Backend Deployment Options

### Option 1: Render
- Deploy via Railway/Render using provided server.js
- Environment: Node 21
- Port: 5000
- Set GITHUB_TOKEN secret

### Option 2: Fly.io
- Docker image ready for deployment
- Command: `flyctl deploy`
- 3 free shared-cpu-1x VMs

### Option 3: AWS/GCP/Azure
- ECR/GCR/ACR image repositories
- Deploy via container registry
- Use docker-compose for local testing

## Environment Variables (Vercel)

Set in Vercel project settings:
```
VITE_API_BASE_URL=https://your-backend-url.com
```

Set in backend:
```
GITHUB_TOKEN=your_github_token
NODE_ENV=production
```

## Domain Setup
1. Purchase domain or use Vercel domain
2. Point DNS to Vercel nameservers
3. Configure custom domain in project settings
4. SSL certificate auto-provisioned

## Monitoring
- Vercel Analytics dashboard
- Error tracking and logs
- Performance metrics
- Deployment history
