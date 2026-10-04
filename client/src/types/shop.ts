export type ShopCategory = 'avatar' | 'frame' | 'effect';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  previewStyle?: Record<string, string>;
}
