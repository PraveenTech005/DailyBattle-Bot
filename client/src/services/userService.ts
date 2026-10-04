import type { UserProfile, UserSettings } from '../types/user';
import { storageService } from './storageService';
import { ALL_ACHIEVEMENTS } from '../data/achievementsData';

/**
 * User Service
 * Manages player profile, progression, level-ups, and achievements.
 * In production: connects to GET/PUT /api/user endpoints, validating session via Telegram initData.
 */
class UserService {
  public getProfile(): UserProfile {
    return storageService.getProfile();
  }

  public updateProfile(updated: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const merged = { ...current, ...updated };
    storageService.saveProfile(merged);
    return merged;
  }

  public getSettings(): UserSettings {
    return storageService.getSettings();
  }

  public updateSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const merged = { ...current, ...settings };
    storageService.saveSettings(merged);
    return merged;
  }

  /**
   * Called when a game concludes: awards XP, coins, checks level up,
   * updates stats, and unlocks achievements.
   */
  public recordGameResult(result: {
    score: number;
    accuracy: number;
    highestCombo: number;
    fastestReactionTimeMs: number;
  }): { profile: UserProfile; newAchievements: string[]; leveledUp: boolean } {
    const profile = this.getProfile();
    const newAchievements: string[] = [];

    // Calculate coin & xp reward
    // Base: 1 coin per 100 score + combo bonus
    const coinsEarned = Math.max(10, Math.floor(result.score / 90) + Math.floor(result.highestCombo * 2));
    const xpGained = Math.max(25, Math.floor(result.score / 10));

    let xp = profile.xp + xpGained;
    let level = profile.level;
    let xpToNext = profile.xpToNextLevel;
    let leveledUp = false;

    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = Math.round(xpToNext * 1.25);
      leveledUp = true;
    }

    // Check achievements
    const achievements = { ...profile.achievements };
    if (!achievements.first_rush) {
      achievements.first_rush = true;
      newAchievements.push('first_rush');
    }
    if (result.fastestReactionTimeMs > 0 && result.fastestReactionTimeMs < 250 && !achievements.speed_demon) {
      achievements.speed_demon = true;
      newAchievements.push('speed_demon');
    }
    if (result.highestCombo >= 10 && !achievements.combo_king) {
      achievements.combo_king = true;
      newAchievements.push('combo_king');
    }
    if (result.accuracy >= 95 && !achievements.sharp_shooter) {
      achievements.sharp_shooter = true;
      newAchievements.push('sharp_shooter');
    }
    if (result.score >= 5000 && !achievements.score_5k) {
      achievements.score_5k = true;
      newAchievements.push('score_5k');
    }

    // Bonus coins from newly unlocked achievements
    let achievementCoins = 0;
    newAchievements.forEach((achId) => {
      const ach = ALL_ACHIEVEMENTS.find((a) => a.id === achId);
      if (ach) achievementCoins += ach.rewardCoins;
    });

    const isBest = result.score > profile.bestScore;
    const bestScore = isBest ? result.score : profile.bestScore;
    const totalGames = profile.totalGames + 1;
    // Weighted rolling win rate (accuracy)
    const winRate = Math.round((profile.winRate * 4 + result.accuracy) / 5);

    const updatedProfile: UserProfile = {
      ...profile,
      coins: profile.coins + coinsEarned + achievementCoins,
      xp,
      level,
      xpToNextLevel: xpToNext,
      bestScore,
      totalGames,
      winRate,
      achievements,
    };

    storageService.saveProfile(updatedProfile);

    return {
      profile: updatedProfile,
      newAchievements,
      leveledUp,
    };
  }

  public claimDailyStreak(): { success: boolean; newStreak: number; coinsAwarded: number } {
    const profile = this.getProfile();
    const today = new Date().toISOString().split('T')[0];

    if (profile.lastPlayedDate === today && profile.streak > 0) {
      // Already claimed today
      return { success: false, newStreak: profile.streak, coinsAwarded: 0 };
    }

    const newStreak = profile.streak + 1;
    const coinsAwarded = 100 + newStreak * 25;
    const longestStreak = Math.max(profile.longestStreak, newStreak);

    this.updateProfile({
      streak: newStreak,
      longestStreak,
      lastPlayedDate: today,
      coins: profile.coins + coinsAwarded,
    });

    return { success: true, newStreak, coinsAwarded };
  }
}

export const userService = new UserService();
