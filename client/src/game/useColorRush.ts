import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameColor, GameState, GameStats, DifficultyLevel, ScorePopup } from '../types/game';
import { getColorsForLevel } from './colorPalette';
import { soundService } from '../services/soundService';
import { telegramService } from '../services/telegramService';
import { userService } from '../services/userService';

const GAME_DURATION_SECONDS = 30;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function useColorRush(options?: { onGameEnd?: () => void }) {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [countdown, setCountdown] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [highestCombo, setHighestCombo] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);

  // Round state
  const [targetColor, setTargetColor] = useState<GameColor | null>(null);
  const [colorOptions, setColorOptions] = useState<GameColor[]>([]);
  const [lastSelectedColorId, setLastSelectedColorId] = useState<string | null>(null);
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [popups, setPopups] = useState<ScorePopup[]>([]);

  // Statistics references (to avoid closure stale state in timer callbacks)
  const totalAttemptsRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const wrongAnswersRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const fastestReactionTimeRef = useRef<number>(9999);
  const roundStartTimeRef = useRef<number>(0);
  const isInputLockedRef = useRef(false);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const highestComboRef = useRef(0);

  // Timers references for safe cancellation
  const roundTransitionTimerRef = useRef<number | null>(null);
  const resultsTimerRef = useRef<number | null>(null);

  // Final match stats
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  // Clear all pending timeouts
  const clearAllTimers = useCallback(() => {
    if (roundTransitionTimerRef.current !== null) {
      clearTimeout(roundTransitionTimerRef.current);
      roundTransitionTimerRef.current = null;
    }
    if (resultsTimerRef.current !== null) {
      clearTimeout(resultsTimerRef.current);
      resultsTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Sound and haptics triggers
  const triggerPopup = useCallback((text: string, type: ScorePopup['type']) => {
    const id = Date.now() + Math.random();
    setPopups((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  // Generate a new round
  const generateRound = useCallback((currentDiff: DifficultyLevel, prevTargetId?: string) => {
    const activePalette = getColorsForLevel(currentDiff);
    // Pick target color (prefer different from previous to keep dynamic)
    const eligibleTargets = activePalette.filter((c) => c.id !== prevTargetId);
    const chosenTarget = eligibleTargets.length > 0
      ? eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)]
      : activePalette[Math.floor(Math.random() * activePalette.length)];

    // Buttons array contains the target plus others, shuffled
    const shuffledButtons = shuffleArray(activePalette);

    setTargetColor(chosenTarget);
    setColorOptions(shuffledButtons);
    setLastSelectedColorId(null);
    setLastAnswerStatus(null);
    roundStartTimeRef.current = performance.now();
    isInputLockedRef.current = false;
  }, []);

  // Start the 3-2-1 countdown
  const startCountdown = useCallback(() => {
    clearAllTimers();

    // Reset all game state cleanly
    setGameState('COUNTDOWN');
    setTimeLeft(GAME_DURATION_SECONDS);
    setCountdown(3);
    setScore(0);
    setCombo(0);
    setHighestCombo(0);
    setDifficulty(1);
    setPopups([]);
    setFinalStats(null);

    totalAttemptsRef.current = 0;
    correctAnswersRef.current = 0;
    wrongAnswersRef.current = 0;
    reactionTimesRef.current = [];
    fastestReactionTimeRef.current = 9999;
    scoreRef.current = 0;
    comboRef.current = 0;
    highestComboRef.current = 0;
    isInputLockedRef.current = true;

    soundService.playTick(false);
  }, [clearAllTimers]);

  // Handle countdown interval
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;

    if (countdown > 1) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
        soundService.playTick(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        setCountdown(0);
        soundService.playTick(true);
        setGameState('PLAYING');
        generateRound(1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown, generateRound]);

  // End match and calculate final statistics
  const endGame = useCallback(() => {
    clearAllTimers();
    setGameState('GAME_OVER');
    soundService.playGameOver();
    telegramService.hapticNotification('warning');

    const total = totalAttemptsRef.current;
    const correct = correctAnswersRef.current;
    const wrong = wrongAnswersRef.current;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgReaction = reactionTimesRef.current.length > 0
      ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length)
      : 0;
    const fastest = fastestReactionTimeRef.current === 9999 ? 0 : fastestReactionTimeRef.current;
    const finalScore = scoreRef.current;
    const maxCombo = highestComboRef.current;

    // Coins earned: 1 per 90 pts + combo bonus
    const coins = Math.max(10, Math.floor(finalScore / 90) + Math.floor(maxCombo * 2));

    const currentProfile = userService.getProfile();
    const isNewHighScore = finalScore > currentProfile.bestScore;

    // Rank estimate
    let rankEstimate = 'Top 50%';
    if (finalScore >= 12000) rankEstimate = 'Top 1% 🔥';
    else if (finalScore >= 9500) rankEstimate = 'Top 5% ⚡';
    else if (finalScore >= 7500) rankEstimate = 'Top 10% 🏆';
    else if (finalScore >= 5000) rankEstimate = 'Top 25% 💎';

    const stats: GameStats = {
      score: finalScore,
      totalAttempts: total,
      correctAnswers: correct,
      wrongAnswers: wrong,
      accuracy,
      avgReactionTimeMs: avgReaction,
      fastestReactionTimeMs: fastest,
      highestCombo: maxCombo,
      coinsEarned: coins,
      isNewHighScore,
      rankEstimate,
    };

    setFinalStats(stats);

    // Save to user profile & check achievements
    userService.recordGameResult({
      score: finalScore,
      accuracy,
      highestCombo: maxCombo,
      fastestReactionTimeMs: fastest,
    });

    options?.onGameEnd?.();

    // GAME_OVER -> RESULTS after dramatic 1.25s "TIME'S UP!" presentation
    resultsTimerRef.current = window.setTimeout(() => {
      setGameState('RESULTS');
    }, 1250);
  }, [clearAllTimers, options]);

  // 30-Second Game timer loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }

        const nextTime = prev - 1;
        const elapsed = GAME_DURATION_SECONDS - nextTime;

        // Difficulty progression:
        // 0-10s (elapsed <= 10): Level 1 (4 colors)
        // 10-20s (elapsed 11-20): Level 2 (5 colors)
        // 20-30s (elapsed 21-30): Level 3 (6 colors)
        let newDiff: DifficultyLevel = 1;
        if (elapsed > 20) newDiff = 3;
        else if (elapsed > 10) newDiff = 2;

        setDifficulty((cur) => {
          if (cur !== newDiff) {
            return newDiff;
          }
          return cur;
        });

        // Warning tick on last 5 seconds
        if (nextTime <= 5) {
          soundService.playTick(false);
          telegramService.hapticImpact('light');
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, endGame]);

  // Handle player tapping a color
  const handleColorTap = useCallback(
    (pickedColor: GameColor) => {
      if (gameState !== 'PLAYING' || !targetColor || isInputLockedRef.current) {
        return;
      }

      // Input lockout to avoid rapid double-tap exploit
      isInputLockedRef.current = true;
      const reactionTime = Math.round(performance.now() - roundStartTimeRef.current);
      reactionTimesRef.current.push(reactionTime);
      if (reactionTime < fastestReactionTimeRef.current) {
        fastestReactionTimeRef.current = reactionTime;
      }

      totalAttemptsRef.current += 1;
      setLastSelectedColorId(pickedColor.id);

      if (pickedColor.id === targetColor.id) {
        // --- CORRECT ANSWER ---
        correctAnswersRef.current += 1;
        setLastAnswerStatus('correct');

        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);

        if (newCombo > highestComboRef.current) {
          highestComboRef.current = newCombo;
          setHighestCombo(newCombo);
        }

        // Combo multiplier
        let comboMultiplier = 1.0;
        if (newCombo >= 10) comboMultiplier = 2.5;
        else if (newCombo >= 7) comboMultiplier = 2.0;
        else if (newCombo >= 4) comboMultiplier = 1.5;
        else if (newCombo >= 2) comboMultiplier = 1.2;

        const basePoints = 100;
        let speedBonus = 0;
        let speedLabel = '';

        if (reactionTime < 250) {
          speedBonus = 80;
          speedLabel = ' ⚡LIGHTNING!';
        } else if (reactionTime < 350) {
          speedBonus = 40;
          speedLabel = ' ⚡FAST!';
        }

        const pointsEarned = Math.round(basePoints * comboMultiplier) + speedBonus;
        const newScore = scoreRef.current + pointsEarned;
        scoreRef.current = newScore;
        setScore(newScore);

        // Sound & Haptics
        if (newCombo % 5 === 0) {
          soundService.playComboMilestone();
        } else {
          soundService.playCorrect(newCombo);
        }
        telegramService.hapticImpact(speedBonus > 0 ? 'medium' : 'light');

        const popupText = `+${pointsEarned}${speedLabel}`;
        triggerPopup(popupText, speedBonus > 0 ? 'fast' : 'correct');

        // Fast transition to next round (110ms gives visual satisfaction without lag)
        roundTransitionTimerRef.current = window.setTimeout(() => {
          generateRound(difficulty, targetColor.id);
        }, 110);
      } else {
        // --- WRONG ANSWER ---
        wrongAnswersRef.current += 1;
        setLastAnswerStatus('wrong');
        comboRef.current = 0;
        setCombo(0);

        // Deduct 50 pts, min 0
        const penalty = 50;
        const newScore = Math.max(0, scoreRef.current - penalty);
        scoreRef.current = newScore;
        setScore(newScore);

        soundService.playWrong();
        telegramService.hapticNotification('error');
        triggerPopup(`-50`, 'wrong');

        // Slightly longer visual pause for wrong answer to establish consequence
        roundTransitionTimerRef.current = window.setTimeout(() => {
          generateRound(difficulty, targetColor.id);
        }, 220);
      }
    },
    [gameState, targetColor, difficulty, generateRound, triggerPopup]
  );

  // Keyboard desktop shortcuts (1-6)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= colorOptions.length) {
        const option = colorOptions[keyNum - 1];
        if (option) {
          handleColorTap(option);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, colorOptions, handleColorTap]);

  return {
    gameState,
    setGameState,
    timeLeft,
    countdown,
    score,
    combo,
    highestCombo,
    difficulty,
    targetColor,
    colorOptions,
    lastSelectedColorId,
    lastAnswerStatus,
    popups,
    finalStats,
    startCountdown,
    handleColorTap,
  };
}
