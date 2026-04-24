const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;
const GITHUB_API = process.env.GITHUB_API || 'https://api.github.com';

const sendApiError = (res, message, status = 500) => {
  return res.status(status).json({ error: message });
};

const getIdentifierFromRequest = (req) => {
  const rawInput = req.params.owner
    ? `${req.params.owner}/${req.params.repo || ''}`
    : req.query.input || req.query.repo || req.query.owner || '';

  return rawInput.trim();
};

const isValidRepoPart = (value) => /^[A-Za-z0-9._-]+$/.test(value);
const isValidUsername = (value) => /^[A-Za-z0-9-]+$/.test(value);

const normalizeGitHubInput = (value) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return { type: 'repo', owner: 'facebook', repo: 'react' };
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
  const withoutWww = withoutProtocol.replace(/^www\./i, '');
  const githubPath = withoutWww.replace(/^github\.com\//i, '');
  const cleaned = githubPath.replace(/\/+$/, '');

  if (!cleaned) {
    return { type: 'user', username: 'github' };
  }

  const parts = cleaned.split('/').filter(Boolean);

  if (parts.length >= 2) {
    return {
      type: 'repo',
      owner: parts[0],
      repo: parts[1],
    };
  }

  return {
    type: 'user',
    username: parts[0],
  };
};

const validateRepoInput = (res, owner, repo) => {
  if (!owner || !repo) {
    sendApiError(res, 'Both owner and repo are required', 400);
    return false;
  }

  if (!isValidRepoPart(owner) || !isValidRepoPart(repo)) {
    sendApiError(res, 'Invalid owner/repo format', 400);
    return false;
  }

  return true;
};

const validateUserInput = (res, username) => {
  if (!username) {
    sendApiError(res, 'Username is required', 400);
    return false;
  }

  if (!isValidUsername(username)) {
    sendApiError(res, 'Invalid GitHub username format', 400);
    return false;
  }

  return true;
};

const fetchRepoData = async (owner, repo) => {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);

  const [repoResponse, contributorsResponse, commitsResponse] = await Promise.all([
    axios.get(`${GITHUB_API}/repos/${encodedOwner}/${encodedRepo}`),
    axios.get(`${GITHUB_API}/repos/${encodedOwner}/${encodedRepo}/contributors?per_page=5`),
    axios.get(`${GITHUB_API}/repos/${encodedOwner}/${encodedRepo}/commits?per_page=5`),
  ]);

  return {
    repo: repoResponse.data,
    contributors: contributorsResponse.data,
    commits: commitsResponse.data,
  };
};

const fetchUserData = async (username) => {
  const encodedUsername = encodeURIComponent(username);

  const [userResponse, reposResponse] = await Promise.all([
    axios.get(`${GITHUB_API}/users/${encodedUsername}`),
    axios.get(`${GITHUB_API}/users/${encodedUsername}/repos?sort=updated&per_page=6`),
  ]);

  return {
    user: userResponse.data,
    repositories: reposResponse.data,
  };
};

const handleGithubError = (res, err, fallbackMessage) => {
  if (err.response?.status === 404) {
    return sendApiError(res, 'Repository not found', 404);
  }

  if (err.response?.status === 403) {
    return sendApiError(res, 'GitHub rate limit exceeded. Please try again shortly.', 429);
  }

  return sendApiError(res, fallbackMessage);
};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/resolve', async (req, res) => {
  try {
    const parsed = normalizeGitHubInput(req.query.input || req.query.repo || req.query.owner || '');

    if (parsed.type === 'repo') {
      if (!validateRepoInput(res, parsed.owner, parsed.repo)) return;
      const payload = await fetchRepoData(parsed.owner, parsed.repo);
      res.json({ type: 'repo', ...payload });
      return;
    }

    if (!validateUserInput(res, parsed.username)) return;
    const payload = await fetchUserData(parsed.username);
    res.json({ type: 'user', ...payload });
  } catch (err) {
    handleGithubError(res, err, 'Failed to resolve GitHub input');
  }
});

app.get('/repo', async (req, res) => {
  try {
    const identifier = getIdentifierFromRequest(req);
    const parsed = normalizeGitHubInput(identifier);

    if (parsed.type !== 'repo') {
      sendApiError(res, 'Repository input must be owner/repo', 400);
      return;
    }

    const { owner, repo } = parsed;
    if (!validateRepoInput(res, owner, repo)) return;
    const response = await axios.get(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch repo');
  }
});

app.get('/repo/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`).type === 'repo'
      ? normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`)
      : { owner: req.params.owner, repo: req.params.repo };
    if (!validateRepoInput(res, owner, repo)) return;
    const response = await axios.get(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch repo');
  }
});

app.get('/contributors', async (req, res) => {
  try {
    const identifier = getIdentifierFromRequest(req);
    const parsed = normalizeGitHubInput(identifier);

    if (parsed.type !== 'repo') {
      sendApiError(res, 'Repository input must be owner/repo', 400);
      return;
    }

    const { owner, repo } = parsed;
    if (!validateRepoInput(res, owner, repo)) return;
    const response = await axios.get(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=10`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch contributors');
  }
});

app.get('/contributors/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`).type === 'repo'
      ? normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`)
      : { owner: req.params.owner, repo: req.params.repo };
    if (!validateRepoInput(res, owner, repo)) return;
    const response = await axios.get(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=10`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch contributors');
  }
});

app.get('/commits', async (req, res) => {
  try {
    const identifier = getIdentifierFromRequest(req);
    const parsed = normalizeGitHubInput(identifier);

    if (parsed.type !== 'repo') {
      sendApiError(res, 'Repository input must be owner/repo', 400);
      return;
    }

    const { owner, repo } = parsed;
    if (!validateRepoInput(res, owner, repo)) return;
    const response = await axios.get(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=10`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch commits');
  }
});

app.get('/commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`).type === 'repo'
      ? normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`)
      : { owner: req.params.owner, repo: req.params.repo };
    if (!validateRepoInput(res, owner, repo)) return;
    const response = await axios.get(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=10`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch commits');
  }
});

app.get('/dashboard/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`).type === 'repo'
      ? normalizeGitHubInput(`${req.params.owner}/${req.params.repo}`)
      : { owner: req.params.owner, repo: req.params.repo };
    if (!validateRepoInput(res, owner, repo)) return;

    const payload = await fetchRepoData(owner, repo);
    res.json(payload);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch dashboard data');
  }
});

app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (!validateUserInput(res, username)) return;

    const response = await axios.get(`${GITHUB_API}/users/${encodeURIComponent(username)}`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch user');
  }
});

app.get('/user/:username/repos', async (req, res) => {
  try {
    const { username } = req.params;
    if (!validateUserInput(res, username)) return;

    const response = await axios.get(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`);
    res.json(response.data);
  } catch (err) {
    handleGithubError(res, err, 'Failed to fetch user repositories');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
