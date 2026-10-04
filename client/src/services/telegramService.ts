import type { TelegramUser, TelegramWebApp } from '../types/telegram';

const MOCK_USER: TelegramUser = {
  id: 777123456,
  first_name: 'CyberAce',
  last_name: 'Player',
  username: 'cyber_ace',
  language_code: 'en',
  is_premium: true,
};

class TelegramService {
  private webApp: TelegramWebApp | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      try {
        this.webApp.ready();
        this.webApp.expand();
      } catch {
        // Safe fail
      }
    }
  }

  public isInsideTelegram(): boolean {
    return Boolean(this.webApp && this.webApp.initData);
  }

  public getUser(): TelegramUser {
    if (this.webApp?.initDataUnsafe?.user) {
      return this.webApp.initDataUnsafe.user;
    }
    return MOCK_USER;
  }

  public getInitData(): string {
    return this.webApp?.initData || '';
  }

  public hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (this.webApp?.HapticFeedback) {
      try {
        this.webApp.HapticFeedback.impactOccurred(style);
        return;
      } catch {}
    }
    // Web vibrate fallback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const duration = style === 'heavy' ? 40 : style === 'medium' ? 25 : 12;
      navigator.vibrate(duration);
    }
  }

  public hapticNotification(type: 'success' | 'error' | 'warning') {
    if (this.webApp?.HapticFeedback) {
      try {
        this.webApp.HapticFeedback.notificationOccurred(type);
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'error') navigator.vibrate([40, 30, 40]);
      else if (type === 'success') navigator.vibrate([20, 20, 20]);
    }
  }

  public closeApp() {
    if (this.webApp) {
      this.webApp.close();
    } else {
      console.log('[TelegramService] Mock app closed.');
    }
  }

  /**
   * Challenge / Share flow:
   * Uses Telegram deep link (t.me/share/url) if Telegram is available,
   * or Web Share API, or clipboard copy.
   */
  public generateChallengeText(score: number): string {
    return `⚡ I just scored ${score.toLocaleString()} points in Daily Battle: Color Rush! Can you beat my reaction speed? 🎮🔥`;
  }

  public shareChallenge(score: number, botUsername?: string): { success: boolean; method: 'telegram' | 'webshare' | 'clipboard' } {
    const text = this.generateChallengeText(score);
    const botUrl = botUsername ? `https://t.me/${botUsername}/app?startapp=challenge_${score}` : window.location.href;

    if (this.isInsideTelegram() && this.webApp) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
      this.webApp.openTelegramLink(shareUrl);
      return { success: true, method: 'telegram' };
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Daily Battle: Color Rush',
        text: text,
        url: botUrl,
      }).catch(() => {});
      return { success: true, method: 'webshare' };
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${botUrl}`).catch(() => {});
      return { success: true, method: 'clipboard' };
    }

    return { success: false, method: 'clipboard' };
  }
}

export const telegramService = new TelegramService();
