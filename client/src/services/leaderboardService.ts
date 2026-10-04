import type { LeaderboardEntry, LeaderboardTimeframe } from '../types/leaderboard';
import { DEMO_DAILY_LEADERBOARD, DEMO_WEEKLY_LEADERBOARD } from '../data/leaderboardData';
import { userService } from './userService';

class LeaderboardService {
  /**
   * Fetches leaderboard data.
   * In local MVP: combines curated demo competitors with the player's saved best score.
   */
  public async getLeaderboard(timeframe: LeaderboardTimeframe): Promise<{
    entries: LeaderboardEntry[];
    userEntry: LeaderboardEntry;
  }> {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/leaderboard?timeframe=${timeframe}`);
        if (res.ok) {
          const json = await res.json();
          return json;
        }
      } catch (err) {
        console.warn('Backend leaderboard unreachable, falling back to demo data', err);
      }
    }

    const profile = userService.getProfile();
    const baseList = timeframe === 'daily' ? [...DEMO_DAILY_LEADERBOARD] : [...DEMO_WEEKLY_LEADERBOARD];

    // Create current user entry
    const userScore = timeframe === 'daily' ? profile.bestScore : profile.bestScore * 5 + 1200;
    const userEntry: LeaderboardEntry = {
      id: 'current-user',
      rank: 1, // Will be computed after sorting
      username: profile.username,
      avatar: profile.avatar,
      frame: profile.avatarFrame,
      score: userScore,
      isCurrentUser: true,
      streak: profile.streak,
      badge: 'YOU',
    };

    const combined = [...baseList, userEntry];
    combined.sort((a, b) => b.score - a.score);

    // Reassign ranks
    let userRank = 1;
    combined.forEach((entry, index) => {
      entry.rank = index + 1;
      if (entry.isCurrentUser) {
        userRank = entry.rank;
      }
    });

    userEntry.rank = userRank;

    return {
      entries: combined,
      userEntry,
    };
  }
}

export const leaderboardService = new LeaderboardService();
