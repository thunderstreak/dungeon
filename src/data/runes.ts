// 符文数据 - 5品质符文，含属性加成

import type { EquipmentRarity, RuneType } from '@/config/types';

// ==================== 符文数据结构 ====================

/** 符文属性加成 */
export interface RuneEffect {
  stat: string;
  type: 'flat' | 'percent';
  value: number;
}

/** 符文等级数据 (一个符文在不同品质下的效果) */
export interface RuneLevelEffect {
  rarity: EquipmentRarity;
  levelReq: number;
  effects: RuneEffect[];
  specialEffect: string | null;
}

/** 符文定义 */
export interface RuneDefinition {
  id: string;
  name: string;
  type: RuneType;
  description: string;
  levels: RuneLevelEffect[];
  icon: string;
}

// ==================== 攻击符文 (战士) ====================

const WARRIOR_ATTACK_RUNES: RuneDefinition[] = [
  {
    id: 'rune_strength',
    name: '力量符文',
    type: 'attack',
    description: '提升物理攻击力',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'physicalAttack', type: 'percent', value: 3 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'physicalAttack', type: 'percent', value: 4 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'physicalAttack', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'physicalAttack', type: 'percent', value: 7 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'physicalAttack', type: 'percent', value: 8 }], specialEffect: null },
    ],
    icon: 'rune_strength',
  },
  {
    id: 'rune_critical',
    name: '暴击符文',
    type: 'attack',
    description: '提升暴击率',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'criticalRate', type: 'percent', value: 2 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'criticalRate', type: 'percent', value: 3 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'criticalRate', type: 'percent', value: 4 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'criticalRate', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'criticalRate', type: 'percent', value: 6 }], specialEffect: null },
    ],
    icon: 'rune_critical',
  },
  {
    id: 'rune_lifesteal',
    name: '吸血符文',
    type: 'attack',
    description: '攻击吸血',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'lifeSteal', type: 'percent', value: 2 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'lifeSteal', type: 'percent', value: 4 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'lifeSteal', type: 'percent', value: 6 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'lifeSteal', type: 'percent', value: 8 }], specialEffect: null },
    ],
    icon: 'rune_lifesteal',
  },
  {
    id: 'rune_penetrate',
    name: '穿透符文',
    type: 'attack',
    description: '无视防御',
    levels: [
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'armorPenetration', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'armorPenetration', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'armorPenetration', type: 'percent', value: 15 }], specialEffect: null },
    ],
    icon: 'rune_penetrate',
  },
  {
    id: 'rune_combo',
    name: '连击符文',
    type: 'attack',
    description: '攻击有几率二连击',
    levels: [
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'comboChance', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'comboChance', type: 'percent', value: 20 }], specialEffect: null },
    ],
    icon: 'rune_combo',
  },
];

// ==================== 攻击符文 (法师) ====================

const MAGE_ATTACK_RUNES: RuneDefinition[] = [
  {
    id: 'rune_wisdom',
    name: '智慧符文',
    type: 'attack',
    description: '提升魔法攻击力',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'magicAttack', type: 'percent', value: 3 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'magicAttack', type: 'percent', value: 4 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'magicAttack', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'magicAttack', type: 'percent', value: 7 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'magicAttack', type: 'percent', value: 8 }], specialEffect: null },
    ],
    icon: 'rune_wisdom',
  },
  {
    id: 'rune_mana',
    name: '法力符文',
    type: 'attack',
    description: '提升MP上限',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'mp', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'mp', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'mp', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'mp', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'mp', type: 'percent', value: 15 }], specialEffect: null },
    ],
    icon: 'rune_mana',
  },
  {
    id: 'rune_frost',
    name: '冰霜符文',
    type: 'element',
    description: '提升冰系伤害',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'iceDamage', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'iceDamage', type: 'percent', value: 14 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'iceDamage', type: 'percent', value: 20 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'iceDamage', type: 'percent', value: 25 }], specialEffect: null },
    ],
    icon: 'rune_frost',
  },
  {
    id: 'rune_thunder',
    name: '雷霆符文',
    type: 'element',
    description: '提升雷系伤害',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'thunderDamage', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'thunderDamage', type: 'percent', value: 14 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'thunderDamage', type: 'percent', value: 20 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'thunderDamage', type: 'percent', value: 25 }], specialEffect: null },
    ],
    icon: 'rune_thunder',
  },
  {
    id: 'rune_flame',
    name: '烈焰符文',
    type: 'element',
    description: '提升火系伤害',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'fireDamage', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'fireDamage', type: 'percent', value: 14 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'fireDamage', type: 'percent', value: 20 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'fireDamage', type: 'percent', value: 25 }], specialEffect: null },
    ],
    icon: 'rune_flame',
  },
  {
    id: 'rune_chain',
    name: '连锁符文',
    type: 'attack',
    description: '魔法攻击有几率连锁',
    levels: [
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'chainChance', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'chainChance', type: 'percent', value: 25 }], specialEffect: null },
    ],
    icon: 'rune_chain',
  },
];

