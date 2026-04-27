require("dotenv").config();
console.log("TOKEN:", process.env.GITHUB_TOKEN);
const express = require('express');
const cors = require('cors');

const {
  normalizeGitHubInput,
  ensureRepoInput,
  ensureUserInput,
  fetchRepoInfo,
  fetchContributors,
  fetchCommits,
  fetchIssues,
  fetchPullRequests,
  fetchUserProfile,
  fetchUserRepos,
  fetchRateLimit,
  hasGithubToken,
  fetchCommitDetails,
  summarizeRepoInfo,
  summarizeContributors,
  summarizeCommits,
  buildContributorAnalysis,
  buildLeaderboard,
  buildCommitFrequency,
  buildCommitQuality,
  buildBurstActivity,
  buildInactiveContributors,
  buildContributionDistribution,
  buildWeeklyReport,
  buildFileActivity,
  buildPullRequests,
  buildIssueResolution,
  buildCodeChurn,
  buildContributorConsistency,
  buildPeakTime,
  buildModuleOwnership,
  buildNewContributors,
  buildTrend,
  buildIssueCommitLinks,
  buildRiskAnalysis,
  buildProductivity,
  buildRepoHealth,
  buildIssuesTracker,
} = require('./githubAnalytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const sendApiError = (res, message, status = 500) => {
  res.status(status).json({ error: message });
};

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

const getUserTarget = (req) => {
  const parsed = normalizeGitHubInput(getInputValue(req));
  if (parsed.kind !== 'user') {
    throw new Error('Profile input must be a GitHub profile URL or username');
  }

  return ensureUserInput(parsed.username);
};

const asyncHandler = (handler, fallbackMessage) => async (req, res) => {
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
        `GitHub rate limit exceeded.${hasGithubToken ? '' : ' Add GITHUB_TOKEN in backend/.env to increase limit.'}${resetAt ? ` Resets at ${resetAt}.` : ''}`,
        429,
      );
      return;
    }

    if (error.message?.includes('owner/repo') || error.message?.includes('username')) {
      sendApiError(res, error.message, 400);
      return;
    }

    sendApiError(res, fallbackMessage);
  }
};

const repoHandler = (builder, fallbackMessage) => asyncHandler(async (req, res) => {
  const { owner, repo } = getRepoTarget(req);
  const payload = await builder(owner, repo, req);
  res.json(payload);
}, fallbackMessage);

const userHandler = (builder, fallbackMessage) => asyncHandler(async (req, res) => {
  const username = getUserTarget(req);
  const payload = await builder(username, req);
  res.json(payload);
}, fallbackMessage);

const loadRepoBase = async (owner, repo) => {
  const [repoInfo, contributors, commits] = await Promise.all([
    fetchRepoInfo(owner, repo),
    fetchContributors(owner, repo),
    fetchCommits(owner, repo),
  ]);

  return { repoInfo, contributors, commits };
};

const loadRepoAdvanced = async (owner, repo) => {
  const [base, issues, pulls] = await Promise.all([
    loadRepoBase(owner, repo),
    fetchIssues(owner, repo, 'all'),
    fetchPullRequests(owner, repo),
  ]);

  const commitDetails = await fetchCommitDetails(owner, repo, base.commits, 20);
  return { ...base, issues, pulls, commitDetails };
};

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/rate-limit', asyncHandler(async (req, res) => {
  const data = await fetchRateLimit();
  res.json({
    authenticated: hasGithubToken,
    limit: data?.rate?.limit ?? null,
    remaining: data?.rate?.remaining ?? null,
    reset: data?.rate?.reset ? new Date(data.rate.reset * 1000).toISOString() : null,
    used: data?.rate?.used ?? null,
  });
}, 'Failed to fetch GitHub rate limit'));

