import { useState } from "react";

function App() {
  const [repo, setRepo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRepo = async () => {
    if (!repo.includes("/")) {
      alert("Enter repo in format owner/repo");
      return;
    }

    setLoading(true);

    try {
      const [owner, repoName] = repo.split("/");

      const res = await fetch(
        `http://localhost:5000/repo/${owner}/${repoName}`
      );
      const result = await res.json();

      setData(result);
      setRepo(""); // clear input
    } catch (err) {
      alert("Failed to fetch repo");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        DevSync 🚀
      </h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter repo (e.g. facebook/react)"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            width: "250px",
          }}
        />

        <button
          onClick={fetchRepo}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#ff7a18",
            color: "white",
            cursor: "pointer",
          }}
        >
          Fetch
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {data && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "20px",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            width: "300px",
            textAlign: "center",
          }}
        >
          <h2>{data.name}</h2>
          <p>⭐ Stars: {data.stargazers_count}</p>
          <p>🍴 Forks: {data.forks_count}</p>
        </div>
      )}
    </div>
  );
}

export default App;