import { useState } from "react";

Function App() {
  // ✅ STATES (top section)
  const [repo, setRepo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRepo = () => {
    setLoading(true);

    setTimeout(() => {
      const fakeData = {
        name: "react",
        stargazers_count: 210000,
        forks_count: 45000,
      };

      setData(fakeData);
      setLoading(false);
    }, 1000);
  };
  const [loading, setLoading] = useState(false);
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

    {data && (
      <div style={{
        background: "#1e1e2f",
        padding: "20px",
        borderRadius: "12px",
        width: "300px",
        margin: "auto"
      }}>
        <h2>{data.name}</h2>
        <p>⭐ Stars: {data.stargazers_count}</p>
        <p>🍴 Forks: {data.forks_count}</p>
      </div>
    )}
  </div>
);
}

export default App;