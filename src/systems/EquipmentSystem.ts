// 装备系统 - 穿戴/卸下、属性计算、套装效果、耐久、强化

import type { Character, Equipment, EquipmentSlot, StatBonus, SetBonus } from '@/config/types';
import { eventBus } from './EventBus';
import { ENHANCE_COST, ENHANCE_SUCCESS_RATE } from '@/data/npcs';
import { PURPLE_SETS, WARRIOR_PINK_SETS, MAGE_PINK_SETS } from '@/data/equipment';
import { recalculateStats } from './LevelSystem';

// ==================== 穿戴/卸下 ====================

/** 穿戴装备，返回旧装备（如有） */
export function equipItem(character: Character, equipment: Equipment, slot: EquipmentSlot): { success: boolean; unequipped: Equipment | null } {
  // 检查等级要求
  if (character.level < equipment.requirement.level) {
    return { success: false, unequipped: null };
  }

  // 检查职业要求（武器类型检查）
  if (slot === 'weapon') {
    const weaponType = equipment.type;
    if (character.class === 'warrior' && !['sword', 'blade', 'axe'].includes(weaponType)) {
      return { success: false, unequipped: null };
    }
    if (character.class === 'mage' && !['long_staff', 'short_staff', 'wand'].includes(weaponType)) {
      return { success: false, unequipped: null };
    }
  }

  // 检查盾牌只限战士
  if (slot === 'shield' && character.class === 'mage') {
    return { success: false, unequipped: null };
  }

  // 如果该槽位已有装备，先卸下
  let unequipped: Equipment | null = null;
  const current = character.equipment[slot];
  if (current) {
    unequipped = unequipItem(character, slot);
  }

  character.equipment[slot] = equipment;
  eventBus.emit('equipment:equip', { slot, itemId: equipment.id });

  // 重新计算属性（先重置基础值，再叠加装备）
  recalculateStats(character);
  recalculateEquipmentStats(character);
  return { success: true, unequipped };
}

/** 卸下装备 */
export function unequipItem(character: Character, slot: EquipmentSlot): Equipment | null {
  const equipment = character.equipment[slot];
  if (!equipment) return null;

  character.equipment[slot] = null;
  eventBus.emit('equipment:unequip', { slot, itemId: equipment.id });

  // 重新计算属性（先重置基础值，再叠加装备）
  recalculateStats(character);
  recalculateEquipmentStats(character);
  return equipment;
}

// ==================== 属性计算 ====================

/** 从所有已穿戴装备计算总属性加成 */
export function calculateEquipmentBonuses(character: Character): Map<string, { flat: number; percent: number }> {
  const bonuses = new Map<string, { flat: number; percent: number }>();

  // 遍历所有装备槽位
  for (const slot of Object.values(character.equipment)) {
    if (!slot) continue;

    // 0耐久时属性减半
    const durabilityMultiplier = slot.durability <= 0 ? 0.5 : 1;

    // 基础属性加成
    for (const stat of slot.stats) {
      addStatBonus(bonuses, {
        stat: stat.stat,
        type: stat.type,
        value: Math.floor(stat.value * durabilityMultiplier),
      });
    }

    // 强化加成: 每级+2%基础属性
    if (slot.enhancementLevel > 0) {
      const enhanceMultiplier = slot.enhancementLevel * 0.02;
      for (const stat of slot.stats) {
        if (stat.type === 'flat') {
          addStatBonus(bonuses, {
            stat: stat.stat,
            type: 'flat',
            value: Math.floor(stat.value * enhanceMultiplier * durabilityMultiplier),
          });
        }
      }
    }
  }

  // 套装效果
  const setBonuses = calculateSetBonuses(character);
  for (const effect of setBonuses) {
    addStatBonus(bonuses, effect);
  }

  return bonuses;
}

/** 应用装备属性到角色stats */
export function recalculateEquipmentStats(character: Character): void {
  const bonuses = calculateEquipmentBonuses(character);
  const stats = character.stats;

  // 先重置装备相关属性为基础值（由LevelSystem计算的基础值）
  // 这里只叠加装备加成
  for (const [stat, { flat, percent }] of bonuses) {
    // hp/mp 加成应用到 maxHp/maxMp
    const actualStat = stat === 'hp' ? 'maxHp' : stat === 'mp' ? 'maxMp' : stat;
    if (actualStat in stats) {
      const key = actualStat as keyof typeof stats;
      const baseVal = stats[key] as number;
      stats[key] = (baseVal + flat) * (1 + percent / 100) as typeof stats[typeof key];
    }
  }

  // 装备加成后，当前HP/MP同步为最大值
  stats.hp = stats.maxHp;
  stats.mp = stats.maxMp;
}

