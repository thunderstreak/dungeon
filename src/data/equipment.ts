// 装备数据 - 武器/防具/饰品/套装/深渊装备

import type {
  EquipmentRarity, EquipmentSlot, EquipmentType,
  StatBonus, SetBonus, SetBonusEffect,
} from '@/config/types';

// ==================== 装备数据结构 ====================

/** 装备模板 (用于生成同品质不同等级的装备) */
export interface EquipmentTemplate {
  id: string;
  name: string;
  type: EquipmentType;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  level: number;
  stats: StatBonus[];
  requirement: { level: number };
  maxDurability: number;
  setBonus: SetBonus | null;
  isBound: boolean;
  specialEffect: string | null;
  icon: string;
}

/** 套装定义 */
export interface SetDefinition {
  setId: string;
  setName: string;
  bonuses: SetBonusEffect[];
}

// ==================== 套装定义 ====================

/** 紫色套装 (9套) */
export const PURPLE_SETS: SetDefinition[] = [
  {
    setId: 'set_shadow',
    setName: '暗影套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'physicalAttack', type: 'flat', value: 15 }] },
      { requiredPieces: 4, effects: [{ stat: 'criticalRate', type: 'percent', value: 5 }] },
      { requiredPieces: 6, effects: [{ stat: 'attackSpeed', type: 'percent', value: 10 }] },
    ],
  },
  {
    setId: 'set_thunder',
    setName: '雷霆套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'magicAttack', type: 'flat', value: 15 }] },
      { requiredPieces: 4, effects: [{ stat: 'criticalRate', type: 'percent', value: 5 }] },
      { requiredPieces: 6, effects: [{ stat: 'castSpeed', type: 'percent', value: 15 }] },
    ],
  },
  {
    setId: 'set_holy',
    setName: '神圣套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'hp', type: 'flat', value: 100 }] },
      { requiredPieces: 4, effects: [{ stat: 'physicalDefense', type: 'flat', value: 20 }] },
      { requiredPieces: 6, effects: [{ stat: 'magicDefense', type: 'flat', value: 20 }] },
    ],
  },
  {
    setId: 'set_storm',
    setName: '暴风套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'physicalAttack', type: 'flat', value: 20 }] },
      { requiredPieces: 4, effects: [{ stat: 'attackSpeed', type: 'percent', value: 8 }] },
      { requiredPieces: 6, effects: [{ stat: 'criticalDamage', type: 'percent', value: 20 }] },
    ],
  },
  {
    setId: 'set_hell',
    setName: '地狱套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'magicAttack', type: 'flat', value: 20 }] },
      { requiredPieces: 4, effects: [{ stat: 'castSpeed', type: 'percent', value: 10 }] },
      { requiredPieces: 6, effects: [{ stat: 'criticalDamage', type: 'percent', value: 25 }] },
    ],
  },
  {
    setId: 'set_angel',
    setName: '天使套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'hp', type: 'flat', value: 150 }] },
      { requiredPieces: 4, effects: [{ stat: 'dodgeRate', type: 'percent', value: 8 }] },
      { requiredPieces: 6, effects: [{ stat: 'moveSpeed', type: 'percent', value: 15 }] },
    ],
  },
  {
    setId: 'set_dragon',
    setName: '龙鳞套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'physicalAttack', type: 'flat', value: 25 }] },
      { requiredPieces: 4, effects: [{ stat: 'magicAttack', type: 'flat', value: 25 }] },
      { requiredPieces: 6, effects: [{ stat: 'criticalRate', type: 'percent', value: 10 }] },
    ],
  },
  {
    setId: 'set_chaos',
    setName: '混沌套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'hp', type: 'flat', value: 200 }] },
      { requiredPieces: 4, effects: [{ stat: 'physicalAttack', type: 'flat', value: 30 }] },
      { requiredPieces: 6, effects: [{ stat: 'magicAttack', type: 'flat', value: 30 }] },
    ],
  },
  {
    setId: 'set_artifact',
    setName: '神器套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'physicalAttack', type: 'flat', value: 35 }] },
      { requiredPieces: 4, effects: [{ stat: 'magicAttack', type: 'flat', value: 35 }] },
      { requiredPieces: 6, effects: [{ stat: 'criticalDamage', type: 'percent', value: 30 }] },
    ],
  },
];

/** 粉色/橙色战士套装 (3套) */
export const WARRIOR_PINK_SETS: SetDefinition[] = [
  {
    setId: 'set_berserker',
    setName: '狂战士套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'physicalAttack', type: 'percent', value: 12 }] },
      { requiredPieces: 4, effects: [{ stat: 'criticalRate', type: 'percent', value: 10 }] },
      { requiredPieces: 6, effects: [{ stat: 'attackSpeed', type: 'percent', value: 20 }] },
    ],
  },
  {
    setId: 'set_sword_saint',
    setName: '剑圣套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'criticalDamage', type: 'percent', value: 30 }] },
      { requiredPieces: 4, effects: [{ stat: 'physicalAttack', type: 'percent', value: 15 }] },
      { requiredPieces: 6, effects: [{ stat: 'criticalRate', type: 'percent', value: 15 }] },
    ],
  },
  {
    setId: 'set_blade_god',
    setName: '刀神套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'attackSpeed', type: 'percent', value: 15 }] },
      { requiredPieces: 4, effects: [{ stat: 'physicalAttack', type: 'percent', value: 18 }] },
      { requiredPieces: 6, effects: [{ stat: 'dodgeRate', type: 'percent', value: 12 }] },
    ],
  },
];

/** 粉色/橙色法师套装 (3套) */
export const MAGE_PINK_SETS: SetDefinition[] = [
  {
    setId: 'set_ice_queen',
    setName: '冰霜女皇套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'magicAttack', type: 'percent', value: 15 }] },
      { requiredPieces: 4, effects: [{ stat: 'castSpeed', type: 'percent', value: 12 }] },
      { requiredPieces: 6, effects: [{ stat: 'criticalDamage', type: 'percent', value: 30 }] },
    ],
  },
  {
    setId: 'set_thunder_lord',
    setName: '雷霆之主套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'magicAttack', type: 'percent', value: 15 }] },
      { requiredPieces: 4, effects: [{ stat: 'criticalRate', type: 'percent', value: 12 }] },
      { requiredPieces: 6, effects: [{ stat: 'castSpeed', type: 'percent', value: 18 }] },
    ],
  },
  {
    setId: 'set_flame_king',
    setName: '烈焰之王套装',
    bonuses: [
      { requiredPieces: 2, effects: [{ stat: 'magicAttack', type: 'percent', value: 18 }] },
      { requiredPieces: 4, effects: [{ stat: 'criticalDamage', type: 'percent', value: 25 }] },
      { requiredPieces: 6, effects: [{ stat: 'magicAttack', type: 'percent', value: 25 }] },
    ],
  },
];

// ==================== 辅助函数 ====================

/** 生成装备ID前缀 */
function id(type: string, level: number, name: string): string {
  return `${type}_${level}_${name}`;
}

/** 创建属性加成 */
function stat(stat: string, type: 'flat' | 'percent', value: number): StatBonus {
  return { stat, type, value };
}

/** 创建套装效果引用 */
function setRef(setId: string, setName: string, pieces: number): SetBonus {
  const allSets = [...PURPLE_SETS, ...WARRIOR_PINK_SETS, ...MAGE_PINK_SETS];
  const def = allSets.find(s => s.setId === setId);
  return {
    setId,
    setName,
    pieces,
    bonuses: def?.bonuses ?? [],
  };
}

// ==================== 战士武器 - 刀 (攻速+25%) ====================

const BLADE_LEVELS = [
  { level: 1, name: '生锈的刀', atk: [2, 3], dur: 35 },
  { level: 5, name: '铁刀', atk: [4, 6], dur: 37 },
  { level: 10, name: '钢刀', atk: [7, 10], dur: 39 },
  { level: 15, name: '精钢刀', atk: [10, 14], dur: 41 },
  { level: 20, name: '黑铁刀', atk: [14, 19], dur: 43 },
  { level: 25, name: '秘银刀', atk: [19, 25], dur: 45 },
  { level: 30, name: '精金刀', atk: [25, 33], dur: 47 },
  { level: 35, name: '魔化刀', atk: [32, 43], dur: 48 },
  { level: 40, name: '龙骨刀', atk: [40, 53], dur: 49 },
  { level: 45, name: '暗影刀', atk: [49, 65], dur: 50 },
  { level: 50, name: '混沌刀', atk: [59, 78], dur: 50 },
  { level: 55, name: '神圣刀', atk: [70, 93], dur: 50 },
  { level: 60, name: '传说刀', atk: [82, 109], dur: 50 },
];

const BLADE_PURPLES = [
  { level: 20, name: '暗影', atk: [17, 23], dur: 43 },
  { level: 25, name: '雷霆', atk: [23, 31], dur: 45 },
  { level: 30, name: '神圣', atk: [31, 41], dur: 47 },
  { level: 35, name: '暴风', atk: [40, 53], dur: 48 },
  { level: 40, name: '地狱', atk: [50, 66], dur: 49 },
  { level: 45, name: '天使', atk: [61, 81], dur: 50 },
  { level: 50, name: '龙鳞', atk: [73, 97], dur: 50 },
  { level: 55, name: '混沌', atk: [87, 115], dur: 50 },
  { level: 60, name: '神器', atk: [102, 135], dur: 50 },
];

/** 生成刀类武器 */
function generateBlades(): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  // 白色/蓝色
  for (const d of BLADE_LEVELS) {
    result.push(...makeWB('blade', 'weapon', 'blade', d.level, d.name, [
      stat('physicalAttack', 'flat', d.atk[0]),
      stat('physicalAttackMax', 'flat', d.atk[1]),
      stat('attackSpeed', 'percent', 25),
      stat('criticalRate', 'percent', 8),
    ], d.dur, 'weapon_blade'));
  }
  // 紫色
  for (const d of BLADE_PURPLES) {
    result.push(makePurple('blade', 'weapon', 'blade', d.level, `${d.name}套装`, [
      stat('physicalAttack', 'flat', d.atk[0]),
      stat('physicalAttackMax', 'flat', d.atk[1]),
      stat('attackSpeed', 'percent', 25),
      stat('criticalRate', 'percent', 10),
    ], d.dur, 'weapon_blade'));
  }
  return result;
}

// ==================== 战士武器 - 剑 (均衡) ====================

const SWORD_LEVELS = [
  { level: 1, name: '生锈的铁剑', atk: [3, 4], dur: 35 },
  { level: 5, name: '铁剑', atk: [5, 7], dur: 37 },
  { level: 10, name: '钢剑', atk: [8, 12], dur: 39 },
  { level: 15, name: '精钢剑', atk: [12, 17], dur: 41 },
  { level: 20, name: '黑铁剑', atk: [17, 23], dur: 43 },
  { level: 25, name: '秘银剑', atk: [23, 31], dur: 45 },
  { level: 30, name: '精金剑', atk: [31, 42], dur: 47 },
  { level: 35, name: '魔化剑', atk: [41, 55], dur: 48 },
  { level: 40, name: '龙骨剑', atk: [53, 70], dur: 49 },
  { level: 45, name: '暗影剑', atk: [66, 88], dur: 50 },
  { level: 50, name: '混沌剑', atk: [81, 108], dur: 50 },
  { level: 55, name: '神圣剑', atk: [99, 132], dur: 50 },
  { level: 60, name: '传说剑', atk: [120, 160], dur: 50 },
];

const SWORD_PURPLES = [
  { level: 20, name: '暗影', atk: [21, 28], dur: 43 },
  { level: 25, name: '雷霆', atk: [28, 38], dur: 45 },
  { level: 30, name: '神圣', atk: [38, 51], dur: 47 },
  { level: 35, name: '暴风', atk: [50, 67], dur: 48 },
  { level: 40, name: '地狱', atk: [64, 85], dur: 49 },
  { level: 45, name: '天使', atk: [80, 107], dur: 50 },
  { level: 50, name: '龙鳞', atk: [99, 132], dur: 50 },
  { level: 55, name: '混沌', atk: [122, 162], dur: 50 },
  { level: 60, name: '神器', atk: [148, 197], dur: 50 },
];

/** 生成剑类武器 */
function generateSwords(): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const d of SWORD_LEVELS) {
    result.push(...makeWB('sword', 'weapon', 'sword', d.level, d.name, [
      stat('physicalAttack', 'flat', d.atk[0]),
      stat('physicalAttackMax', 'flat', d.atk[1]),
      stat('attackSpeed', 'percent', 0),
      stat('criticalRate', 'percent', 5),
    ], d.dur, 'weapon_sword'));
  }
  for (const d of SWORD_PURPLES) {
    result.push(makePurple('sword', 'weapon', 'sword', d.level, `${d.name}套装`, [
      stat('physicalAttack', 'flat', d.atk[0]),
      stat('physicalAttackMax', 'flat', d.atk[1]),
      stat('attackSpeed', 'percent', 0),
      stat('criticalRate', 'percent', 7),
    ], d.dur, 'weapon_sword'));
  }
  return result;
}

