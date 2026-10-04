import type { UserProfile, UserSettings } from '../types/user';
import { telegramService } from './telegramService';

const PROFILE_KEY = 'daily_battle_user_profile';
const SETTINGS_KEY = 'daily_battle_user_settings';

export function getDefaultProfile(): UserProfile {
  const tgUser = telegramService.getUser();
  const todayStr = new Date().toISOString().split('T')[0];

  return {
    id: String(tgUser.id),
    username: tgUser.username ? `@${tgUser.username}` : (tgUser.first_name || 'CyberAce'),
    avatar: '🦊',
    avatarFrame: 'frame-neon-blue',
    level: 3,
    xp: 450,
    xpToNextLevel: 1000,
    coins: 420,
    streak: 7,
    longestStreak: 12,
    lastPlayedDate: todayStr,
    bestScore: 8420,
    totalGames: 24,
    winRate: 92,
    equippedEffect: 'effect-neon',
    inventory: {
      avatars: ['avatar-fox'],
      frames: ['frame-neon-blue'],
      effects: ['effect-neon'],
    },
    achievements: {
      first_rush: true,
      streak_7: true,
      combo_king: true,
    },
  };
}

export function getDefaultSettings(): UserSettings {
  return {
    soundEnabled: true,
    hapticsEnabled: true,
    reducedMotion: false,
  };
}

class StorageService {
  public getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return { ...getDefaultProfile(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading profile from localStorage', e);
    }
    const def = getDefaultProfile();
    this.saveProfile(def);
    return def;
  }

  public saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  }

  public getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading settings from localStorage', e);
    }
    return getDefaultSettings();
  }

  public saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  }

  public resetAllData(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
}

export const storageService = new StorageService();