app.get('/resolve', asyncHandler(async (req, res) => {
  const parsed = normalizeGitHubInput(req.query.input || req.query.repo || req.query.owner || '');

  if (parsed.kind === 'repo') {
    const { owner, repo } = ensureRepoInput(parsed.owner, parsed.repo);
    const [repoInfo, contributors, commits] = await Promise.all([
      fetchRepoInfo(owner, repo),
      fetchContributors(owner, repo),
      fetchCommits(owner, repo),
    ]);

    res.json({
      type: 'repo',
      repo: summarizeRepoInfo(repoInfo),
      contributors: summarizeContributors(contributors),
      commits: summarizeCommits(commits),
    });
    return;
  }

  const username = ensureUserInput(parsed.username);
  const [user, repositories] = await Promise.all([
    fetchUserProfile(username),
    fetchUserRepos(username),
  ]);

  res.json({
    type: 'user',
    user,
    repositories,
  });
}, 'Failed to resolve GitHub input'));

app.get('/repo-info', repoHandler(async (owner, repo) => {
  const repoInfo = await fetchRepoInfo(owner, repo);
  return { repo: summarizeRepoInfo(repoInfo) };
}, 'Failed to fetch repository info'));

app.get('/repo-info/:owner/:repo', repoHandler(async (owner, repo) => {
  const repoInfo = await fetchRepoInfo(owner, repo);
  return { repo: summarizeRepoInfo(repoInfo) };
}, 'Failed to fetch repository info'));

app.get('/repo', repoHandler(async (owner, repo) => {
  const repoInfo = await fetchRepoInfo(owner, repo);
  return summarizeRepoInfo(repoInfo);
}, 'Failed to fetch repository info'));

app.get('/repo/:owner/:repo', repoHandler(async (owner, repo) => {
  const repoInfo = await fetchRepoInfo(owner, repo);
  return summarizeRepoInfo(repoInfo);
}, 'Failed to fetch repository info'));

app.get('/contributors', repoHandler(async (owner, repo) => {
  const contributors = await fetchContributors(owner, repo);
  return { contributors: summarizeContributors(contributors) };
}, 'Failed to fetch contributors'));

app.get('/contributors/:owner/:repo', repoHandler(async (owner, repo) => {
  const contributors = await fetchContributors(owner, repo);
  return { contributors: summarizeContributors(contributors) };
}, 'Failed to fetch contributors'));

app.get('/contributors-analysis', repoHandler(async (owner, repo) => {
  const contributors = await fetchContributors(owner, repo);
  return buildContributorAnalysis(contributors);
}, 'Failed to analyze contributors'));

app.get('/contributors-analysis/:owner/:repo', repoHandler(async (owner, repo) => {
  const contributors = await fetchContributors(owner, repo);
  return buildContributorAnalysis(contributors);
}, 'Failed to analyze contributors'));

app.get('/commits', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return { commits: summarizeCommits(commits) };
}, 'Failed to fetch commits'));

app.get('/commits/:owner/:repo', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return { commits: summarizeCommits(commits) };
}, 'Failed to fetch commits'));

app.get('/commit-frequency', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return { frequency: buildCommitFrequency(commits) };
}, 'Failed to calculate commit frequency'));

app.get('/commit-quality', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return buildCommitQuality(commits);
}, 'Failed to analyze commit quality'));

app.get('/burst-activity', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return buildBurstActivity(commits);
}, 'Failed to analyze burst activity'));

app.get('/repo-health', repoHandler(async (owner, repo) => {
  const data = await loadRepoAdvanced(owner, repo);
  return buildRepoHealth({
    repo: data.repoInfo,
    contributors: data.contributors,
    commits: data.commits,
    issues: data.issues,
    commitDetails: data.commitDetails,
  });
}, 'Failed to calculate repository health'));

app.get('/issues', repoHandler(async (owner, repo) => {
  const issues = await fetchIssues(owner, repo, 'open');
  return buildIssuesTracker(issues);
}, 'Failed to fetch issues'));

app.get('/leaderboard', repoHandler(async (owner, repo) => {
  const contributors = await fetchContributors(owner, repo);
  return buildLeaderboard(contributors);
}, 'Failed to generate leaderboard'));

app.get('/inactive-contributors', repoHandler(async (owner, repo) => {
  const [contributors, commits] = await Promise.all([
    fetchContributors(owner, repo),
    fetchCommits(owner, repo),
  ]);
  return { inactive_contributors: buildInactiveContributors(contributors, commits, 7) };
}, 'Failed to detect inactive contributors'));

app.get('/contribution-distribution', repoHandler(async (owner, repo) => {
  const contributors = await fetchContributors(owner, repo);
  return buildContributionDistribution(contributors);
}, 'Failed to calculate contribution distribution'));