// ==================== 战士武器 - 斧 (攻速-20%) ====================

const AXE_LEVELS = [
  { level: 1, name: '生锈的斧头', atk: [4, 6], dur: 35 },
  { level: 5, name: '铁斧', atk: [7, 10], dur: 37 },
  { level: 10, name: '钢斧', atk: [12, 16], dur: 39 },
  { level: 15, name: '精钢斧', atk: [17, 23], dur: 41 },
  { level: 20, name: '黑铁斧', atk: [24, 32], dur: 43 },
  { level: 25, name: '秘银斧', atk: [33, 44], dur: 45 },
  { level: 30, name: '精金斧', atk: [44, 59], dur: 47 },
  { level: 35, name: '魔化斧', atk: [58, 77], dur: 48 },
  { level: 40, name: '龙骨斧', atk: [74, 99], dur: 49 },
  { level: 45, name: '暗影斧', atk: [93, 124], dur: 50 },
  { level: 50, name: '混沌斧', atk: [115, 153], dur: 50 },
  { level: 55, name: '神圣斧', atk: [141, 188], dur: 50 },
  { level: 60, name: '传说斧', atk: [172, 229], dur: 50 },
];

const AXE_PURPLES = [
  { level: 20, name: '暗影', atk: [29, 39], dur: 43 },
  { level: 25, name: '雷霆', atk: [40, 54], dur: 45 },
  { level: 30, name: '神圣', atk: [54, 72], dur: 47 },
  { level: 35, name: '暴风', atk: [71, 95], dur: 48 },
  { level: 40, name: '地狱', atk: [92, 123], dur: 49 },
  { level: 45, name: '天使', atk: [116, 155], dur: 50 },
  { level: 50, name: '龙鳞', atk: [144, 192], dur: 50 },
  { level: 55, name: '混沌', atk: [177, 236], dur: 50 },
  { level: 60, name: '神器', atk: [216, 288], dur: 50 },
];

/** 生成斧类武器 */
function generateAxes(): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const d of AXE_LEVELS) {
    result.push(...makeWB('axe', 'weapon', 'axe', d.level, d.name, [
      stat('physicalAttack', 'flat', d.atk[0]),
      stat('physicalAttackMax', 'flat', d.atk[1]),
      stat('attackSpeed', 'percent', -20),
      stat('criticalRate', 'percent', 3),
    ], d.dur, 'weapon_axe'));
  }
  for (const d of AXE_PURPLES) {
    result.push(makePurple('axe', 'weapon', 'axe', d.level, `${d.name}套装`, [
      stat('physicalAttack', 'flat', d.atk[0]),
      stat('physicalAttackMax', 'flat', d.atk[1]),
      stat('attackSpeed', 'percent', -20),
      stat('criticalRate', 'percent', 5),
    ], d.dur, 'weapon_axe'));
  }
  return result;
}

/** 创建白色/蓝色品质装备 (共用数据，仅品质不同) */
function makeWB(
  type: string, slot: EquipmentSlot, equipType: EquipmentType,
  level: number, name: string,
  stats: StatBonus[], durability: number,
  icon: string, specialEffect?: string,
): EquipmentTemplate[] {
  const baseId = id(type, level, name);
  const rarities: EquipmentRarity[] = ['white', 'blue'];
  return rarities.map(r => ({
    id: `${baseId}_${r}`,
    name,
    type: equipType,
    slot,
    rarity: r,
    level,
    stats,
    requirement: { level },
    maxDurability: durability,
    setBonus: null,
    isBound: false,
    specialEffect: specialEffect ?? null,
    icon,
  }));
}

/** 生成紫色品质装备 (带套装) */
function makePurple(
  type: string, slot: EquipmentSlot, equipType: EquipmentType,
  level: number, setName: string,
  stats: StatBonus[], durability: number,
  icon: string,
): EquipmentTemplate {
  return {
    id: id(type, level, setName),
    name: setName.replace('套装', ''),
    type: equipType,
    slot,
    rarity: 'purple',
    level,
    stats,
    requirement: { level },
    maxDurability: durability,
    setBonus: setRef(`set_${setName.replace('套装', '').toLowerCase()}`, setName, 0),
    isBound: false,
    specialEffect: null,
    icon,
  };
}

// ==================== 法师武器 - 长杖 (施法速度-20%) ====================

const LONG_STAFF_LEVELS = [
  { level: 1, name: '生锈的长杖', atk: [3, 5], dur: 35 },
  { level: 5, name: '铁长杖', atk: [6, 9], dur: 37 },
  { level: 10, name: '钢长杖', atk: [10, 15], dur: 39 },
  { level: 15, name: '精钢长杖', atk: [15, 21], dur: 41 },
  { level: 20, name: '黑铁长杖', atk: [21, 28], dur: 43 },
  { level: 25, name: '秘银长杖', atk: [28, 38], dur: 45 },
  { level: 30, name: '精金长杖', atk: [38, 51], dur: 47 },
  { level: 35, name: '魔化长杖', atk: [50, 67], dur: 48 },
  { level: 40, name: '龙骨长杖', atk: [64, 85], dur: 49 },
  { level: 45, name: '暗影长杖', atk: [80, 107], dur: 50 },
  { level: 50, name: '混沌长杖', atk: [99, 132], dur: 50 },
  { level: 55, name: '神圣长杖', atk: [122, 162], dur: 50 },
  { level: 60, name: '传说长杖', atk: [148, 197], dur: 50 },
];

const LONG_STAFF_PURPLES = [
  { level: 20, name: '暗影', atk: [25, 33], dur: 43 },
  { level: 25, name: '雷霆', atk: [33, 45], dur: 45 },
  { level: 30, name: '神圣', atk: [45, 60], dur: 47 },
  { level: 35, name: '暴风', atk: [59, 79], dur: 48 },
  { level: 40, name: '地狱', atk: [76, 102], dur: 49 },
  { level: 45, name: '天使', atk: [96, 128], dur: 50 },
  { level: 50, name: '龙鳞', atk: [119, 159], dur: 50 },
  { level: 55, name: '混沌', atk: [147, 196], dur: 50 },
  { level: 60, name: '神器', atk: [179, 239], dur: 50 },
];

function generateLongStaves(): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const d of LONG_STAFF_LEVELS) {
    result.push(...makeWB('long_staff', 'weapon', 'long_staff', d.level, d.name, [
      stat('magicAttack', 'flat', d.atk[0]),
      stat('magicAttackMax', 'flat', d.atk[1]),
      stat('castSpeed', 'percent', -20),
      stat('criticalRate', 'percent', 3),
    ], d.dur, 'weapon_long_staff'));
  }
  for (const d of LONG_STAFF_PURPLES) {
    result.push(makePurple('long_staff', 'weapon', 'long_staff', d.level, `${d.name}套装`, [
      stat('magicAttack', 'flat', d.atk[0]),
      stat('magicAttackMax', 'flat', d.atk[1]),
      stat('castSpeed', 'percent', -20),
      stat('criticalRate', 'percent', 5),
    ], d.dur, 'weapon_long_staff'));
  }
  return result;
}

// ==================== 法师武器 - 短杖 (施法速度+25%) ====================

const SHORT_STAFF_LEVELS = [
  { level: 1, name: '生锈的短杖', atk: [2, 4], dur: 35 },
  { level: 5, name: '铁短杖', atk: [5, 7], dur: 37 },
  { level: 10, name: '钢短杖', atk: [8, 12], dur: 39 },
  { level: 15, name: '精钢短杖', atk: [12, 17], dur: 41 },
  { level: 20, name: '黑铁短杖', atk: [17, 23], dur: 43 },
  { level: 25, name: '秘银短杖', atk: [23, 31], dur: 45 },
  { level: 30, name: '精金短杖', atk: [31, 42], dur: 47 },
  { level: 35, name: '魔化短杖', atk: [41, 55], dur: 48 },
  { level: 40, name: '龙骨短杖', atk: [53, 70], dur: 49 },
  { level: 45, name: '暗影短杖', atk: [66, 88], dur: 50 },
  { level: 50, name: '混沌短杖', atk: [81, 108], dur: 50 },
  { level: 55, name: '神圣短杖', atk: [99, 132], dur: 50 },
  { level: 60, name: '传说短杖', atk: [120, 160], dur: 50 },
];

const SHORT_STAFF_PURPLES = [
  { level: 20, name: '暗影', atk: [20, 27], dur: 43 },
  { level: 25, name: '雷霆', atk: [27, 36], dur: 45 },
  { level: 30, name: '神圣', atk: [36, 48], dur: 47 },
  { level: 35, name: '暴风', atk: [47, 63], dur: 48 },
  { level: 40, name: '地狱', atk: [61, 81], dur: 49 },
  { level: 45, name: '天使', atk: [77, 102], dur: 50 },
  { level: 50, name: '龙鳞', atk: [95, 127], dur: 50 },
  { level: 55, name: '混沌', atk: [117, 156], dur: 50 },
  { level: 60, name: '神器', atk: [143, 190], dur: 50 },
];

function generateShortStaves(): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const d of SHORT_STAFF_LEVELS) {
    result.push(...makeWB('short_staff', 'weapon', 'short_staff', d.level, d.name, [
      stat('magicAttack', 'flat', d.atk[0]),
      stat('magicAttackMax', 'flat', d.atk[1]),
      stat('castSpeed', 'percent', 25),
      stat('criticalRate', 'percent', 5),
    ], d.dur, 'weapon_short_staff'));
  }
  for (const d of SHORT_STAFF_PURPLES) {
    result.push(makePurple('short_staff', 'weapon', 'short_staff', d.level, `${d.name}套装`, [
      stat('magicAttack', 'flat', d.atk[0]),
      stat('magicAttackMax', 'flat', d.atk[1]),
      stat('castSpeed', 'percent', 25),
      stat('criticalRate', 'percent', 7),
    ], d.dur, 'weapon_short_staff'));
  }
  return result;
}

// ==================== 法师武器 - 魔杖 (施法速度+0%, 技能强化) ====================

const WAND_LEVELS = [
  { level: 1, name: '生锈的魔杖', atk: [2, 4], dur: 35, dmg: 2 },
  { level: 5, name: '铁魔杖', atk: [5, 7], dur: 37, dmg: 3 },
  { level: 10, name: '钢魔杖', atk: [8, 12], dur: 39, dmg: 4 },
  { level: 15, name: '精钢魔杖', atk: [12, 17], dur: 41, dmg: 5 },
  { level: 20, name: '黑铁魔杖', atk: [17, 23], dur: 43, dmg: 6 },
  { level: 25, name: '秘银魔杖', atk: [23, 31], dur: 45, dmg: 7 },
  { level: 30, name: '精金魔杖', atk: [31, 42], dur: 47, dmg: 8 },
  { level: 35, name: '魔化魔杖', atk: [41, 55], dur: 48, dmg: 9 },
  { level: 40, name: '龙骨魔杖', atk: [53, 70], dur: 49, dmg: 10 },
  { level: 45, name: '暗影魔杖', atk: [66, 88], dur: 50, dmg: 11 },
  { level: 50, name: '混沌魔杖', atk: [81, 108], dur: 50, dmg: 12 },
  { level: 55, name: '神圣魔杖', atk: [99, 132], dur: 50, dmg: 13 },
  { level: 60, name: '传说魔杖', atk: [120, 160], dur: 50, dmg: 15 },
];

const WAND_PURPLES = [
  { level: 20, name: '暗影', atk: [20, 27], dur: 43, dmg: 8 },
  { level: 25, name: '雷霆', atk: [27, 36], dur: 45, dmg: 9 },
  { level: 30, name: '神圣', atk: [36, 48], dur: 47, dmg: 10 },
  { level: 35, name: '暴风', atk: [47, 63], dur: 48, dmg: 11 },
  { level: 40, name: '地狱', atk: [61, 81], dur: 49, dmg: 12 },
  { level: 45, name: '天使', atk: [77, 102], dur: 50, dmg: 13 },
  { level: 50, name: '龙鳞', atk: [95, 127], dur: 50, dmg: 14 },
  { level: 55, name: '混沌', atk: [117, 156], dur: 50, dmg: 15 },
  { level: 60, name: '神器', atk: [143, 190], dur: 50, dmg: 18 },
];

function generateWands(): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const d of WAND_LEVELS) {
    result.push(...makeWB('wand', 'weapon', 'wand', d.level, d.name, [
      stat('magicAttack', 'flat', d.atk[0]),
      stat('magicAttackMax', 'flat', d.atk[1]),
      stat('castSpeed', 'percent', 0),
      stat('criticalRate', 'percent', 4),
      stat('skillDamage', 'percent', d.dmg),
    ], d.dur, 'weapon_wand'));
  }
  for (const d of WAND_PURPLES) {
    result.push(makePurple('wand', 'weapon', 'wand', d.level, `${d.name}套装`, [
      stat('magicAttack', 'flat', d.atk[0]),
      stat('magicAttackMax', 'flat', d.atk[1]),
      stat('castSpeed', 'percent', 0),
      stat('criticalRate', 'percent', 6),
      stat('skillDamage', 'percent', d.dmg),
    ], d.dur, 'weapon_wand'));
  }
  return result;
}

