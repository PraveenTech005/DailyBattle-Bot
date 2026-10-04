export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardCoins: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  avatarFrame: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  streak: number;
  longestStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  bestScore: number;
  totalGames: number;
  winRate: number; // overall accuracy
  equippedEffect: string;
  inventory: {
    avatars: string[];
    frames: string[];
    effects: string[];
  };
  achievements: Record<string, boolean>;
}

export interface UserSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
}
