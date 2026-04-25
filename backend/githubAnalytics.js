require('dotenv').config();
const axios = require('axios');

const GITHUB_API = process.env.GITHUB_API || 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const DEFAULT_OWNER = 'facebook';
const DEFAULT_REPO = 'react';
const CACHE_TTL_MS = 5 * 60 * 1000;
const githubCache = new Map();

const githubClient = axios.create({
  baseURL: GITHUB_API,
  headers: {
    Accept: 'application/vnd.github+json',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
});

const hasGithubToken = Boolean(GITHUB_TOKEN);

const requestConfig = (params = {}) => ({
  params: {
    per_page: 30,
    ...params,
  },
});

const isRepoPart = (value) => /^[A-Za-z0-9._-]+$/.test(value);
const isUsername = (value) => /^[A-Za-z0-9-]+$/.test(value);

const normalizeGitHubInput = (value) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return { kind: 'repo', owner: DEFAULT_OWNER, repo: DEFAULT_REPO };
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
  const withoutWww = withoutProtocol.replace(/^www\./i, '');
  const githubPath = withoutWww.replace(/^github\.com\//i, '');
  const cleaned = githubPath.replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);

  if (parts.length >= 2) {
    return { kind: 'repo', owner: parts[0], repo: parts[1] };
  }

  if (parts.length === 1) {
    return { kind: 'user', username: parts[0] };
  }

  return { kind: 'repo', owner: DEFAULT_OWNER, repo: DEFAULT_REPO };
};

const ensureRepoInput = (owner, repo) => {
  if (!owner || !repo) {
    throw new Error('Both owner and repo are required');
  }

  if (!isRepoPart(owner) || !isRepoPart(repo)) {
    throw new Error('Invalid owner/repo format');
  }

  return { owner, repo };
};

const ensureUserInput = (username) => {
  if (!username) {
    throw new Error('Username is required');
  }

  if (!isUsername(username)) {
    throw new Error('Invalid GitHub username format');
  }

  return username;
};

const githubGet = async (path, params = {}) => {
  const cacheKey = `${path}?${JSON.stringify(params)}`;
  const cached = githubCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const response = await githubClient.get(path, requestConfig(params));

    githubCache.set(cacheKey, {
      data: response.data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return response.data;

  } catch (error) {
    const status = error.response?.status;

    console.error(
      "GitHub API Error:",
      status,
      error.response?.data || error.message
    );
  
    if (status === 403 && cached) {
      console.warn("⚠️ Rate limited. Using cached data.");
      return cached.data;
    }

    if (status === 403) {
      throw new Error("GitHub rate limit exceeded. Add token or wait.");
    }

    if (status === 404) {
      throw new Error("Repository not found");
    }

    throw error;
  }
};

const fetchRateLimit = async () => githubGet('/rate_limit', {});

const fetchRepoInfo = async (owner, repo) => githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);

const fetchContributors = async (owner, repo) => githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`, { per_page: 100 });

const fetchCommits = async (owner, repo) => githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`, { per_page: 100 });

const fetchIssues = async (owner, repo, state = 'open') => githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`, { state, per_page: 100 });

const fetchPullRequests = async (owner, repo) => githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, { state: 'all', per_page: 100 });

const fetchUserProfile = async (username) => githubGet(`/users/${encodeURIComponent(username)}`);

const fetchUserRepos = async (username) => githubGet(`/users/${encodeURIComponent(username)}/repos`, { sort: 'updated', per_page: 6 });

const fetchCommitDetails = async (owner, repo, commits, limit = 10) => {
  const targetCommits = commits.slice(0, limit);
  const settled = await Promise.allSettled(
    targetCommits.map((commit) => githubGet(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${commit.sha}`)),
  );

  return settled
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
};