// ==================== 防御装备 ====================

/** 通用防具等级数据 */
interface ArmorLevelData {
  level: number;
  prefix: string;
  stats: StatBonus[];
  dur: number;
}

/** 通用防具生成器 */
function generateArmorPieces(
  slot: EquipmentSlot, slotName: string,
  wbLevels: ArmorLevelData[], purpleLevels: ArmorLevelData[],
): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const d of wbLevels) {
    result.push(...makeWB(slotName, slot, 'sword' as EquipmentType, d.level, d.prefix, d.stats, d.dur, `armor_${slot}`));
  }
  for (const d of purpleLevels) {
    result.push(makePurple(slotName, slot, 'sword' as EquipmentType, d.level, `${d.prefix}套装`, d.stats, d.dur, `armor_${slot}`));
  }
  return result;
}

// ---- 上衣 (物理防御+生命值+魔法抗性) ----

const UPPER_BODY_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '布衣', stats: [stat('physicalDefense', 'flat', 2), stat('hp', 'flat', 5), stat('magicDefense', 'flat', 1)], dur: 25 },
  { level: 5, prefix: '皮甲', stats: [stat('physicalDefense', 'flat', 4), stat('hp', 'flat', 10), stat('magicDefense', 'flat', 2)], dur: 27 },
  { level: 10, prefix: '铁甲', stats: [stat('physicalDefense', 'flat', 7), stat('hp', 'flat', 18), stat('magicDefense', 'flat', 3)], dur: 28 },
  { level: 15, prefix: '钢甲', stats: [stat('physicalDefense', 'flat', 10), stat('hp', 'flat', 28), stat('magicDefense', 'flat', 4)], dur: 29 },
  { level: 20, prefix: '黑铁甲', stats: [stat('physicalDefense', 'flat', 14), stat('hp', 'flat', 40), stat('magicDefense', 'flat', 5)], dur: 30 },
  { level: 25, prefix: '秘银甲', stats: [stat('physicalDefense', 'flat', 19), stat('hp', 'flat', 55), stat('magicDefense', 'flat', 6)], dur: 31 },
  { level: 30, prefix: '精金甲', stats: [stat('physicalDefense', 'flat', 25), stat('hp', 'flat', 72), stat('magicDefense', 'flat', 7)], dur: 32 },
  { level: 35, prefix: '魔化甲', stats: [stat('physicalDefense', 'flat', 32), stat('hp', 'flat', 92), stat('magicDefense', 'flat', 8)], dur: 33 },
  { level: 40, prefix: '龙骨甲', stats: [stat('physicalDefense', 'flat', 40), stat('hp', 'flat', 115), stat('magicDefense', 'flat', 9)], dur: 34 },
  { level: 45, prefix: '暗影甲', stats: [stat('physicalDefense', 'flat', 49), stat('hp', 'flat', 140), stat('magicDefense', 'flat', 10)], dur: 35 },
  { level: 50, prefix: '混沌甲', stats: [stat('physicalDefense', 'flat', 59), stat('hp', 'flat', 168), stat('magicDefense', 'flat', 11)], dur: 35 },
  { level: 55, prefix: '神圣甲', stats: [stat('physicalDefense', 'flat', 70), stat('hp', 'flat', 200), stat('magicDefense', 'flat', 12)], dur: 35 },
  { level: 60, prefix: '传说甲', stats: [stat('physicalDefense', 'flat', 82), stat('hp', 'flat', 235), stat('magicDefense', 'flat', 13)], dur: 35 },
];

const UPPER_BODY_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('physicalDefense', 'flat', 17), stat('hp', 'flat', 50), stat('magicDefense', 'flat', 6)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('physicalDefense', 'flat', 23), stat('hp', 'flat', 68), stat('magicDefense', 'flat', 7)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('physicalDefense', 'flat', 31), stat('hp', 'flat', 90), stat('magicDefense', 'flat', 8)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('physicalDefense', 'flat', 40), stat('hp', 'flat', 115), stat('magicDefense', 'flat', 9)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('physicalDefense', 'flat', 50), stat('hp', 'flat', 144), stat('magicDefense', 'flat', 10)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('physicalDefense', 'flat', 61), stat('hp', 'flat', 175), stat('magicDefense', 'flat', 11)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('physicalDefense', 'flat', 73), stat('hp', 'flat', 210), stat('magicDefense', 'flat', 12)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('physicalDefense', 'flat', 87), stat('hp', 'flat', 250), stat('magicDefense', 'flat', 13)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('physicalDefense', 'flat', 102), stat('hp', 'flat', 294), stat('magicDefense', 'flat', 14)], dur: 35 },
];

function generateUpperBody(): EquipmentTemplate[] {
  return generateArmorPieces('armor', 'upper_body', UPPER_BODY_LEVELS, UPPER_BODY_PURPLES);
}

// ---- 下衣 (物理防御+闪避) ----

const LOWER_BODY_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '布裤', stats: [stat('physicalDefense', 'flat', 1), stat('hp', 'flat', 3), stat('dodgeRate', 'percent', 1)], dur: 25 },
  { level: 5, prefix: '皮裤', stats: [stat('physicalDefense', 'flat', 3), stat('hp', 'flat', 6), stat('dodgeRate', 'percent', 2)], dur: 27 },
  { level: 10, prefix: '铁裤', stats: [stat('physicalDefense', 'flat', 5), stat('hp', 'flat', 12), stat('dodgeRate', 'percent', 3)], dur: 28 },
  { level: 15, prefix: '钢裤', stats: [stat('physicalDefense', 'flat', 7), stat('hp', 'flat', 18), stat('dodgeRate', 'percent', 4)], dur: 29 },
  { level: 20, prefix: '黑铁裤', stats: [stat('physicalDefense', 'flat', 10), stat('hp', 'flat', 26), stat('dodgeRate', 'percent', 5)], dur: 30 },
  { level: 25, prefix: '秘银裤', stats: [stat('physicalDefense', 'flat', 13), stat('hp', 'flat', 36), stat('dodgeRate', 'percent', 6)], dur: 31 },
  { level: 30, prefix: '精金裤', stats: [stat('physicalDefense', 'flat', 18), stat('hp', 'flat', 48), stat('dodgeRate', 'percent', 7)], dur: 32 },
  { level: 35, prefix: '魔化裤', stats: [stat('physicalDefense', 'flat', 23), stat('hp', 'flat', 62), stat('dodgeRate', 'percent', 8)], dur: 33 },
  { level: 40, prefix: '龙骨裤', stats: [stat('physicalDefense', 'flat', 30), stat('hp', 'flat', 78), stat('dodgeRate', 'percent', 9)], dur: 34 },
  { level: 45, prefix: '暗影裤', stats: [stat('physicalDefense', 'flat', 37), stat('hp', 'flat', 96), stat('dodgeRate', 'percent', 10)], dur: 35 },
  { level: 50, prefix: '混沌裤', stats: [stat('physicalDefense', 'flat', 45), stat('hp', 'flat', 116), stat('dodgeRate', 'percent', 11)], dur: 35 },
  { level: 55, prefix: '神圣裤', stats: [stat('physicalDefense', 'flat', 55), stat('hp', 'flat', 138), stat('dodgeRate', 'percent', 12)], dur: 35 },
  { level: 60, prefix: '传说裤', stats: [stat('physicalDefense', 'flat', 66), stat('hp', 'flat', 164), stat('dodgeRate', 'percent', 13)], dur: 35 },
];

const LOWER_BODY_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('physicalDefense', 'flat', 12), stat('hp', 'flat', 32), stat('dodgeRate', 'percent', 6)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('physicalDefense', 'flat', 16), stat('hp', 'flat', 44), stat('dodgeRate', 'percent', 7)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('physicalDefense', 'flat', 22), stat('hp', 'flat', 58), stat('dodgeRate', 'percent', 8)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('physicalDefense', 'flat', 28), stat('hp', 'flat', 75), stat('dodgeRate', 'percent', 9)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('physicalDefense', 'flat', 36), stat('hp', 'flat', 95), stat('dodgeRate', 'percent', 10)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('physicalDefense', 'flat', 45), stat('hp', 'flat', 118), stat('dodgeRate', 'percent', 11)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('physicalDefense', 'flat', 55), stat('hp', 'flat', 144), stat('dodgeRate', 'percent', 12)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('physicalDefense', 'flat', 67), stat('hp', 'flat', 174), stat('dodgeRate', 'percent', 13)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('physicalDefense', 'flat', 82), stat('hp', 'flat', 206), stat('dodgeRate', 'percent', 14)], dur: 35 },
];

function generateLowerBody(): EquipmentTemplate[] {
  return generateArmorPieces('belt', 'lower_body', LOWER_BODY_LEVELS, LOWER_BODY_PURPLES);
}

// ---- 头盔 (生命值+魔法抗性) ----

const HELMET_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '布帽', stats: [stat('hp', 'flat', 8), stat('magicDefense', 'flat', 1)], dur: 25 },
  { level: 5, prefix: '皮帽', stats: [stat('hp', 'flat', 16), stat('magicDefense', 'flat', 2), stat('criticalRate', 'percent', 1)], dur: 27 },
  { level: 10, prefix: '铁盔', stats: [stat('hp', 'flat', 28), stat('magicDefense', 'flat', 3), stat('criticalRate', 'percent', 1)], dur: 28 },
  { level: 15, prefix: '钢盔', stats: [stat('hp', 'flat', 42), stat('magicDefense', 'flat', 4), stat('criticalRate', 'percent', 2)], dur: 29 },
  { level: 20, prefix: '黑铁盔', stats: [stat('hp', 'flat', 60), stat('magicDefense', 'flat', 5), stat('criticalRate', 'percent', 2)], dur: 30 },
  { level: 25, prefix: '秘银盔', stats: [stat('hp', 'flat', 82), stat('magicDefense', 'flat', 6), stat('criticalRate', 'percent', 3)], dur: 31 },
  { level: 30, prefix: '精金盔', stats: [stat('hp', 'flat', 108), stat('magicDefense', 'flat', 7), stat('criticalRate', 'percent', 3)], dur: 32 },
  { level: 35, prefix: '魔化盔', stats: [stat('hp', 'flat', 138), stat('magicDefense', 'flat', 8), stat('criticalRate', 'percent', 4)], dur: 33 },
  { level: 40, prefix: '龙骨盔', stats: [stat('hp', 'flat', 172), stat('magicDefense', 'flat', 9), stat('criticalRate', 'percent', 4)], dur: 34 },
  { level: 45, prefix: '暗影盔', stats: [stat('hp', 'flat', 210), stat('magicDefense', 'flat', 10), stat('criticalRate', 'percent', 5)], dur: 35 },
  { level: 50, prefix: '混沌盔', stats: [stat('hp', 'flat', 252), stat('magicDefense', 'flat', 11), stat('criticalRate', 'percent', 5)], dur: 35 },
  { level: 55, prefix: '神圣盔', stats: [stat('hp', 'flat', 300), stat('magicDefense', 'flat', 12), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 60, prefix: '传说盔', stats: [stat('hp', 'flat', 352), stat('magicDefense', 'flat', 13), stat('criticalRate', 'percent', 6)], dur: 35 },
];

const HELMET_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('hp', 'flat', 75), stat('magicDefense', 'flat', 6), stat('criticalRate', 'percent', 3)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('hp', 'flat', 102), stat('magicDefense', 'flat', 7), stat('criticalRate', 'percent', 3)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('hp', 'flat', 135), stat('magicDefense', 'flat', 8), stat('criticalRate', 'percent', 4)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('hp', 'flat', 172), stat('magicDefense', 'flat', 9), stat('criticalRate', 'percent', 4)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('hp', 'flat', 215), stat('magicDefense', 'flat', 10), stat('criticalRate', 'percent', 5)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('hp', 'flat', 262), stat('magicDefense', 'flat', 11), stat('criticalRate', 'percent', 5)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('hp', 'flat', 315), stat('magicDefense', 'flat', 12), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('hp', 'flat', 375), stat('magicDefense', 'flat', 13), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('hp', 'flat', 440), stat('magicDefense', 'flat', 14), stat('criticalRate', 'percent', 7)], dur: 35 },
];

function generateHelmets(): EquipmentTemplate[] {
  return generateArmorPieces('helmet', 'helmet', HELMET_LEVELS, HELMET_PURPLES);
}

// ---- 鞋子 (移动速度+闪避+物理防御) ----

