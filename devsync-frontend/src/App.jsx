import { useState } from "react";
import axios from "axios";
import "./App.css";

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
        setContributors((response.data.contributors || []).slice(0, 5));
        setCommits((response.data.commits || []).slice(0, 5));
        setRepositories([]);
        await fetchFeature(selectedFeature, parsed.query, "repo");
      } else {
        setResultType("user");
        setUserData(response.data.user);
        setRepoData(null);
        setContributors([]);
        setCommits([]);
        setRepositories((response.data.repositories || []).slice(0, 6));
        setFeatureData(null);
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

  return (
    <div className="page">
      <header className="hero">
        <p className="kicker">Compile Phobia</p>
        <h1>GitHub Intelligence Dashboard</h1>
        <p className="subtitle">
          Paste a repo URL, a repo path, a profile URL, or a username. The dashboard resolves the right GitHub data automatically.
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
            {loading ? "Loading..." : "Fetch"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </header>

      {repoData && resultType === "repo" && (
        <main className="layout-shell">
          <section className="card card-primary">
            <h2>{repoData.full_name}</h2>
            <p className="muted">{repoData.description || "No description available."}</p>
            <div className="stats">
              <article>
                <span>Stars</span>
                <strong>{repoData.stargazers_count}</strong>
              </article>
              <article>
                <span>Forks</span>
                <strong>{repoData.forks_count}</strong>
              </article>
              <article>
                <span>Open Issues</span>
                <strong>{repoData.open_issues_count}</strong>
              </article>
              <article>
                <span>Language</span>
                <strong>{repoData.language || "N/A"}</strong>
              </article>
            </div>
            <a className="repo-link" href={repoData.html_url} target="_blank" rel="noreferrer">
              Open on GitHub
            </a>
          </section>

          <section className="card feature-card">
            <h3>Feature Explorer</h3>
            <p className="muted">Choose any repository analytics endpoint to inspect live data.</p>
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

          <section className="card">
            <h3>Top Contributors</h3>
            {contributors.length === 0 ? (
              <p className="muted">No contributors found.</p>
            ) : (
              <ul>
                {contributors.map((contributor) => (
                  <li key={contributor.login || contributor.id}>
                    <span>{contributor.login}</span>
                    <strong>{contributor.contributions} contributions</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h3>Recent Commits</h3>
            {commits.length === 0 ? (
              <p className="muted">No commits found.</p>
            ) : (
              <ul>
                {commits.map((commit) => (
                  <li key={commit.sha}>
                    <p>{commit.message || commit.commit?.message?.split("\n")[0]}</p>
                    <small>
                      {commit.author || commit.commit?.author?.name || "Unknown"} • {formatDate(commit.date || commit.commit?.author?.date)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card json-card">
            <h3>{selectedFeature.replace(/-/g, " ")}</h3>
            <p className="muted">{featureLoading ? "Loading feature data..." : "Live API response"}</p>
            <pre>{JSON.stringify(featureData, null, 2)}</pre>
          </section>
        </main>
      )}

      {userData && resultType === "user" && (
        <main className="layout-shell">
          <section className="card card-primary">
            <h2>{userData.name || userData.login}</h2>
            <p className="muted">{userData.bio || "No bio available."}</p>
            <div className="stats">
              <article>
                <span>Followers</span>
                <strong>{userData.followers}</strong>
              </article>
              <article>
                <span>Following</span>
                <strong>{userData.following}</strong>
              </article>
              <article>
                <span>Public Repos</span>
                <strong>{userData.public_repos}</strong>
              </article>
              <article>
                <span>Location</span>
                <strong>{userData.location || "N/A"}</strong>
              </article>
            </div>
            <a className="repo-link" href={userData.html_url} target="_blank" rel="noreferrer">
              Open GitHub Profile
            </a>
          </section>

          <section className="card">
            <h3>Recent Public Repositories</h3>
            {repositories.length === 0 ? (
              <p className="muted">No repositories found.</p>
            ) : (
              <ul>
                {repositories.map((repository) => (
                  <li key={repository.id}>
                    <p>{repository.name}</p>
                    <small>
                      {repository.language || "Unknown"} • ⭐ {repository.stargazers_count}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>

            <section className="card json-card">
              <h3>Profile Response</h3>
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </section>
        </main>
      )}
    </div>
  );
}

export default App;