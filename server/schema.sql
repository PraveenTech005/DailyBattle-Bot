-- Daily Battle: PostgreSQL Database Schema
-- Compatible with local PostgreSQL, Supabase, Neon, Railway, AWS RDS

-- 1. Users Table
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

-- 2. Scores Table (Audit trail of every 30-second match)
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

-- 3. Purchases Table (In-game cosmetics & future Stars purchases)
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL,
    item_category VARCHAR(32) NOT NULL,
    currency VARCHAR(16) DEFAULT 'COINS', -- 'COINS' or 'STARS'
    price INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_users_best_score ON users(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
