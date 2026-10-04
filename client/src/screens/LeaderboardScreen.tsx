import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock } from 'lucide-react';
import type { LeaderboardEntry, LeaderboardTimeframe } from '../types/leaderboard';
import { leaderboardService } from '../services/leaderboardService';
import { soundService } from '../services/soundService';

export const LeaderboardScreen: React.FC = () => {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    leaderboardService.getLeaderboard(timeframe).then((data) => {
      if (isMounted) {
        setEntries(data.entries);
        setUserEntry(data.userEntry);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  const handleTabChange = (tf: LeaderboardTimeframe) => {
    soundService.playTick();
    setLoading(true);
    setTimeframe(tf);
  };

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
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 900,
            letterSpacing: '0.5px',
            color: '#FFFFFF',
          }}
        >
          HALL OF FAME
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          Compete against the fastest Color Rush players worldwide
        </p>

        {/* Demo data disclosure banner */}
        <div
          style={{
            marginTop: 10,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '0.72rem',
            color: '#A5B4FC',
            display: 'inline-block',
          }}
        >
          Demo Leaderboard • Real-time backend sync coming in v1.0
        </div>
      </div>

      {/* Timeframe Toggle Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(19, 23, 44, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => handleTabChange('daily')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: timeframe === 'daily' ? 'linear-gradient(135deg, #00E5FF, #7928CA)' : 'transparent',
            color: timeframe === 'daily' ? '#FFFFFF' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
          id="leaderboard-tab-daily"
        >
          <Clock size={15} />
          <span>Daily Rush</span>
        </button>

        <button
          onClick={() => handleTabChange('weekly')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: timeframe === 'weekly' ? 'linear-gradient(135deg, #FFB703, #FF5400)' : 'transparent',
            color: timeframe === 'weekly' ? '#0B0D19' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
          id="leaderboard-tab-weekly"
        >
          <Calendar size={15} />
          <span>Weekly Elite</span>
        </button>
      </div>

      {/* Top 3 Podium Highlights if available */}
      {!loading && entries.length >= 3 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr 1fr',
            gap: 8,
            alignItems: 'flex-end',
            marginBottom: 20,
            padding: '0 4px',
          }}
        >
          {/* Rank 2 (Left) */}
          <div
            className="glass-card"
            style={{
              padding: '12px 8px',
              textAlign: 'center',
              borderTop: '3px solid #C0C0C0',
              height: 125,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '1.4rem' }}>{entries[1]?.avatar}</div>
            <div style={{ fontWeight: 800, fontSize: '0.78rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entries[1]?.username}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#C0C0C0', fontWeight: 800 }}>#2</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: 2 }}>
              {entries[1]?.score.toLocaleString()}
            </div>
          </div>

          {/* Rank 1 (Center - Tallest) */}
          <div
            className="glass-card"
            style={{
              padding: '14px 8px',
              textAlign: 'center',
              borderTop: '4px solid #FFD700',
              background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.25)',
              height: 145,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
              <Trophy size={20} color="#FFD700" />
            </div>
            <div style={{ fontSize: '1.6rem', marginTop: 4 }}>{entries[0]?.avatar}</div>
            <div style={{ fontWeight: 900, fontSize: '0.82rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entries[0]?.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 900 }}>#1 CHAMPION</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 900, color: '#FFB703', marginTop: 2 }}>
              {entries[0]?.score.toLocaleString()}
            </div>
          </div>

          {/* Rank 3 (Right) */}
          <div
            className="glass-card"
            style={{
              padding: '12px 8px',
              textAlign: 'center',
              borderTop: '3px solid #CD7F32',
              height: 115,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '1.4rem' }}>{entries[2]?.avatar}</div>
            <div style={{ fontWeight: 800, fontSize: '0.78rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entries[2]?.username}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#CD7F32', fontWeight: 800 }}>#3</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: 2 }}>
              {entries[2]?.score.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Loading rankings...
          </div>
        ) : (
          entries.map((entry) => {
            const isMe = entry.isCurrentUser;

            return (
              <div
                key={entry.id}
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isMe
                    ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.15), rgba(157, 78, 221, 0.15))'
                    : 'var(--bg-card)',
                  borderColor: isMe ? 'var(--color-cyan)' : 'var(--border-subtle)',
                  boxShadow: isMe ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                }}
              >
                {/* Left: Rank & Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 900,
                      width: 24,
                      textAlign: 'center',
                      color:
                        entry.rank === 1
                          ? '#FFD700'
                          : entry.rank === 2
                          ? '#C0C0C0'
                          : entry.rank === 3
                          ? '#CD7F32'
                          : 'var(--text-muted)',
                    }}
                  >
                    #{entry.rank}
                  </div>

                  <div
                    className={`avatar-container ${entry.frame || ''}`}
                    style={{
                      width: 38,
                      height: 38,
                      fontSize: '1.3rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {entry.avatar}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isMe ? '#00E5FF' : '#FFFFFF' }}>
                        {entry.username}
                      </span>
                      {isMe && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            background: '#00E5FF',
                            color: '#0B0D19',
                            padding: '1px 5px',
                            borderRadius: 4,
                            fontWeight: 800,
                          }}
                        >
                          YOU
                        </span>
                      )}
                      {entry.badge && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            color: '#FFB703',
                            background: 'rgba(255, 183, 3, 0.15)',
                            padding: '1px 5px',
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          {entry.badge}
                        </span>
                      )}
                    </div>

                    {entry.streak && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                        🔥 {entry.streak}d streak
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Score */}
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.15rem',
                      fontWeight: 900,
                      color: isMe ? '#00E5FF' : '#FFFFFF',
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>POINTS</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Persistent Sticky User Footer (if user not in top 3) */}
      {userEntry && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            marginTop: 14,
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: '#00E5FF' }}>
              #{userEntry.rank}
            </span>
            <div style={{ fontSize: '1.3rem' }}>{userEntry.avatar}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Your Best Score</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Keep playing to climb ranks!</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, color: '#00E5FF' }}>
            {userEntry.score.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};
