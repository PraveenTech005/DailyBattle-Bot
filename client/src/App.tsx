import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav, type TabType } from './components/BottomNav';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ShopScreen } from './screens/ShopScreen';
import { useColorRush } from './game/useColorRush';
import { userService } from './services/userService';
import { soundService } from './services/soundService';
import type { UserProfile } from './types/user';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [profile, setProfile] = useState<UserProfile>(() => userService.getProfile());
  const [soundMuted, setSoundMuted] = useState<boolean>(() => soundService.getMuted());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Reload profile from localStorage
  const refreshProfile = useCallback(() => {
    setProfile(userService.getProfile());
  }, []);

  // Hook into the Color Rush game engine
  const {
    gameState,
    setGameState,
    timeLeft,
    countdown,
    score,
    combo,
    difficulty,
    targetColor,
    colorOptions,
    lastSelectedColorId,
    lastAnswerStatus,
    popups,
    finalStats,
    startCountdown,
    handleColorTap,
  } = useColorRush({ onGameEnd: refreshProfile });

  // Toast notification helper
  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Audio mute toggle
  const toggleSound = useCallback(() => {
    const isNowMuted = soundService.toggleMute();
    setSoundMuted(isNowMuted);
    userService.updateSettings({ soundEnabled: !isNowMuted });
    showToast(isNowMuted ? 'Sound muted' : 'Sound enabled', 'info');
  }, [showToast]);

  // Start new game session
  const handleStartGame = () => {
    startCountdown();
  };

  // Safe tab navigation guard while game is in progress
  const handleSelectTab = (tab: TabType) => {
    if (gameState === 'PLAYING' || gameState === 'COUNTDOWN' || gameState === 'GAME_OVER') {
      setShowQuitConfirm(true);
      return;
    }
    setActiveTab(tab);
  };

  const confirmQuitGame = () => {
    setGameState('IDLE');
    setShowQuitConfirm(false);
    setActiveTab('home');
    refreshProfile();
    showToast('Match abandoned', 'info');
  };

  // Prevent browser back button or page close during active match
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState === 'PLAYING') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState]);

  return (
    <div className="app-container">
      {/* Toast notifications layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal for quitting an active match */}
      {showQuitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 13, 25, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 99999,
          }}
        >
          <div
            className="glass-card"
            style={{
              padding: '24px 20px',
              maxWidth: 340,
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(239, 68, 68, 0.4)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#EF4444' }}>
              Abandon Current Match?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
              Your current 30-second Color Rush progress will be lost.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="btn-secondary"
                style={{ padding: '10px' }}
              >
                Keep Playing
              </button>
              <button
                onClick={confirmQuitGame}
                style={{
                  padding: '10px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Quit Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Router */}
      {gameState === 'COUNTDOWN' || gameState === 'PLAYING' || gameState === 'GAME_OVER' ? (
        <GameScreen
          gameState={gameState}
          countdown={countdown}
          timeLeft={timeLeft}
          score={score}
          combo={combo}
          difficulty={difficulty}
          targetColor={targetColor}
          colorOptions={colorOptions}
          lastSelectedColorId={lastSelectedColorId}
          lastAnswerStatus={lastAnswerStatus}
          popups={popups}
          onColorTap={handleColorTap}
          onQuitGame={() => setShowQuitConfirm(true)}
        />
      ) : gameState === 'RESULTS' && finalStats ? (
        <GameOverScreen
          stats={finalStats}
          streak={profile.streak}
          onPlayAgain={handleStartGame}
          onGoHome={() => {
            setGameState('IDLE');
            setActiveTab('home');
            refreshProfile();
          }}
          onShowToast={showToast}
        />
      ) : (
        <>
          {/* Main App Header */}
          <Header
            profile={profile}
            soundMuted={soundMuted}
            onToggleSound={toggleSound}
            onOpenProfile={() => setActiveTab('profile')}
          />

          {/* Tab Views */}
          {activeTab === 'home' && (
            <HomeScreen
              profile={profile}
              onStartGame={handleStartGame}
              onNavigate={(tab) => setActiveTab(tab)}
              onShowToast={showToast}
              onRefreshProfile={refreshProfile}
            />
          )}

          {activeTab === 'leaderboard' && <LeaderboardScreen />}

          {activeTab === 'shop' && (
            <ShopScreen
              profile={profile}
              onRefreshProfile={refreshProfile}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'profile' && <ProfileScreen profile={profile} />}

          {/* Bottom Tabs Navigation */}
          <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />
        </>
      )}
    </div>
  );
};

export default App;
