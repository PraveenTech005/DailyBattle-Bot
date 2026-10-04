import type { GameStats } from '../types/game';

/**
 * Score Service
 * Handles score formulas, bonus calculations, and production validation architecture.
 *
 * PRODUCTION SECURITY & ANTI-CHEAT ARCHITECTURE:
 * 1. In production, frontend scores are UNTRUSTED.
 * 2. When a player presses "PLAY NOW", client calls `POST /api/match/start`.
 *    Backend returns a `matchToken` and a pseudo-random seed or encrypted round sequence.
 * 3. Client logs player input vectors: `[{ roundId, targetColorId, pickedColorId, tapDeltaMs }]`.
 * 4. At match completion (30s), client sends the log to `POST /api/match/finish`.
 * 5. Backend validates:
 *    - HMAC authentication via Telegram `initData`.
 *    - Total duration is within 30s (+ allowable network jitter).
 *    - Human physical feasibility (no robotic sub-80ms taps).
 *    - Replays match logic with the seed to verify exact score.
 * 6. Only verified scores are written to the database & global leaderboard.
 */
class ScoreService {
  /**
   * Calculate rank estimate based on score.
   */
  public estimateRank(score: number): string {
    if (score >= 12000) return 'Top 1% (Master)';
    if (score >= 10000) return 'Top 3% (Diamond)';
    if (score >= 8000) return 'Top 8% (Platinum)';
    if (score >= 6000) return 'Top 15% (Gold)';
    if (score >= 4000) return 'Top 30% (Silver)';
    return 'Top 50% (Bronze)';
  }

  /**
   * Submit score. In local MVP, this simulates a fast local round submission.
   * When VITE_API_URL is configured, this will POST to the Express server.
   */
  public async submitScore(stats: GameStats): Promise<{ success: boolean; rank: string }> {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: stats.score,
            accuracy: stats.accuracy,
            fastestReactionTimeMs: stats.fastestReactionTimeMs,
            highestCombo: stats.highestCombo,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          return { success: true, rank: data.rank || this.estimateRank(stats.score) };
        }
      } catch (e) {
        console.warn('Backend unavailable, using local score ranking', e);
      }
    }

    return {
      success: true,
      rank: this.estimateRank(stats.score),
    };
  }
}

export const scoreService = new ScoreService();
