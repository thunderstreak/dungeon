// 物品数据 - 药水与材料

import type { ItemType, EquipmentRarity, EffectValueType } from '@/config/types';

/** 物品效果 */
export interface ItemEffect {
  stat: string;
  type: EffectValueType;
  value: number;
  duration?: number; // 秒, -1=永久, 无=即时
}

/** 药水数据 */
export interface PotionData {
  id: string;
  name: string;
  type: ItemType;
  rarity: EquipmentRarity;
  description: string;
  icon: string;
  isStackable: boolean;
  maxStack: number;
  cooldown: number; // 秒
  price: number;
  effects: ItemEffect[];
}

/** 材料数据 */
export interface MaterialData {
  id: string;
  name: string;
  type: ItemType;
  rarity: EquipmentRarity;
  description: string;
  icon: string;
  isStackable: boolean;
  maxStack: number;
  price: number;
}

// ==================== 恢复药水 ====================

export const HEALING_POTIONS: PotionData[] = [
  {
    id: 'potion_hp_small',
    name: '小型生命药水',
    type: 'consumable',
    rarity: 'white',
    description: '回复50HP',
    icon: 'potion_hp_small',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 10,
    effects: [{ stat: 'hp', type: 'flat', value: 50 }],
  },
  {
    id: 'potion_hp_medium',
    name: '中型生命药水',
    type: 'consumable',
    rarity: 'blue',
    description: '回复150HP',
    icon: 'potion_hp_medium',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 30,
    effects: [{ stat: 'hp', type: 'flat', value: 150 }],
  },
  {
    id: 'potion_hp_large',
    name: '大型生命药水',
    type: 'consumable',
    rarity: 'purple',
    description: '回复350HP',
    icon: 'potion_hp_large',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 80,
    effects: [{ stat: 'hp', type: 'flat', value: 350 }],
  },
  {
    id: 'potion_hp_xlarge',
    name: '特大生命药水',
    type: 'consumable',
    rarity: 'pink',
    description: '回复800HP',
    icon: 'potion_hp_xlarge',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 200,
    effects: [{ stat: 'hp', type: 'flat', value: 800 }],
  },
  {
    id: 'potion_hp_full',
    name: '满血药水',
    type: 'consumable',
    rarity: 'orange',
    description: '回复全部HP',
    icon: 'potion_hp_full',
    isStackable: true,
    maxStack: 20,
    cooldown: 30,
    price: 500,
    effects: [{ stat: 'hp', type: 'percent', value: 100 }],
  },
  {
    id: 'potion_mp_small',
    name: '小型魔力药水',
    type: 'consumable',
    rarity: 'white',
    description: '回复30MP',
    icon: 'potion_mp_small',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 15,
    effects: [{ stat: 'mp', type: 'flat', value: 30 }],
  },
  {
    id: 'potion_mp_medium',
    name: '中型魔力药水',
    type: 'consumable',
    rarity: 'blue',
    description: '回复90MP',
    icon: 'potion_mp_medium',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 45,
    effects: [{ stat: 'mp', type: 'flat', value: 90 }],
  },
  {
    id: 'potion_mp_large',
    name: '大型魔力药水',
    type: 'consumable',
    rarity: 'purple',
    description: '回复200MP',
    icon: 'potion_mp_large',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 120,
    effects: [{ stat: 'mp', type: 'flat', value: 200 }],
  },
  {
    id: 'potion_mp_xlarge',
    name: '特大魔力药水',
    type: 'consumable',
    rarity: 'pink',
    description: '回复500MP',
    icon: 'potion_mp_xlarge',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 300,
    effects: [{ stat: 'mp', type: 'flat', value: 500 }],
  },
  {
    id: 'potion_mp_full',
    name: '满蓝药水',
    type: 'consumable',
    rarity: 'orange',
    description: '回复全部MP',
    icon: 'potion_mp_full',
    isStackable: true,
    maxStack: 20,
    cooldown: 30,
    price: 600,
    effects: [{ stat: 'mp', type: 'percent', value: 100 }],
  },
  {
    id: 'potion_dual',
    name: '双重药水',
    type: 'consumable',
    rarity: 'purple',
    description: '回复200HP+100MP',
    icon: 'potion_dual',
    isStackable: true,
    maxStack: 20,
    cooldown: 15,
    price: 150,
    effects: [
      { stat: 'hp', type: 'flat', value: 200 },
      { stat: 'mp', type: 'flat', value: 100 },
    ],
  },
];