const BOOTS_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '布鞋', stats: [stat('moveSpeed', 'percent', 5), stat('dodgeRate', 'percent', 1), stat('physicalDefense', 'flat', 1)], dur: 25 },
  { level: 5, prefix: '皮靴', stats: [stat('moveSpeed', 'percent', 8), stat('dodgeRate', 'percent', 2), stat('physicalDefense', 'flat', 2)], dur: 27 },
  { level: 10, prefix: '铁靴', stats: [stat('moveSpeed', 'percent', 10), stat('dodgeRate', 'percent', 3), stat('physicalDefense', 'flat', 3)], dur: 28 },
  { level: 15, prefix: '钢靴', stats: [stat('moveSpeed', 'percent', 12), stat('dodgeRate', 'percent', 4), stat('physicalDefense', 'flat', 4)], dur: 29 },
  { level: 20, prefix: '黑铁靴', stats: [stat('moveSpeed', 'percent', 14), stat('dodgeRate', 'percent', 5), stat('physicalDefense', 'flat', 5)], dur: 30 },
  { level: 25, prefix: '秘银靴', stats: [stat('moveSpeed', 'percent', 16), stat('dodgeRate', 'percent', 6), stat('physicalDefense', 'flat', 6)], dur: 31 },
  { level: 30, prefix: '精金靴', stats: [stat('moveSpeed', 'percent', 18), stat('dodgeRate', 'percent', 7), stat('physicalDefense', 'flat', 7)], dur: 32 },
  { level: 35, prefix: '魔化靴', stats: [stat('moveSpeed', 'percent', 20), stat('dodgeRate', 'percent', 8), stat('physicalDefense', 'flat', 8)], dur: 33 },
  { level: 40, prefix: '龙骨靴', stats: [stat('moveSpeed', 'percent', 22), stat('dodgeRate', 'percent', 9), stat('physicalDefense', 'flat', 9)], dur: 34 },
  { level: 45, prefix: '暗影靴', stats: [stat('moveSpeed', 'percent', 24), stat('dodgeRate', 'percent', 10), stat('physicalDefense', 'flat', 10)], dur: 35 },
  { level: 50, prefix: '混沌靴', stats: [stat('moveSpeed', 'percent', 26), stat('dodgeRate', 'percent', 11), stat('physicalDefense', 'flat', 11)], dur: 35 },
  { level: 55, prefix: '神圣靴', stats: [stat('moveSpeed', 'percent', 28), stat('dodgeRate', 'percent', 12), stat('physicalDefense', 'flat', 12)], dur: 35 },
  { level: 60, prefix: '传说靴', stats: [stat('moveSpeed', 'percent', 30), stat('dodgeRate', 'percent', 13), stat('physicalDefense', 'flat', 13)], dur: 35 },
];

const BOOTS_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('moveSpeed', 'percent', 18), stat('dodgeRate', 'percent', 6), stat('physicalDefense', 'flat', 6)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('moveSpeed', 'percent', 20), stat('dodgeRate', 'percent', 7), stat('physicalDefense', 'flat', 7)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('moveSpeed', 'percent', 22), stat('dodgeRate', 'percent', 8), stat('physicalDefense', 'flat', 8)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('moveSpeed', 'percent', 24), stat('dodgeRate', 'percent', 9), stat('physicalDefense', 'flat', 9)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('moveSpeed', 'percent', 26), stat('dodgeRate', 'percent', 10), stat('physicalDefense', 'flat', 10)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('moveSpeed', 'percent', 28), stat('dodgeRate', 'percent', 11), stat('physicalDefense', 'flat', 11)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('moveSpeed', 'percent', 30), stat('dodgeRate', 'percent', 12), stat('physicalDefense', 'flat', 12)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('moveSpeed', 'percent', 32), stat('dodgeRate', 'percent', 13), stat('physicalDefense', 'flat', 13)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('moveSpeed', 'percent', 35), stat('dodgeRate', 'percent', 14), stat('physicalDefense', 'flat', 14)], dur: 35 },
];

function generateBoots(): EquipmentTemplate[] {
  return generateArmorPieces('boots', 'boots', BOOTS_LEVELS, BOOTS_PURPLES);
}

// ---- 腰带 (生命值+攻击速度) ----

const BELT_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '布腰带', stats: [stat('hp', 'flat', 5), stat('attackSpeed', 'percent', 2)], dur: 25 },
  { level: 5, prefix: '皮腰带', stats: [stat('hp', 'flat', 10), stat('attackSpeed', 'percent', 3), stat('criticalRate', 'percent', 1)], dur: 27 },
  { level: 10, prefix: '铁腰带', stats: [stat('hp', 'flat', 18), stat('attackSpeed', 'percent', 4), stat('criticalRate', 'percent', 1)], dur: 28 },
  { level: 15, prefix: '钢腰带', stats: [stat('hp', 'flat', 28), stat('attackSpeed', 'percent', 5), stat('criticalRate', 'percent', 2)], dur: 29 },
  { level: 20, prefix: '黑铁腰带', stats: [stat('hp', 'flat', 40), stat('attackSpeed', 'percent', 6), stat('criticalRate', 'percent', 2)], dur: 30 },
  { level: 25, prefix: '秘银腰带', stats: [stat('hp', 'flat', 55), stat('attackSpeed', 'percent', 7), stat('criticalRate', 'percent', 3)], dur: 31 },
  { level: 30, prefix: '精金腰带', stats: [stat('hp', 'flat', 72), stat('attackSpeed', 'percent', 8), stat('criticalRate', 'percent', 3)], dur: 32 },
  { level: 35, prefix: '魔化腰带', stats: [stat('hp', 'flat', 92), stat('attackSpeed', 'percent', 9), stat('criticalRate', 'percent', 4)], dur: 33 },
  { level: 40, prefix: '龙骨腰带', stats: [stat('hp', 'flat', 115), stat('attackSpeed', 'percent', 10), stat('criticalRate', 'percent', 4)], dur: 34 },
  { level: 45, prefix: '暗影腰带', stats: [stat('hp', 'flat', 140), stat('attackSpeed', 'percent', 11), stat('criticalRate', 'percent', 5)], dur: 35 },
  { level: 50, prefix: '混沌腰带', stats: [stat('hp', 'flat', 168), stat('attackSpeed', 'percent', 12), stat('criticalRate', 'percent', 5)], dur: 35 },
  { level: 55, prefix: '神圣腰带', stats: [stat('hp', 'flat', 200), stat('attackSpeed', 'percent', 13), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 60, prefix: '传说腰带', stats: [stat('hp', 'flat', 235), stat('attackSpeed', 'percent', 15), stat('criticalRate', 'percent', 6)], dur: 35 },
];

const BELT_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('hp', 'flat', 50), stat('attackSpeed', 'percent', 8), stat('criticalRate', 'percent', 3)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('hp', 'flat', 68), stat('attackSpeed', 'percent', 9), stat('criticalRate', 'percent', 3)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('hp', 'flat', 90), stat('attackSpeed', 'percent', 10), stat('criticalRate', 'percent', 4)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('hp', 'flat', 115), stat('attackSpeed', 'percent', 11), stat('criticalRate', 'percent', 4)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('hp', 'flat', 144), stat('attackSpeed', 'percent', 12), stat('criticalRate', 'percent', 5)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('hp', 'flat', 175), stat('attackSpeed', 'percent', 13), stat('criticalRate', 'percent', 5)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('hp', 'flat', 210), stat('attackSpeed', 'percent', 14), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('hp', 'flat', 250), stat('attackSpeed', 'percent', 15), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('hp', 'flat', 294), stat('attackSpeed', 'percent', 18), stat('criticalRate', 'percent', 7)], dur: 35 },
];

function generateBelts(): EquipmentTemplate[] {
  return generateArmorPieces('belt', 'belt', BELT_LEVELS, BELT_PURPLES);
}

// ---- 项链 (魔法攻击+暴击伤害+施法速度) ----

const NECKLACE_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '铜项链', stats: [stat('magicAttack', 'flat', 1), stat('criticalDamage', 'percent', 5), stat('castSpeed', 'percent', 1)], dur: 25 },
  { level: 5, prefix: '铁项链', stats: [stat('magicAttack', 'flat', 2), stat('criticalDamage', 'percent', 8), stat('castSpeed', 'percent', 2)], dur: 27 },
  { level: 10, prefix: '钢项链', stats: [stat('magicAttack', 'flat', 4), stat('criticalDamage', 'percent', 12), stat('castSpeed', 'percent', 3)], dur: 28 },
  { level: 15, prefix: '精钢项链', stats: [stat('magicAttack', 'flat', 7), stat('criticalDamage', 'percent', 16), stat('castSpeed', 'percent', 4)], dur: 29 },
  { level: 20, prefix: '黑铁项链', stats: [stat('magicAttack', 'flat', 10), stat('criticalDamage', 'percent', 20), stat('castSpeed', 'percent', 5)], dur: 30 },
  { level: 25, prefix: '秘银项链', stats: [stat('magicAttack', 'flat', 14), stat('criticalDamage', 'percent', 25), stat('castSpeed', 'percent', 6)], dur: 31 },
  { level: 30, prefix: '精金项链', stats: [stat('magicAttack', 'flat', 19), stat('criticalDamage', 'percent', 30), stat('castSpeed', 'percent', 7)], dur: 32 },
  { level: 35, prefix: '魔化项链', stats: [stat('magicAttack', 'flat', 25), stat('criticalDamage', 'percent', 35), stat('castSpeed', 'percent', 8)], dur: 33 },
  { level: 40, prefix: '龙骨项链', stats: [stat('magicAttack', 'flat', 32), stat('criticalDamage', 'percent', 40), stat('castSpeed', 'percent', 9)], dur: 34 },
  { level: 45, prefix: '暗影项链', stats: [stat('magicAttack', 'flat', 40), stat('criticalDamage', 'percent', 45), stat('castSpeed', 'percent', 10)], dur: 35 },
  { level: 50, prefix: '混沌项链', stats: [stat('magicAttack', 'flat', 49), stat('criticalDamage', 'percent', 50), stat('castSpeed', 'percent', 11)], dur: 35 },
  { level: 55, prefix: '神圣项链', stats: [stat('magicAttack', 'flat', 60), stat('criticalDamage', 'percent', 55), stat('castSpeed', 'percent', 12)], dur: 35 },
  { level: 60, prefix: '传说项链', stats: [stat('magicAttack', 'flat', 72), stat('criticalDamage', 'percent', 60), stat('castSpeed', 'percent', 13)], dur: 35 },
];

const NECKLACE_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('magicAttack', 'flat', 12), stat('criticalDamage', 'percent', 25), stat('castSpeed', 'percent', 6)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('magicAttack', 'flat', 17), stat('criticalDamage', 'percent', 30), stat('castSpeed', 'percent', 7)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('magicAttack', 'flat', 23), stat('criticalDamage', 'percent', 35), stat('castSpeed', 'percent', 8)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('magicAttack', 'flat', 31), stat('criticalDamage', 'percent', 40), stat('castSpeed', 'percent', 9)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('magicAttack', 'flat', 40), stat('criticalDamage', 'percent', 45), stat('castSpeed', 'percent', 10)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('magicAttack', 'flat', 50), stat('criticalDamage', 'percent', 50), stat('castSpeed', 'percent', 11)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('magicAttack', 'flat', 61), stat('criticalDamage', 'percent', 55), stat('castSpeed', 'percent', 12)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('magicAttack', 'flat', 75), stat('criticalDamage', 'percent', 60), stat('castSpeed', 'percent', 13)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('magicAttack', 'flat', 91), stat('criticalDamage', 'percent', 65), stat('castSpeed', 'percent', 15)], dur: 35 },
];

function generateNecklaces(): EquipmentTemplate[] {
  return generateArmorPieces('necklace', 'necklace', NECKLACE_LEVELS, NECKLACE_PURPLES);
}

// ---- 戒指 (物理攻击+暴击率) ----

const RING_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '铜戒指', stats: [stat('physicalAttack', 'flat', 1), stat('criticalRate', 'percent', 1)], dur: 25 },
  { level: 5, prefix: '铁戒指', stats: [stat('physicalAttack', 'flat', 2), stat('criticalRate', 'percent', 2)], dur: 27 },
  { level: 10, prefix: '钢戒指', stats: [stat('physicalAttack', 'flat', 3), stat('criticalRate', 'percent', 2)], dur: 28 },
  { level: 15, prefix: '精钢戒指', stats: [stat('physicalAttack', 'flat', 5), stat('criticalRate', 'percent', 3)], dur: 29 },
  { level: 20, prefix: '黑铁戒指', stats: [stat('physicalAttack', 'flat', 7), stat('criticalRate', 'percent', 3)], dur: 30 },
  { level: 25, prefix: '秘银戒指', stats: [stat('physicalAttack', 'flat', 9), stat('criticalRate', 'percent', 4)], dur: 31 },
  { level: 30, prefix: '精金戒指', stats: [stat('physicalAttack', 'flat', 12), stat('criticalRate', 'percent', 4)], dur: 32 },
  { level: 35, prefix: '魔化戒指', stats: [stat('physicalAttack', 'flat', 15), stat('criticalRate', 'percent', 5)], dur: 33 },
  { level: 40, prefix: '龙骨戒指', stats: [stat('physicalAttack', 'flat', 19), stat('criticalRate', 'percent', 5)], dur: 34 },
  { level: 45, prefix: '暗影戒指', stats: [stat('physicalAttack', 'flat', 23), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 50, prefix: '混沌戒指', stats: [stat('physicalAttack', 'flat', 28), stat('criticalRate', 'percent', 6)], dur: 35 },
  { level: 55, prefix: '神圣戒指', stats: [stat('physicalAttack', 'flat', 34), stat('criticalRate', 'percent', 7)], dur: 35 },
  { level: 60, prefix: '传说戒指', stats: [stat('physicalAttack', 'flat', 41), stat('criticalRate', 'percent', 8)], dur: 35 },
];

