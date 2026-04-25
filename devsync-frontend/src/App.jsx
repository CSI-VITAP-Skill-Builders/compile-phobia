import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { motion } from "framer-motion";
import "./App.css";

function App() {
  const [repo, setRepo] = useState("");
  const [repoData, setRepoData] = useState(null);
  const [freq, setFreq] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRepo = async () => {
    if (!repo.includes("/")) return alert("Use owner/repo");

    setLoading(true);

    try {
      const [owner, repoName] = repo.split("/");
      const base = "http://localhost:5000";

      const repoRes = await fetch(`${base}/repo/${owner}/${repoName}`);
      const freqRes = await fetch(`${base}/commit-frequency/${owner}/${repoName}`);
      const contRes = await fetch(`${base}/contributors/${owner}/${repoName}`);

      const repoJson = await repoRes.json();
      const freqJson = await freqRes.json();
      const contJson = await contRes.json();

      setRepoData(repoJson);

      setFreq(
        Object.entries(freqJson.frequency).map(([date, count]) => ({
          date,
          count,
        }))
      );

      setContributors(
        contJson.contributors.slice(0, 5).map((c) => ({
          name: c.login,
          commits: c.contributions,
        }))
      );
    } catch {
      alert("Error fetching repo");
    }

    setLoading(false);
  };

  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>DevSync 🚀</h2>
        <p>Analytics Dashboard</p>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* SEARCH */}
        <div className="search">
          <input
            placeholder="facebook/react"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <button onClick={fetchRepo}>
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>

        {/* DASHBOARD */}
        {repoData && (
          <div className="dashboard">

            {/* STATS */}
            <motion.div className="card" whileHover={{ scale: 1.05 }}>
              <h3>⭐ Stars</h3>
              <p>{repoData.stars}</p>
            </motion.div>

            <motion.div className="card" whileHover={{ scale: 1.05 }}>
              <h3>🍴 Forks</h3>
              <p>{repoData.forks}</p>
            </motion.div>

            <motion.div className="card" whileHover={{ scale: 1.05 }}>
              <h3>📦 Repo</h3>
              <p>{repoData.name}</p>
            </motion.div>

            {/* LINE CHART */}
            <motion.div className="card large" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3>Commit Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={freq}>
                  <XAxis dataKey="date" hide />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="count" stroke="#00e5ff" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* BAR CHART */}
            <motion.div className="card large">
              <h3>Top Contributors</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contributors}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="commits" fill="#ff7a18" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;