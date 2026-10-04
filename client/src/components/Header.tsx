import React from 'react';
import { Volume2, VolumeX, Coins } from 'lucide-react';
import type { UserProfile } from '../types/user';
import { soundService } from '../services/soundService';

interface HeaderProps {
  profile: UserProfile;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  soundMuted,
  onToggleSound,
  onOpenProfile,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Player quick badge */}
      <div
        onClick={onOpenProfile}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
      >
        <div
          className={`avatar-container ${profile.avatarFrame}`}
          style={{
            width: 42,
            height: 42,
            fontSize: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {profile.avatar}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{profile.username}</span>
            <span
              style={{
                fontSize: '0.7rem',
                background: 'linear-gradient(135deg, #00e5ff, #7928ca)',
                padding: '1px 6px',
                borderRadius: 99,
                fontWeight: 700,
              }}
            >
              LVL {profile.level}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              marginTop: 2,
            }}
          >
            🔥 {profile.streak} Day Streak
          </div>
        </div>
      </div>

      {/* Right controls: Coins & Sound */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Coin badge */}
        <div className="badge-coins" title="Daily Battle Coins">
          <Coins size={15} color="#ffb703" />
          <span>{profile.coins.toLocaleString()}</span>
        </div>

        {/* Mute button */}
        <button
          onClick={() => {
            onToggleSound();
            soundService.playTick();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: soundMuted ? 'var(--text-muted)' : 'var(--color-cyan)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-label={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          id="sound-toggle-btn"
        >
          {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </header>
  );
};