const summarizeRepoInfo = (repo) => ({
  name: repo.name,
  full_name: repo.full_name,
  description: repo.description,
  stars: repo.stargazers_count,
  forks: repo.forks_count,
  open_issues: repo.open_issues_count,
  language: repo.language,
  url: repo.html_url,
  owner: repo.owner?.login,
  updated_at: repo.updated_at,
  pushed_at: repo.pushed_at,
  watchers: repo.watchers_count,
});

const summarizeContributors = (contributors) => contributors.map((contributor) => ({
  login: contributor.login,
  contributions: contributor.contributions,
  avatar_url: contributor.avatar_url,
  html_url: contributor.html_url,
}));

const summarizeCommits = (commits) => commits.map((commit) => ({
  sha: commit.sha,
  message: commit.commit?.message?.split('\n')[0] || 'No message',
  author: commit.commit?.author?.name || commit.author?.login || 'Unknown',
  author_login: commit.author?.login || null,
  date: commit.commit?.author?.date || null,
  url: commit.html_url,
}));

const groupBy = (items, keyFactory) => items.reduce((acc, item) => {
  const key = keyFactory(item);
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const toDateKey = (value) => new Date(value).toISOString().slice(0, 10);
const toHourKey = (value) => `${String(new Date(value).getHours()).padStart(2, '0')}:00`;
const toWeekKey = (value) => {
  const date = new Date(value);
  const day = date.getUTCDay() || 7;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - day + 1);
  return start.toISOString().slice(0, 10);
};

const buildContributorActivityMap = (contributors, commits) => {
  const lastCommitByLogin = new Map();
  const firstCommitByLogin = new Map();
  const commitCountByLogin = new Map();
  const activeDaysByLogin = new Map();

  commits.forEach((commit) => {
    const login = commit.author?.login || commit.commit?.author?.name || 'unknown';
    const dateValue = commit.commit?.author?.date;
    if (!dateValue) {
      return;
    }

    const date = new Date(dateValue);
    const currentLast = lastCommitByLogin.get(login);
    if (!currentLast || date > currentLast) {
      lastCommitByLogin.set(login, date);
    }

    const currentFirst = firstCommitByLogin.get(login);
    if (!currentFirst || date < currentFirst) {
      firstCommitByLogin.set(login, date);
    }

    commitCountByLogin.set(login, (commitCountByLogin.get(login) || 0) + 1);
    const activeDayKey = toDateKey(dateValue);
    const activeDays = activeDaysByLogin.get(login) || new Set();
    activeDays.add(activeDayKey);
    activeDaysByLogin.set(login, activeDays);
  });

  return contributors.map((contributor) => {
    const lastCommit = lastCommitByLogin.get(contributor.login) || null;
    const firstCommit = firstCommitByLogin.get(contributor.login) || null;
    const commitCount = commitCountByLogin.get(contributor.login) || 0;
    const activeDays = activeDaysByLogin.get(contributor.login)?.size || 0;

    return {
      login: contributor.login,
      contributions: contributor.contributions,
      last_commit_at: lastCommit ? lastCommit.toISOString() : null,
      first_commit_at: firstCommit ? firstCommit.toISOString() : null,
      commit_count: commitCount,
      active_days: activeDays,
      status: commitCount > 5 ? 'active' : 'inactive',
    };
  });
};

const buildCommitFrequency = (commits) => groupBy(commits.filter((commit) => commit.commit?.author?.date), (commit) => toDateKey(commit.commit.author.date));

const buildWeeklyReport = (commits) => groupBy(commits.filter((commit) => commit.commit?.author?.date), (commit) => toWeekKey(commit.commit.author.date));

const buildPeakTime = (commits) => {
  const byHour = groupBy(commits.filter((commit) => commit.commit?.author?.date), (commit) => toHourKey(commit.commit.author.date));
  const peakHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0] || ['00:00', 0];
  return {
    peak_hour: peakHour[0],
    peak_count: peakHour[1],
    hourly_distribution: byHour,
  };
};

