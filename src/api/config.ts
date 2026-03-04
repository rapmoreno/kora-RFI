/**
 * Config API Routes
 * Provides avatar URL and voice ID for ReadyPlayerMe integration
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/config
 * Returns avatar URL and voice ID from environment variables
 */
router.get('/', (_req, res) => {
  try {
    let avatarUrl = process.env.READYPLAYERME_AVATAR_URL || process.env.AVATAR_URL;
    const voiceId = process.env.VOICE_ID || process.env.ELEVENLABS_VOICE_ID;

    // Normalize avatar URL: bare filenames like "69a707ed...glb" become full ReadyPlayerMe URLs
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
      avatarUrl = `https://models.readyplayer.me/${avatarUrl}`;
    }

    if (!avatarUrl || !voiceId) {
      res.status(500).json({
        error: 'Configuration missing',
        message: 'Please set READYPLAYERME_AVATAR_URL and VOICE_ID in your .env file',
      });
      return;
    }

    res.json({
      avatarUrl,
      voiceId,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to load configuration',
      message: err.message,
    });
  }
});

export default router;

