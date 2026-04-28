#  DevSync - Smart Project Collaboration Platform

> A modern full-stack MERN application that enables seamless project collaboration, repository tracking, and team synchronization.
>It provides comprehensive GitHub repository analytics, contributor insights, and code intelligence using structured metrics and visualizations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

---
#   Overview

>Compile Phobia transforms raw GitHub data into actionable insights. It helps developers, teams, and evaluators understand repository health, contributor behavior, and project risk through a unified analytics dashboard.
---

##  Table of Contents

- [Problem Statement](#problem-statement)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Contribution Guidelines](#contribution-guidelines)
- [Future Improvements](#future-improvements)
- [Team](#team)
- [License](#license)

---

## Problem Statement

Modern development teams struggle with:
- **Project Fragmentation**: Repositories scattered across multiple platforms
- **Collaboration Overhead**: Difficulty tracking team contributions
- **Information Gaps**: Limited visibility into project metrics
- **Onboarding Challenges**: New team members struggle to understand project structure

**DevSync solves this** by providing a centralized dashboard where teams can:
- View and track GitHub repositories in real-time
- Monitor project statistics and team contributions
- Access key metrics from a single interface
- Collaborate efficiently without context switching

---

##  Features

### Current Features (MVP - Day 1)
**Express Backend Server** - Robust API for data management
**React Dashboard** - Beautiful, responsive user interface with purple gradient design
**GitHub API Integration** - Real-time repository data fetching
 **Error Handling** - Comprehensive error management and user feedback
**CORS Support** - Seamless cross-origin communication
**Responsive Design** - Works on desktop and tablet devices
 **Data Visualization** - Display repo metrics (stars, language, owner)
**Refresh Functionality** - Manual data refresh with loading states

### Planned Features (Future Sprints)
 **User Authentication** - JWT-based login system
 **Multiple Repositories** - Support for tracking multiple repos
 **Database Integration** - MongoDB for persistent data storage
 **User Profiles** - Team member management
 **Real-time Updates** - WebSocket integration
**Advanced Analytics** - Commit history, contributor insights

**Notification System** - Real-time alerts for team activities **Deployment Support** - Cloud deployment guides

---
# Architecture
flowchart LR

%% Client Layer
A[User / Browser] --> B[React Frontend]

%% API Layer
B -->|HTTP Requests (Axios)| C[Node.js + Express Backend]

%% Processing Layer
C --> D[Analytics Engine]

%% External Services
C --> E[GitHub API]

%% Data Processing
D --> F[Repository Metrics]
D --> G[Contributor Analysis]
D --> H[Commit Analysis]
D --> I[Risk & Health Scoring]

%% Optimization Layer
C --> J[Cache Layer (Optional)]

%% Response Flow
C --> B
B --> A

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React.js** | UI framework for interactive components |
| **Axios** | HTTP client for API requests |
| **CSS3** | Modern styling with gradients & animations |
| **ES6+** | Modern JavaScript features |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for API routes |
| **Axios** | HTTP client for external APIs |
| **CORS** | Cross-origin resource sharing middleware |

### APIs & Services
| Service | Usage |
|---------|-------|
| **GitHub API** | Repository data and statistics |

---

##  Project Structure

```
compile-phobia/
├── backend/
│   ├── server.js
│   ├── githubAnalytics.js
│   ├── package.json
│   └── .env.example
│
├── devsync-frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── vercel.json
├── package.json
└── README.md
```

---

##  Installation & Setup

### Prerequisites
- **Node.js** v14 or higher
- **npm** v6 or higher (or yarn)
- **Git** for version control

### Quick Start (3 Minutes)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```
Expected output: ` Backend server is running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npx create-react-app .
npm install
npm start
```
Browser opens automatically at `http://localhost:3000`

### Detailed Setup

#### Step 1: Clone & Navigate
```bash
git clone https://github.com/YOUR_USERNAME/devsync.git
cd devsync
```

#### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start server
npm start
```

**Verify Backend:**
- Open http://localhost:5000/
- Should see: `{"message": "Welcome to DevSync Backend!", "status": "Backend is running successfully"}`

#### Step 3: Frontend Setup
```bash
cd ../frontend

# Create React app structure
npx create-react-app .

# Install dependencies
npm install

# Start development server
npm start
```

**Verify Frontend:**
- Browser opens automatically
- Dashboard loads with purple gradient background
- Repository data displays correctly

#### Step 4: Test API Connection
1. Open http://localhost:3000
2. Dashboard loads with repository information
3. Open DevTools (F12) → Console
4. Should see: `Repository Data: {success: true, data: {...}}`
5. Click "Refresh Data" to reload

---

##  API Documentation

### Base URLs
| Service | URL |
|---------|-----|
| Backend API | `http://localhost:5000` |
| Frontend App | `http://localhost:3000` |

### Endpoints

#### 1. Welcome Endpoint
```
GET /
```
**Response:**
```json
{
  "message": "Welcome to DevSync Backend!",
  "status": "Backend is running successfully"
}
```

#### 2. Repository Data Endpoint
```
GET /repo
```
**Response:**
```json
{
  "success": true,
  "data": {
    "name": "freeCodeCamp",
    "owner": "freeCodeCamp",
    "description": "The freeCodeCamp community...",
    "stars": 397000,
    "language": "JavaScript",
    "url": "https://github.com/freeCodeCamp/freeCodeCamp"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error fetching repository data",
  "error": "Error details here"
}
```

---

##  Contribution Guidelines

### Commit Convention
All commits must follow this format:
```
[type] short description
```

**Allowed Types:**
- `[feature]` - New feature
- `[fix]` - Bug fix
- `[perf]` - Performance improvement
- `[refactor]` - Code refactoring
- `[test]` - Test files
- `[docs]` - Documentation
- `[style]` - Styling changes
- `[chore]` - Maintenance/setup

**Examples:**
```
[feature] add github api endpoint
[fix] handle network errors in api calls
[docs] update README with setup instructions
[style] improve dashboard styling
```

### Pull Request Convention
All PRs must follow this format:
```
[type] short description (difficulty)
```

**Difficulty Levels:**
- `(easy)` - Simple changes, no dependencies
- `(medium)` - Moderate changes, some dependencies
- `(hard)` - Complex changes, multiple dependencies

**Example:**
```
[feature] setup express server (easy)
[feature] integrate frontend with backend api (medium)
```

### GitHub Workflow
1. Create a branch: `git checkout -b feature/task-name`
2. Make changes and commit: `git commit -m "[type] description"`
3. Push to remote: `git push origin feature/task-name`
4. Create Pull Request with proper title
5. Wait for review and merge

### Code Quality Standards
-  No console errors
-  Meaningful variable names
-  Comments for complex logic
-   Error handling implemented
-  Code tested locally before pushing

---

##  Future Improvements

### Phase 2 (Next Sprint)
- [ ] User authentication (JWT)
- [ ] MongoDB database integration
- [ ] User profile management
- [ ] Multiple repository support

### Phase 3 (Extended)
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Team management features

### Phase 4 (Production)
- [ ] Cloud deployment (AWS/Azure)
- [ ] Performance optimization
- [ ] Security audits
- [ ] Scalability improvements

---

##  Team

| Developer | Role | Focus |
|-----------|------|-------|
| **Sathvik** |
| **Nikita** |

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
