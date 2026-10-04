export interface GameColor {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  borderGlow: string;
}

export type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER' | 'RESULTS';

export type DifficultyLevel = 1 | 2 | 3;

export interface GameStats {
  score: number;
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number; // percentage 0 - 100
  avgReactionTimeMs: number;
  fastestReactionTimeMs: number;
  highestCombo: number;
  coinsEarned: number;
  isNewHighScore: boolean;
  rankEstimate: string;
}

export interface ScorePopup {
  id: number;
  text: string;
  type: 'correct' | 'wrong' | 'combo' | 'fast';
}