const RING_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('physicalAttack', 'flat', 9), stat('criticalRate', 'percent', 4)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('physicalAttack', 'flat', 12), stat('criticalRate', 'percent', 5)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('physicalAttack', 'flat', 16), stat('criticalRate', 'percent', 5)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('physicalAttack', 'flat', 20), stat('criticalRate', 'percent', 6)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('physicalAttack', 'flat', 25), stat('criticalRate', 'percent', 6)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('physicalAttack', 'flat', 30), stat('criticalRate', 'percent', 7)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('physicalAttack', 'flat', 36), stat('criticalRate', 'percent', 7)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('physicalAttack', 'flat', 44), stat('criticalRate', 'percent', 8)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('physicalAttack', 'flat', 53), stat('criticalRate', 'percent', 9)], dur: 35 },
];

function generateRings(): EquipmentTemplate[] {
  return generateArmorPieces('ring1', 'ring', RING_LEVELS, RING_PURPLES);
}

// ---- 手镯 (魔法攻击+施法速度) ----

const BRACELET_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '铜手镯', stats: [stat('magicAttack', 'flat', 1), stat('castSpeed', 'percent', 1)], dur: 25 },
  { level: 5, prefix: '铁手镯', stats: [stat('magicAttack', 'flat', 2), stat('castSpeed', 'percent', 2)], dur: 27 },
  { level: 10, prefix: '钢手镯', stats: [stat('magicAttack', 'flat', 3), stat('castSpeed', 'percent', 2)], dur: 28 },
  { level: 15, prefix: '精钢手镯', stats: [stat('magicAttack', 'flat', 5), stat('castSpeed', 'percent', 3)], dur: 29 },
  { level: 20, prefix: '黑铁手镯', stats: [stat('magicAttack', 'flat', 7), stat('castSpeed', 'percent', 3)], dur: 30 },
  { level: 25, prefix: '秘银手镯', stats: [stat('magicAttack', 'flat', 9), stat('castSpeed', 'percent', 4)], dur: 31 },
  { level: 30, prefix: '精金手镯', stats: [stat('magicAttack', 'flat', 12), stat('castSpeed', 'percent', 4)], dur: 32 },
  { level: 35, prefix: '魔化手镯', stats: [stat('magicAttack', 'flat', 15), stat('castSpeed', 'percent', 5)], dur: 33 },
  { level: 40, prefix: '龙骨手镯', stats: [stat('magicAttack', 'flat', 19), stat('castSpeed', 'percent', 5)], dur: 34 },
  { level: 45, prefix: '暗影手镯', stats: [stat('magicAttack', 'flat', 23), stat('castSpeed', 'percent', 6)], dur: 35 },
  { level: 50, prefix: '混沌手镯', stats: [stat('magicAttack', 'flat', 28), stat('castSpeed', 'percent', 6)], dur: 35 },
  { level: 55, prefix: '神圣手镯', stats: [stat('magicAttack', 'flat', 34), stat('castSpeed', 'percent', 7)], dur: 35 },
  { level: 60, prefix: '传说手镯', stats: [stat('magicAttack', 'flat', 41), stat('castSpeed', 'percent', 8)], dur: 35 },
];

const BRACELET_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('magicAttack', 'flat', 9), stat('castSpeed', 'percent', 4)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('magicAttack', 'flat', 12), stat('castSpeed', 'percent', 5)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('magicAttack', 'flat', 16), stat('castSpeed', 'percent', 5)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('magicAttack', 'flat', 20), stat('castSpeed', 'percent', 6)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('magicAttack', 'flat', 25), stat('castSpeed', 'percent', 6)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('magicAttack', 'flat', 30), stat('castSpeed', 'percent', 7)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('magicAttack', 'flat', 36), stat('castSpeed', 'percent', 7)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('magicAttack', 'flat', 44), stat('castSpeed', 'percent', 8)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('magicAttack', 'flat', 53), stat('castSpeed', 'percent', 9)], dur: 35 },
];

function generateBracelets(): EquipmentTemplate[] {
  return generateArmorPieces('bracelet1', 'bracelet', BRACELET_LEVELS, BRACELET_PURPLES);
}

// ---- 盾牌 (格挡率+物理防御+魔法抗性) ----

const SHIELD_LEVELS: ArmorLevelData[] = [
  { level: 1, prefix: '木盾', stats: [stat('blockRate', 'percent', 5), stat('physicalDefense', 'flat', 2), stat('magicDefense', 'flat', 1)], dur: 25 },
  { level: 5, prefix: '皮盾', stats: [stat('blockRate', 'percent', 8), stat('physicalDefense', 'flat', 3), stat('magicDefense', 'flat', 2)], dur: 27 },
  { level: 10, prefix: '铁盾', stats: [stat('blockRate', 'percent', 12), stat('physicalDefense', 'flat', 5), stat('magicDefense', 'flat', 3)], dur: 28 },
  { level: 15, prefix: '钢盾', stats: [stat('blockRate', 'percent', 15), stat('physicalDefense', 'flat', 7), stat('magicDefense', 'flat', 4)], dur: 29 },
  { level: 20, prefix: '黑铁盾', stats: [stat('blockRate', 'percent', 18), stat('physicalDefense', 'flat', 10), stat('magicDefense', 'flat', 5)], dur: 30 },
  { level: 25, prefix: '秘银盾', stats: [stat('blockRate', 'percent', 22), stat('physicalDefense', 'flat', 13), stat('magicDefense', 'flat', 6)], dur: 31 },
  { level: 30, prefix: '精金盾', stats: [stat('blockRate', 'percent', 25), stat('physicalDefense', 'flat', 17), stat('magicDefense', 'flat', 7)], dur: 32 },
  { level: 35, prefix: '魔化盾', stats: [stat('blockRate', 'percent', 28), stat('physicalDefense', 'flat', 22), stat('magicDefense', 'flat', 8)], dur: 33 },
  { level: 40, prefix: '龙骨盾', stats: [stat('blockRate', 'percent', 32), stat('physicalDefense', 'flat', 28), stat('magicDefense', 'flat', 9)], dur: 34 },
  { level: 45, prefix: '暗影盾', stats: [stat('blockRate', 'percent', 35), stat('physicalDefense', 'flat', 34), stat('magicDefense', 'flat', 10)], dur: 35 },
  { level: 50, prefix: '混沌盾', stats: [stat('blockRate', 'percent', 38), stat('physicalDefense', 'flat', 41), stat('magicDefense', 'flat', 11)], dur: 35 },
  { level: 55, prefix: '神圣盾', stats: [stat('blockRate', 'percent', 42), stat('physicalDefense', 'flat', 50), stat('magicDefense', 'flat', 12)], dur: 35 },
  { level: 60, prefix: '传说盾', stats: [stat('blockRate', 'percent', 45), stat('physicalDefense', 'flat', 60), stat('magicDefense', 'flat', 13)], dur: 35 },
];

const SHIELD_PURPLES: ArmorLevelData[] = [
  { level: 20, prefix: '暗影', stats: [stat('blockRate', 'percent', 22), stat('physicalDefense', 'flat', 12), stat('magicDefense', 'flat', 6)], dur: 30 },
  { level: 25, prefix: '雷霆', stats: [stat('blockRate', 'percent', 25), stat('physicalDefense', 'flat', 16), stat('magicDefense', 'flat', 7)], dur: 31 },
  { level: 30, prefix: '神圣', stats: [stat('blockRate', 'percent', 28), stat('physicalDefense', 'flat', 21), stat('magicDefense', 'flat', 8)], dur: 32 },
  { level: 35, prefix: '暴风', stats: [stat('blockRate', 'percent', 32), stat('physicalDefense', 'flat', 27), stat('magicDefense', 'flat', 9)], dur: 33 },
  { level: 40, prefix: '地狱', stats: [stat('blockRate', 'percent', 35), stat('physicalDefense', 'flat', 34), stat('magicDefense', 'flat', 10)], dur: 34 },
  { level: 45, prefix: '天使', stats: [stat('blockRate', 'percent', 38), stat('physicalDefense', 'flat', 42), stat('magicDefense', 'flat', 11)], dur: 35 },
  { level: 50, prefix: '龙鳞', stats: [stat('blockRate', 'percent', 42), stat('physicalDefense', 'flat', 51), stat('magicDefense', 'flat', 12)], dur: 35 },
  { level: 55, prefix: '混沌', stats: [stat('blockRate', 'percent', 45), stat('physicalDefense', 'flat', 62), stat('magicDefense', 'flat', 13)], dur: 35 },
  { level: 60, prefix: '神器', stats: [stat('blockRate', 'percent', 48), stat('physicalDefense', 'flat', 75), stat('magicDefense', 'flat', 14)], dur: 35 },
];

function generateShields(): EquipmentTemplate[] {
  return generateArmorPieces('shield', 'shield', SHIELD_LEVELS, SHIELD_PURPLES);
}

// ==================== 粉色/橙色装备 (不限等级) ====================

/** 生成粉色/橙色武器 */
function makePinkOrange(
  prefix: string, name: string, slot: EquipmentSlot, equipType: EquipmentType,
  levelReq: number, stats: StatBonus[], dur: number, effect: string, icon: string,
  setId: string, setName: string,
): EquipmentTemplate[] {
  const result: EquipmentTemplate[] = [];
  for (const rarity of ['pink', 'orange'] as EquipmentRarity[]) {
    result.push({
      id: `po_${prefix}_${name}_${rarity}`,
      name,
      type: equipType,
      slot,
      rarity,
      level: levelReq,
      stats,
      requirement: { level: levelReq },
      maxDurability: dur,
      setBonus: setRef(setId, setName, 0),
      isBound: rarity === 'orange',
      specialEffect: effect,
      icon,
    });
  }
  return result;
}

/** 生成粉色/橙色防具 */
function makePinkOrangeArmor(
  prefix: string, name: string, slot: EquipmentSlot,
  levelReq: number, stats: StatBonus[], dur: number, effect: string, icon: string,
  setId: string, setName: string,
): EquipmentTemplate[] {
  return makePinkOrange(prefix, name, slot, 'sword' as EquipmentType, levelReq, stats, dur, effect, icon, setId, setName);
}

// ---- 战士粉色/橙色武器 ----

