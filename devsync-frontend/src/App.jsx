import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const normalizeInput = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "facebook/react";
  }

  return trimmed;
};

function App() {
  const [repoInput, setRepoInput] = useState("facebook/react");
  const [resultType, setResultType] = useState("repo");
  const [repoData, setRepoData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [commits, setCommits] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setError("");
    setLoading(true);

    try {
      const input = normalizeInput(repoInput);
      const response = await axios.get(`${API_BASE_URL}/resolve`, {
        params: { input },
      });

      if (response.data.type === "repo") {
        setResultType("repo");
        setRepoData(response.data.repo);
        setUserData(null);
        setContributors((response.data.contributors || []).slice(0, 5));
        setCommits((response.data.commits || []).slice(0, 5));
        setRepositories([]);
      } else {
        setResultType("user");
        setUserData(response.data.user);
        setRepoData(null);
        setContributors([]);
        setCommits([]);
        setRepositories((response.data.repositories || []).slice(0, 6));
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

  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString();
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
        <main className="grid">
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

          <section className="card">
            <h3>Top Contributors</h3>
            {contributors.length === 0 ? (
              <p className="muted">No contributors found.</p>
            ) : (
              <ul>
                {contributors.map((contributor) => (
                  <li key={contributor.id}>
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
                    <p>{commit.commit.message.split("\n")[0]}</p>
                    <small>
                      {commit.commit.author?.name || "Unknown"} • {formatDate(commit.commit.author?.date)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}

      {userData && resultType === "user" && (
        <main className="grid">
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
        </main>
      )}
    </div>
  );
}

export default App;