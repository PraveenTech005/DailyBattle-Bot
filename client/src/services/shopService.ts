import type { ShopItem, ShopCategory } from '../types/shop';
import { SHOP_ITEMS } from '../data/shopData';
import { userService } from './userService';

class ShopService {
  public getItems(category?: ShopCategory): ShopItem[] {
    if (!category) return SHOP_ITEMS;
    return SHOP_ITEMS.filter((item) => item.category === category);
  }

  public getItemById(id: string): ShopItem | undefined {
    return SHOP_ITEMS.find((item) => item.id === id);
  }

  public buyItem(itemId: string): { success: boolean; message: string } {
    const item = this.getItemById(itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    const profile = userService.getProfile();

    // Check if already owned
    const categoryKey = item.category === 'avatar' ? 'avatars' : item.category === 'frame' ? 'frames' : 'effects';
    if (profile.inventory[categoryKey].includes(itemId)) {
      return { success: false, message: 'Item already owned' };
    }

    if (profile.coins < item.price) {
      return { success: false, message: `Need ${item.price - profile.coins} more coins!` };
    }

    // Deduct coins and add to inventory
    const updatedInventory = {
      ...profile.inventory,
      [categoryKey]: [...profile.inventory[categoryKey], itemId],
    };

    // Auto-equip purchased item
    const updates: Record<string, unknown> = {
      coins: profile.coins - item.price,
      inventory: updatedInventory,
    };

    if (item.category === 'avatar') {
      updates.avatar = item.icon;
    } else if (item.category === 'frame') {
      updates.avatarFrame = item.id;
    } else if (item.category === 'effect') {
      updates.equippedEffect = item.id;
    }

    userService.updateProfile(updates);
    return { success: true, message: `Purchased and equipped ${item.name}!` };
  }

  public equipItem(itemId: string): { success: boolean; message: string } {
    const item = this.getItemById(itemId);
    if (!item) return { success: false, message: 'Item not found' };

    const profile = userService.getProfile();
    const categoryKey = item.category === 'avatar' ? 'avatars' : item.category === 'frame' ? 'frames' : 'effects';

    if (!profile.inventory[categoryKey].includes(itemId)) {
      return { success: false, message: 'You do not own this item' };
    }

    if (item.category === 'avatar') {
      userService.updateProfile({ avatar: item.icon });
    } else if (item.category === 'frame') {
      userService.updateProfile({ avatarFrame: item.id });
    } else if (item.category === 'effect') {
      userService.updateProfile({ equippedEffect: item.id });
    }

    return { success: true, message: `Equipped ${item.name}!` };
  }
}

export const shopService = new ShopService();