// ==================== 防御符文 ====================

const DEFENSE_RUNES: RuneDefinition[] = [
  {
    id: 'rune_vitality',
    name: '坚韧符文',
    type: 'defense',
    description: '提升生命值',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'hp', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'hp', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'hp', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'hp', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'hp', type: 'percent', value: 15 }], specialEffect: null },
    ],
    icon: 'rune_vitality',
  },
  {
    id: 'rune_armor',
    name: '护甲符文',
    type: 'defense',
    description: '提升物理防御',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'physicalDefense', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'physicalDefense', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'physicalDefense', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'physicalDefense', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'physicalDefense', type: 'percent', value: 15 }], specialEffect: null },
    ],
    icon: 'rune_armor',
  },
  {
    id: 'rune_magic_resist',
    name: '魔抗符文',
    type: 'defense',
    description: '提升魔法抗性',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'magicDefense', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'magicDefense', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'magicDefense', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'magicDefense', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'magicDefense', type: 'percent', value: 15 }], specialEffect: null },
    ],
    icon: 'rune_magic_resist',
  },
  {
    id: 'rune_dodge',
    name: '闪避符文',
    type: 'defense',
    description: '提升闪避率',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'dodgeRate', type: 'percent', value: 3 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'dodgeRate', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'dodgeRate', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'dodgeRate', type: 'percent', value: 10 }], specialEffect: null },
    ],
    icon: 'rune_dodge',
  },
  {
    id: 'rune_block',
    name: '格挡符文',
    type: 'defense',
    description: '提升格挡率',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'blockRate', type: 'percent', value: 3 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'blockRate', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'blockRate', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'blockRate', type: 'percent', value: 10 }], specialEffect: null },
    ],
    icon: 'rune_block',
  },
  {
    id: 'rune_thorns',
    name: '反伤符文',
    type: 'defense',
    description: '受伤反弹伤害',
    levels: [
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'thornsDamage', type: 'percent', value: 3 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'thornsDamage', type: 'percent', value: 7 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'thornsDamage', type: 'percent', value: 10 }], specialEffect: null },
    ],
    icon: 'rune_thorns',
  },
  {
    id: 'rune_regen',
    name: '再生符文',
    type: 'defense',
    description: '每秒回复生命',
    levels: [
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'hpRegen', type: 'percent', value: 0.5 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'hpRegen', type: 'percent', value: 1.5 }], specialEffect: null },
    ],
    icon: 'rune_regen',
  },
];

// ==================== 功能符文 ====================

