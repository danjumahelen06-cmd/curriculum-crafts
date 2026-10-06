import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// The app must listen on 3000 for Nginx proxying in both dev and production containers
const port = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);

const distDir = path.resolve(__dirname, 'dist');

// Serve static assets from dist
app.use(express.static(distDir));

// Health check endpoint for Cloud Run and control plane
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback: any route returns index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
