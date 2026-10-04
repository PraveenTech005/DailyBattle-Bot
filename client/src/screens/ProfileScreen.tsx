import React from 'react';
import { Flame, Zap, Target, Trophy, Coins, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../types/user';
import { ALL_ACHIEVEMENTS } from '../data/achievementsData';

interface ProfileScreenProps {
  profile: UserProfile;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile }) => {
  const xpPercentage = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));

  return (
    <div
      style={{
        flex: 1,
        padding: '16px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Profile Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 16,
          background: 'linear-gradient(180deg, rgba(22, 27, 46, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        }}
      >
        {/* Avatar with equipped frame */}
        <div
          className={`avatar-container ${profile.avatarFrame}`}
          style={{
            width: 76,
            height: 76,
            fontSize: '2.8rem',
            background: 'rgba(255, 255, 255, 0.08)',
            margin: '0 auto 12px',
          }}
        >
          {profile.avatar}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
          }}
        >
          {profile.username}
        </h1>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            color: 'var(--color-cyan)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: 4,
          }}
        >
          Level {profile.level} • Reflex Cadet
        </div>

        {/* Level XP Bar */}
        <div style={{ marginTop: 14, maxWidth: 280, margin: '14px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>XP Progress</span>
            <span>
              {profile.xp} / {profile.xpToNextLevel} XP
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${xpPercentage}%`,
                background: 'linear-gradient(90deg, #00E5FF, #9D4EDD)',
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: 10,
          }}
        >
          Career Statistics
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Trophy size={14} color="#FFB703" />
              <span>BEST SCORE</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#FFB703', marginTop: 4 }}>
              {profile.bestScore.toLocaleString()}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Target size={14} color="#00FF66" />
              <span>WIN RATE / ACCURACY</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#00FF66', marginTop: 4 }}>
              {profile.winRate}%
            </div>
          </div>

          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Flame size={14} color="#FF5400" />
              <span>CURRENT STREAK</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#FF5400', marginTop: 4 }}>
              {profile.streak} Days
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Best: {profile.longestStreak} days
            </div>
          </div>

          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Zap size={14} color="#00E5FF" />
              <span>TOTAL MATCHES</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#00E5FF', marginTop: 4 }}>
              {profile.totalGames}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: 10,
          }}
        >
          Badges & Achievements
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = Boolean(profile.achievements[ach.id]);

            return (
              <div
                key={ach.id}
                className="glass-card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: isUnlocked ? 1 : 0.65,
                  background: isUnlocked
                    ? 'rgba(22, 27, 46, 0.75)'
                    : 'rgba(11, 13, 25, 0.5)',
                  borderColor: isUnlocked ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-md)',
                      background: isUnlocked ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      border: isUnlocked ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {ach.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isUnlocked ? '#FFFFFF' : '#94A3B8' }}>
                        {ach.title}
                      </span>
                      {isUnlocked && <CheckCircle2 size={14} color="#00FF66" />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {ach.description}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isUnlocked ? '#FFB703' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Coins size={12} />
                    <span>+{ach.rewardCoins}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: isUnlocked ? '#00FF66' : 'var(--text-muted)', marginTop: 2 }}>
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
