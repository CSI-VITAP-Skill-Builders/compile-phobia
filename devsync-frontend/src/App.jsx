import { useState } from "react";
import "./App.css";

function App() {
  const [repo, setRepo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepo = async () => {
    if (!repo.includes("/")) {
      setError("Use format: owner/repo");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const [owner, repoName] = repo.split("/");

      const res = await fetch(
        `http://localhost:5000/dashboard/${owner}/${repoName}`
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setData(result);
      setRepo("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <h1 className="title">DevSync 🚀</h1>
      <p className="subtitle">Analyze any GitHub repo like a pro</p>

      <div className="searchBox">
        <input
          type="text"
          placeholder="facebook/react"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />

        <button onClick={fetchRepo} disabled={loading}>
          {loading ? "Loading..." : "Fetch"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {data && (
        <div className="dashboard">

          {/* Repo Overview */}
          <div className="card">
            <h2>{data.repo.name}</h2>
            <p>⭐ {data.repo.stars}</p>
            <p>🍴 {data.repo.forks}</p>
            <p className="desc">{data.repo.description}</p>
          </div>

          {/* Contributors */}
          <div className="card">
            <h3>Top Contributors</h3>
            {data.contributors.slice(0, 5).map((c, i) => (
              <div key={i} className="row">
                <span>{c.login}</span>
                <span>{c.contributions}</span>
              </div>
            ))}
          </div>

          {/* Commits */}
          <div className="card">
            <h3>Recent Commits</h3>
            {data.commits.slice(0, 5).map((c, i) => (
              <p key={i} className="commit">
                {c.message}
              </p>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default App;