// 商人NPC - 买卖、等级门控库存、每日刷新

import type { NPCData, Character } from '@/config/types';
import { NPC } from '../NPC';
import { addItem, removeItem, addGold, spendGold } from '@/systems/InventorySystem';

export class Merchant extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  /** 购买物品 */
  buy(character: Character, itemId: string, price: number): boolean {
    if (!spendGold(character, price)) return false;
    // 创建物品对象（简化）
    const item = { id: itemId, name: itemId, type: 'consumable' as const, icon: '', description: '', isStackable: true, maxStack: 20 };
    const added = addItem(character, item, 1);
    if (added <= 0) {
      addGold(character, price); // 退还金币
      return false;
    }
    return true;
  }

  /** 出售物品 */
  sell(character: Character, itemId: string, sellPrice: number): boolean {
    if (!removeItem(character, itemId, 1)) return false;
    addGold(character, sellPrice);
    return true;
  }
}