// ==================== 增益药水 ====================

export const BUFF_POTIONS: PotionData[] = [
  {
    id: 'potion_str',
    name: '力量药水',
    type: 'consumable',
    rarity: 'white',
    description: '物理攻击+10%，持续60秒',
    icon: 'potion_str',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 20,
    effects: [{ stat: 'physicalAttack', type: 'percent', value: 10, duration: 60 }],
  },
  {
    id: 'potion_str_2',
    name: '力量药水II',
    type: 'consumable',
    rarity: 'blue',
    description: '物理攻击+20%，持续60秒',
    icon: 'potion_str_2',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 60,
    effects: [{ stat: 'physicalAttack', type: 'percent', value: 20, duration: 60 }],
  },
  {
    id: 'potion_int',
    name: '智慧药水',
    type: 'consumable',
    rarity: 'white',
    description: '魔法攻击+10%，持续60秒',
    icon: 'potion_int',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 20,
    effects: [{ stat: 'magicAttack', type: 'percent', value: 10, duration: 60 }],
  },
  {
    id: 'potion_int_2',
    name: '智慧药水II',
    type: 'consumable',
    rarity: 'blue',
    description: '魔法攻击+20%，持续60秒',
    icon: 'potion_int_2',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 60,
    effects: [{ stat: 'magicAttack', type: 'percent', value: 20, duration: 60 }],
  },
  {
    id: 'potion_agi',
    name: '敏捷药水',
    type: 'consumable',
    rarity: 'white',
    description: '攻击速度+10%，持续60秒',
    icon: 'potion_agi',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 20,
    effects: [{ stat: 'attackSpeed', type: 'percent', value: 10, duration: 60 }],
  },
  {
    id: 'potion_agi_2',
    name: '敏捷药水II',
    type: 'consumable',
    rarity: 'blue',
    description: '攻击速度+20%，持续60秒',
    icon: 'potion_agi_2',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 60,
    effects: [{ stat: 'attackSpeed', type: 'percent', value: 20, duration: 60 }],
  },
  {
    id: 'potion_def',
    name: '铁皮药水',
    type: 'consumable',
    rarity: 'white',
    description: '物理防御+15%，持续60秒',
    icon: 'potion_def',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 20,
    effects: [{ stat: 'physicalDefense', type: 'percent', value: 15, duration: 60 }],
  },
  {
    id: 'potion_def_2',
    name: '铁皮药水II',
    type: 'consumable',
    rarity: 'blue',
    description: '物理防御+30%，持续60秒',
    icon: 'potion_def_2',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 60,
    effects: [{ stat: 'physicalDefense', type: 'percent', value: 30, duration: 60 }],
  },
  {
    id: 'potion_mdef',
    name: '魔抗药水',
    type: 'consumable',
    rarity: 'white',
    description: '魔法抗性+15%，持续60秒',
    icon: 'potion_mdef',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 20,
    effects: [{ stat: 'magicDefense', type: 'percent', value: 15, duration: 60 }],
  },
  {
    id: 'potion_mdef_2',
    name: '魔抗药水II',
    type: 'consumable',
    rarity: 'blue',
    description: '魔法抗性+30%，持续60秒',
    icon: 'potion_mdef_2',
    isStackable: true,
    maxStack: 20,
    cooldown: 120,
    price: 60,
    effects: [{ stat: 'magicDefense', type: 'percent', value: 30, duration: 60 }],
  },
  {
    id: 'potion_berserk',
    name: '狂暴药水',
    type: 'consumable',
    rarity: 'purple',
    description: '攻击力+25%，防御力-10%，持续30秒',
    icon: 'potion_berserk',
    isStackable: true,
    maxStack: 20,
    cooldown: 180,
    price: 150,
    effects: [
      { stat: 'physicalAttack', type: 'percent', value: 25, duration: 30 },
      { stat: 'physicalDefense', type: 'percent', value: -10, duration: 30 },
    ],
  },
  {
    id: 'potion_swift',
    name: '疾风药水',
    type: 'consumable',
    rarity: 'purple',
    description: '移动速度+30%，攻击速度+15%，持续30秒',
    icon: 'potion_swift',
    isStackable: true,
    maxStack: 20,
    cooldown: 180,
    price: 150,
    effects: [
      { stat: 'moveSpeed', type: 'percent', value: 30, duration: 30 },
      { stat: 'attackSpeed', type: 'percent', value: 15, duration: 30 },
    ],
  },
  {
    id: 'potion_iron',
    name: '钢铁药水',
    type: 'consumable',
    rarity: 'purple',
    description: '受到伤害-20%，持续30秒',
    icon: 'potion_iron',
    isStackable: true,
    maxStack: 20,
    cooldown: 180,
    price: 150,
    effects: [{ stat: 'damage_reduction', type: 'percent', value: 20, duration: 30 }],
  },
];

