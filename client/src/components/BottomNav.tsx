import React from 'react';
import { Flame, Trophy, ShoppingBag, User } from 'lucide-react';

export type TabType = 'home' | 'leaderboard' | 'shop' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  disabled?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  disabled = false,
}) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => !disabled && onSelectTab('home')}
        disabled={disabled}
        id="nav-tab-home"
      >
        <Flame size={20} />
        <span>Battle</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
        onClick={() => !disabled && onSelectTab('leaderboard')}
        disabled={disabled}
        id="nav-tab-leaderboard"
      >
        <Trophy size={20} />
        <span>Ranks</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
        onClick={() => !disabled && onSelectTab('shop')}
        disabled={disabled}
        id="nav-tab-shop"
      >
        <ShoppingBag size={20} />
        <span>Shop</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => !disabled && onSelectTab('profile')}
        disabled={disabled}
        id="nav-tab-profile"
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
