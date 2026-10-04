import React, { useState } from 'react';
import { Play, Trophy, ShoppingBag, User, Sparkles, Zap, Flame, ShieldAlert } from 'lucide-react';
import type { UserProfile } from '../types/user';
import { userService } from '../services/userService';
import { soundService } from '../services/soundService';
import { telegramService } from '../services/telegramService';
import { fireConfetti } from '../components/Confetti';

interface HomeScreenProps {
  profile: UserProfile;
  onStartGame: () => void;
  onNavigate: (tab: 'leaderboard' | 'shop' | 'profile') => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onRefreshProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onStartGame,
  onNavigate,
  onShowToast,
  onRefreshProfile,
}) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaimStreak = () => {
    setClaiming(true);
    const res = userService.claimDailyStreak();
    if (res.success) {
      soundService.playComboMilestone();
      telegramService.hapticNotification('success');
      fireConfetti();
      onShowToast(`🔥 Daily Streak Maintained! +${res.coinsAwarded} Coins`, 'success');
      onRefreshProfile();
    } else {
      onShowToast("You've already claimed today's streak reward! Play matches to earn more.", 'info');
    }
    setClaiming(false);
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '16px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
      }}
    >
      {/* Top Banner / Title */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            color: 'var(--color-cyan)',
            letterSpacing: '2px',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          <Zap size={14} /> Telegram Mini App
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(180deg, #FFFFFF 20%, #A5B4FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          Daily Battle
        </h1>

        {/* Player Status Overview: Avatar, Level, Coins, Streak */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 14,
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar and Level */}
          <div
            onClick={() => onNavigate('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '4px 12px 4px 6px',
              borderRadius: 99,
              cursor: 'pointer',
            }}
          >
            <div
              className={`avatar-container ${profile.avatarFrame}`}
              style={{
                width: 28,
                height: 28,
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              {profile.avatar}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
              LVL {profile.level}
            </span>
          </div>

          {/* Interactive Streak Badge */}
          <button
            onClick={handleClaimStreak}
            disabled={claiming}
            className="badge-streak pulse-glow"
            style={{
              cursor: 'pointer',
              border: 'none',
              fontSize: '0.85rem',
              padding: '6px 14px',
            }}
            id="home-streak-badge"
            title="Tap to claim daily reward"
          >
            <Flame size={16} color="#FF5400" />
            <span>{profile.streak} DAY STREAK</span>
            <Sparkles size={13} color="#FFB703" />
          </button>
        </div>
      </div>

      {/* Hero Card: Today's Challenge: COLOR RUSH */}
      <div
        className="glass-card"
        style={{
          margin: '18px 0',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        }}
      >
        {/* Ambient background glows */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.25) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 0, 127, 0.25) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 700,
          }}
        >
          Today's Challenge
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '1px',
            margin: '6px 0 16px',
            background: 'linear-gradient(135deg, #00E5FF 0%, #FF007F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          COLOR RUSH
        </div>

        {/* Best Score Counter Box */}
        <div
          style={{
            background: 'rgba(11, 13, 25, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            margin: '0 auto 20px',
            maxWidth: 240,
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Best Score
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#FFB703',
              lineHeight: 1.1,
              marginTop: 4,
            }}
          >
            {profile.bestScore.toLocaleString()}
          </div>
        </div>

        {/* Giant PLAY NOW button */}
        <button
          onClick={() => {
            soundService.playTick(true);
            telegramService.hapticImpact('heavy');
            onStartGame();
          }}
          className="btn-primary"
          id="btn-play-now"
        >
          <Play size={24} fill="#ffffff" />
          <span>PLAY NOW</span>
        </button>

        <div
          style={{
            marginTop: 12,
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          ⏱ 30 Seconds • ⚡ Fast Reactions • 🎯 Max Combos
        </div>
      </div>

      {/* Navigation Quick Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <button
          onClick={() => onNavigate('leaderboard')}
          className="glass-card-interactive"
          style={{
            padding: '14px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-primary)',
          }}
          id="home-btn-leaderboard"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255, 183, 3, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={18} color="#FFB703" />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Leaderboard</span>
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className="glass-card-interactive"
          style={{
            padding: '14px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-primary)',
          }}
          id="home-btn-shop"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={18} color="#00E5FF" />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Shop</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="glass-card-interactive"
          style={{
            padding: '14px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-primary)',
          }}
          id="home-btn-profile"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(157, 78, 221, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={18} color="#9D4EDD" />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Profile</span>
        </button>
      </div>

      {/* Telegram mode badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: 6,
        }}
      >
        <ShieldAlert size={12} />
        <span>
          {telegramService.isInsideTelegram() ? 'Telegram Session Active' : 'Local Browser Mode (Telegram Ready)'}
        </span>
      </div>
    </div>
  );
};
