import { useState } from "react";

function App() {
  // ✅ STATES
  const [repo, setRepo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ FUNCTION
  const fetchRepo = async () => {
  setLoading(true);

  try {
    const [owner, repoName] = repo.split("/");

    const res = await fetch(`http://localhost:5000/repo`);
    const data = await res.json();

    setRepos((prev) => [...prev, data]);
  } catch (err) {
    console.log(err);
  }

  setLoading(false);
};
  // ✅ UI
  return (
    <div style={{ padding: "20px" }}>
      <h1>DevSync 🚀</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter repo (e.g. facebook/react)"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", marginRight: "10px" }}
        />

        <button onClick={fetchRepo}>
          Fetch Data
        </button>
      </div>

      {/* 🔥 Loading state */}
      {loading && <p>Loading...</p>}

      {/* 🔥 Data display */}
      {data && (
        <div
          style={{
            background: "#1e1e2f",
            padding: "20px",
            borderRadius: "12px",
            width: "300px",
            margin: "auto",
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