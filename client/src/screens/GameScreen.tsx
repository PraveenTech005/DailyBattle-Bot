import React from 'react';
import { Flame, Clock } from 'lucide-react';
import type { GameColor, GameState, ScorePopup, DifficultyLevel } from '../types/game';

interface GameScreenProps {
  gameState: GameState;
  countdown: number;
  timeLeft: number;
  score: number;
  combo: number;
  difficulty: DifficultyLevel;
  targetColor: GameColor | null;
  colorOptions: GameColor[];
  lastSelectedColorId: string | null;
  lastAnswerStatus: 'correct' | 'wrong' | null;
  popups: ScorePopup[];
  onColorTap: (color: GameColor) => void;
  onQuitGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  countdown,
  timeLeft,
  score,
  combo,
  difficulty,
  targetColor,
  colorOptions,
  lastSelectedColorId,
  lastAnswerStatus,
  popups,
  onColorTap,
  onQuitGame,
}) => {
  // Timer bar percentage
  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / 30) * 100));
  const isTimerCritical = timeLeft <= 5;

  return (
    <div
      style={{
        flex: 1,
        padding: '12px 18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3-2-1 Countdown Overlay */}
      {gameState === 'COUNTDOWN' && (
        <div className="countdown-overlay">
          <div
            style={{
              fontSize: '1.2rem',
              color: 'var(--color-cyan)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Get Ready
          </div>
          <div className="countdown-number" key={countdown}>
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <div
            style={{
              marginTop: 20,
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Tap matching colors as fast as possible!
          </div>
        </div>
      )}

      {/* Game Over / Time's Up Splash Overlay */}
      {gameState === 'GAME_OVER' && (
        <div className="countdown-overlay">
          <div
            style={{
              fontSize: '1rem',
              color: 'var(--color-gold)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            30 SECONDS EXPIRED
          </div>
          <div
            className="countdown-number"
            style={{
              fontSize: '4rem',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FF007F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TIME'S UP!
          </div>
          <div
            style={{
              marginTop: 18,
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Calculating rank & accuracy...
          </div>
        </div>
      )}

      {/* Floating score feedback popups */}
      <div
        style={{
          position: 'absolute',
          top: '36%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {popups.map((p) => (
          <div
            key={p.id}
            className={`floating-popup ${
              p.type === 'wrong' ? 'popup-wrong' : p.type === 'fast' ? 'popup-fast' : 'popup-correct'
            }`}
          >
            {p.text}
          </div>
        ))}
      </div>

      {/* Header HUD: Timer, Quit, Score & Combo */}
      <div>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          {/* Timer Display */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isTimerCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${isTimerCritical ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              transition: 'all 0.3s ease',
            }}
          >
            <Clock size={16} color={isTimerCritical ? '#EF4444' : '#00E5FF'} />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: isTimerCritical ? '#EF4444' : '#FFFFFF',
              }}
            >
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>

          {/* Level Indicator */}
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: difficulty === 3 ? '#FF007F' : difficulty === 2 ? '#FFB703' : '#00E5FF',
              background: 'rgba(11, 13, 25, 0.7)',
              padding: '4px 10px',
              borderRadius: 99,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {difficulty === 1 ? 'LVL 1: WARM UP' : difficulty === 2 ? 'LVL 2: RUSH' : 'LVL 3: OVERDRIVE'}
          </div>

          {/* Quit button */}
          <button
            onClick={onQuitGame}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Quit
          </button>
        </div>

        {/* Smooth Timer Bar */}
        <div
          style={{
            height: 6,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 99,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${timerPercentage}%`,
              background: isTimerCritical
                ? 'linear-gradient(90deg, #EF4444, #FF007F)'
                : 'linear-gradient(90deg, #00E5FF, #7928CA)',
              transition: 'width 0.95s linear',
              borderRadius: 99,
            }}
          />
        </div>

        {/* Score & Combo HUD Box */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(19, 23, 44, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
          }}
        >
          {/* Score Counter */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Score
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              {score.toLocaleString()}
            </div>
          </div>

          {/* Combo Multiplier */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Combo
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: combo >= 5 ? '#FF5400' : combo >= 2 ? '#FFB703' : 'var(--text-secondary)',
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              <Flame size={18} color={combo >= 5 ? '#FF5400' : combo >= 2 ? '#FFB703' : '#64748B'} />
              <span>{combo}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Color Presentation Card */}
      <div
        className={`glass-card ${lastAnswerStatus === 'wrong' ? 'shake' : ''}`}
        style={{
          margin: '14px 0',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          border: targetColor ? `2px solid ${targetColor.hex}` : '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: targetColor ? `0 0 35px ${targetColor.borderGlow}` : 'none',
          position: 'relative',
          transition: 'all 0.15s ease-out',
        }}
      >
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          FIND THIS COLOR:
        </div>

        {/* Giant Color Name & Swatch */}
        {targetColor && (
          <>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 900,
                color: targetColor.hex,
                textShadow: `0 0 20px ${targetColor.borderGlow}`,
                letterSpacing: '2px',
                lineHeight: 1.1,
              }}
            >
              {targetColor.name}
            </div>

            {/* Glowing Target Orb Preview */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: targetColor.hex,
                boxShadow: `0 0 25px ${targetColor.borderGlow}, inset 0 2px 4px rgba(255, 255, 255, 0.6)`,
                marginTop: 14,
                border: '3px solid #FFFFFF',
              }}
            />
          </>
        )}
      </div>

      {/* Touch Options Grid (2x2 or 2x3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {colorOptions.map((option, idx) => {
          const isSelected = lastSelectedColorId === option.id;
          const isCorrect = isSelected && lastAnswerStatus === 'correct';
          const isWrong = isSelected && lastAnswerStatus === 'wrong';
          const isLastOdd = colorOptions.length % 2 !== 0 && idx === colorOptions.length - 1;

          return (
            <button
              key={`${option.id}-${idx}`}
              onClick={() => onColorTap(option)}
              disabled={gameState !== 'PLAYING'}
              style={{
                height: 72,
                gridColumn: isLastOdd ? 'span 2' : 'auto',
                backgroundColor: option.hex,
                color: option.textColor,
                border: isCorrect
                  ? '4px solid #00FF66'
                  : isWrong
                  ? '4px solid #EF4444'
                  : '3px solid rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 20px ${option.borderGlow}`,
                transition: 'transform 0.1s ease, filter 0.1s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="color-rush-btn"
              id={`color-btn-${option.id}`}
            >
              {/* Desktop keyboard hint [1], [2], etc. */}
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 8,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  opacity: 0.6,
                }}
              >
                [{idx + 1}]
              </span>

              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
