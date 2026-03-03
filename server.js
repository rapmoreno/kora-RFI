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

const app = express();
const PORT = parseInt(process.env.API_PORT || process.env.PORT || '8888', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Serve index.html (Ah Meng avatar with web components) - DEFAULT ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve chat-ui.html (text-only testing) - available at /chat
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat-ui.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SASI-KORA Emotion Engine',
    timestamp: new Date().toISOString()
  });
});

// Emotion engine API routes
app.use('/api/emotional-state', emotionalStateRoutes);
app.use('/api/config', configRoutes);
app.use('/api/elevenlabs', elevenLabsRoutes);

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

