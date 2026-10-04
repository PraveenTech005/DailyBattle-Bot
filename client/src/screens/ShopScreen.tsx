import React, { useState } from 'react';
import { Coins, Check, ShieldAlert } from 'lucide-react';
import type { UserProfile } from '../types/user';
import type { ShopCategory, ShopItem } from '../types/shop';
import { shopService } from '../services/shopService';
import { soundService } from '../services/soundService';
import { telegramService } from '../services/telegramService';
import { fireConfetti } from '../components/Confetti';

interface ShopScreenProps {
  profile: UserProfile;
  onRefreshProfile: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  profile,
  onRefreshProfile,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('avatar');
  const items = shopService.getItems(selectedCategory);

  const isItemOwned = (item: ShopItem): boolean => {
    const list =
      item.category === 'avatar'
        ? profile.inventory.avatars
        : item.category === 'frame'
        ? profile.inventory.frames
        : profile.inventory.effects;
    return list.includes(item.id);
  };

  const isItemEquipped = (item: ShopItem): boolean => {
    if (item.category === 'avatar') return profile.avatar === item.icon;
    if (item.category === 'frame') return profile.avatarFrame === item.id;
    if (item.category === 'effect') return profile.equippedEffect === item.id;
    return false;
  };

  const handleBuy = (item: ShopItem) => {
    soundService.playTick();
    const res = shopService.buyItem(item.id);
    if (res.success) {
      soundService.playComboMilestone();
      telegramService.hapticNotification('success');
      fireConfetti();
      onShowToast(res.message, 'success');
      onRefreshProfile();
    } else {
      soundService.playWrong();
      telegramService.hapticNotification('error');
      onShowToast(res.message, 'error');
    }
  };

  const handleEquip = (item: ShopItem) => {
    soundService.playTick();
    const res = shopService.equipItem(item.id);
    if (res.success) {
      telegramService.hapticImpact('medium');
      onShowToast(res.message, 'success');
      onRefreshProfile();
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: '16px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 900,
            letterSpacing: '0.5px',
            color: '#FFFFFF',
          }}
        >
          COIN VAULT
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          Customize your battle identity with earned coins
        </p>

        {/* Currency Separation Disclosure Banner */}
        <div
          style={{
            marginTop: 10,
            background: 'rgba(255, 183, 3, 0.1)',
            border: '1px solid rgba(255, 183, 3, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            fontSize: '0.72rem',
            color: '#FFB703',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ShieldAlert size={14} />
          <span>Fictional In-Game Coins • Telegram Stars Payments coming in v2.0</span>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'rgba(19, 23, 44, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
          marginBottom: 16,
        }}
      >
        {(['avatar', 'frame', 'effect'] as ShopCategory[]).map((cat) => {
          const isActive = selectedCategory === cat;
          const label = cat === 'avatar' ? 'Avatars' : cat === 'frame' ? 'Frames' : 'Effects';

          return (
            <button
              key={cat}
              onClick={() => {
                soundService.playTick();
                setSelectedCategory(cat);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg, #00E5FF, #7928CA)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
              }}
              id={`shop-cat-${cat}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Items Catalogue Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flex: 1 }}>
        {items.map((item) => {
          const owned = isItemOwned(item);
          const equipped = isItemEquipped(item);
          const canAfford = profile.coins >= item.price;

          const rarityColor =
            item.rarity === 'legendary'
              ? '#FFB703'
              : item.rarity === 'epic'
              ? '#FF007F'
              : item.rarity === 'rare'
              ? '#00E5FF'
              : 'var(--text-muted)';

          return (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                borderColor: equipped ? 'var(--color-cyan)' : 'var(--border-subtle)',
                boxShadow: equipped ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                position: 'relative',
              }}
            >
              {/* Rarity tag */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: rarityColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {item.rarity}
              </div>

              {/* Equipped badge */}
              {equipped && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--color-cyan)',
                    color: '#0B0D19',
                    borderRadius: 99,
                    padding: '1px 5px',
                    fontSize: '0.6rem',
                    fontWeight: 900,
                  }}
                >
                  EQUIPPED
                </div>
              )}

              {/* Item Icon / Preview */}
              <div
                className={item.category === 'frame' ? `avatar-container ${item.id}` : ''}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  margin: '14px 0 10px',
                }}
              >
                {item.icon}
              </div>

              {/* Item info */}
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF' }}>{item.name}</div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    marginTop: 3,
                    minHeight: 28,
                    lineHeight: 1.2,
                  }}
                >
                  {item.description}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 12, width: '100%' }}>
                {equipped ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(0, 229, 255, 0.1)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      color: 'var(--color-cyan)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={14} /> Active
                  </button>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                    id={`btn-equip-${item.id}`}
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: canAfford
                        ? 'linear-gradient(135deg, #FFB703, #FF5400)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      color: canAfford ? '#0B0D19' : 'var(--text-muted)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                    id={`btn-buy-${item.id}`}
                  >
                    <Coins size={12} />
                    <span>{item.price === 0 ? 'FREE' : item.price}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
