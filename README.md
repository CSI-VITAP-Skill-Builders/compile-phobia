#  DevSync #  Compile Phobia – GitHub Intelligence Dashboard

A modern full-stack analytics platform that transforms GitHub repository data into actionable insights using interactive visualizations, contributor analysis, and code intelligence.

🌐 **Live Demo:** https://github-dashboard-lime-delta.vercel.app/
📦 **Repository:** https://github.com/CSI-VITAP-Skill-Builders/compile-phobia

---

##  Overview

Compile Phobia helps developers, teams, and evaluators:

* Understand repository health 
* Analyze contributor behavior 
* Track project trends 
* Detect risks and inefficiencies 

All in one clean, visual dashboard.

---

##  Features

###  Repository Health Dashboard

* Score-based evaluation system
* Positive vs penalty analysis
* Interactive charts (Bar + Pie)

###  Contributor Insights

* Top contributors visualization
* Contribution distribution
* Activity tracking

###  Repository Analytics

* Commit trends & activity
* Code churn insights
* Productivity indicators

###  Smart Insights

* Issue-based recommendations
* Activity-based alerts
* Project quality signals

---

## Tech Stack

### Frontend

* React (Vite)
* Chart.js
* CSS3 (Responsive UI)

### Backend

* Node.js
* Express.js

### APIs

* GitHub REST API

### Deployment

* Frontend → Vercel
* Backend → Render

---

## 📁 Project Structure

```bash
compile-phobia/
├── backend/
│   ├── server.js
│   ├── githubAnalytics.js
│   ├── package.json
│   └── .env.example
├── devsync-frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── vercel.json
└── README.md
```

---

##  Installation & Setup

### Prerequisites

* Node.js v14+
* npm / yarn
* Git

---

### 🔹 Backend Setup

```bash
cd backend
npm install
npm start
```

Expected:

```bash
Backend server running on http://localhost:5000
```

---

###  Frontend Setup

```bash
cd devsync-frontend
npm install
npm run dev
```

App runs at:

```bash
http://localhost:5173
```

---

###  Environment Variables

Create `.env` inside frontend:

```env
VITE_API_BASE_URL=https://compile-phobia.onrender.com
```

---

##  API Documentation

### Base URLs

| Service        | URL                                 |
| -------------- | ----------------------------------- |
| Backend API    | http://localhost:5000               |
| Production API | https://compile-phobia.onrender.com |

---

### Example Endpoint

```bash
GET /resolve?input=facebook/react
```

Response:

```json
{
  "success": true,
  "data": {
    "name": "facebook/react",
    "stars": 307000
  }
}
```

---

##  Example Use Case

Input:

```bash
facebook/react
```

Output:

* Repository health score
* Contributor insights
* Activity metrics
* Visual analytics dashboard

---

##  GitHub Workflow

1. Create a branch

```bash
git checkout -b feature/task-name
```

2. Make changes & commit

```bash
git commit -m "[feature] add analytics chart"
```

3. Push & create PR

```bash
git push origin feature/task-name
```

---

##  Contribution Guidelines

### Commit Format

```
[type] short description
```

### Allowed Types

* `[feature]` New feature
* `[fix]` Bug fix
* `[refactor]` Code improvement
* `[docs]` Documentation
* `[style]` UI changes
* `[chore]` Maintenance

---

##  Future Improvements

* User authentication (JWT)
* Multi-repository comparison
* Real-time analytics
* AI-based insights 🤖
* Performance optimization

---

## 👥 Team

* Sathvik
* Nikita

---

## 💡 Why this Project?

Most tools show raw GitHub data.
**Compile Phobia converts it into insights**, helping developers make smarter decisions faster.

---

##  Documentation

Complete documentation available in:
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[QUICK_START.md](QUICK_START.md)** - Fast startup guide
- **[GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md)** - Git conventions & workflow
- **[DAY1_CHECKLIST.md](DAY1_CHECKLIST.md)** - Quick reference & checklists
- **[VISUAL_WORKFLOW.md](VISUAL_WORKFLOW.md)** - Architecture & diagrams

---

##  Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT in `backend/server.js` |
| npm command not found | Install Node.js from nodejs.org |
| Frontend won't load | Run `npx create-react-app .` first |
| Backend can't connect | Verify URLs in `frontend/src/App.js` |
| CORS error | Check CORS middleware in server.js |

---

##  License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 DevSync Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---


---

**Made with ❤️ by the DevSync Team**

*Last Updated: April 22, 2026*