// ==================== 特殊药水 ====================

export const SPECIAL_POTIONS: PotionData[] = [
  {
    id: 'potion_cure_poison',
    name: '解毒药水',
    type: 'consumable',
    rarity: 'white',
    description: '解除中毒状态',
    icon: 'potion_cure',
    isStackable: true,
    maxStack: 20,
    cooldown: 5,
    price: 5,
    effects: [{ stat: 'cure_poison', type: 'flat', value: 1 }],
  },
  {
    id: 'potion_purify',
    name: '净化药水',
    type: 'consumable',
    rarity: 'blue',
    description: '解除所有负面状态',
    icon: 'potion_purify',
    isStackable: true,
    maxStack: 20,
    cooldown: 10,
    price: 30,
    effects: [{ stat: 'cure_all_debuff', type: 'flat', value: 1 }],
  },
  {
    id: 'potion_revive',
    name: '复活药水',
    type: 'consumable',
    rarity: 'pink',
    description: '死亡后原地复活，回复50%HP',
    icon: 'potion_revive',
    isStackable: true,
    maxStack: 20,
    cooldown: 0,
    price: 500,
    effects: [{ stat: 'revive', type: 'percent', value: 50 }],
  },
  {
    id: 'potion_teleport',
    name: '传送药水',
    type: 'consumable',
    rarity: 'blue',
    description: '立即传送回城镇',
    icon: 'potion_teleport',
    isStackable: true,
    maxStack: 20,
    cooldown: 300,
    price: 50,
    effects: [{ stat: 'teleport_town', type: 'flat', value: 1 }],
  },
  {
    id: 'potion_exp',
    name: '经验药水',
    type: 'consumable',
    rarity: 'purple',
    description: '经验获取+50%，持续300秒',
    icon: 'potion_exp',
    isStackable: true,
    maxStack: 20,
    cooldown: 300,
    price: 200,
    effects: [{ stat: 'exp_bonus', type: 'percent', value: 50, duration: 300 }],
  },
  {
    id: 'potion_gold',
    name: '金币药水',
    type: 'consumable',
    rarity: 'purple',
    description: '金币获取+50%，持续300秒',
    icon: 'potion_gold',
    isStackable: true,
    maxStack: 20,
    cooldown: 300,
    price: 200,
    effects: [{ stat: 'gold_bonus', type: 'percent', value: 50, duration: 300 }],
  },
  {
    id: 'potion_abyss',
    name: '深渊药水',
    type: 'consumable',
    rarity: 'orange',
    description: '全属性+15%，免疫负面状态，持续60秒',
    icon: 'potion_abyss',
    isStackable: true,
    maxStack: 20,
    cooldown: 60,
    price: 0,
    effects: [
      { stat: 'all_stats', type: 'percent', value: 15, duration: 60 },
      { stat: 'debuff_immune', type: 'flat', value: 1, duration: 60 },
    ],
  },
];

// ==================== 强化材料 ====================

