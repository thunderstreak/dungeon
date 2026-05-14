// 掉落系统 - 掉落率计算、保底机制、深渊加成

import type { EquipmentRarity } from '@/config/types';
import type { MonsterDefinition } from '@/data/monsters';
import type { BossDefinition } from '@/data/bosses';

// ==================== 掉落率配置 ====================

/** 普通怪物装备掉落率 */
const MONSTER_DROP_RATES: Record<EquipmentRarity, number> = {
  white: 0.60,
  blue: 0.25,
  purple: 0.12,
  pink: 0.025,
  orange: 0.005,
};

/** 精英怪装备掉落率 (必定蓝色以上) */
const ELITE_DROP_RATES: Record<EquipmentRarity, number> = {
  white: 0,      // 精英怪不掉落白色
  blue: 0.55,
  purple: 0.30,
  pink: 0.10,
  orange: 0.05,
};

/** Boss装备掉落率 */
const BOSS_DROP_RATES: Record<EquipmentRarity, number> = {
  white: 0.30,
  blue: 0.35,
  purple: 0.25,
  pink: 0.08,
  orange: 0.02,
};

/** 药水掉落率 */
const POTION_DROP_RATE: Record<string, number> = {
  normal: 0.30,
  elite: 0.50,
  boss: 1.0,
};

/** 强化材料掉落率 */
const MATERIAL_DROP_RATE: Record<string, number> = {
  normal: 0.20,
  elite: 0.40,
  boss: 0.80,
};

// ==================== 保底计数器 ====================

export class PityCounter {
  private normalMonsterCount = 0;      // 普通怪计数
  private pinkOrangeCount = 0;         // 粉橙掉落计数

  /** 记录一次击杀 (未掉落粉橙装备时调用) */
  recordKill(droppedPinkOrOrange: boolean): void {
    this.normalMonsterCount++;
    if (droppedPinkOrOrange) {
      this.pinkOrangeCount = 0;
    } else {
      this.pinkOrangeCount++;
    }
  }

  /** 获取紫色以上掉落倍率 */
  getPurpleMultiplier(): number {
    // 连续50个怪物未掉落紫色以上: ×2
    return this.normalMonsterCount >= 50 ? 2 : 1;
  }

  /** 获取粉色以上掉落倍率 */
  getPinkMultiplier(): number {
    // 连续100个怪物未掉落粉色以上: ×3
    return this.pinkOrangeCount >= 100 ? 3 : 1;
  }

  /** 重置计数器 */
  reset(): void {
    this.normalMonsterCount = 0;
    this.pinkOrangeCount = 0;
  }
}

// ==================== 掉落计算 ====================

export interface DropResult {
  equipmentDropped: boolean;
  equipmentRarity: EquipmentRarity | null;
  potionDropped: boolean;
  materialDropped: boolean;
  goldAmount: number;
  expAmount: number;
  isBossFirstKill: boolean;
}

/** 计算怪物掉落 */
export function calculateMonsterDrop(
  monster: MonsterDefinition,
  floorMultiplier: number,
  isElite: boolean,
  pity: PityCounter,
): DropResult {
  const dropRates = isElite ? ELITE_DROP_RATES : MONSTER_DROP_RATES;
  const monsterType = isElite ? 'elite' : 'normal';

  // 经验和金币
  const expAmount = Math.floor(monster.expReward * floorMultiplier);
  const goldAmount = Math.floor(
    (monster.goldReward[0] + Math.random() * (monster.goldReward[1] - monster.goldReward[0]))
    * floorMultiplier
  );

  // 装备掉落
  let equipmentRarity: EquipmentRarity | null = null;
  const rarityOrder: EquipmentRarity[] = ['orange', 'pink', 'purple', 'blue', 'white'];

  for (const rarity of rarityOrder) {
    let rate = dropRates[rarity];
    // 保底加成
    if (rarity === 'purple' || rarity === 'pink' || rarity === 'orange') {
      rate *= pity.getPurpleMultiplier();
    }
    if (rarity === 'pink' || rarity === 'orange') {
      rate *= pity.getPinkMultiplier();
    }

    if (Math.random() < rate) {
      equipmentRarity = rarity;
      break;
    }
  }

  // 精英怪必定掉落蓝色以上装备
  if (isElite && equipmentRarity === null) {
    // 如果没有随机到装备，强制掉落蓝色
    equipmentRarity = 'blue';
  }

  // 药水掉落
  const potionDropped = Math.random() < (POTION_DROP_RATE[monsterType] ?? 0.3);

  // 材料掉落
  const materialDropped = Math.random() < (MATERIAL_DROP_RATE[monsterType] ?? 0.2);

  // 更新保底计数
  pity.recordKill(equipmentRarity === 'pink' || equipmentRarity === 'orange');

  return {
    equipmentDropped: equipmentRarity !== null,
    equipmentRarity,
    potionDropped,
    materialDropped,
    goldAmount,
    expAmount,
    isBossFirstKill: false,
  };
}

/** 计算Boss掉落 */
export function calculateBossDrop(
  boss: BossDefinition,
  isFirstKill: boolean,
): DropResult {
  const dropRates = boss.lootTable.equipmentRarity;

  // 经验和金币
  const expAmount = boss.expReward;
  const goldAmount = Math.floor(
    boss.goldReward[0] + Math.random() * (boss.goldReward[1] - boss.goldReward[0])
  );

  // 装备掉落
  let equipmentRarity: EquipmentRarity | null = null;
  const rarityOrder: EquipmentRarity[] = ['orange', 'pink', 'purple', 'blue', 'white'];

  for (const rarity of rarityOrder) {
    let rate = dropRates[rarity];
    // 首次击败必定掉落粉色以上
    if (isFirstKill && (rarity === 'pink' || rarity === 'orange')) {
      rate = 1.0;
    }
    if (Math.random() < rate) {
      equipmentRarity = rarity;
      break;
    }
  }

  // Boss必定掉药水
  const potionDropped = boss.lootTable.potionChance > 0;

  // 材料掉落
  const materialDropped = Math.random() < boss.lootTable.materialChance;

  // 保底掉落
  if (!equipmentRarity && boss.lootTable.guaranteedDrop) {
    if (Math.random() < boss.lootTable.guaranteedDrop.chance) {
      equipmentRarity = boss.lootTable.guaranteedDrop.rarity;
    }
  }

  return {
    equipmentDropped: equipmentRarity !== null,
    equipmentRarity,
    potionDropped,
    materialDropped,
    goldAmount,
    expAmount,
    isBossFirstKill: isFirstKill,
  };
}

// ==================== 深渊加成 ====================

/** 深渊模式掉落倍率 */
export const ABYSS_DROP_MULTIPLIER = {
  pinkRate: 3,    // 粉色掉落率 ×3
  orangeRate: 3,  // 橙色掉落率 ×3
  expMultiplier: 2,
  goldMultiplier: 2,
};

/** 应用深渊加成到掉落率 */
export function applyAbyssModifier(
  dropRates: Record<EquipmentRarity, number>,
): Record<EquipmentRarity, number> {
  return {
    ...dropRates,
    pink: dropRates.pink * ABYSS_DROP_MULTIPLIER.pinkRate,
    orange: dropRates.orange * ABYSS_DROP_MULTIPLIER.orangeRate,
  };
}
