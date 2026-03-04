// SASI-KORA Server - Emotion Engine Test Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import emotionalStateRoutes from './dist/api/emotional-state.js';
import configRoutes from './dist/api/config.js';
import elevenLabsRoutes from './dist/api/elevenlabs-tts.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel bundles files relative to the function - use cwd for Vercel
const BASE_DIR = process.env.VERCEL === '1'
  ? process.cwd()
  : __dirname;

const app = express();
const PORT = parseInt(process.env.API_PORT || process.env.PORT || '8888', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Static files
app.use(express.static(path.join(BASE_DIR, 'public')));
app.use(express.static(BASE_DIR));
app.use('/css', express.static(path.join(BASE_DIR, 'public', 'css')));
app.use('/js', express.static(path.join(BASE_DIR, 'public', 'js')));

// Serve index.html (Kora avatar with web components) - DEFAULT ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.join(BASE_DIR, 'index.html'));
});

// Serve chat-ui.html (text-only testing) - available at /chat
app.get('/chat', (req, res) => {
  res.sendFile(path.join(BASE_DIR, 'chat-ui.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SASI-KORA Emotion Engine',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for Vercel
app.get('/api/debug', async (req, res) => {
  const fs = await import('fs');
  let files = [];
  let publicFiles = [];
  let stylesFiles = [];

  try {
    files = fs.default.readdirSync(BASE_DIR);
  } catch (e) {
    files = ['ERROR: ' + e.message];
  }

  try {
    publicFiles = fs.default.readdirSync(path.join(BASE_DIR, 'public'));
  } catch (e) {
    publicFiles = ['ERROR: ' + e.message];
  }

  try {
    stylesFiles = fs.default.readdirSync(path.join(BASE_DIR, 'styles'));
  } catch (e) {
    stylesFiles = ['ERROR: ' + e.message];
  }

  res.json({
    __dirname,
    BASE_DIR,
    cwd: process.cwd(),
    VERCEL: process.env.VERCEL,
    files,
    publicFiles,
    stylesFiles
  });
});

// Emotion engine API routes
app.use('/api/emotional-state', emotionalStateRoutes);
app.use('/api/config', configRoutes);
app.use('/api/elevenlabs', elevenLabsRoutes);

// 404 handler - catch unmatched routes
app.use((req, res) => {
  console.log(`[404] Not found: ${req.url} | BASE_DIR: ${BASE_DIR}`);
  res.status(404).json({
    error: 'Not Found',
    url: req.url,
    BASE_DIR,
    __dirname,
    cwd: process.cwd()
  });
});

// Export app for Vercel (serverless)
export default app;

// Start server locally (only if not in Vercel environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 SASI-KORA Server Started!`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🎭 Avatar UI: http://localhost:${PORT}/`);
    console.log(`💬 Chat UI: http://localhost:${PORT}/chat`);
    console.log(`🔊 Health: http://localhost:${PORT}/api/health`);
    console.log(`💬 Emotion Engine: http://localhost:${PORT}/api/emotional-state/chat`);
    console.log('');
    console.log('✨ Emotion Engine Ready!');
  });
}