const WARRIOR_PO_WEAPONS: EquipmentTemplate[] = [
  // 刀类
  ...makePinkOrange('berserker', '狂战士之怒', 'weapon', 'blade', 30, [
    stat('physicalAttack', 'flat', 50), stat('physicalAttackMax', 'flat', 67),
    stat('attackSpeed', 'percent', 25), stat('criticalRate', 'percent', 15),
  ], 47, '攻击吸血5%', 'weapon_blade', 'set_berserker', '狂战士套装'),
  ...makePinkOrange('sword_saint', '剑圣传说', 'weapon', 'blade', 40, [
    stat('physicalAttack', 'flat', 69), stat('physicalAttackMax', 'flat', 92),
    stat('attackSpeed', 'percent', 25), stat('criticalRate', 'percent', 18),
  ], 49, '暴击伤害+50%', 'weapon_blade', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrange('blade_god', '刀神降临', 'weapon', 'blade', 50, [
    stat('physicalAttack', 'flat', 90), stat('physicalAttackMax', 'flat', 120),
    stat('attackSpeed', 'percent', 25), stat('criticalRate', 'percent', 20),
  ], 50, '连击数+3', 'weapon_blade', 'set_blade_god', '刀神套装'),
  // 剑类
  ...makePinkOrange('berserker', '狂战士之怒', 'weapon', 'sword', 30, [
    stat('physicalAttack', 'flat', 58), stat('physicalAttackMax', 'flat', 78),
    stat('attackSpeed', 'percent', 0), stat('criticalRate', 'percent', 12),
  ], 47, '攻击吸血5%', 'weapon_sword', 'set_berserker', '狂战士套装'),
  ...makePinkOrange('sword_saint', '剑圣传说', 'weapon', 'sword', 40, [
    stat('physicalAttack', 'flat', 80), stat('physicalAttackMax', 'flat', 107),
    stat('attackSpeed', 'percent', 0), stat('criticalRate', 'percent', 15),
  ], 49, '暴击伤害+50%', 'weapon_sword', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrange('blade_god', '刀神降临', 'weapon', 'sword', 50, [
    stat('physicalAttack', 'flat', 105), stat('physicalAttackMax', 'flat', 140),
    stat('attackSpeed', 'percent', 0), stat('criticalRate', 'percent', 17),
  ], 50, '连击数+3', 'weapon_sword', 'set_blade_god', '刀神套装'),
  // 斧类
  ...makePinkOrange('berserker', '狂战士之怒', 'weapon', 'axe', 30, [
    stat('physicalAttack', 'flat', 69), stat('physicalAttackMax', 'flat', 93),
    stat('attackSpeed', 'percent', -20), stat('criticalRate', 'percent', 8),
  ], 47, '攻击吸血5%', 'weapon_axe', 'set_berserker', '狂战士套装'),
  ...makePinkOrange('sword_saint', '剑圣传说', 'weapon', 'axe', 40, [
    stat('physicalAttack', 'flat', 96), stat('physicalAttackMax', 'flat', 128),
    stat('attackSpeed', 'percent', -20), stat('criticalRate', 'percent', 10),
  ], 49, '暴击伤害+50%', 'weapon_axe', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrange('blade_god', '刀神降临', 'weapon', 'axe', 50, [
    stat('physicalAttack', 'flat', 126), stat('physicalAttackMax', 'flat', 168),
    stat('attackSpeed', 'percent', -20), stat('criticalRate', 'percent', 12),
  ], 50, '连击数+3', 'weapon_axe', 'set_blade_god', '刀神套装'),
];

// ---- 法师粉色/橙色武器 ----

const MAGE_PO_WEAPONS: EquipmentTemplate[] = [
  // 长杖
  ...makePinkOrange('ice_queen', '冰霜女皇之杖', 'weapon', 'long_staff', 30, [
    stat('magicAttack', 'flat', 55), stat('magicAttackMax', 'flat', 73),
    stat('castSpeed', 'percent', -20), stat('criticalRate', 'percent', 8),
  ], 47, '冰系伤害+25%', 'weapon_long_staff', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrange('thunder_lord', '雷霆之主之杖', 'weapon', 'long_staff', 40, [
    stat('magicAttack', 'flat', 75), stat('magicAttackMax', 'flat', 100),
    stat('castSpeed', 'percent', -20), stat('criticalRate', 'percent', 10),
  ], 49, '雷系伤害+25%', 'weapon_long_staff', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrange('flame_king', '烈焰之王之杖', 'weapon', 'long_staff', 50, [
    stat('magicAttack', 'flat', 98), stat('magicAttackMax', 'flat', 130),
    stat('castSpeed', 'percent', -20), stat('criticalRate', 'percent', 12),
  ], 50, '火系伤害+25%', 'weapon_long_staff', 'set_flame_king', '烈焰之王套装'),
  // 短杖
  ...makePinkOrange('ice_queen', '冰霜女皇之杖', 'weapon', 'short_staff', 30, [
    stat('magicAttack', 'flat', 44), stat('magicAttackMax', 'flat', 59),
    stat('castSpeed', 'percent', 25), stat('criticalRate', 'percent', 10),
  ], 47, '冰系伤害+25%', 'weapon_short_staff', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrange('thunder_lord', '雷霆之主之杖', 'weapon', 'short_staff', 40, [
    stat('magicAttack', 'flat', 60), stat('magicAttackMax', 'flat', 80),
    stat('castSpeed', 'percent', 25), stat('criticalRate', 'percent', 12),
  ], 49, '雷系伤害+25%', 'weapon_short_staff', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrange('flame_king', '烈焰之王之杖', 'weapon', 'short_staff', 50, [
    stat('magicAttack', 'flat', 78), stat('magicAttackMax', 'flat', 104),
    stat('castSpeed', 'percent', 25), stat('criticalRate', 'percent', 14),
  ], 50, '火系伤害+25%', 'weapon_short_staff', 'set_flame_king', '烈焰之王套装'),
  // 魔杖
  ...makePinkOrange('ice_queen', '冰霜女皇之杖', 'weapon', 'wand', 30, [
    stat('magicAttack', 'flat', 44), stat('magicAttackMax', 'flat', 59),
    stat('castSpeed', 'percent', 0), stat('criticalRate', 'percent', 9),
    stat('skillDamage', 'percent', 12),
  ], 47, '冰系伤害+30%', 'weapon_wand', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrange('thunder_lord', '雷霆之主之杖', 'weapon', 'wand', 40, [
    stat('magicAttack', 'flat', 60), stat('magicAttackMax', 'flat', 80),
    stat('castSpeed', 'percent', 0), stat('criticalRate', 'percent', 11),
    stat('skillDamage', 'percent', 15),
  ], 49, '雷系伤害+30%', 'weapon_wand', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrange('flame_king', '烈焰之王之杖', 'weapon', 'wand', 50, [
    stat('magicAttack', 'flat', 78), stat('magicAttackMax', 'flat', 104),
    stat('castSpeed', 'percent', 0), stat('criticalRate', 'percent', 13),
    stat('skillDamage', 'percent', 18),
  ], 50, '火系伤害+30%', 'weapon_wand', 'set_flame_king', '烈焰之王套装'),
];

// ---- 战士粉色/橙色防具 ----

const WARRIOR_PO_ARMOR: EquipmentTemplate[] = [
  // 上衣
  ...makePinkOrangeArmor('berserker', '狂战士胸甲', 'armor', 30, [stat('physicalDefense', 'flat', 30), stat('hp', 'flat', 85), stat('magicDefense', 'flat', 7)], 32, '受伤-5%', 'armor_upper', 'set_berserker', '狂战士套装'),
  ...makePinkOrangeArmor('sword_saint', '剑圣胸甲', 'armor', 40, [stat('physicalDefense', 'flat', 41), stat('hp', 'flat', 120), stat('magicDefense', 'flat', 9)], 34, '格挡率+10%', 'armor_upper', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrangeArmor('blade_god', '刀神胸甲', 'armor', 50, [stat('physicalDefense', 'flat', 54), stat('hp', 'flat', 158), stat('magicDefense', 'flat', 11)], 35, '闪避率+8%', 'armor_upper', 'set_blade_god', '刀神套装'),
  // 下衣
  ...makePinkOrangeArmor('berserker', '狂战士护腿', 'belt', 30, [stat('physicalDefense', 'flat', 20), stat('hp', 'flat', 55), stat('dodgeRate', 'percent', 8)], 32, '移速+10%', 'armor_lower', 'set_berserker', '狂战士套装'),
  ...makePinkOrangeArmor('sword_saint', '剑圣护腿', 'belt', 40, [stat('physicalDefense', 'flat', 27), stat('hp', 'flat', 75), stat('dodgeRate', 'percent', 10)], 34, '暴击率+8%', 'armor_lower', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrangeArmor('blade_god', '刀神护腿', 'belt', 50, [stat('physicalDefense', 'flat', 35), stat('hp', 'flat', 98), stat('dodgeRate', 'percent', 12)], 35, '攻速+12%', 'armor_lower', 'set_blade_god', '刀神套装'),
  // 头盔
  ...makePinkOrangeArmor('berserker', '狂战士头盔', 'helmet', 30, [stat('hp', 'flat', 125), stat('magicDefense', 'flat', 7), stat('criticalRate', 'percent', 4)], 32, '眩晕时间-30%', 'armor_helmet', 'set_berserker', '狂战士套装'),
  ...makePinkOrangeArmor('sword_saint', '剑圣头盔', 'helmet', 40, [stat('hp', 'flat', 175), stat('magicDefense', 'flat', 9), stat('criticalRate', 'percent', 6)], 34, '暴击伤害+25%', 'armor_helmet', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrangeArmor('blade_god', '刀神头盔', 'helmet', 50, [stat('hp', 'flat', 230), stat('magicDefense', 'flat', 11), stat('criticalRate', 'percent', 8)], 35, '攻速+10%', 'armor_helmet', 'set_blade_god', '刀神套装'),
  // 鞋子
  ...makePinkOrangeArmor('berserker', '狂战士战靴', 'boots', 30, [stat('moveSpeed', 'percent', 20), stat('dodgeRate', 'percent', 8), stat('physicalDefense', 'flat', 8)], 32, '冲锋距离+30%', 'armor_boots', 'set_berserker', '狂战士套装'),
  ...makePinkOrangeArmor('sword_saint', '剑圣战靴', 'boots', 40, [stat('moveSpeed', 'percent', 25), stat('dodgeRate', 'percent', 10), stat('physicalDefense', 'flat', 10)], 34, '移速+15%', 'armor_boots', 'set_sword_saint', '剑圣套装'),
  ...makePinkOrangeArmor('blade_god', '刀神战靴', 'boots', 50, [stat('moveSpeed', 'percent', 30), stat('dodgeRate', 'percent', 13), stat('physicalDefense', 'flat', 13)], 35, '闪避后移速+20%', 'armor_boots', 'set_blade_god', '刀神套装'),
];

// ---- 法师粉色/橙色防具 ----

const MAGE_PO_ARMOR: EquipmentTemplate[] = [
  // 上衣
  ...makePinkOrangeArmor('ice_queen', '冰霜女皇法袍', 'armor', 30, [stat('physicalDefense', 'flat', 18), stat('hp', 'flat', 65), stat('magicDefense', 'flat', 9)], 32, '冰系伤害+25%', 'armor_upper', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrangeArmor('thunder_lord', '雷霆之主法袍', 'armor', 40, [stat('physicalDefense', 'flat', 24), stat('hp', 'flat', 90), stat('magicDefense', 'flat', 11)], 34, '雷系伤害+25%', 'armor_upper', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrangeArmor('flame_king', '烈焰之王法袍', 'armor', 50, [stat('physicalDefense', 'flat', 32), stat('hp', 'flat', 118), stat('magicDefense', 'flat', 13)], 35, '火系伤害+25%', 'armor_upper', 'set_flame_king', '烈焰之王套装'),
  // 下衣
  ...makePinkOrangeArmor('ice_queen', '冰霜女皇护腿', 'belt', 30, [stat('physicalDefense', 'flat', 12), stat('hp', 'flat', 42), stat('dodgeRate', 'percent', 7)], 32, '冰冻时间+50%', 'armor_lower', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrangeArmor('thunder_lord', '雷霆之主护腿', 'belt', 40, [stat('physicalDefense', 'flat', 16), stat('hp', 'flat', 58), stat('dodgeRate', 'percent', 9)], 34, '连锁次数+2', 'armor_lower', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrangeArmor('flame_king', '烈焰之王护腿', 'belt', 50, [stat('physicalDefense', 'flat', 21), stat('hp', 'flat', 76), stat('dodgeRate', 'percent', 11)], 35, '灼烧伤害+50%', 'armor_lower', 'set_flame_king', '烈焰之王套装'),
  // 头盔
  ...makePinkOrangeArmor('ice_queen', '冰霜女皇头冠', 'helmet', 30, [stat('hp', 'flat', 95), stat('magicDefense', 'flat', 9), stat('criticalRate', 'percent', 3)], 32, '冰系技能CD-15%', 'armor_helmet', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrangeArmor('thunder_lord', '雷霆之主头冠', 'helmet', 40, [stat('hp', 'flat', 130), stat('magicDefense', 'flat', 11), stat('criticalRate', 'percent', 4)], 34, '雷系暴击率+12%', 'armor_helmet', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrangeArmor('flame_king', '烈焰之王头冠', 'helmet', 50, [stat('hp', 'flat', 170), stat('magicDefense', 'flat', 13), stat('criticalRate', 'percent', 5)], 35, '火系范围+20%', 'armor_helmet', 'set_flame_king', '烈焰之王套装'),
  // 鞋子
  ...makePinkOrangeArmor('ice_queen', '冰霜女皇法靴', 'boots', 30, [stat('moveSpeed', 'percent', 18), stat('dodgeRate', 'percent', 7), stat('physicalDefense', 'flat', 5)], 32, '传送距离+30%', 'armor_boots', 'set_ice_queen', '冰霜女皇套装'),
  ...makePinkOrangeArmor('thunder_lord', '雷霆之主法靴', 'boots', 40, [stat('moveSpeed', 'percent', 22), stat('dodgeRate', 'percent', 9), stat('physicalDefense', 'flat', 7)], 34, '施法速度+15%', 'armor_boots', 'set_thunder_lord', '雷霆之主套装'),
  ...makePinkOrangeArmor('flame_king', '烈焰之王法靴', 'boots', 50, [stat('moveSpeed', 'percent', 26), stat('dodgeRate', 'percent', 11), stat('physicalDefense', 'flat', 9)], 35, '移速+18%', 'armor_boots', 'set_flame_king', '烈焰之王套装'),
];

// ==================== 深渊专属装备 (橙色, 拾取绑定) ====================

/** 生成深渊装备 */
function makeAbyss(
  name: string, slot: EquipmentSlot, equipType: EquipmentType,
  levelReq: number, stats: StatBonus[], dur: number, effect: string, icon: string,
): EquipmentTemplate {
  return {
    id: `abyss_${name}`,
    name,
    type: equipType,
    slot,
    rarity: 'orange',
    level: levelReq,
    stats,
    requirement: { level: levelReq },
    maxDurability: dur,
    setBonus: null,
    isBound: true,
    specialEffect: effect,
    icon,
  };
}

// ---- 战士深渊武器 ----

const ABYSS_WARRIOR_WEAPONS: EquipmentTemplate[] = [
  // 刀类
  makeAbyss('深渊·狂暴之刃', 'weapon', 'blade', 30, [stat('physicalAttack', 'flat', 55), stat('physicalAttackMax', 'flat', 73), stat('criticalRate', 'percent', 12)], 47, '狂暴技能等级+2，狂暴期间攻速+20%', 'weapon_blade'),
  makeAbyss('深渊·嗜血刀', 'weapon', 'blade', 40, [stat('physicalAttack', 'flat', 75), stat('physicalAttackMax', 'flat', 100), stat('criticalRate', 'percent', 15)], 49, '嗜血效果提升至8%，击杀刷新嗜血冷却', 'weapon_blade'),
  makeAbyss('深渊·影斩之刃', 'weapon', 'blade', 50, [stat('physicalAttack', 'flat', 98), stat('physicalAttackMax', 'flat', 130), stat('criticalRate', 'percent', 18)], 50, '影斩变为瞬移+斩击，CD-30%', 'weapon_blade'),
  makeAbyss('深渊·绝杀刀', 'weapon', 'blade', 60, [stat('physicalAttack', 'flat', 120), stat('physicalAttackMax', 'flat', 160), stat('criticalRate', 'percent', 20)], 50, '绝杀阈值提升至40%，击杀回复20%HP', 'weapon_blade'),
  // 剑类
  makeAbyss('深渊·剑气之剑', 'weapon', 'sword', 30, [stat('physicalAttack', 'flat', 64), stat('physicalAttackMax', 'flat', 85), stat('criticalRate', 'percent', 10)], 47, '剑气变为扇形范围，穿透敌人', 'weapon_sword'),
  makeAbyss('深渊·精准之剑', 'weapon', 'sword', 40, [stat('physicalAttack', 'flat', 88), stat('physicalAttackMax', 'flat', 117), stat('criticalRate', 'percent', 13)], 49, '精准打击必暴击，暴击伤害+60%', 'weapon_sword'),
  makeAbyss('深渊·剑刃风暴', 'weapon', 'sword', 50, [stat('physicalAttack', 'flat', 115), stat('physicalAttackMax', 'flat', 153), stat('criticalRate', 'percent', 16)], 50, '剑刃风暴范围+50%，持续时间+2秒', 'weapon_sword'),
  makeAbyss('深渊·万剑归宗', 'weapon', 'sword', 60, [stat('physicalAttack', 'flat', 140), stat('physicalAttackMax', 'flat', 187), stat('criticalRate', 'percent', 18)], 50, '万剑归宗剑数×2，自动追踪敌人', 'weapon_sword'),
  // 斧类
  makeAbyss('深渊·怒气之斧', 'weapon', 'axe', 30, [stat('physicalAttack', 'flat', 77), stat('physicalAttackMax', 'flat', 103), stat('criticalRate', 'percent', 8)], 47, '怒气爆发范围+40%，附加眩晕2秒', 'weapon_axe'),
  makeAbyss('深渊·血之渴望', 'weapon', 'axe', 40, [stat('physicalAttack', 'flat', 106), stat('physicalAttackMax', 'flat', 141), stat('criticalRate', 'percent', 10)], 49, '血之渴望吸血比例提升至12%，CD-25%', 'weapon_axe'),
  makeAbyss('深渊·死亡旋风', 'weapon', 'axe', 50, [stat('physicalAttack', 'flat', 138), stat('physicalAttackMax', 'flat', 184), stat('criticalRate', 'percent', 12)], 50, '死亡旋风持续时间+3秒，伤害+30%', 'weapon_axe'),
  makeAbyss('深渊·终极狂暴', 'weapon', 'axe', 60, [stat('physicalAttack', 'flat', 168), stat('physicalAttackMax', 'flat', 224), stat('criticalRate', 'percent', 15)], 50, '狂暴状态下所有技能CD-40%', 'weapon_axe'),
];

// ---- 法师深渊武器 ----

const ABYSS_MAGE_WEAPONS: EquipmentTemplate[] = [
  // 长杖
  makeAbyss('深渊·冰霜女皇之杖', 'weapon', 'long_staff', 30, [stat('magicAttack', 'flat', 60), stat('magicAttackMax', 'flat', 80), stat('criticalRate', 'percent', 6)], 47, '冰墙持续时间+3秒，可阻挡技能', 'weapon_long_staff'),
  makeAbyss('深渊·暴风雪之杖', 'weapon', 'long_staff', 40, [stat('magicAttack', 'flat', 82), stat('magicAttackMax', 'flat', 109), stat('criticalRate', 'percent', 8)], 49, '暴风雪范围+60%，冰冻几率+20%', 'weapon_long_staff'),
  makeAbyss('深渊·绝对零度', 'weapon', 'long_staff', 50, [stat('magicAttack', 'flat', 108), stat('magicAttackMax', 'flat', 144), stat('criticalRate', 'percent', 10)], 50, '绝对零度冻结时间+2秒，结束后减速50%', 'weapon_long_staff'),
  makeAbyss('深渊·冰霜新星', 'weapon', 'long_staff', 60, [stat('magicAttack', 'flat', 132), stat('magicAttackMax', 'flat', 176), stat('criticalRate', 'percent', 12)], 50, '冰霜新星范围+80%，可连续释放2次', 'weapon_long_staff'),
  // 短杖
  makeAbyss('深渊·雷霆一击', 'weapon', 'short_staff', 30, [stat('magicAttack', 'flat', 48), stat('magicAttackMax', 'flat', 64), stat('criticalRate', 'percent', 8)], 47, '雷霆一击变为落雷×3，每道100%伤害', 'weapon_short_staff'),
  makeAbyss('深渊·连锁闪电', 'weapon', 'short_staff', 40, [stat('magicAttack', 'flat', 66), stat('magicAttackMax', 'flat', 88), stat('criticalRate', 'percent', 10)], 49, '连锁闪电弹射次数+3，伤害不衰减', 'weapon_short_staff'),
  makeAbyss('深渊·雷神之怒', 'weapon', 'short_staff', 50, [stat('magicAttack', 'flat', 86), stat('magicAttackMax', 'flat', 115), stat('criticalRate', 'percent', 12)], 50, '雷神之怒眩晕几率+20%，范围+40%', 'weapon_short_staff'),
  makeAbyss('深渊·天罚', 'weapon', 'short_staff', 60, [stat('magicAttack', 'flat', 105), stat('magicAttackMax', 'flat', 140), stat('criticalRate', 'percent', 15)], 50, '天罚落雷频率×2，持续时间+50%', 'weapon_short_staff'),
  // 魔杖
  makeAbyss('深渊·火焰风暴', 'weapon', 'wand', 30, [stat('magicAttack', 'flat', 48), stat('magicAttackMax', 'flat', 64), stat('criticalRate', 'percent', 7), stat('skillDamage', 'percent', 10)], 47, '火焰风暴范围+50%，灼烧伤害+80%', 'weapon_wand'),
  makeAbyss('深渊·陨石', 'weapon', 'wand', 40, [stat('magicAttack', 'flat', 66), stat('magicAttackMax', 'flat', 88), stat('criticalRate', 'percent', 9), stat('skillDamage', 'percent', 12)], 49, '陨石爆炸范围+60%，附加眩晕1秒', 'weapon_wand'),
  makeAbyss('深渊·火墙', 'weapon', 'wand', 50, [stat('magicAttack', 'flat', 86), stat('magicAttackMax', 'flat', 115), stat('criticalRate', 'percent', 11), stat('skillDamage', 'percent', 15)], 50, '火墙持续时间+4秒，穿越伤害+50%', 'weapon_wand'),
  makeAbyss('深渊·地狱火', 'weapon', 'wand', 60, [stat('magicAttack', 'flat', 105), stat('magicAttackMax', 'flat', 140), stat('criticalRate', 'percent', 13), stat('skillDamage', 'percent', 18)], 50, '地狱火范围+70%，击杀触发爆炸', 'weapon_wand'),
];

// ---- 战士深渊防具 ----

const ABYSS_WARRIOR_ARMOR: EquipmentTemplate[] = [
  makeAbyss('深渊·狂暴胸甲', 'armor', 'sword' as EquipmentType, 30, [stat('physicalDefense', 'flat', 35), stat('hp', 'flat', 100), stat('magicDefense', 'flat', 8)], 32, '狂暴状态下受伤-15%，持续+5秒', 'armor_upper'),
  makeAbyss('深渊·剑意胸甲', 'armor', 'sword' as EquipmentType, 40, [stat('physicalDefense', 'flat', 48), stat('hp', 'flat', 140), stat('magicDefense', 'flat', 10)], 34, '剑意持续时间翻倍，真伤+20%', 'armor_upper'),
  makeAbyss('深渊·刀神胸甲', 'armor', 'sword' as EquipmentType, 50, [stat('physicalDefense', 'flat', 63), stat('hp', 'flat', 185), stat('magicDefense', 'flat', 12)], 35, '刀神状态下连击数+5，攻速+15%', 'armor_upper'),
  makeAbyss('深渊·冲锋护腿', 'belt', 'sword' as EquipmentType, 30, [stat('physicalDefense', 'flat', 23), stat('hp', 'flat', 65), stat('dodgeRate', 'percent', 9)], 32, '冲锋后下次攻击必暴击，伤害+30%', 'armor_lower'),
  makeAbyss('深渊·闪避护腿', 'belt', 'sword' as EquipmentType, 40, [stat('physicalDefense', 'flat', 32), stat('hp', 'flat', 90), stat('dodgeRate', 'percent', 12)], 34, '闪避成功后回复10%HP，无敌0.5秒', 'armor_lower'),
  makeAbyss('深渊·疾风护腿', 'belt', 'sword' as EquipmentType, 50, [stat('physicalDefense', 'flat', 42), stat('hp', 'flat', 118), stat('dodgeRate', 'percent', 15)], 35, '疾风步持续时间+3秒，移速+30%', 'armor_lower'),
  makeAbyss('深渊·坚韧头盔', 'helmet', 'sword' as EquipmentType, 30, [stat('hp', 'flat', 150), stat('magicDefense', 'flat', 8), stat('criticalRate', 'percent', 5)], 32, '坚韧被动生命+25%，低于10%HP触发护盾', 'armor_helmet'),
  makeAbyss('深渊·剑心头盔', 'helmet', 'sword' as EquipmentType, 40, [stat('hp', 'flat', 210), stat('magicDefense', 'flat', 10), stat('criticalRate', 'percent', 7)], 34, '剑心通明闪避+20%，闪避后下次攻击必暴击', 'armor_helmet'),
  makeAbyss('深渊·不屈头盔', 'helmet', 'sword' as EquipmentType, 50, [stat('hp', 'flat', 275), stat('magicDefense', 'flat', 12), stat('criticalRate', 'percent', 9)], 35, '不屈意志减伤+20%，低于30%HP触发', 'armor_helmet'),
  makeAbyss('深渊·冲锋战靴', 'boots', 'sword' as EquipmentType, 30, [stat('moveSpeed', 'percent', 22), stat('dodgeRate', 'percent', 9), stat('physicalDefense', 'flat', 9)], 32, '冲锋距离+50%，冲锋后移速+30%持续3秒', 'armor_boots'),
  makeAbyss('深渊·影步战靴', 'boots', 'sword' as EquipmentType, 40, [stat('moveSpeed', 'percent', 28), stat('dodgeRate', 'percent', 12), stat('physicalDefense', 'flat', 11)], 34, '影斩距离+40%，斩击后隐身1秒', 'armor_boots'),
  makeAbyss('深渊·疾风战靴', 'boots', 'sword' as EquipmentType, 50, [stat('moveSpeed', 'percent', 34), stat('dodgeRate', 'percent', 15), stat('physicalDefense', 'flat', 14)], 35, '移速+25%被动，攻击时有几率瞬移', 'armor_boots'),
  makeAbyss('深渊·狂暴腰带', 'belt', 'sword' as EquipmentType, 30, [stat('hp', 'flat', 100), stat('attackSpeed', 'percent', 12), stat('criticalRate', 'percent', 5)], 32, '狂暴状态下暴击率+30%，暴伤+40%', 'armor_belt'),
  makeAbyss('深渊·精准腰带', 'belt', 'sword' as EquipmentType, 40, [stat('hp', 'flat', 140), stat('attackSpeed', 'percent', 14), stat('criticalRate', 'percent', 7)], 34, '精准打击后下次技能无消耗', 'armor_belt'),
  makeAbyss('深渊·连击腰带', 'belt', 'sword' as EquipmentType, 50, [stat('hp', 'flat', 185), stat('attackSpeed', 'percent', 18), stat('criticalRate', 'percent', 8)], 35, '连击成功时有30%几率重置技能CD', 'armor_belt'),
  makeAbyss('深渊·怒气项链', 'necklace', 'sword' as EquipmentType, 30, [stat('physicalAttack', 'flat', 16), stat('criticalDamage', 'percent', 40)], 32, '怒气爆发伤害+50%，范围+30%', 'armor_necklace'),
  makeAbyss('深渊·嗜血项链', 'necklace', 'sword' as EquipmentType, 40, [stat('physicalAttack', 'flat', 22), stat('criticalDamage', 'percent', 50)], 34, '嗜血击杀回复30%HP，刷新CD', 'armor_necklace'),
  makeAbyss('深渊·刀意项链', 'necklace', 'sword' as EquipmentType, 50, [stat('physicalAttack', 'flat', 29), stat('criticalDamage', 'percent', 60)], 35, '刀意真伤+30%，持续时间+2秒', 'armor_necklace'),
  makeAbyss('深渊·狂暴戒指', 'ring1', 'sword' as EquipmentType, 30, [stat('physicalAttack', 'flat', 16), stat('criticalRate', 'percent', 6)], 32, '狂暴CD-30%，狂暴期间攻速+25%', 'armor_ring'),
  makeAbyss('深渊·剑气戒指', 'ring1', 'sword' as EquipmentType, 40, [stat('physicalAttack', 'flat', 22), stat('criticalRate', 'percent', 8)], 34, '剑气穿透+2个目标，伤害+20%', 'armor_ring'),
  makeAbyss('深渊·绝杀戒指', 'ring1', 'sword' as EquipmentType, 50, [stat('physicalAttack', 'flat', 29), stat('criticalRate', 'percent', 10)], 35, '绝杀阈值提升至50%，击杀回复HP', 'armor_ring'),
  makeAbyss('深渊·怒气手镯', 'bracelet1', 'sword' as EquipmentType, 30, [stat('physicalAttack', 'flat', 16), stat('attackSpeed', 'percent', 5)], 32, '怒气爆发CD-25%，伤害+30%', 'armor_bracelet'),
  makeAbyss('深渊·旋风手镯', 'bracelet1', 'sword' as EquipmentType, 40, [stat('physicalAttack', 'flat', 22), stat('attackSpeed', 'percent', 7)], 34, '旋风斩段数+3，范围+20%', 'armor_bracelet'),
  makeAbyss('深渊·暴走手镯', 'bracelet1', 'sword' as EquipmentType, 50, [stat('physicalAttack', 'flat', 29), stat('attackSpeed', 'percent', 9)], 35, '暴走无敌时间+1秒，结束后攻速+50%持续3秒', 'armor_bracelet'),
  makeAbyss('深渊·格挡之盾', 'shield', 'sword' as EquipmentType, 30, [stat('blockRate', 'percent', 30), stat('physicalDefense', 'flat', 22), stat('magicDefense', 'flat', 8)], 32, '格挡成功后下次攻击伤害+40%', 'armor_shield'),
  makeAbyss('深渊·挑衅之盾', 'shield', 'sword' as EquipmentType, 40, [stat('blockRate', 'percent', 38), stat('physicalDefense', 'flat', 30), stat('magicDefense', 'flat', 10)], 34, '挑衅持续时间+3秒，范围内敌人攻击-20%', 'armor_shield'),
  makeAbyss('深渊·不屈之盾', 'shield', 'sword' as EquipmentType, 50, [stat('blockRate', 'percent', 45), stat('physicalDefense', 'flat', 40), stat('magicDefense', 'flat', 12)], 35, '不屈意志触发时回复15%HP，无敌2秒', 'armor_shield'),
];

// ---- 法师深渊防具 ----

const ABYSS_MAGE_ARMOR: EquipmentTemplate[] = [
  makeAbyss('深渊·冰霜法袍', 'armor', 'long_staff', 30, [stat('physicalDefense', 'flat', 20), stat('hp', 'flat', 75), stat('magicDefense', 'flat', 10)], 32, '冰系技能CD-20%，冰冻时间+1秒', 'armor_upper'),
  makeAbyss('深渊·雷霆法袍', 'armor', 'long_staff', 40, [stat('physicalDefense', 'flat', 28), stat('hp', 'flat', 105), stat('magicDefense', 'flat', 12)], 34, '雷系连锁次数+2，暴击率+15%', 'armor_upper'),
  makeAbyss('深渊·烈焰法袍', 'armor', 'long_staff', 50, [stat('physicalDefense', 'flat', 37), stat('hp', 'flat', 138), stat('magicDefense', 'flat', 14)], 35, '火系灼烧伤害+100%，范围+30%', 'armor_upper'),
  makeAbyss('深渊·冰晶护腿', 'belt', 'long_staff', 30, [stat('physicalDefense', 'flat', 14), stat('hp', 'flat', 50), stat('dodgeRate', 'percent', 8)], 32, '冰墙CD-30%，冰墙持续时间+2秒', 'armor_lower'),
  makeAbyss('深渊·雷光护腿', 'belt', 'long_staff', 40, [stat('physicalDefense', 'flat', 19), stat('hp', 'flat', 70), stat('dodgeRate', 'percent', 10)], 34, '雷霆一击变为落雷×2，每道80%伤害', 'armor_lower'),
  makeAbyss('深渊·火焰护腿', 'belt', 'long_staff', 50, [stat('physicalDefense', 'flat', 25), stat('hp', 'flat', 92), stat('dodgeRate', 'percent', 12)], 35, '火焰风暴持续时间+3秒，伤害+40%', 'armor_lower'),
  makeAbyss('深渊·冰霜头冠', 'helmet', 'long_staff', 30, [stat('hp', 'flat', 110), stat('magicDefense', 'flat', 10), stat('criticalRate', 'percent', 4)], 32, '冰系技能范围+25%，冰冻几率+15%', 'armor_helmet'),
  makeAbyss('深渊·雷霆头冠', 'helmet', 'long_staff', 40, [stat('hp', 'flat', 155), stat('magicDefense', 'flat', 12), stat('criticalRate', 'percent', 5)], 34, '雷系技能暴击伤害+60%，CD-15%', 'armor_helmet'),
  makeAbyss('深渊·烈焰头冠', 'helmet', 'long_staff', 50, [stat('hp', 'flat', 205), stat('magicDefense', 'flat', 14), stat('criticalRate', 'percent', 6)], 35, '火系技能范围+40%，击杀爆炸范围+50%', 'armor_helmet'),
  makeAbyss('深渊·冰霜法靴', 'boots', 'long_staff', 30, [stat('moveSpeed', 'percent', 20), stat('dodgeRate', 'percent', 8), stat('physicalDefense', 'flat', 6)], 32, '传送CD-30%，传送后获得护盾3秒', 'armor_boots'),
  makeAbyss('深渊·雷光法靴', 'boots', 'long_staff', 40, [stat('moveSpeed', 'percent', 24), stat('dodgeRate', 'percent', 10), stat('physicalDefense', 'flat', 8)], 34, '施法速度+20%，雷系技能CD-10%', 'armor_boots'),
  makeAbyss('深渊·烈焰法靴', 'boots', 'long_staff', 50, [stat('moveSpeed', 'percent', 28), stat('dodgeRate', 'percent', 12), stat('physicalDefense', 'flat', 10)], 35, '移速+20%被动，攻击时有几率瞬移', 'armor_boots'),
  makeAbyss('深渊·冰霜腰带', 'belt', 'long_staff', 30, [stat('hp', 'flat', 75), stat('attackSpeed', 'percent', 7), stat('criticalRate', 'percent', 4)], 32, 'MP+30%，冰系技能消耗-20%', 'armor_belt'),
  makeAbyss('深渊·雷霆腰带', 'belt', 'long_staff', 40, [stat('hp', 'flat', 105), stat('attackSpeed', 'percent', 9), stat('criticalRate', 'percent', 5)], 34, 'MP回复+30%，雷系技能击杀回复10%MP', 'armor_belt'),
  makeAbyss('深渊·烈焰腰带', 'belt', 'long_staff', 50, [stat('hp', 'flat', 138), stat('attackSpeed', 'percent', 12), stat('criticalRate', 'percent', 6)], 35, '魔法伤害+25%，火系技能击杀回复15%MP', 'armor_belt'),
  makeAbyss('深渊·冰霜项链', 'necklace', 'long_staff', 30, [stat('magicAttack', 'flat', 28), stat('criticalDamage', 'percent', 45)], 32, '冰系技能伤害+40%，冰冻时间+1.5秒', 'armor_necklace'),
  makeAbyss('深渊·雷霆项链', 'necklace', 'long_staff', 40, [stat('magicAttack', 'flat', 38), stat('criticalDamage', 'percent', 55)], 34, '雷系技能伤害+40%，连锁不衰减', 'armor_necklace'),
  makeAbyss('深渊·烈焰项链', 'necklace', 'long_staff', 50, [stat('magicAttack', 'flat', 50), stat('criticalDamage', 'percent', 65)], 35, '火系技能伤害+40%，灼烧叠加无上限', 'armor_necklace'),
  makeAbyss('深渊·冰霜戒指', 'ring1', 'long_staff', 30, [stat('magicAttack', 'flat', 18), stat('criticalRate', 'percent', 5)], 32, '冰系技能CD-25%，冰冻几率+20%', 'armor_ring'),
  makeAbyss('深渊·雷霆戒指', 'ring1', 'long_staff', 40, [stat('magicAttack', 'flat', 25), stat('criticalRate', 'percent', 6)], 34, '雷系暴击率+20%，暴击后下次技能+30%伤害', 'armor_ring'),
  makeAbyss('深渊·烈焰戒指', 'ring1', 'long_staff', 50, [stat('magicAttack', 'flat', 32), stat('criticalRate', 'percent', 7)], 35, '火系击杀爆炸伤害+50%，范围+30%', 'armor_ring'),
  makeAbyss('深渊·冰霜手套', 'bracelet1', 'long_staff', 30, [stat('magicAttack', 'flat', 18), stat('castSpeed', 'percent', 6)], 32, '冰墙CD-40%，可同时存在2面冰墙', 'armor_bracelet'),
  makeAbyss('深渊·雷霆手套', 'bracelet1', 'long_staff', 40, [stat('magicAttack', 'flat', 25), stat('castSpeed', 'percent', 8)], 34, '连锁闪电CD-30%，弹射次数+2', 'armor_bracelet'),
  makeAbyss('深渊·烈焰手套', 'bracelet1', 'long_staff', 50, [stat('magicAttack', 'flat', 32), stat('castSpeed', 'percent', 10)], 35, '火焰风暴CD-25%，伤害+50%', 'armor_bracelet'),
  makeAbyss('深渊·冰霜之盾', 'shield', 'long_staff', 30, [stat('blockRate', 'percent', 24), stat('physicalDefense', 'flat', 16), stat('magicDefense', 'flat', 10)], 32, '格挡后冰冻攻击者2秒，CD-30%', 'armor_shield'),
  makeAbyss('深渊·雷霆之盾', 'shield', 'long_staff', 40, [stat('blockRate', 'percent', 30), stat('physicalDefense', 'flat', 22), stat('magicDefense', 'flat', 12)], 34, '格挡后雷击攻击者，造成100%伤害', 'armor_shield'),
  makeAbyss('深渊·烈焰之盾', 'shield', 'long_staff', 50, [stat('blockRate', 'percent', 37), stat('physicalDefense', 'flat', 30), stat('magicDefense', 'flat', 14)], 35, '格挡后灼烧攻击者5秒，伤害+50%', 'armor_shield'),
];

// ==================== 主数组与查询函数 ====================

/** 所有装备 (生成时组装) */
export const ALL_EQUIPMENT: EquipmentTemplate[] = [
  // 战士武器
  ...generateBlades(),
  ...generateSwords(),
  ...generateAxes(),
  // 法师武器
  ...generateLongStaves(),
  ...generateShortStaves(),
  ...generateWands(),
  // 防御装备
  ...generateUpperBody(),
  ...generateLowerBody(),
  ...generateHelmets(),
  ...generateBoots(),
  ...generateBelts(),
  ...generateNecklaces(),
  ...generateRings(),
  ...generateBracelets(),
  ...generateShields(),
  // 粉色/橙色装备
  ...WARRIOR_PO_WEAPONS,
  ...MAGE_PO_WEAPONS,
  ...WARRIOR_PO_ARMOR,
  ...MAGE_PO_ARMOR,
  // 深渊装备
  ...ABYSS_WARRIOR_WEAPONS,
  ...ABYSS_MAGE_WEAPONS,
  ...ABYSS_WARRIOR_ARMOR,
  ...ABYSS_MAGE_ARMOR,
];

/** 按ID查询装备 */
export function getEquipmentById(id: string): EquipmentTemplate | undefined {
  return ALL_EQUIPMENT.find(e => e.id === id);
}

/** 按品质查询装备 */
export function getEquipmentByRarity(rarity: EquipmentRarity): EquipmentTemplate[] {
  return ALL_EQUIPMENT.filter(e => e.rarity === rarity);
}

/** 按等级范围查询装备 (要求等级在范围内) */
export function getEquipmentByLevel(minLevel: number, maxLevel: number): EquipmentTemplate[] {
  return ALL_EQUIPMENT.filter(e => e.level >= minLevel && e.level <= maxLevel);
}

/** 按槽位查询装备 */
export function getEquipmentBySlot(slot: EquipmentSlot): EquipmentTemplate[] {
  return ALL_EQUIPMENT.filter(e => e.slot === slot);
}

/** 获取深渊装备 */
export function getAbyssEquipment(): EquipmentTemplate[] {
  return ALL_EQUIPMENT.filter(e => e.id.startsWith('abyss_'));
}

/** 获取粉色/橙色装备 */
export function getPinkOrangeEquipment(): EquipmentTemplate[] {
  return ALL_EQUIPMENT.filter(e => e.rarity === 'pink' || e.rarity === 'orange');
}

/** 装备总数统计 */
export const EQUIPMENT_COUNT = ALL_EQUIPMENT.length;