const buildContributionDistribution = (contributors) => {
  const total = contributors.reduce((sum, contributor) => sum + (contributor.contributions || 0), 0) || 1;
  const distribution = contributors.map((contributor) => ({
    login: contributor.login,
    contributions: contributor.contributions,
    percentage: Number(((contributor.contributions / total) * 100).toFixed(2)),
  }));
  const dominant = distribution.find((item) => item.percentage > 70) || null;

  return {
    total_contributions: total,
    distribution,
    dominant_contributor: dominant,
    balanced: !dominant,
  };
};

const buildCommitQuality = (commits) => {
  const genericMessages = new Set(['update', 'fix', 'test', 'changes', 'misc', 'wip', 'debug', 'docs']);
  const lowQuality = commits
    .filter((commit) => commit.commit?.message)
    .filter((commit) => {
      const message = commit.commit.message.split('\n')[0].trim();
      const normalized = message.toLowerCase();
      return message.length < 10 || genericMessages.has(normalized);
    })
    .map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message.split('\n')[0],
      author: commit.commit.author?.name || commit.author?.login || 'Unknown',
    }));

  return {
    total_commits_checked: commits.length,
    low_quality_commits: lowQuality,
    low_quality_count: lowQuality.length,
  };
};

const buildBurstActivity = (commits, threshold = 5, windowHours = 6) => {
  const timestamps = commits
    .map((commit) => commit.commit?.author?.date)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .sort((a, b) => a - b);

  let maxBurst = 0;
  let startIndex = 0;

  for (let endIndex = 0; endIndex < timestamps.length; endIndex += 1) {
    while (timestamps[endIndex] - timestamps[startIndex] > windowHours * 60 * 60 * 1000) {
      startIndex += 1;
    }

    maxBurst = Math.max(maxBurst, endIndex - startIndex + 1);
  }

  return {
    threshold,
    window_hours: windowHours,
    max_commits_in_window: maxBurst,
    burst_activity: maxBurst >= threshold,
  };
};

const buildInactiveContributors = (contributors, commits, days = 7) => {
  const map = buildContributorActivityMap(contributors, commits);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return map.filter((item) => {
    if (!item.last_commit_at) {
      return true;
    }
    return new Date(item.last_commit_at).getTime() < cutoff;
  }).map((item) => ({
    login: item.login,
    last_commit_at: item.last_commit_at,
    contributions: item.contributions,
    status: 'inactive',
  }));
};

const buildNewContributors = (contributors, commits, days = 30) => {
  const map = buildContributorActivityMap(contributors, commits);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return map
    .filter((item) => item.first_commit_at && new Date(item.first_commit_at).getTime() >= cutoff)
    .map((item) => ({
      login: item.login,
      first_commit_at: item.first_commit_at,
      contributions: item.contributions,
    }));
};

const buildTrend = (commits) => {
  const timestamps = commits
    .map((commit) => commit.commit?.author?.date)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .sort((a, b) => a - b);

  if (timestamps.length === 0) {
    return { trend: 'flat', recent_count: 0, previous_count: 0 };
  }

  const latest = timestamps[timestamps.length - 1];
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recentStart = latest - sevenDays;
  const previousStart = latest - 2 * sevenDays;

  const recentCount = timestamps.filter((timestamp) => timestamp > recentStart).length;
  const previousCount = timestamps.filter((timestamp) => timestamp <= recentStart && timestamp > previousStart).length;

  let trend = 'flat';
  if (recentCount > previousCount) trend = 'increasing';
  if (recentCount < previousCount) trend = 'decreasing';

  return { trend, recent_count: recentCount, previous_count: previousCount };
};

