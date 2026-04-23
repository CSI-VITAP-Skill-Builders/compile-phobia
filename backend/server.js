const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running'
  });
});

app.get('/repo', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/repos/facebook/react');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repo' });
  }
});

app.get('/contributors', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/repos/facebook/react/contributors');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

app.get('/commits', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/repos/facebook/react/commits');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