app.get('/weekly-report', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return { weekly_report: buildWeeklyReport(commits) };
}, 'Failed to create weekly report'));

app.get('/file-activity', repoHandler(async (owner, repo) => {
  const data = await loadRepoAdvanced(owner, repo);
  return { file_activity: buildFileActivity(data.commitDetails) };
}, 'Failed to analyze file activity'));

app.get('/pull-requests', repoHandler(async (owner, repo) => {
  const pullRequests = await fetchPullRequests(owner, repo);
  return buildPullRequests(pullRequests);
}, 'Failed to fetch pull requests'));

app.get('/issue-resolution', repoHandler(async (owner, repo) => {
  const issues = await fetchIssues(owner, repo, 'closed');
  return buildIssueResolution(issues.filter((issue) => !issue.pull_request));
}, 'Failed to calculate issue resolution time'));

app.get('/code-churn', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  const commitDetails = await fetchCommitDetails(owner, repo, commits, 20);
  return buildCodeChurn(commitDetails);
}, 'Failed to calculate code churn'));

app.get('/consistency-score', repoHandler(async (owner, repo) => {
  const [contributors, commits] = await Promise.all([
    fetchContributors(owner, repo),
    fetchCommits(owner, repo),
  ]);
  return { consistency_score: buildContributorConsistency(contributors, commits) };
}, 'Failed to calculate consistency score'));

app.get('/peak-time', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return buildPeakTime(commits);
}, 'Failed to calculate peak activity time'));

app.get('/module-ownership', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  const commitDetails = await fetchCommitDetails(owner, repo, commits, 20);
  return { module_ownership: buildModuleOwnership(commitDetails) };
}, 'Failed to calculate module ownership'));

app.get('/new-contributors', repoHandler(async (owner, repo) => {
  const [contributors, commits] = await Promise.all([
    fetchContributors(owner, repo),
    fetchCommits(owner, repo),
  ]);
  return { new_contributors: buildNewContributors(contributors, commits, 30) };
}, 'Failed to detect new contributors'));

app.get('/trend', repoHandler(async (owner, repo) => {
  const commits = await fetchCommits(owner, repo);
  return buildTrend(commits);
}, 'Failed to calculate contribution trend'));

app.get('/issue-commit-link', repoHandler(async (owner, repo) => {
  const [issues, commits] = await Promise.all([
    fetchIssues(owner, repo, 'all'),
    fetchCommits(owner, repo),
  ]);
  return { links: buildIssueCommitLinks(issues.filter((issue) => !issue.pull_request), commits) };
}, 'Failed to link issues and commits'));

app.get('/risk-analysis', repoHandler(async (owner, repo) => {
  const [contributors, commits, issues] = await Promise.all([
    fetchContributors(owner, repo),
    fetchCommits(owner, repo),
    fetchIssues(owner, repo, 'all'),
  ]);
  return buildRiskAnalysis({
    contributors,
    commits,
    issues,
  });
}, 'Failed to calculate risk analysis'));

app.get('/productivity', repoHandler(async (owner, repo) => {
  const [contributors, commits] = await Promise.all([
    fetchContributors(owner, repo),
    fetchCommits(owner, repo),
  ]);
  return { productivity: buildProductivity(contributors, commits) };
}, 'Failed to calculate productivity'));

app.get('/dashboard/:owner/:repo', repoHandler(async (owner, repo) => {
  const data = await loadRepoAdvanced(owner, repo);
  return {
    repo: summarizeRepoInfo(data.repoInfo),
    contributors: summarizeContributors(data.contributors),
    commits: summarizeCommits(data.commits),
    repo_health: buildRepoHealth({
      repo: data.repoInfo,
      contributors: data.contributors,
      commits: data.commits,
      issues: data.issues,
      commitDetails: data.commitDetails,
    }),
  };
}, 'Failed to fetch dashboard data'));

app.get('/user/:username', userHandler(async (username) => {
  const user = await fetchUserProfile(username);
  return user;
}, 'Failed to fetch user profile'));

app.get('/user/:username/repos', userHandler(async (username) => {
  const repositories = await fetchUserRepos(username);
  return { repositories };
}, 'Failed to fetch user repositories'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