export const MATERIALS: MaterialData[] = [
  {
    id: 'mat_ore_common',
    name: '普通矿石',
    type: 'material',
    rarity: 'white',
    description: '基础强化材料，用于+1~+5强化',
    icon: 'mat_ore_common',
    isStackable: true,
    maxStack: 99,
    price: 10,
  },
  {
    id: 'mat_ore_fine',
    name: '精铁矿',
    type: 'material',
    rarity: 'blue',
    description: '中级强化材料，用于+6~+10强化',
    icon: 'mat_ore_fine',
    isStackable: true,
    maxStack: 99,
    price: 40,
  },
  {
    id: 'mat_ore_mithril',
    name: '秘银矿',
    type: 'material',
    rarity: 'purple',
    description: '高级强化材料，用于+11~+15强化',
    icon: 'mat_ore_mithril',
    isStackable: true,
    maxStack: 99,
    price: 100,
  },
  {
    id: 'mat_ore_adamantine',
    name: '精金矿',
    type: 'material',
    rarity: 'pink',
    description: '稀有强化材料，用于+16~+20强化',
    icon: 'mat_ore_adamantine',
    isStackable: true,
    maxStack: 99,
    price: 250,
  },
  {
    id: 'mat_abyss_crystal',
    name: '深渊结晶',
    type: 'material',
    rarity: 'orange',
    description: '传说强化材料，用于+19~+20强化',
    icon: 'mat_abyss_crystal',
    isStackable: true,
    maxStack: 99,
    price: 500,
  },
  {
    id: 'mat_herb',
    name: '草药',
    type: 'material',
    rarity: 'white',
    description: '炼金基础材料',
    icon: 'mat_herb',
    isStackable: true,
    maxStack: 99,
    price: 5,
  },
  {
    id: 'mat_magic_essence',
    name: '魔法精华',
    type: 'material',
    rarity: 'blue',
    description: '蕴含魔力的精华，用于制作高级物品',
    icon: 'mat_magic_essence',
    isStackable: true,
    maxStack: 99,
    price: 50,
  },
  {
    id: 'mat_rare_ore',
    name: '稀有矿石',
    type: 'material',
    rarity: 'purple',
    description: '稀有矿石，用于制作高级装备',
    icon: 'mat_rare_ore',
    isStackable: true,
    maxStack: 99,
    price: 100,
  },
];

// ==================== 辅助材料 ====================

export const AUXILIARY_MATERIALS: MaterialData[] = [
  {
    id: 'mat_enhance_protect',
    name: '强化保护券',
    type: 'material',
    rarity: 'purple',
    description: '强化失败不降级（+11以上）',
    icon: 'mat_protect',
    isStackable: true,
    maxStack: 20,
    price: 0,
  },
  {
    id: 'mat_lucky_charm',
    name: '幸运符',
    type: 'material',
    rarity: 'pink',
    description: '强化成功率+15%',
    icon: 'mat_lucky',
    isStackable: true,
    maxStack: 20,
    price: 0,
  },
  {
    id: 'mat_perfect_stone',
    name: '完美强化石',
    type: 'material',
    rarity: 'orange',
    description: '强化必定成功（限+15以下）',
    icon: 'mat_perfect',
    isStackable: true,
    maxStack: 10,
    price: 0,
  },
  {
    id: 'mat_repair_scroll',
    name: '耐久修复卷',
    type: 'material',
    rarity: 'white',
    description: '修复装备50%耐久',
    icon: 'mat_repair',
    isStackable: true,
    maxStack: 20,
    price: 0,
  },
  {
    id: 'mat_full_repair_scroll',
    name: '完全修复卷',
    type: 'material',
    rarity: 'blue',
    description: '修复装备100%耐久',
    icon: 'mat_full_repair',
    isStackable: true,
    maxStack: 20,
    price: 0,
  },
];

// ==================== 汇总 ====================

/** 所有药水 */
export const ALL_POTIONS: PotionData[] = [
  ...HEALING_POTIONS,
  ...BUFF_POTIONS,
  ...SPECIAL_POTIONS,
];

/** 所有材料 */
export const ALL_MATERIALS: MaterialData[] = [
  ...MATERIALS,
  ...AUXILIARY_MATERIALS,
];

/** 按ID获取药水 */
export function getPotionById(id: string): PotionData | undefined {
  return ALL_POTIONS.find(p => p.id === id);
}

/** 按ID获取材料 */
export function getMaterialById(id: string): MaterialData | undefined {
  return ALL_MATERIALS.find(m => m.id === id);
}