const FUNCTION_RUNES: RuneDefinition[] = [
  {
    id: 'rune_greed',
    name: '贪婪符文',
    type: 'function',
    description: '提升金币获取',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'goldBonus', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'goldBonus', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'goldBonus', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'goldBonus', type: 'percent', value: 16 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'goldBonus', type: 'percent', value: 20 }], specialEffect: null },
    ],
    icon: 'rune_greed',
  },
  {
    id: 'rune_exp',
    name: '经验符文',
    type: 'function',
    description: '提升经验获取',
    levels: [
      { rarity: 'white', levelReq: 1, effects: [{ stat: 'expBonus', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'expBonus', type: 'percent', value: 8 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'expBonus', type: 'percent', value: 12 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'expBonus', type: 'percent', value: 16 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'expBonus', type: 'percent', value: 20 }], specialEffect: null },
    ],
    icon: 'rune_exp',
  },
  {
    id: 'rune_recovery',
    name: '回复符文',
    type: 'function',
    description: '脱战后HP回复',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'outOfCombatRegen', type: 'percent', value: 20 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'outOfCombatRegen', type: 'percent', value: 35 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'outOfCombatRegen', type: 'percent', value: 50 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'outOfCombatRegen', type: 'percent', value: 60 }], specialEffect: null },
    ],
    icon: 'rune_recovery',
  },
  {
    id: 'rune_enhance',
    name: '强化符文',
    type: 'function',
    description: '提升装备强化成功率',
    levels: [
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'enhanceSuccessRate', type: 'percent', value: 5 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'enhanceSuccessRate', type: 'percent', value: 10 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'enhanceSuccessRate', type: 'percent', value: 15 }], specialEffect: null },
    ],
    icon: 'rune_enhance',
  },
  {
    id: 'rune_durability',
    name: '耐久符文',
    type: 'function',
    description: '降低装备耐久消耗',
    levels: [
      { rarity: 'blue', levelReq: 10, effects: [{ stat: 'durabilityReduction', type: 'percent', value: 20 }], specialEffect: null },
      { rarity: 'purple', levelReq: 20, effects: [{ stat: 'durabilityReduction', type: 'percent', value: 30 }], specialEffect: null },
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'durabilityReduction', type: 'percent', value: 40 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'durabilityReduction', type: 'percent', value: 50 }], specialEffect: null },
    ],
    icon: 'rune_durability',
  },
  {
    id: 'rune_teleport',
    name: '传送符文',
    type: 'function',
    description: '降低传送冷却',
    levels: [
      { rarity: 'pink', levelReq: 30, effects: [{ stat: 'teleportCooldownReduction', type: 'percent', value: 30 }], specialEffect: null },
      { rarity: 'orange', levelReq: 40, effects: [{ stat: 'teleportCooldownReduction', type: 'percent', value: 60 }], specialEffect: null },
    ],
    icon: 'rune_teleport',
  },
];

// ==================== 主数组与查询 ====================

/** 所有符文定义 */
export const ALL_RUNES: RuneDefinition[] = [
  ...WARRIOR_ATTACK_RUNES,
  ...MAGE_ATTACK_RUNES,
  ...DEFENSE_RUNES,
  ...FUNCTION_RUNES,
];

/** 符文合成费用 */
export const RUNE_CRAFT_COST: Record<string, { materials: number; gold: number }> = {
  blue: { materials: 3, gold: 100 },
  purple: { materials: 3, gold: 500 },
  pink: { materials: 3, gold: 2000 },
  orange: { materials: 3, gold: 10000 },
};

/** 符文分解获得碎片数 */
export const RUNE_SHARD_YIELD: Record<EquipmentRarity, number> = {
  white: 1,
  blue: 2,
  purple: 3,
  pink: 5,
  orange: 8,
};

/** 按ID查询符文 */
export function getRuneById(id: string): RuneDefinition | undefined {
  return ALL_RUNES.find(r => r.id === id);
}

/** 按类型查询符文 */
export function getRunesByType(type: RuneType): RuneDefinition[] {
  return ALL_RUNES.filter(r => r.type === type);
}

/** 按品质查询符文 (返回包含该品质等级的符文) */
export function getRunesByRarity(rarity: EquipmentRarity): RuneDefinition[] {
  return ALL_RUNES.filter(r => r.levels.some(l => l.rarity === rarity));
}

/** 符文总数 */
export const RUNE_COUNT = ALL_RUNES.length;
