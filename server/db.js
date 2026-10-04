const { Pool } = require('pg');

let pool = null;
let isConnected = false;

// Initial in-memory leaderboard demo data fallback
let inMemoryDaily = [
  { id: '1', rank: 1, username: 'NeonWolf', avatar: '🐺', frame: 'frame-gold', score: 12450, badge: '🔥 GODLIKE', streak: 14 },
  { id: '2', rank: 2, username: 'SpeedFox', avatar: '🦊', frame: 'frame-emerald', score: 11820, badge: '⚡ ELITE', streak: 9 },
  { id: '3', rank: 3, username: 'PixelKing', avatar: '👑', frame: 'frame-violet', score: 10950, badge: '🏆 MASTER', streak: 11 },
  { id: '4', rank: 4, username: 'Nova', avatar: '✨', frame: 'frame-neon-blue', score: 9800, streak: 6 },
  { id: '5', rank: 5, username: 'ShadowTap', avatar: '🥷', frame: 'frame-neon-blue', score: 9240, streak: 8 },
  { id: '6', rank: 6, username: 'Rocket', avatar: '🚀', frame: 'frame-neon-blue', score: 8910, streak: 5 },
  { id: '7', rank: 7, username: 'CyberCat', avatar: '🐱', frame: 'frame-neon-blue', score: 8450, streak: 7 },
  { id: '8', rank: 8, username: 'Blaze', avatar: '🔥', frame: 'frame-neon-blue', score: 7990, streak: 4 },
];

let inMemoryWeekly = [
  { id: '1', rank: 1, username: 'PixelKing', avatar: '👑', frame: 'frame-gold', score: 68400, badge: '🏆 WEEKLY CHAMP', streak: 21 },
  { id: '2', rank: 2, username: 'NeonWolf', avatar: '🐺', frame: 'frame-emerald', score: 64200, badge: '🔥 RUNNER UP', streak: 14 },
  { id: '3', rank: 3, username: 'SpeedFox', avatar: '🦊', frame: 'frame-violet', score: 59300, badge: '⚡ TOP 3', streak: 9 },
  { id: '4', rank: 4, username: 'Nova', avatar: '✨', frame: 'frame-neon-blue', score: 52100, streak: 6 },
  { id: '5', rank: 5, username: 'CyberCat', avatar: '🐱', frame: 'frame-neon-blue', score: 48900, streak: 7 },
  { id: '6', rank: 6, username: 'ShadowTap', avatar: '🥷', frame: 'frame-neon-blue', score: 45200, streak: 8 },
  { id: '7', rank: 7, username: 'Rocket', avatar: '🚀', frame: 'frame-neon-blue', score: 41800, streak: 5 },
  { id: '8', rank: 8, username: 'Blaze', avatar: '🔥', frame: 'frame-neon-blue', score: 39500, streak: 4 },
];