const buildIssueCommitLinks = (issues, commits) => {
  const issueLookup = new Map();
  issues.forEach((issue) => {
    if (issue.number) {
      issueLookup.set(issue.number, issue);
    }
  });

  const links = [];
  commits.forEach((commit) => {
    const message = commit.commit?.message || '';
    const matches = [...message.matchAll(/#(\d+)/g)];
    matches.forEach((match) => {
      const issueNumber = Number(match[1]);
      const issue = issueLookup.get(issueNumber);
      if (issue) {
        links.push({
          commit_sha: commit.sha,
          commit_message: message.split('\n')[0],
          issue_number: issueNumber,
          issue_title: issue.title,
        });
      }
    });
  });

  return links;
};

const buildFileActivity = (commitDetails) => {
  const fileCount = new Map();
  commitDetails.forEach((detail) => {
    (detail.files || []).forEach((file) => {
      fileCount.set(file.filename, (fileCount.get(file.filename) || 0) + 1);
    });
  });

  return [...fileCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([filename, count]) => ({ filename, count }));
};

const buildModuleOwnership = (commitDetails) => {
  const ownership = new Map();

  commitDetails.forEach((detail) => {
    const owner = detail.author?.login || detail.commit?.author?.name || 'unknown';
    const files = detail.files || [];
    if (!ownership.has(owner)) {
      ownership.set(owner, new Map());
    }
    const fileMap = ownership.get(owner);
    files.forEach((file) => {
      fileMap.set(file.filename, (fileMap.get(file.filename) || 0) + 1);
    });
  });

  return [...ownership.entries()].map(([owner, fileMap]) => ({
    contributor: owner,
    files: [...fileMap.entries()].sort((a, b) => b[1] - a[1]).map(([filename, count]) => ({ filename, count })),
  }));
};

const buildCodeChurn = (commitDetails) => {
  return commitDetails.reduce((acc, detail) => {
    acc.additions += detail.stats?.additions || 0;
    acc.deletions += detail.stats?.deletions || 0;
    return acc;
  }, { additions: 0, deletions: 0 });
};

const buildIssueResolution = (issues) => {
  const closedIssues = issues.filter((issue) => issue.closed_at && issue.created_at);
  const totalHours = closedIssues.reduce((sum, issue) => {
    const created = new Date(issue.created_at).getTime();
    const closed = new Date(issue.closed_at).getTime();
    return sum + Math.max(0, closed - created) / (60 * 60 * 1000);
  }, 0);

  return {
    average_resolution_hours: closedIssues.length ? Number((totalHours / closedIssues.length).toFixed(2)) : 0,
    closed_issues: closedIssues.length,
  };
};

const buildContributorConsistency = (contributors, commits) => {
  const map = buildContributorActivityMap(contributors, commits);
  const maxActiveDays = Math.max(...map.map((item) => item.active_days), 1);

  return map.map((item) => ({
    login: item.login,
    commit_count: item.commit_count,
    active_days: item.active_days,
    consistency_score: Number(((item.active_days / maxActiveDays) * 100).toFixed(2)),
  }));
};

const buildProductivity = (contributors, commits) => {
  const consistency = buildContributorConsistency(contributors, commits);
  const maxCommits = Math.max(...contributors.map((contributor) => contributor.contributions || 0), 1);

  return consistency.map((item) => {
    const contributor = contributors.find((entry) => entry.login === item.login) || { contributions: 0 };
    const commitScore = (contributor.contributions / maxCommits) * 50;
    const consistencyScore = (item.consistency_score / 100) * 30;
    const recencyScore = item.active_days > 0 ? 20 : 0;

    return {
      login: item.login,
      score: Number((commitScore + consistencyScore + recencyScore).toFixed(2)),
      commit_count: contributor.contributions || 0,
      active_days: item.active_days,
      consistency_score: item.consistency_score,
    };
  }).sort((a, b) => b.score - a.score);
};

const buildRepoHealth = ({ repo, contributors, commits, issues, commitDetails }) => {
  const contributorCount = contributors.length;
  const recentDays = new Set(commits
    .map((commit) => commit.commit?.author?.date)
    .filter(Boolean)
    .map((date) => toDateKey(date)));
  const frequencyScore = Math.min(30, recentDays.size * 5);
  const contributorScore = Math.min(30, contributorCount * 6);
  const consistencyScore = buildContributorConsistency(contributors, commits).reduce((sum, item) => sum + (item.consistency_score / 10), 0);
  const issuePenalty = Math.min(15, Math.max(0, issues.filter((issue) => !issue.pull_request).length / 2));
  const churn = buildCodeChurn(commitDetails);
  const churnPenalty = churn.additions + churn.deletions > 5000 ? 10 : 0;
  const burst = buildBurstActivity(commits);
  const burstPenalty = burst.burst_activity ? 10 : 0;
  const raw = contributorScore + frequencyScore + Math.min(25, consistencyScore) - issuePenalty - churnPenalty - burstPenalty;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    score,
    breakdown: {
      contributor_score: contributorScore,
      frequency_score: frequencyScore,
      consistency_score: Math.min(25, Math.round(consistencyScore)),
      issue_penalty: issuePenalty,
      churn_penalty: churnPenalty,
      burst_penalty: burstPenalty,
    },
    signals: {
      open_issues: issues.filter((issue) => !issue.pull_request).length,
      contributor_count: contributorCount,
      active_days: recentDays.size,
      burst_activity: burst.burst_activity,
      additions: churn.additions,
      deletions: churn.deletions,
    },
    repo: summarizeRepoInfo(repo),
  };
};

const buildRiskAnalysis = ({ contributors, commits, issues }) => {
  const risks = [];
  const contributorCount = contributors.length;
  const inactive = buildInactiveContributors(contributors, commits, 7);
  const burst = buildBurstActivity(commits);
  const trend = buildTrend(commits);
  const openIssues = issues.filter((issue) => !issue.pull_request).length;

  if (contributorCount < 3) {
    risks.push({ level: 'medium', message: 'Low contributor count' });
  }

  if (inactive.length > contributorCount / 2) {
    risks.push({ level: 'high', message: 'Most contributors are inactive' });
  }

  if (burst.burst_activity) {
    risks.push({ level: 'medium', message: 'Burst commit activity detected' });
  }

  if (trend.trend === 'decreasing') {
    risks.push({ level: 'medium', message: 'Commit activity is declining' });
  }

  if (openIssues > 20) {
    risks.push({ level: 'medium', message: 'Issue backlog is high' });
  }

  return {
    risks,
    severity: risks.some((risk) => risk.level === 'high') ? 'high' : risks.length ? 'medium' : 'low',
  };
};

const buildContributorAnalysis = (contributors) => ({
  contributors: contributors.map((contributor) => ({
    login: contributor.login,
    contributions: contributor.contributions,
    status: contributor.contributions > 5 ? 'active' : 'inactive',
  })),
});

const buildLeaderboard = (contributors) => ({
  top_contributors: contributors
    .slice()
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 5)
    .map((contributor) => ({
      login: contributor.login,
      contributions: contributor.contributions,
    })),
});

const buildIssuesTracker = (issues) => ({
  issues: issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      title: issue.title,
      creator: issue.user?.login || 'unknown',
      status: issue.state,
    })),
});

const buildPullRequests = (pullRequests) => ({
  pull_requests: pullRequests.map((pullRequest) => ({
    title: pullRequest.title,
    author: pullRequest.user?.login || 'unknown',
    status: pullRequest.state,
    merged: Boolean(pullRequest.merged_at),
  })),
});

const buildContributorMetrics = (contributors, commits) => {
  const consistency = buildContributorConsistency(contributors, commits);
  const productivty = buildProductivity(contributors, commits);
  const inactive = buildInactiveContributors(contributors, commits, 7);
  const newContributors = buildNewContributors(contributors, commits, 30);

  return {
    consistency,
    productivity: productivty,
    inactive,
    newContributors,
  };
};

module.exports = {
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
  fetchCommitDetails,
  summarizeRepoInfo,
  summarizeContributors,
  summarizeCommits,
  buildContributorActivityMap,
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
  buildContributorMetrics,
  fetchRateLimit,
  hasGithubToken,
};