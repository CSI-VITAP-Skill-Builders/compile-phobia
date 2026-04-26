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
  const [health, setHealth] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState(null);
  const [peak, setPeak] = useState(null);
  const [productivity, setProductivity] = useState(null);

  const fetchRepo = async () => {
    if (!repo.includes("/")) return alert("Use owner/repo");

    setLoading(true);

    try {
      const [owner, repoName] = repo.split("/");
      const base = "https://compile-phobia.onrender.com";

      const [
        repoRes,
        freqRes,
        contRes,
        healthRes,
        leaderRes,
        riskRes
      ] = await Promise.all([
        fetch(`${base}/repo/${owner}/${repoName}`),
        fetch(`${base}/commit-frequency/${owner}/${repoName}`),
        fetch(`${base}/contributors/${owner}/${repoName}`),
        fetch(`${base}/repo-health/${owner}/${repoName}`),
        fetch(`${base}/leaderboard/${owner}/${repoName}`),
        fetch(`${base}/risk-analysis/${owner}/${repoName}`),
        fetch(`${base}/peak-time/${owner}/${repoName}`),
        fetch(`${base}/productivity/${owner}/${repoName}`)
      ]);

      const repoJson = await repoRes.json();
      const freqJson = await freqRes.json();
      const contJson = await contRes.json();
      const healthJson = await healthRes.json();
      const leaderJson = await leaderRes.json();
      const riskJson = await riskRes.json();
      setRisk(riskJson);
      const peakRes = await fetch(`${base}/peak-time/${owner}/${repoName}`);
      const peakData = await peakRes.json();
      setPeak(peakData);
      const prodRes = await fetch(`${base}/productivity/${owner}/${repoName}`);
      const prodData = await prodRes.json();
      setProductivity(prodData);

      setRepoData(repoJson);

      setFreq(
        Object.entries(freqJson.frequency || {}).map(([date, count]) => ({
          date,
          count,
        }))
      );

      setContributors(
        (contJson.contributors || []).slice(0, 5).map((c) => ({
          name: c.login,
          commits: c.contributions,
        }))
      );

      setHealth(healthJson);

      setLeaderboard(leaderJson || []);

    } catch (err) {
      console.log(err);
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

            {/* BASIC STATS */}
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

            {/* REPO HEALTH */}
            <motion.div className="card" whileHover={{ scale: 1.05 }}>
              <h3>🧠 Repo Health</h3>
              <p>{health?.score || "N/A"}</p>
            </motion.div>

            {/* RISK ANALYSIS */}
            <motion.div className="card" whileHover={{ scale: 1.05 }}>
              <h3>⚠️ Risk Level</h3>
              <p>{risk?.level || "Low"}</p>
            </motion.div>

            {/* COMMIT ACTIVITY */}
            <motion.div className="card large" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3>📈 Commit Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={freq}>
                  <XAxis dataKey="date" hide />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="count" stroke="#00e5ff" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* PEAK TIME */}
            <motion.div className="card">
              <h3>⏰ Peak Activity</h3>
              <p>{peak?.time || "N/A"}</p>
            </motion.div>

            {/* PRODUCTIVITY */}
            <motion.div className="card">
              <h3>🚀 Productivity</h3>
              <p>{productivity?.score || "N/A"}</p>
            </motion.div>

            {/* CONTRIBUTORS */}
            <motion.div className="card large">
              <h3>👥 Top Contributors</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contributors}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="commits" fill="#ff7a18" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* LEADERBOARD */}
            <motion.div className="card large">
              <h3>🏆 Leaderboard</h3>
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((c, i) => (
                  <p key={i}>
                    {i + 1}. {c.login || c.name} — {c.contributions || c.commits}
                  </p>
                ))
              ) : (
                <p>No data</p>
              )}
            </motion.div>


          </div>
        )}
      </div>
    </div>
  );
}

export default App;