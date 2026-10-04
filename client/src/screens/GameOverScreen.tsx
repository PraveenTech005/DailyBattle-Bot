import React, { useEffect, useState } from 'react';
import { RotateCcw, Share2, Swords, Home, Trophy, Zap, Target, Flame, Coins, Sparkles } from 'lucide-react';
import type { GameStats } from '../types/game';
import { fireConfetti, fireHighscoreCelebration } from '../components/Confetti';
import { telegramService } from '../services/telegramService';
import { soundService } from '../services/soundService';

interface GameOverScreenProps {
  stats: GameStats;
  streak: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  streak,
  onPlayAgain,
  onGoHome,
  onShowToast,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Score count-up animation on mount
  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const increment = stats.score / steps;
    let current = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      current += increment;
      stepCount += 1;
      if (stepCount % 2 === 0) {
        soundService.playScoreTick();
      }

      if (current >= stats.score) {
        setAnimatedScore(stats.score);
        clearInterval(timer);
        if (stats.isNewHighScore) {
          fireHighscoreCelebration();
          soundService.playComboMilestone();
        } else {
          fireConfetti();
          soundService.playCorrect(5);
        }
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [stats]);

  // Challenge Friend flow
  const handleChallengeFriend = () => {
    soundService.playTick();
    const result = telegramService.shareChallenge(stats.score);
    if (result.method === 'clipboard') {
      onShowToast('📋 Challenge link copied to clipboard! Paste it to any friend.', 'success');
    } else if (result.method === 'webshare') {
      onShowToast('Opened share dialog!', 'info');
    } else {
      onShowToast('Sharing challenge via Telegram...', 'success');
    }
  };

  // Share Result flow
  const handleShareResult = () => {
    soundService.playTick();
    const result = telegramService.shareChallenge(stats.score);
    if (result.method === 'clipboard') {
      onShowToast('📋 Result copied to clipboard! Ready to share.', 'success');
    } else {
      onShowToast('Sharing your result...', 'info');
    }
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
      {/* Header Result Badge */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        {stats.isNewHighScore ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #FFB703, #FF5400)',
              color: '#0B0D19',
              fontWeight: 900,
              fontSize: '0.85rem',
              padding: '6px 14px',
              borderRadius: 99,
              letterSpacing: '1px',
              boxShadow: '0 0 20px rgba(255, 183, 3, 0.6)',
              marginBottom: 10,
            }}
          >
            <Sparkles size={16} /> NEW HIGH SCORE!
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            MATCH COMPLETED
          </div>
        )}

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 900,
            letterSpacing: '0.5px',
            color: '#FFFFFF',
          }}
        >
          GAME OVER
        </h1>
      </div>

      {/* Main Score Hero Card */}
      <div
        className="glass-card"
        style={{
          margin: '16px 0',
          padding: '24px 20px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(22, 27, 46, 0.85) 0%, rgba(11, 13, 25, 0.95) 100%)',
          borderColor: stats.isNewHighScore ? '#FFB703' : 'rgba(0, 229, 255, 0.3)',
          boxShadow: stats.isNewHighScore ? '0 0 30px rgba(255, 183, 3, 0.25)' : 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Final Score
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.6rem',
            fontWeight: 900,
            color: stats.isNewHighScore ? '#FFB703' : '#00E5FF',
            lineHeight: 1,
            margin: '8px 0 10px',
            textShadow: stats.isNewHighScore ? '0 0 25px rgba(255, 183, 3, 0.6)' : '0 0 25px rgba(0, 229, 255, 0.5)',
          }}
        >
          {animatedScore.toLocaleString()}
        </div>

        {/* Rank & Coins Awarded Banner */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 14px',
              borderRadius: 99,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-cyan)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
            }}
          >
            Rank: {stats.rankEstimate}
          </div>

          <div
            style={{
              background: 'rgba(255, 183, 3, 0.1)',
              padding: '6px 14px',
              borderRadius: 99,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#FFB703',
              border: '1px solid rgba(255, 183, 3, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Coins size={14} /> +{stats.coinsEarned} Coins
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginTop: 20,
            textAlign: 'left',
          }}
        >
          <div style={{ background: 'rgba(11, 13, 25, 0.6)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Target size={13} color="#00FF66" />
              <span>ACCURACY</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
              {stats.accuracy}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {stats.correctAnswers}/{stats.totalAttempts} correct
            </div>
          </div>

          <div style={{ background: 'rgba(11, 13, 25, 0.6)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Zap size={13} color="#FFB703" />
              <span>BEST REACTION</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
              {stats.fastestReactionTimeMs} ms
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Avg: {stats.avgReactionTimeMs} ms
            </div>
          </div>

          <div style={{ background: 'rgba(11, 13, 25, 0.6)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Flame size={13} color="#FF5400" />
              <span>HIGHEST COMBO</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
              {stats.highestCombo}x
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Streak: {streak} days
            </div>
          </div>

          <div style={{ background: 'rgba(11, 13, 25, 0.6)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Trophy size={13} color="#9D4EDD" />
              <span>WRONG TAPS</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginTop: 4, color: stats.wrongAnswers > 0 ? '#EF4444' : '#00FF66' }}>
              {stats.wrongAnswers}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {stats.wrongAnswers === 0 ? 'Flawless run! 🎯' : '-50 pts each'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* PLAY AGAIN */}
        <button onClick={onPlayAgain} className="btn-primary" id="btn-play-again">
          <RotateCcw size={20} />
          <span>PLAY AGAIN</span>
        </button>

        {/* CHALLENGE FRIEND */}
        <button
          onClick={handleChallengeFriend}
          className="btn-secondary"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(157, 78, 221, 0.15))',
            borderColor: 'rgba(0, 229, 255, 0.3)',
          }}
          id="btn-challenge-friend"
        >
          <Swords size={18} color="#00E5FF" />
          <span>CHALLENGE FRIEND</span>
        </button>

        {/* Secondary row: Share and Home */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={handleShareResult} className="btn-secondary" id="btn-share-result">
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button onClick={onGoHome} className="btn-secondary" id="btn-go-home">
            <Home size={16} />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
