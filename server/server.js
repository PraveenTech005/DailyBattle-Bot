const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

app.use(cors());
app.use(express.json());

// ============================================================================
// PRODUCTION SECURITY & ANTI-CHEAT ARCHITECTURE
// ============================================================================
/**
 * 1. TELEGRAM INITDATA VALIDATION:
 * Validates that data received in the Mini App was genuinely issued by Telegram
 * and not forged by an attacker.
 *
 * Algorithm:
 * - Parse query string from Telegram.WebApp.initData
 * - Extract hash parameter
 * - Sort all other parameters alphabetically
 * - Concatenate in key=value format joined by \n
 * - secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
 * - calculated_hash = HMAC_SHA256(data_check_string, secret_key).hex()
 * - return calculated_hash === hash
 */
function verifyTelegramInitData(initDataString, botToken) {
  if (!botToken || !initDataString) return false;

  try {
    const params = new URLSearchParams(initDataString);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');
    const sortedKeys = Array.from(params.keys()).sort();
    const dataCheckString = sortedKeys.map((key) => `${key}=${params.get(key)}`).join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
  } catch (err) {
    console.error('InitData verification error:', err);
    return false;
  }
}

/**
 * 2. ANTI-CHEAT SCORE VALIDATION (FOR PRODUCTION):
 * - In production, score submission must include the sequence of round inputs:
 *   [{ roundId, targetColorId, pickedColorId, tapDeltaMs }]
 * - Server checks:
 *   a) Minimum human reaction time threshold (no inhuman robotic < 100ms taps).
 *   b) Total game duration matches server match session duration (<= 30.5 seconds).
 *   c) Server re-runs scoring formula with pseudo-random seed to verify correct total.
 */

// In-memory demo leaderboard store
let leaderboardDaily = [
  { id: '1', rank: 1, username: 'NeonWolf', avatar: '🐺', frame: 'frame-gold', score: 12450, badge: '🔥 GODLIKE', streak: 14 },
  { id: '2', rank: 2, username: 'SpeedFox', avatar: '🦊', frame: 'frame-emerald', score: 11820, badge: '⚡ ELITE', streak: 9 },
  { id: '3', rank: 3, username: 'PixelKing', avatar: '👑', frame: 'frame-violet', score: 10950, badge: '🏆 MASTER', streak: 11 },
  { id: '4', rank: 4, username: 'Nova', avatar: '✨', frame: 'frame-neon-blue', score: 9800, streak: 6 },
  { id: '5', rank: 5, username: 'ShadowTap', avatar: '🥷', frame: 'frame-neon-blue', score: 9240, streak: 8 },
  { id: '6', rank: 6, username: 'Rocket', avatar: '🚀', frame: 'frame-neon-blue', score: 8910, streak: 5 },
  { id: '7', rank: 7, username: 'CyberCat', avatar: '🐱', frame: 'frame-neon-blue', score: 8450, streak: 7 },
  { id: '8', rank: 8, username: 'Blaze', avatar: '🔥', frame: 'frame-neon-blue', score: 7990, streak: 4 },
];

let leaderboardWeekly = [
  { id: '1', rank: 1, username: 'PixelKing', avatar: '👑', frame: 'frame-gold', score: 68400, badge: '🏆 WEEKLY CHAMP', streak: 21 },
  { id: '2', rank: 2, username: 'NeonWolf', avatar: '🐺', frame: 'frame-emerald', score: 64200, badge: '🔥 RUNNER UP', streak: 14 },
  { id: '3', rank: 3, username: 'SpeedFox', avatar: '🦊', frame: 'frame-violet', score: 59300, badge: '⚡ TOP 3', streak: 9 },
  { id: '4', rank: 4, username: 'Nova', avatar: '✨', frame: 'frame-neon-blue', score: 52100, streak: 6 },
  { id: '5', rank: 5, username: 'CyberCat', avatar: '🐱', frame: 'frame-neon-blue', score: 48900, streak: 7 },
  { id: '6', rank: 6, username: 'ShadowTap', avatar: '🥷', frame: 'frame-neon-blue', score: 45200, streak: 8 },
  { id: '7', rank: 7, username: 'Rocket', avatar: '🚀', frame: 'frame-neon-blue', score: 41800, streak: 5 },
  { id: '8', rank: 8, username: 'Blaze', avatar: '🔥', frame: 'frame-neon-blue', score: 39500, streak: 4 },
];

const { initDatabase, getLeaderboard, submitScore, getUserProfile, isDbConnected } = require('./db');

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Daily Battle: Color Rush',
    version: '1.0.0',
    database: isDbConnected() ? 'PostgreSQL' : 'in-memory (mock)',
    timestamp: new Date().toISOString(),
  });
});

// GET Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const timeframe = req.query.timeframe === 'weekly' ? 'weekly' : 'daily';
    const entries = await getLeaderboard(timeframe);
    res.json({
      timeframe,
      database: isDbConnected() ? 'PostgreSQL' : 'in-memory',
      entries,
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST Score Submission
app.post('/api/scores', async (req, res) => {
  const {
    userId,
    score,
    username = 'Player',
    avatar = '🦊',
    frame = 'frame-neon-blue',
    accuracy = 0,
    highestCombo = 0,
    fastestReactionTimeMs = 0,
  } = req.body;

  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Invalid score value' });
  }

  // Calculate rank estimation
  let rankEstimate = 'Top 50%';
  if (score >= 12000) rankEstimate = 'Top 1% 🔥';
  else if (score >= 9500) rankEstimate = 'Top 5% ⚡';
  else if (score >= 7500) rankEstimate = 'Top 10% 🏆';
  else if (score >= 5000) rankEstimate = 'Top 25% 💎';

  try {
    const saveResult = await submitScore({
      userId,
      username,
      avatar,
      frame,
      score,
      accuracy,
      highestCombo,
      fastestReactionMs: fastestReactionTimeMs,
      rankEstimate,
    });

    res.json({
      success: true,
      score,
      rank: rankEstimate,
      storage: saveResult.db,
      receivedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Score submission error:', err);
    res.status(500).json({ error: 'Failed to record score' });
  }
});

// GET User Profile
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await getUserProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST Telegram Authentication & Validation
app.post('/api/auth/telegram', (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    return res.status(400).json({ valid: false, error: 'initData is required' });
  }

  const isValid = verifyTelegramInitData(initData, BOT_TOKEN);
  res.json({
    valid: isValid,
    message: isValid ? 'Telegram signature verified' : 'Invalid or mock signature',
  });
});

// Start Server & Init DB
app.listen(PORT, async () => {
  console.log(`⚡ Daily Battle server running on http://localhost:${PORT}`);
  await initDatabase();
});
