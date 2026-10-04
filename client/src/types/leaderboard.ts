export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  frame?: string;
  score: number;
  isCurrentUser?: boolean;
  badge?: string;
  streak?: number;
}

export type LeaderboardTimeframe = 'daily' | 'weekly';
