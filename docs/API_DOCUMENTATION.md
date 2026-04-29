# API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All requests require `Authorization: token <GITHUB_TOKEN>` header

## Rate Limiting
- GitHub API: 5000 requests/hour
- Cached for 5 minutes per endpoint

## Core Endpoints

### Repository Resolution
**POST /resolve**
- Input: URL or repo name
- Returns: { owner, repo, isUser }
- Example: `facebook/react` or `https://github.com/facebook/react`

### Repository Information
**GET /repo-info**
- Query: `owner`, `repo`
- Returns: Repository metadata, language distribution
- Cache: 5 minutes

### Contributor Analytics
**GET /contributors**
- Query: `owner`, `repo`
- Returns: Top 10 contributors with commit counts
- Chart: Bar chart ready format

### Code Quality Score
**GET /repo-health**
- Query: `owner`, `repo`
- Returns: 0-100 score, color code, factors
- Calculation: Activity, contributors, documentation

### Smart Recommendations
**GET /smart-recommendations**
- Query: `owner`, `repo`
- Returns: Array of AI-generated insights
- Categories: Architecture, Scalability, Security

### Feature Endpoints (25+ total)
- `/commit-quality`: Commit message analysis
- `/code-churn`: File change frequency
- `/contributor-growth`: Contributor trend
- `/issue-resolution`: Issue closure rate
- `/pr-metrics`: Pull request statistics
- `/activity-timeline`: Repository activity over time
- And 19 more...

## Error Responses

### 404 Not Found
```json
{
  "error": "Repository not found",
  "owner": "facebook",
  "repo": "react"
}
```

### 403 Forbidden (Rate Limited)
```json
{
  "error": "GitHub API rate limit exceeded",
  "resetTime": 1234567890
}
```

### 500 Server Error
```json
{
  "error": "Internal server error",
  "message": "Details of the error"
}
```

## Example Requests

```bash
# Get repo info
curl http://localhost:5000/repo-info?owner=facebook&repo=react \
  -H "Authorization: token YOUR_GITHUB_TOKEN"

# Get contributors
curl http://localhost:5000/contributors?owner=facebook&repo=react \
  -H "Authorization: token YOUR_GITHUB_TOKEN"

# Get quality score
curl http://localhost:5000/repo-health?owner=facebook&repo=react \
  -H "Authorization: token YOUR_GITHUB_TOKEN"
```

## Response Time
- Average: < 1 second
- Cached: < 100ms
- With GitHub API call: 0.5-2s
