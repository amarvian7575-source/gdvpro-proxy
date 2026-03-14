const express = require('express');
const cors = require('cors');
const app = express();

// Allow requests from your DreamHost site
app.use(cors({ origin: ['https://gdvpro.com', 'https://www.gdvpro.com', 'http://localhost:3000'] }));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req, res) => res.json({ status: 'GDVpro proxy running', ok: true }));

// Proxy to Anthropic API
app.post('/api/analyse', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('GDVpro proxy on port ' + PORT));
