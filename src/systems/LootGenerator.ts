// 掉落物生成 - 从 DropResult 生成实际物品

import type { DropResult } from './DropSystem';
import type { GroundLootItem } from '@/entities/GroundLoot';
import { getEquipmentByRarity } from '@/data/equipment';
import { HEALING_POTIONS, MATERIALS } from '@/data/items';

/** 根据掉落结果和玩家等级生成地面掉落物品 */
export function generateLootItems(drop: DropResult, playerLevel: number): GroundLootItem[] {
  const items: GroundLootItem[] = [];

  // 装备掉落
  if (drop.equipmentDropped && drop.equipmentRarity) {
    const candidates = getEquipmentByRarity(drop.equipmentRarity);
    const filtered = candidates.filter(e => e.level <= playerLevel);
    const pool = filtered.length > 0 ? filtered : candidates;
    if (pool.length > 0) {
      const template = pool[Math.floor(Math.random() * pool.length)];
      items.push({
        itemId: template.id,
        name: template.name,
        type: 'equipment',
        rarity: drop.equipmentRarity,
        count: 1,
      });
    }
  }

  // 药水掉落
  if (drop.potionDropped) {
    const healingPotions = HEALING_POTIONS.filter(p => {
      if (playerLevel <= 5) return p.rarity === 'white';
      if (playerLevel <= 15) return p.rarity === 'white' || p.rarity === 'blue';
      return true;
    });
    if (healingPotions.length > 0) {
      const potion = healingPotions[Math.floor(Math.random() * healingPotions.length)];
      items.push({
        itemId: potion.id,
        name: potion.name,
        type: 'potion',
        rarity: potion.rarity,
        count: 1,
      });
    }
  }

  // 材料掉落
  if (drop.materialDropped) {
    const materials = MATERIALS.filter(m => {
      if (playerLevel <= 5) return m.rarity === 'white';
      if (playerLevel <= 15) return m.rarity === 'white' || m.rarity === 'blue';
      return true;
    });
    if (materials.length > 0) {
      const mat = materials[Math.floor(Math.random() * materials.length)];
      items.push({
        itemId: mat.id,
        name: mat.name,
        type: 'material',
        rarity: mat.rarity,
        count: 1,
      });
    }
  }

  return items;
}
