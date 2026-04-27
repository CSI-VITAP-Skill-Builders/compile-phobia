require("dotenv").config();
const express = require('express');
const cors = require('cors');

const {
  normalizeGitHubInput,
  ensureRepoInput,
  ensureUserInput,
  fetchRepoInfo,
  fetchContributors,
  fetchRateLimit,
  hasGithubToken,
  buildRepoHealth,
  buildContributorAnalysis,
} = require('../backend/githubAnalytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handler
const sendApiError = (res, message, status = 500) => {
  res.status(status).json({ error: message });
};

// Input helpers
const getInputValue = (req) => {
  if (req.params.owner && req.params.repo) {
    return `${req.params.owner}/${req.params.repo}`;
  }
  return req.query.input || req.query.repo || req.query.owner || '';
};

const getRepoTarget = (req) => {
  const parsed = normalizeGitHubInput(getInputValue(req));
  if (parsed.kind !== 'repo') {
    throw new Error('Repository input must be owner/repo or a GitHub repo URL');
  }
  return ensureRepoInput(parsed.owner, parsed.repo);
};

const asyncHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    const status = error.response?.status;
    if (status === 404) {
      sendApiError(res, 'GitHub resource not found', 404);
      return;
    }
    if (status === 403) {
      const resetHeader = error.response?.headers?.['x-ratelimit-reset'];
      const resetAt = resetHeader ? new Date(Number(resetHeader) * 1000).toISOString() : null;
      sendApiError(
        res,
        `GitHub rate limit exceeded.${hasGithubToken ? '' : ' Add GITHUB_TOKEN in .env to increase limit.'}${resetAt ? ` Resets at ${resetAt}.` : ''}`,
        429
      );
      return;
    }
    sendApiError(res, error.message || 'Internal server error', 500);
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limit endpoint
app.get('/api/rate-limit', asyncHandler(async (req, res) => {
  const rateLimit = await fetchRateLimit();
  res.json(rateLimit);
}));

// Resolve endpoint
app.get('/api/resolve', asyncHandler(async (req, res) => {
  const input = getInputValue(req);
  if (!input) {
    return sendApiError(res, 'Input required (owner/repo or GitHub URL)', 400);
  }
  const parsed = normalizeGitHubInput(input);
  res.json(parsed);
}));

// Repository info
app.get('/api/repo-info', asyncHandler(async (req, res) => {
  const { owner, repo } = getRepoTarget(req);
  const repoData = await fetchRepoInfo(owner, repo);
  res.json(repoData);
}));

// Repository health/quality score
app.get('/api/repo-health', asyncHandler(async (req, res) => {
  const { owner, repo } = getRepoTarget(req);
  const health = await buildRepoHealth(owner, repo);
  res.json(health);
}));

// Contributors
app.get('/api/contributors', asyncHandler(async (req, res) => {
  const { owner, repo } = getRepoTarget(req);
  const contributors = await fetchContributors(owner, repo);
  const analysis = await buildContributorAnalysis(owner, repo);
  res.json({ contributors, analysis });
}));

// Catch all API route
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app;
