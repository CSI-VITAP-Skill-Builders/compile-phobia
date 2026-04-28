import { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const FEATURE_ENDPOINTS = [
  { key: "repo-info", label: "Repo Info" },
  { key: "contributors", label: "Contributors" },
  { key: "contributors-analysis", label: "Contributors Analysis" },
  { key: "commits", label: "Commit History" },
  { key: "commit-frequency", label: "Commit Frequency" },
  { key: "commit-quality", label: "Commit Quality" },
  { key: "burst-activity", label: "Burst Activity" },
  { key: "repo-health", label: "Repo Health" },
  { key: "issues", label: "Open Issues" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "inactive-contributors", label: "Inactive Contributors" },
  { key: "contribution-distribution", label: "Contribution Distribution" },
  { key: "weekly-report", label: "Weekly Report" },
  { key: "file-activity", label: "File Activity" },
  { key: "pull-requests", label: "Pull Requests" },
  { key: "issue-resolution", label: "Issue Resolution" },
  { key: "code-churn", label: "Code Churn" },
  { key: "consistency-score", label: "Consistency Score" },
  { key: "peak-time", label: "Peak Time" },
  { key: "module-ownership", label: "Module Ownership" },
  { key: "new-contributors", label: "New Contributors" },
  { key: "trend", label: "Trend" },
  { key: "issue-commit-link", label: "Issue-Commit Link" },
  { key: "risk-analysis", label: "Risk Analysis" },
  { key: "productivity", label: "Productivity" },
];

const parseInput = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { kind: "repo", query: "facebook/react" };
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const withoutWww = withoutProtocol.replace(/^www\./i, "");
  const githubPath = withoutWww.replace(/^github\.com\//i, "");
  const cleaned = githubPath.replace(/\/+$/, "");
  const parts = cleaned.split("/").filter(Boolean);

  if (parts.length >= 2) {
    return { kind: "repo", query: `${parts[0]}/${parts[1]}` };
  }

  if (parts.length === 1) {
    return { kind: "user", query: parts[0] };
  }

  return { kind: "repo", query: "facebook/react" };
};

const formatDate = (date) => {
  if (!date) return "Unknown";
  return new Date(date).toLocaleString();
};

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

function SkeletonLoader() {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  );
}