// ==================== 套装效果 ====================

/** 计算已穿戴装备的套装效果 */
function calculateSetBonuses(character: Character): StatBonus[] {
  const allSets = [...PURPLE_SETS, ...WARRIOR_PINK_SETS, ...MAGE_PINK_SETS];
  const result: StatBonus[] = [];

  // 统计每个套装穿了几件
  const setCounts = new Map<string, number>();
  for (const slot of Object.values(character.equipment)) {
    if (!slot?.setBonus) continue;
    const setId = slot.setBonus.setId;
    setCounts.set(setId, (setCounts.get(setId) ?? 0) + 1);
  }

  // 应用套装效果
  for (const [setId, count] of setCounts) {
    const setDef = allSets.find(s => s.setId === setId);
    if (!setDef) continue;

    for (const bonus of setDef.bonuses) {
      if (count >= bonus.requiredPieces) {
        result.push(...bonus.effects);
      }
    }
  }

  return result;
}

/** 获取当前激活的套装信息 */
export function getActiveSets(character: Character): Array<{ setId: string; setName: string; count: number; maxPieces: number }> {
  const allSets = [...PURPLE_SETS, ...WARRIOR_PINK_SETS, ...MAGE_PINK_SETS];
  const setCounts = new Map<string, number>();

  for (const slot of Object.values(character.equipment)) {
    if (!slot?.setBonus) continue;
    setCounts.set(slot.setBonus.setId, (setCounts.get(slot.setBonus.setId) ?? 0) + 1);
  }

  const result: Array<{ setId: string; setName: string; count: number; maxPieces: number }> = [];
  for (const [setId, count] of setCounts) {
    const setDef = allSets.find(s => s.setId === setId);
    if (setDef) {
      const maxPieces = Math.max(...setDef.bonuses.map(b => b.requiredPieces));
      result.push({ setId, setName: setDef.setName, count, maxPieces });
    }
  }
  return result;
}

// ==================== 耐久系统 ====================

/** 消耗耐久 */
export function consumeDurability(character: Character, slot: EquipmentSlot, amount: number): void {
  const equipment = character.equipment[slot];
  if (!equipment) return;

  equipment.durability = Math.max(0, equipment.durability - amount);
}

/** 修理装备 */
export function repairEquipment(character: Character, slot: EquipmentSlot): number {
  const equipment = character.equipment[slot];
  if (!equipment) return 0;

  const repairCost = Math.ceil(equipment.maxDurability * 0.2 * (1 - equipment.durability / equipment.maxDurability));
  equipment.durability = equipment.maxDurability;
  return repairCost;
}

/** 修理所有装备 */
export function repairAllEquipment(character: Character): number {
  let totalCost = 0;
  for (const slot of Object.keys(character.equipment) as EquipmentSlot[]) {
    totalCost += repairEquipment(character, slot);
  }
  return totalCost;
}

// ==================== 强化系统 ====================

export interface EnhanceResult {
  success: boolean;
  newLevel: number;
  consumeGold: number;
  consumeMaterials: number;
}

/** 强化装备 */
export function enhanceEquipment(
  character: Character,
  equipment: Equipment,
  materialCount: number,
): EnhanceResult | null {
  const currentLevel = equipment.enhancementLevel;
  if (currentLevel >= 20) return null;

  const nextLevel = currentLevel + 1;
  const cost = ENHANCE_COST[nextLevel];
  if (!cost) return null;

  // 检查材料和金币
  if (materialCount < cost.materials) return null;

  // 计算成功率
  const successRate = ENHANCE_SUCCESS_RATE[nextLevel] ?? 0;
  const success = Math.random() < successRate;

  if (success) {
    equipment.enhancementLevel = nextLevel;
  } else {
    // +11以上失败会降级
    if (nextLevel >= 11) {
      equipment.enhancementLevel = Math.max(1, currentLevel - 1);
    }
  }

  eventBus.emit('equipment:enhance', {
    itemId: equipment.id,
    level: equipment.enhancementLevel,
    success,
  });

  // 重新计算属性
  recalculateEquipmentStats(character);

  return {
    success,
    newLevel: equipment.enhancementLevel,
    consumeGold: cost.gold,
    consumeMaterials: cost.materials,
  };
}

// ==================== 辅助函数 ====================

/** 累加属性加成 */
function addStatBonus(bonuses: Map<string, { flat: number; percent: number }>, stat: StatBonus): void {
  const existing = bonuses.get(stat.stat) ?? { flat: 0, percent: 0 };
  if (stat.type === 'flat') {
    existing.flat += stat.value;
  } else {
    existing.percent += stat.value;
  }
  bonuses.set(stat.stat, existing);
}