// Initialize DB
async function initDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('ℹ️  DATABASE_URL not set. Running in-memory storage mode.');
    return;
  }

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 3000,
    });

    const res = await pool.query('SELECT NOW()');
    isConnected = true;
    console.log(`✅ PostgreSQL Connected successfully (${res.rows[0].now})`);

    // Auto-create tables if missing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        telegram_id BIGINT UNIQUE,
        username VARCHAR(64) NOT NULL,
        first_name VARCHAR(64),
        last_name VARCHAR(64),
        avatar VARCHAR(16) DEFAULT '🦊',
        avatar_frame VARCHAR(32) DEFAULT 'frame-neon-blue',
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        coins INT DEFAULT 100,
        streak INT DEFAULT 1,
        longest_streak INT DEFAULT 1,
        last_played_date DATE DEFAULT CURRENT_DATE,
        best_score INT DEFAULT 0,
        total_games INT DEFAULT 0,
        win_rate INT DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        score INT NOT NULL,
        accuracy INT DEFAULT 0,
        highest_combo INT DEFAULT 0,
        fastest_reaction_ms INT DEFAULT 0,
        coins_earned INT DEFAULT 0,
        rank_estimate VARCHAR(32),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        item_id VARCHAR(64) NOT NULL,
        item_category VARCHAR(32) NOT NULL,
        currency VARCHAR(16) DEFAULT 'COINS',
        price INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_best_score ON users(best_score DESC);
      CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
      CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
    `);

    // Check if initial users exist, if not seed them
    const countRes = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial demo competitors in PostgreSQL...');
      for (const entry of inMemoryDaily) {
        await pool.query(
          `INSERT INTO users (id, username, avatar, avatar_frame, best_score, streak)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [entry.id, entry.username, entry.avatar, entry.frame, entry.score, entry.streak]
        );
      }
    }
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ PostgreSQL connection failed (${err.message}). Defaulting to in-memory store.`);
  }
}

// Fetch Leaderboard
async function getLeaderboard(timeframe = 'daily') {
  if (isConnected && pool) {
    try {
      const isWeekly = timeframe === 'weekly';
      const query = isWeekly
        ? `SELECT id, username, avatar, avatar_frame as frame, (best_score * 5 + 1200) as score, streak
           FROM users ORDER BY score DESC LIMIT 50`
        : `SELECT id, username, avatar, avatar_frame as frame, best_score as score, streak
           FROM users ORDER BY best_score DESC LIMIT 50`;

      const result = await pool.query(query);
      const entries = result.rows.map((row, idx) => ({
        id: row.id,
        rank: idx + 1,
        username: row.username,
        avatar: row.avatar,
        frame: row.frame,
        score: parseInt(row.score, 10),
        streak: row.streak,
        badge: idx === 0 ? '🏆 CHAMPION' : idx === 1 ? '⚡ ELITE' : idx === 2 ? '🔥 MASTER' : undefined,
      }));
      return entries;
    } catch (e) {
      console.error('Error querying PostgreSQL leaderboard, using in-memory', e);
    }
  }

  return timeframe === 'weekly' ? inMemoryWeekly : inMemoryDaily;
}

// Submit Score
async function submitScore({ userId, username, avatar, frame, score, accuracy, highestCombo, fastestReactionMs, rankEstimate }) {
  if (isConnected && pool) {
    try {
      const uId = userId || 'user_' + Math.random().toString(36).substring(7);

      // Upsert user
      await pool.query(
        `INSERT INTO users (id, username, avatar, avatar_frame, best_score, total_games)
         VALUES ($1, $2, $3, $4, $5, 1)
         ON CONFLICT (id) DO UPDATE SET
           best_score = GREATEST(users.best_score, $5),
           total_games = users.total_games + 1,
           avatar = COALESCE($3, users.avatar),
           avatar_frame = COALESCE($4, users.avatar_frame),
           updated_at = NOW()`,
        [uId, username || 'Player', avatar || '🦊', frame || 'frame-neon-blue', score]
      );

      // Record score audit entry
      await pool.query(
        `INSERT INTO scores (user_id, score, accuracy, highest_combo, fastest_reaction_ms, rank_estimate)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uId, score, accuracy || 0, highestCombo || 0, fastestReactionMs || 0, rankEstimate || 'Top 50%']
      );

      return { success: true, db: 'postgresql' };
    } catch (e) {
      console.error('Error writing to PostgreSQL, writing to in-memory', e);
    }
  }

  // Fallback: update in-memory daily leaderboard
  const existingIdx = inMemoryDaily.findIndex((e) => e.username === username);
  if (existingIdx >= 0) {
    if (score > inMemoryDaily[existingIdx].score) {
      inMemoryDaily[existingIdx].score = score;
    }
  } else {
    inMemoryDaily.push({
      id: 'mem_' + Date.now(),
      rank: 99,
      username: username || 'Player',
      avatar: avatar || '🦊',
      frame: frame || 'frame-neon-blue',
      score,
      streak: 1,
    });
  }
  inMemoryDaily.sort((a, b) => b.score - a.score);
  inMemoryDaily.forEach((e, idx) => (e.rank = idx + 1));

  return { success: true, db: 'memory' };
}

// Get User Profile
async function getUserProfile(userId) {
  if (isConnected && pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (e) {
      console.error('Error fetching user from DB', e);
    }
  }
  return null;
}

module.exports = {
  initDatabase,
  getLeaderboard,
  submitScore,
  getUserProfile,
  isDbConnected: () => isConnected,
};