function RepoComparison({ repo1, repo2 }) {
  if (!repo1 || !repo2) return null;

  const metrics = [
    { label: "Stars", key: "stargazers_count" },
    { label: "Forks", key: "forks_count" },
    { label: "Issues", key: "open_issues_count" },
    { label: "Watchers", key: "watchers_count" },
  ];

  return (
    <section className="card card-full">
      <h3>🔄 Repository Comparison</h3>
      <div className="comparison-grid">
        {metrics.map((metric) => (
          <div key={metric.key} className="metric-row">
            <span className="metric-label">{metric.label}</span>
            <div className="metric-compare">
              <div className="metric-item">
                <strong>{repo1.name}</strong>
                <span className="metric-value">{repo1[metric.key] || 0}</span>
              </div>
              <div className="metric-item">
                <strong>{repo2.name}</strong>
                <span className="metric-value">{repo2[metric.key] || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CodeQualityScorecard({ repoData, featureData }) {
  if (!repoData || !featureData) return null;

  const calculateScore = () => {
    let score = 50;
    if (repoData.stargazers_count > 100) score += 10;
    if (repoData.forks_count > 50) score += 10;
    if (repoData.open_issues_count < 20) score += 10;
    if (repoData.watchers_count > 50) score += 10;
    if (repoData.description) score += 10;
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const getScoreColor = (s) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <section className="card quality-card">
      <h3>✨ Code Quality Scorecard</h3>
      <div className="quality-score-container">
        <div className="score-circle" style={{ borderColor: getScoreColor(score) }}>
          <div className="score-number">{score}</div>
          <div className="score-label">{getScoreLabel(score)}</div>
        </div>
        <ul className="quality-metrics">
          <li>✓ <strong>Activity:</strong> {repoData.pushed_at ? "Recent" : "Stale"}</li>
          <li>✓ <strong>Popularity:</strong> {repoData.stargazers_count} stars</li>
          <li>✓ <strong>Community:</strong> {repoData.forks_count} forks</li>
          <li>✓ <strong>Maintenance:</strong> {repoData.open_issues_count} open issues</li>
        </ul>
      </div>
    </section>
  );
}

function LanguageDistribution({ repoData }) {
  if (!repoData || !repoData.language) {
    return (
      <section className="card">
        <h3>📊 Language</h3>
        <p className="muted">{repoData?.language || "Not specified"}</p>
      </section>
    );
  }

  const languages = [
    { name: repoData.language, percentage: 85 },
    { name: "Other", percentage: 15 },
  ];

  const chartData = {
    labels: languages.map((l) => l.name),
    datasets: [
      {
        data: languages.map((l) => l.percentage),
        backgroundColor: ["#0f766e", "#e0f2fe", "#fef3c7"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <section className="card">
      <h3>📊 Primary Language</h3>
      <div className="chart-container" style={{ width: "100%", height: "200px" }}>
        <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      <p className="muted" style={{ marginTop: "10px" }}>Main: {repoData.language}</p>
    </section>
  );
}

function SmartRecommendations({ repoData, contributors }) {
  if (!repoData) return null;

  const recommendations = [];

  if (repoData.open_issues_count > 50) {
    recommendations.push({
      type: "warning",
      icon: "⚠️",
      title: "High Issue Count",
      desc: `${repoData.open_issues_count} open issues. Consider triaging or community help.`,
    });
  }

  if (repoData.stargazers_count > 10000) {
    recommendations.push({
      type: "success",
      icon: "🌟",
      title: "Highly Popular",
      desc: `${formatNumber(repoData.stargazers_count)} stars! This is a well-established project.`,
    });
  }

  if (!repoData.description) {
    recommendations.push({
      type: "info",
      icon: "📝",
      title: "Add Description",
      desc: "Repository is missing a description. Add one to improve discoverability.",
    });
  }

  if (contributors && contributors.length > 0) {
    recommendations.push({
      type: "success",
      icon: "👥",
      title: "Active Community",
      desc: `${contributors.length}+ contributors. Great community engagement!`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      icon: "✅",
      title: "All Good",
      desc: "This repository follows best practices!",
    });
  }

  return (
    <section className="card card-full">
      <h3>💡 Smart Insights & Recommendations</h3>
      <div className="recommendations-grid">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`recommendation-item rec-${rec.type}`}>
            <span className="rec-icon">{rec.icon}</span>
            <div className="rec-content">
              <strong>{rec.title}</strong>
              <p>{rec.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContributorTimeline({ contributors }) {
  if (!contributors || contributors.length === 0) {
    return <p className="muted">No contributors found.</p>;
  }

  const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions).slice(0, 10);

  const chartData = {
    labels: sortedContributors.map((c) => c.login || "Unknown"),
    datasets: [
      {
        label: "Contributions",
        data: sortedContributors.map((c) => c.contributions),
        backgroundColor: "#0f766e",
        borderRadius: 6,
      },
    ],
  };

  return (
    <section className="card card-full">
      <h3>📈 Top Contributors</h3>
      <div className="chart-container" style={{ width: "100%", height: "300px" }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: "y" }} />
      </div>
    </section>
  );
}


function App() {
  const [repoInput, setRepoInput] = useState("facebook/react");
  const [resultType, setResultType] = useState("repo");
  const [repoData, setRepoData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [commits, setCommits] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("repo-health");
  const [featureData, setFeatureData] = useState(null);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compareRepo, setCompareRepo] = useState("");
  const [compareRepoData, setCompareRepoData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const parsedInput = parseInput(repoInput);

  const fetchFeature = async (featureKey, inputValue, kind) => {
    if (kind !== "repo") {
      return;
    }

    setFeatureLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${featureKey}`, {
        params: { input: inputValue },
      });
      setFeatureData(response.data);
      setSelectedFeature(featureKey);
    } catch (err) {
      setFeatureData({ error: err?.response?.data?.error || err.message || "Failed to fetch feature" });
    } finally {
      setFeatureLoading(false);
    }
  };

  const fetchCompareRepo = async (e) => {
    e.preventDefault();
    if (!compareRepo.trim()) return;

    try {
      const parsed = parseInput(compareRepo);
      const response = await axios.get(`${API_BASE_URL}/resolve`, {
        params: { input: parsed.query },
      });

      if (response.data.type === "repo") {
        setCompareRepoData(response.data.repo);
        setShowComparison(true);
      }
    } catch (err) {
      console.error("Failed to fetch compare repo:", err);
    }
  };

  const fetchDashboard = async () => {
    setError("");
    setLoading(true);

    try {
      const parsed = parseInput(repoInput);
      const response = await axios.get(`${API_BASE_URL}/resolve`, {
        params: { input: parsed.query },
      });

      if (response.data.type === "repo") {
        setResultType("repo");
        setRepoData(response.data.repo);
        setUserData(null);
        setContributors((response.data.contributors || []).slice(0, 20));
        setCommits((response.data.commits || []).slice(0, 5));
        setRepositories([]);
        setShowComparison(false);
        setCompareRepoData(null);
        await fetchFeature(selectedFeature, parsed.query, "repo");
      } else {
        setResultType("user");
        setUserData(response.data.user);
        setRepoData(null);
        setContributors([]);
        setCommits([]);
        setRepositories((response.data.repositories || []).slice(0, 6));
        setFeatureData(null);
        setShowComparison(false);
      }
    } catch (err) {
      setRepoData(null);
      setUserData(null);
      setContributors([]);
      setCommits([]);
      setRepositories([]);
      setError(err?.response?.data?.error || err.message || "Failed to fetch repository");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    fetchDashboard();
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <p className="kicker">🚀 Compile Phobia</p>
        <h1>GitHub Intelligence Dashboard</h1>
        <p className="subtitle">
          Advanced analytics for GitHub repositories. Analyze trends, contributions, code quality, and more.
        </p>
        <form className="search-bar" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="https://github.com/Sathvik2005 or facebook/react"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            aria-label="Repository input"
          />
          <button type="submit" disabled={loading}>
            {loading ? "📊 Analyzing..." : "🔍 Analyze"}
          </button>
        </form>
        {error && <p className="error-text">⚠️ {error}</p>}
      </header>

      {repoData && resultType === "repo" && (
        <main className="layout-shell">
          <section className="card card-primary card-hero">
            <div className="repo-header">
              <div>
                <h2>{repoData.full_name}</h2>
                <p className="muted">{repoData.description || "No description available."}</p>
              </div>
              <a className="repo-link-button" href={repoData.html_url} target="_blank" rel="noreferrer">
                ⭐ View on GitHub
              </a>
            </div>
            <div className="stats">
              <article>
                <span>⭐ Stars</span>
                <strong>{formatNumber(repoData.stargazers_count)}</strong>
              </article>
              <article>
                <span>🍴 Forks</span>
                <strong>{formatNumber(repoData.forks_count)}</strong>
              </article>
              <article>
                <span>📋 Issues</span>
                <strong>{formatNumber(repoData.open_issues_count)}</strong>
              </article>
              <article>
                <span>💻 Language</span>
                <strong>{repoData.language || "N/A"}</strong>
              </article>
            </div>
          </section>

          <CodeQualityScorecard repoData={repoData} featureData={featureData} />
          <LanguageDistribution repoData={repoData} />

          <SmartRecommendations repoData={repoData} contributors={contributors} />

          <ContributorTimeline contributors={contributors} />

          {showComparison && compareRepoData && (
            <RepoComparison repo1={repoData} repo2={compareRepoData} />
          )}

          {!showComparison && (
            <section className="card card-full">
              <h3>🔄 Compare with Another Repo</h3>
              <form className="comparison-form" onSubmit={fetchCompareRepo}>
                <input
                  type="text"
                  placeholder="Enter repo to compare (e.g., torvalds/linux)"
                  value={compareRepo}
                  onChange={(e) => setCompareRepo(e.target.value)}
                />
                <button type="submit">Compare</button>
              </form>
            </section>
          )}

          <section className="card card-full">
            <h3>🔬 Feature Explorer</h3>
            <p className="muted">Select any analytics endpoint to inspect detailed data.</p>
            <div className="feature-grid">
              {FEATURE_ENDPOINTS.map((feature) => (
                <button
                  key={feature.key}
                  type="button"
                  className={selectedFeature === feature.key ? "feature-button active" : "feature-button"}
                  onClick={() => fetchFeature(feature.key, parsedInput.query, parsedInput.kind)}
                  disabled={featureLoading || parsedInput.kind !== "repo"}
                >
                  {feature.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card card-full">


  {featureLoading && <SkeletonLoader />}

  {!featureLoading && selectedFeature === "repo-health" && featureData && !featureData.error && (
    <div>
      <h3>📊 Repository Health Dashboard</h3>

      {/* 🔢 TOP STATS */}
      <div className="stats">
        <article>
          <span>💯 Score</span>
          <strong>{featureData.score}</strong>
        </article>
        <article>
          <span>👥 Contributors</span>
          <strong>{featureData.signals.contributor_count}</strong>
        </article>
        <article>
          <span>⚠️ Issues</span>
          <strong>{featureData.signals.open_issues}</strong>
        </article>
        <article>
          <span>📅 Active Days</span>
          <strong>{featureData.signals.active_days}</strong>
        </article>
      </div>

      {/* 📊 BAR CHART */}
      <div className="chart-container" style={{ height: "300px" }}>
        <Bar
          data={{
            labels: Object.keys(featureData.breakdown),
            datasets: [
              {
                label: "Health Metrics",
                data: Object.values(featureData.breakdown),
                backgroundColor: "#0f766e",
              },
            ],
          }}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>

      {/* 🥧 PIE CHART */}
      <div className="chart-container" style={{ height: "250px", marginTop: "20px" }}>
        <Pie
          data={{
            labels: ["Positive", "Penalties"],
            datasets: [
              {
                data: [
                  featureData.breakdown.contributor_score +
                    featureData.breakdown.frequency_score +
                    featureData.breakdown.consistency_score,
                  featureData.breakdown.issue_penalty +
                    featureData.breakdown.churn_penalty +
                    featureData.breakdown.burst_penalty,
                ],
                backgroundColor: ["#10b981", "#ef4444"],
              },
            ],
          }}
        />
      </div>
    </div>
  )}

  {/* 🔁 fallback for other features */}
  {!featureLoading && selectedFeature !== "repo-health" && (
    <pre className="json-display">
      {JSON.stringify(featureData, null, 2)}
    </pre>
  )}
</section>

          <section className="card card-full">
            <h3>👥 All Contributors ({contributors.length}+)</h3>
            {contributors.length === 0 ? (
              <p className="muted">No contributors found.</p>
            ) : (
              <div className="contributors-list">
                {contributors.map((contributor) => (
                  <div key={contributor.login || contributor.id} className="contributor-item">
                    <strong>{contributor.login}</strong>
                    <span>{contributor.contributions} commits</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card card-full">
            <h3>📝 Recent Commits</h3>
            {commits.length === 0 ? (
              <p className="muted">No commits found.</p>
            ) : (
              <ul className="commits-list">
                {commits.map((commit) => (
                  <li key={commit.sha} className="commit-item">
                    <p>{commit.message || commit.commit?.message?.split("\n")[0]}</p>
                    <small>
                      by {commit.author || commit.commit?.author?.name || "Unknown"} •{" "}
                      {formatDate(commit.date || commit.commit?.author?.date)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}

      {userData && resultType === "user" && (
        <main className="layout-shell">
          <section className="card card-primary card-hero">
            <div className="repo-header">
              <div>
                <h2>{userData.name || userData.login}</h2>
                <p className="muted">{userData.bio || "No bio available."}</p>
              </div>
              <a className="repo-link-button" href={userData.html_url} target="_blank" rel="noreferrer">
                👤 View Profile
              </a>
            </div>
            <div className="stats">
              <article>
                <span>👥 Followers</span>
                <strong>{formatNumber(userData.followers)}</strong>
              </article>
              <article>
                <span>🔗 Following</span>
                <strong>{formatNumber(userData.following)}</strong>
              </article>
              <article>
                <span>📦 Public Repos</span>
                <strong>{formatNumber(userData.public_repos)}</strong>
              </article>
              <article>
                <span>📍 Location</span>
                <strong>{userData.location || "N/A"}</strong>
              </article>
            </div>
          </section>

          <section className="card card-full">
            <h3>🏆 Recent Public Repositories</h3>
            {repositories.length === 0 ? (
              <p className="muted">No repositories found.</p>
            ) : (
              <div className="repos-grid">
                {repositories.map((repository) => (
                  <a
                    key={repository.id}
                    href={repository.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="repo-card"
                  >
                    <h4>{repository.name}</h4>
                    <p className="muted">{repository.description || "No description"}</p>
                    <div className="repo-meta">
                      <span>{repository.language || "Unknown"}</span>
                      <span>⭐ {formatNumber(repository.stargazers_count)}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}


export default App;