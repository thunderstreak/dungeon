// 装备鉴定系统 - 未鉴定状态、鉴定费用、鉴定结果生成

import type { Equipment, EquipmentRarity, StatBonus } from '@/config/types';
import { eventBus } from './EventBus';

// ==================== 鉴定状态 ====================

/** 扩展装备接口，添加鉴定状态 */
export interface UnidentifiedEquipment extends Equipment {
  isIdentified: boolean;
  identifyCost: number;
  potentialStats: StatBonus[]; // 鉴定后可能获得的属性
}

/** 鉴定结果 */
export interface IdentifyResult {
  success: boolean;
  equipment: Equipment;
  goldCost: number;
  statsRevealed: StatBonus[];
  error?: string;
}

// ==================== 配置 ====================

/** 鉴定费用基础值 */
const BASE_IDENTIFY_COST = 50;

/** 鉴定费用品质倍率 */
const RARITY_COST_MULTIPLIER: Record<EquipmentRarity, number> = {
  white: 0.5,
  blue: 1,
  purple: 2,
  pink: 5,
  orange: 10,
};

// ==================== 未鉴定装备生成 ====================

/** 生成未鉴定装备 */
export function createUnidentifiedEquipment(equipment: Equipment): UnidentifiedEquipment {
  const identifyCost = calculateIdentifyCost(equipment.rarity);
  const potentialStats = generatePotentialStats(equipment);

  return {
    ...equipment,
    isIdentified: false,
    identifyCost,
    potentialStats,
  };
}

/** 计算鉴定费用 */
export function calculateIdentifyCost(rarity: EquipmentRarity): number {
  return Math.floor(BASE_IDENTIFY_COST * RARITY_COST_MULTIPLIER[rarity]);
}

/** 生成可能的属性 (用于预览) */
function generatePotentialStats(equipment: Equipment): StatBonus[] {
  const stats: StatBonus[] = [];

  // 根据装备品质生成1-3条随机属性
  const statCount = getStatCount(equipment.rarity);

  for (let i = 0; i < statCount; i++) {
    const stat = getRandomStat();
    const value = getRandomStatValue(stat, equipment.rarity, equipment.level);
    stats.push({ stat, type: 'flat', value });
  }

  return stats;
}

/** 根据品质获取属性条数 */
function getStatCount(rarity: EquipmentRarity): number {
  switch (rarity) {
    case 'white': return 1;
    case 'blue': return 2;
    case 'purple': return 2;
    case 'pink': return 3;
    case 'orange': return 3;
  }
}

/** 随机获取属性类型 */
function getRandomStat(): string {
  const stats = [
    'physicalAttack', 'magicAttack',
    'physicalDefense', 'magicDefense',
    'hp', 'mp',
    'criticalRate', 'criticalDamage',
    'dodgeRate', 'attackSpeed',
  ];
  return stats[Math.floor(Math.random() * stats.length)];
}

/** 随机获取属性值 */
function getRandomStatValue(stat: string, rarity: EquipmentRarity, level: number): number {
  const baseValue = 5 + level * 2;
  const rarityMultiplier = RARITY_COST_MULTIPLIER[rarity];

  // 根据属性类型调整范围
  if (stat === 'criticalRate' || stat === 'criticalDamage' || stat === 'dodgeRate') {
    return Math.floor(baseValue * 0.1 * rarityMultiplier);
  }

  return Math.floor(baseValue * rarityMultiplier);
}

// ==================== 鉴定操作 ====================

/** 检查是否可以鉴定 */
export function canIdentify(
  equipment: UnidentifiedEquipment,
  gold: number,
): { canIdentify: boolean; error?: string } {
  if (equipment.isIdentified) {
    return { canIdentify: false, error: '装备已鉴定' };
  }

  if (gold < equipment.identifyCost) {
    return { canIdentify: false, error: `金币不足，需要${equipment.identifyCost}金币` };
  }

  return { canIdentify: true };
}

/** 执行鉴定 */
export function identifyEquipment(
  equipment: UnidentifiedEquipment,
  gold: number,
): IdentifyResult {
  const validation = canIdentify(equipment, gold);
  if (!validation.canIdentify) {
    return {
      success: false,
      equipment,
      goldCost: 0,
      statsRevealed: [],
      error: validation.error,
    };
  }

  // 扣除金币
  const goldCost = equipment.identifyCost;

  // 鉴定成功，生成最终属性
  const identifiedEquipment: Equipment = {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    slot: equipment.slot,
    rarity: equipment.rarity,
    level: equipment.level,
    stats: equipment.potentialStats,
    requirement: equipment.requirement,
    enhancementLevel: equipment.enhancementLevel,
    durability: equipment.durability,
    maxDurability: equipment.maxDurability,
    setBonus: equipment.setBonus,
    isBound: equipment.isBound,
    specialEffect: equipment.specialEffect,
    icon: equipment.icon,
  };

  eventBus.emit('equipment:identify', {
    equipmentId: equipment.id,
    success: true,
  });

  return {
    success: true,
    equipment: identifiedEquipment,
    goldCost,
    statsRevealed: equipment.potentialStats,
  };
}

/** 获取鉴定预览 (显示可能的属性范围) */
export function getIdentifyPreview(equipment: UnidentifiedEquipment): {
  possibleStats: StatBonus[];
  cost: number;
} {
  return {
    possibleStats: equipment.potentialStats,
    cost: equipment.identifyCost,
  };
}

// ==================== 事件声明 ====================

declare module './EventBus' {
  interface GameEvents {
    'equipment:identify': { equipmentId: string; success: boolean };
  }
}
