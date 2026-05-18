// 怪物数据 - 30种普通怪物 (每层3种 × 10层)

import type {
  MonsterType, AggressionType, MonsterSkillType,
  LootEntry, MonsterSkill,
} from '@/config/types';

// ==================== 怪物数据结构 ====================

/** 怪物基础属性 (不含层数倍率) */
export interface MonsterBaseStats {
  hp: number;
  mp: number;
  physicalAttack: [number, number]; // [min, max]
  magicAttack: [number, number];
  physicalDefense: number;
  magicDefense: number;
  attackSpeed: number;   // 百分比, 100=标准
  moveSpeed: number;
  criticalRate: number;  // 百分比
  criticalDamage: number;
}

/** 怪物定义 */
export interface MonsterDefinition {
  id: string;
  name: string;
  floor: number;        // 所在层数
  type: MonsterType;
  aggression: AggressionType;
  aggroRange: number;   // 格数
  stats: MonsterBaseStats;
  skills: MonsterSkill[];
  lootTable: LootEntry[];
  expReward: number;
  goldReward: [number, number];
  sprite: string;
}

// ==================== 辅助函数 ====================

function skill(
  id: string, name: string, type: MonsterSkillType,
  dmgPct: number, damageType: 'physical' | 'magic',
  cooldown: number, effectType?: MonsterSkillType, effectValue?: number,
): MonsterSkill {
  return {
    id,
    name,
    type,
    damage: {
      type: damageType,
      baseValue: dmgPct,
      scalingStat: damageType === 'physical' ? 'physicalAttack' : 'magicAttack',
      scalingFactor: dmgPct / 100,
      aoeRadius: null,
    },
    effect: effectType && effectValue ? {
      type: effectType as any,
      duration: effectValue,
      value: effectValue,
      stackable: false,
      maxStack: 1,
    } : null,
    cooldown,
    range: damageType === 'physical' ? 1 : 5,
    description: `${name} - ${dmgPct}%${damageType === 'physical' ? '物' : '魔'}伤害`,
  };
}

// ==================== 第1层: 地牢入口 ====================

const FLOOR_1_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_skeleton',
    name: '骷髅兵',
    floor: 1,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 50, mp: 0,
      physicalAttack: [8, 12], magicAttack: [0, 0],
      physicalDefense: 3, magicDefense: 1,
      attackSpeed: 100, moveSpeed: 90,
      criticalRate: 2, criticalDamage: 150,
    },
    skills: [skill('sk_skeleton_slash', '骷髅斩', 'attack', 100, 'physical', 3)],
    lootTable: [],
    expReward: 10,
    goldReward: [5, 10],
    sprite: 'octopus',
  },
  {
    id: 'monster_bat',
    name: '蝙蝠',
    floor: 1,
    type: 'ranged',
    aggression: 'normal',
    aggroRange: 5,
    stats: {
      hp: 30, mp: 20,
      physicalAttack: [5, 8], magicAttack: [8, 12],
      physicalDefense: 1, magicDefense: 3,
      attackSpeed: 110, moveSpeed: 120,
      criticalRate: 3, criticalDamage: 150,
    },
    skills: [
      skill('sk_bat_sonic', '超声波', 'attack', 80, 'magic', 4),
      skill('sk_bat_swarm', '蝙蝠群', 'attack', 60, 'magic', 8),
    ],
    lootTable: [],
    expReward: 8,
    goldReward: [3, 8],
    sprite: 'rat_gray',
  },
  {
    id: 'monster_spider',
    name: '毒蛛',
    floor: 1,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 40, mp: 10,
      physicalAttack: [6, 10], magicAttack: [0, 0],
      physicalDefense: 2, magicDefense: 1,
      attackSpeed: 120, moveSpeed: 100,
      criticalRate: 2, criticalDamage: 150,
    },
    skills: [
      skill('sk_spider_venom', '毒液喷射', 'attack', 80, 'physical', 5),
      skill('sk_spider_web', '蛛网', 'control', 0, 'physical', 10),
    ],
    lootTable: [],
    expReward: 12,
    goldReward: [5, 12],
    sprite: 'rat_brown',
  },
];

// ==================== 第2层: 暗影洞穴 ====================

const FLOOR_2_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_shadow_wolf',
    name: '暗影狼',
    floor: 2,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 65, mp: 0,
      physicalAttack: [12, 16], magicAttack: [0, 0],
      physicalDefense: 4, magicDefense: 2,
      attackSpeed: 110, moveSpeed: 120,
      criticalRate: 5, criticalDamage: 150,
    },
    skills: [
      skill('sk_wolf_bite', '暗影撕咬', 'attack', 110, 'physical', 3),
      skill('sk_wolf_rush', '暗影突袭', 'attack', 130, 'physical', 8),
    ],
    lootTable: [],
    expReward: 15,
    goldReward: [8, 15],
    sprite: 'rat_white',
  },
  {
    id: 'monster_gargoyle',
    name: '石像鬼',
    floor: 2,
    type: 'ranged',
    aggression: 'normal',
    aggroRange: 5,
    stats: {
      hp: 50, mp: 25,
      physicalAttack: [8, 12], magicAttack: [12, 16],
      physicalDefense: 3, magicDefense: 5,
      attackSpeed: 90, moveSpeed: 80,
      criticalRate: 3, criticalDamage: 150,
    },
    skills: [
      skill('sk_gargoyle_gaze', '石化凝视', 'attack', 90, 'magic', 6),
      skill('sk_gargoyle_stone', '石弹', 'attack', 100, 'magic', 4),
    ],
    lootTable: [],
    expReward: 12,
    goldReward: [6, 12],
    sprite: 'monster_gargoyle',
  },
  {
    id: 'monster_goblin_mage',
    name: '哥布林法师',
    floor: 2,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 45, mp: 30,
      physicalAttack: [5, 8], magicAttack: [14, 18],
      physicalDefense: 2, magicDefense: 6,
      attackSpeed: 100, moveSpeed: 90,
      criticalRate: 3, criticalDamage: 150,
    },
    skills: [
      skill('sk_goblin_dark_arrow', '暗影箭', 'attack', 100, 'magic', 3),
      skill('sk_goblin_shield', '暗影盾', 'buff', 0, 'magic', 12),
    ],
    lootTable: [],
    expReward: 14,
    goldReward: [8, 14],
    sprite: 'monster_goblin_mage',
  },
];

// ==================== 第3层: 毒沼泽 ====================

const FLOOR_3_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_viper',
    name: '毒蛇',
    floor: 3,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 75, mp: 15,
      physicalAttack: [14, 18], magicAttack: [0, 0],
      physicalDefense: 5, magicDefense: 3,
      attackSpeed: 120, moveSpeed: 110,
      criticalRate: 5, criticalDamage: 150,
    },
    skills: [
      skill('sk_viper_fang', '毒牙', 'attack', 100, 'physical', 3),
      skill('sk_viper_mist', '毒雾', 'attack', 80, 'magic', 8),
    ],
    lootTable: [],
    expReward: 18,
    goldReward: [10, 18],
    sprite: 'monster_viper',
  },
  {
    id: 'monster_swamp_lizard',
    name: '沼泽巨蜥',
    floor: 3,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 120, mp: 0,
      physicalAttack: [12, 16], magicAttack: [0, 0],
      physicalDefense: 8, magicDefense: 3,
      attackSpeed: 80, moveSpeed: 70,
      criticalRate: 3, criticalDamage: 150,
    },
    skills: [
      skill('sk_lizard_tail', '巨尾横扫', 'attack', 120, 'physical', 5),
      skill('sk_lizard_thick_skin', '厚皮', 'buff', 0, 'physical', 15),
    ],
    lootTable: [],
    expReward: 20,
    goldReward: [12, 20],
    sprite: 'monster_swamp_lizard',
  },
  {
    id: 'monster_poison_sprite',
    name: '毒雾精灵',
    floor: 3,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 55, mp: 40,
      physicalAttack: [5, 8], magicAttack: [18, 22],
      physicalDefense: 3, magicDefense: 8,
      attackSpeed: 100, moveSpeed: 90,
      criticalRate: 4, criticalDamage: 150,
    },
    skills: [
      skill('sk_poison_bomb', '毒雾弹', 'attack', 100, 'magic', 6),
      skill('sk_poison_field', '毒之领域', 'attack', 120, 'magic', 12),
    ],
    lootTable: [],
    expReward: 16,
    goldReward: [8, 16],
    sprite: 'monster_poison_sprite',
  },
];

// ==================== 第4层: 火山地带 ====================

const FLOOR_4_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_fire_elemental',
    name: '火元素',
    floor: 4,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 70, mp: 50,
      physicalAttack: [8, 12], magicAttack: [22, 28],
      physicalDefense: 4, magicDefense: 10,
      attackSpeed: 100, moveSpeed: 80,
      criticalRate: 4, criticalDamage: 150,
    },
    skills: [
      skill('sk_fire_fireball', '火球', 'attack', 110, 'magic', 3),
      skill('sk_fire_storm', '火焰风暴', 'attack', 130, 'magic', 8),
    ],
    lootTable: [],
    expReward: 22,
    goldReward: [12, 22],
    sprite: 'monster_fire_elemental',
  },
  {
    id: 'monster_lava_giant',
    name: '熔岩巨人',
    floor: 4,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 150, mp: 0,
      physicalAttack: [18, 24], magicAttack: [0, 0],
      physicalDefense: 12, magicDefense: 5,
      attackSpeed: 70, moveSpeed: 60,
      criticalRate: 3, criticalDamage: 150,
    },
    skills: [
      skill('sk_lava_smash', '岩石重击', 'attack', 130, 'physical', 5),
      skill('sk_lava_armor', '熔岩护甲', 'buff', 0, 'physical', 15),
      skill('sk_lava_burn', '地面灼烧', 'attack', 100, 'magic', 10),
    ],
    lootTable: [],
    expReward: 25,
    goldReward: [15, 25],
    sprite: 'monster_lava_giant',
  },
  {
    id: 'monster_flame_sprite',
    name: '火焰精灵',
    floor: 4,
    type: 'ranged',
    aggression: 'normal',
    aggroRange: 5,
    stats: {
      hp: 60, mp: 45,
      physicalAttack: [10, 14], magicAttack: [20, 26],
      physicalDefense: 5, magicDefense: 12,
      attackSpeed: 110, moveSpeed: 100,
      criticalRate: 5, criticalDamage: 150,
    },
    skills: [
      skill('sk_flame_barrage', '火球连射', 'attack', 80, 'magic', 6),
      skill('sk_flame_shield', '火焰护盾', 'buff', 0, 'magic', 12),
    ],
    lootTable: [],
    expReward: 20,
    goldReward: [10, 20],
    sprite: 'monster_flame_sprite',
  },
];

// ==================== 第5层: 冰霜深渊 ====================

const FLOOR_5_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_ice_elemental',
    name: '冰霜元素',
    floor: 5,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 85, mp: 60,
      physicalAttack: [10, 14], magicAttack: [28, 35],
      physicalDefense: 5, magicDefense: 14,
      attackSpeed: 100, moveSpeed: 80,
      criticalRate: 4, criticalDamage: 150,
    },
    skills: [
      skill('sk_ice_frost_bolt', '冰霜弹', 'attack', 100, 'magic', 3),
      skill('sk_ice_wall', '冰墙', 'control', 0, 'magic', 10),
    ],
    lootTable: [],
    expReward: 28,
    goldReward: [15, 28],
    sprite: 'monster_ice_elemental',
  },
  {
    id: 'monster_snowman',
    name: '雪人',
    floor: 5,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 130, mp: 0,
      physicalAttack: [22, 28], magicAttack: [0, 0],
      physicalDefense: 10, magicDefense: 6,
      attackSpeed: 80, moveSpeed: 70,
      criticalRate: 3, criticalDamage: 150,
    },
    skills: [
      skill('sk_snowman_throw', '投掷雪球', 'attack', 110, 'physical', 4),
      skill('sk_snowman_avalanche', '雪崩', 'attack', 130, 'physical', 8),
    ],
    lootTable: [],
    expReward: 30,
    goldReward: [18, 30],
    sprite: 'monster_snowman',
  },
  {
    id: 'monster_ice_wolf',
    name: '冰狼',
    floor: 5,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 95, mp: 0,
      physicalAttack: [25, 32], magicAttack: [0, 0],
      physicalDefense: 7, magicDefense: 5,
      attackSpeed: 120, moveSpeed: 130,
      criticalRate: 6, criticalDamage: 150,
    },
    skills: [
      skill('sk_ice_wolf_bite', '冰冻撕咬', 'attack', 120, 'physical', 3),
      skill('sk_ice_wolf_rush', '冰霜突袭', 'attack', 130, 'physical', 6),
    ],
    lootTable: [],
    expReward: 26,
    goldReward: [14, 26],
    sprite: 'monster_ice_wolf',
  },
];

// ==================== 第6层: 暗影深渊 ====================

const FLOOR_6_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_shadow_assassin',
    name: '暗影刺客',
    floor: 6,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 100, mp: 0,
      physicalAttack: [30, 38], magicAttack: [0, 0],
      physicalDefense: 8, magicDefense: 6,
      attackSpeed: 130, moveSpeed: 130,
      criticalRate: 10, criticalDamage: 180,
    },
    skills: [
      skill('sk_assassin_slash', '暗影斩', 'attack', 130, 'physical', 3),
      skill('sk_assassin_stealth', '隐身', 'special', 0, 'physical', 10),
    ],
    lootTable: [],
    expReward: 35,
    goldReward: [20, 35],
    sprite: 'monster_shadow_assassin',
  },
  {
    id: 'monster_ghost',
    name: '幽灵',
    floor: 6,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 80, mp: 70,
      physicalAttack: [8, 12], magicAttack: [35, 42],
      physicalDefense: 4, magicDefense: 18,
      attackSpeed: 100, moveSpeed: 90,
      criticalRate: 5, criticalDamage: 150,
    },
    skills: [
      skill('sk_ghost_penetrate', '灵魂穿透', 'attack', 120, 'magic', 4),
      skill('sk_ghost_curse', '诅咒', 'control', 0, 'magic', 12),
    ],
    lootTable: [],
    expReward: 32,
    goldReward: [18, 32],
    sprite: 'monster_ghost',
  },
  {
    id: 'monster_demon',
    name: '恶魔',
    floor: 6,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 140, mp: 30,
      physicalAttack: [35, 42], magicAttack: [0, 0],
      physicalDefense: 12, magicDefense: 8,
      attackSpeed: 110, moveSpeed: 100,
      criticalRate: 6, criticalDamage: 160,
    },
    skills: [
      skill('sk_demon_claw', '恶魔之爪', 'attack', 140, 'physical', 3),
      skill('sk_demon_drain', '吸血', 'attack', 100, 'physical', 8),
    ],
    lootTable: [],
    expReward: 38,
    goldReward: [22, 38],
    sprite: 'monster_demon',
  },
];

// ==================== 第7层: 雷霆领域 ====================

const FLOOR_7_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_thunder_elemental',
    name: '雷元素',
    floor: 7,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 100, mp: 80,
      physicalAttack: [12, 16], magicAttack: [42, 50],
      physicalDefense: 6, magicDefense: 22,
      attackSpeed: 100, moveSpeed: 80,
      criticalRate: 5, criticalDamage: 160,
    },
    skills: [
      skill('sk_thunder_chain', '闪电链', 'attack', 110, 'magic', 4),
      skill('sk_thunder_field', '雷场', 'attack', 140, 'magic', 10),
    ],
    lootTable: [],
    expReward: 42,
    goldReward: [25, 42],
    sprite: 'monster_thunder_elemental',
  },
  {
    id: 'monster_thunder_bird',
    name: '雷鸟',
    floor: 7,
    type: 'ranged',
    aggression: 'aggressive',
    aggroRange: 5,
    stats: {
      hp: 85, mp: 50,
      physicalAttack: [15, 20], magicAttack: [38, 45],
      physicalDefense: 7, magicDefense: 18,
      attackSpeed: 120, moveSpeed: 140,
      criticalRate: 6, criticalDamage: 160,
    },
    skills: [
      skill('sk_bird_thunder', '雷光', 'attack', 130, 'magic', 3),
      skill('sk_bird_speed', '高速移动', 'buff', 0, 'magic', 8),
    ],
    lootTable: [],
    expReward: 40,
    goldReward: [22, 40],
    sprite: 'monster_thunder_bird',
  },
  {
    id: 'monster_thunder_beast',
    name: '雷兽',
    floor: 7,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 160, mp: 20,
      physicalAttack: [40, 48], magicAttack: [0, 0],
      physicalDefense: 15, magicDefense: 10,
      attackSpeed: 90, moveSpeed: 80,
      criticalRate: 5, criticalDamage: 160,
    },
    skills: [
      skill('sk_beast_smash', '雷霆一击', 'attack', 120, 'physical', 5),
      skill('sk_beast_shield', '雷电护盾', 'buff', 0, 'physical', 12),
    ],
    lootTable: [],
    expReward: 45,
    goldReward: [28, 45],
    sprite: 'monster_thunder_beast',
  },
];

// ==================== 第8层: 亡灵之地 ====================

const FLOOR_8_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_death_knight',
    name: '亡灵骑士',
    floor: 8,
    type: 'melee',
    aggression: 'normal',
    aggroRange: 3,
    stats: {
      hp: 180, mp: 0,
      physicalAttack: [45, 55], magicAttack: [0, 0],
      physicalDefense: 18, magicDefense: 12,
      attackSpeed: 100, moveSpeed: 90,
      criticalRate: 5, criticalDamage: 160,
    },
    skills: [
      skill('sk_knight_slash', '亡灵斩', 'attack', 130, 'physical', 4),
      skill('sk_knight_revive', '复活', 'special', 0, 'physical', 0),
    ],
    lootTable: [],
    expReward: 50,
    goldReward: [30, 50],
    sprite: 'monster_death_knight',
  },
  {
    id: 'monster_lich',
    name: '巫妖',
    floor: 8,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 120, mp: 100,
      physicalAttack: [10, 14], magicAttack: [50, 60],
      physicalDefense: 8, magicDefense: 28,
      attackSpeed: 100, moveSpeed: 70,
      criticalRate: 5, criticalDamage: 160,
    },
    skills: [
      skill('sk_lich_bolt', '暗影箭', 'attack', 120, 'magic', 3),
      skill('sk_lich_drain', '生命汲取', 'attack', 100, 'magic', 8),
      skill('sk_lich_army', '召唤亡灵', 'summon', 0, 'magic', 15),
    ],
    lootTable: [],
    expReward: 48,
    goldReward: [28, 48],
    sprite: 'monster_lich',
  },
  {
    id: 'monster_undead_dragon',
    name: '死灵龙',
    floor: 8,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 5,
    stats: {
      hp: 220, mp: 40,
      physicalAttack: [50, 62], magicAttack: [30, 40],
      physicalDefense: 20, magicDefense: 14,
      attackSpeed: 90, moveSpeed: 100,
      criticalRate: 6, criticalDamage: 170,
    },
    skills: [
      skill('sk_dragon_breath', '龙息', 'attack', 140, 'magic', 5),
      skill('sk_dragon_claw', '龙爪', 'attack', 130, 'physical', 3),
      skill('sk_dragon_fear', '恐惧凝视', 'control', 0, 'magic', 12),
    ],
    lootTable: [],
    expReward: 55,
    goldReward: [35, 55],
    sprite: 'monster_undead_dragon',
  },
];

// ==================== 第9层: 深渊裂隙 ====================

const FLOOR_9_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_demon_warrior',
    name: '恶魔战士',
    floor: 9,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 200, mp: 0,
      physicalAttack: [55, 65], magicAttack: [0, 0],
      physicalDefense: 22, magicDefense: 15,
      attackSpeed: 110, moveSpeed: 110,
      criticalRate: 7, criticalDamage: 170,
    },
    skills: [
      skill('sk_demon_w_slash', '恶魔斩', 'attack', 130, 'physical', 3),
      skill('sk_demon_w_rage', '狂暴', 'buff', 0, 'physical', 15),
    ],
    lootTable: [],
    expReward: 60,
    goldReward: [38, 60],
    sprite: 'monster_demon_warrior',
  },
  {
    id: 'monster_demon_mage',
    name: '恶魔法师',
    floor: 9,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 150, mp: 120,
      physicalAttack: [12, 16], magicAttack: [60, 72],
      physicalDefense: 10, magicDefense: 35,
      attackSpeed: 100, moveSpeed: 80,
      criticalRate: 6, criticalDamage: 170,
    },
    skills: [
      skill('sk_demon_m_bolt', '暗影弹', 'attack', 120, 'magic', 3),
      skill('sk_demon_m_storm', '暗影风暴', 'attack', 140, 'magic', 8),
      skill('sk_demon_m_shield', '暗影护盾', 'buff', 0, 'magic', 12),
    ],
    lootTable: [],
    expReward: 58,
    goldReward: [35, 58],
    sprite: 'monster_demon_mage',
  },
  {
    id: 'monster_demon_archer',
    name: '恶魔弓手',
    floor: 9,
    type: 'ranged',
    aggression: 'aggressive',
    aggroRange: 5,
    stats: {
      hp: 160, mp: 30,
      physicalAttack: [60, 72], magicAttack: [0, 0],
      physicalDefense: 14, magicDefense: 12,
      attackSpeed: 130, moveSpeed: 120,
      criticalRate: 8, criticalDamage: 180,
    },
    skills: [
      skill('sk_demon_a_arrow', '暗影箭', 'attack', 110, 'physical', 2),
      skill('sk_demon_a_rain', '箭雨', 'attack', 80, 'physical', 6),
    ],
    lootTable: [],
    expReward: 62,
    goldReward: [40, 62],
    sprite: 'monster_demon_archer',
  },
];

// ==================== 第10层: 深渊核心 ====================

const FLOOR_10_MONSTERS: MonsterDefinition[] = [
  {
    id: 'monster_abyss_guard',
    name: '深渊守卫',
    floor: 10,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 4,
    stats: {
      hp: 250, mp: 0,
      physicalAttack: [65, 78], magicAttack: [0, 0],
      physicalDefense: 28, magicDefense: 18,
      attackSpeed: 110, moveSpeed: 100,
      criticalRate: 7, criticalDamage: 180,
    },
    skills: [
      skill('sk_guard_slash', '深渊斩', 'attack', 140, 'physical', 3),
      skill('sk_guard_shout', '战吼', 'buff', 0, 'physical', 15),
      skill('sk_guard_charge', '冲锋', 'attack', 150, 'physical', 8),
    ],
    lootTable: [],
    expReward: 75,
    goldReward: [48, 75],
    sprite: 'monster_abyss_guard',
  },
  {
    id: 'monster_abyss_mage',
    name: '深渊法师',
    floor: 10,
    type: 'caster',
    aggression: 'normal',
    aggroRange: 6,
    stats: {
      hp: 180, mp: 150,
      physicalAttack: [14, 18], magicAttack: [75, 90],
      physicalDefense: 12, magicDefense: 42,
      attackSpeed: 100, moveSpeed: 80,
      criticalRate: 6, criticalDamage: 180,
    },
    skills: [
      skill('sk_abyss_m_bolt', '深渊弹', 'attack', 130, 'magic', 3),
      skill('sk_abyss_m_storm', '深渊风暴', 'attack', 150, 'magic', 8),
      skill('sk_abyss_m_drain', '生命汲取', 'attack', 100, 'magic', 10),
    ],
    lootTable: [],
    expReward: 72,
    goldReward: [45, 72],
    sprite: 'monster_abyss_mage',
  },
  {
    id: 'monster_abyss_demon',
    name: '深渊恶魔',
    floor: 10,
    type: 'melee',
    aggression: 'aggressive',
    aggroRange: 5,
    stats: {
      hp: 280, mp: 50,
      physicalAttack: [75, 88], magicAttack: [40, 50],
      physicalDefense: 25, magicDefense: 20,
      attackSpeed: 120, moveSpeed: 110,
      criticalRate: 8, criticalDamage: 190,
    },
    skills: [
      skill('sk_abyss_d_claw', '深渊之爪', 'attack', 150, 'physical', 3),
      skill('sk_abyss_d_drain', '吸血', 'attack', 120, 'physical', 6),
      skill('sk_abyss_d_rage', '狂暴', 'buff', 0, 'physical', 15),
    ],
    lootTable: [],
    expReward: 80,
    goldReward: [50, 80],
    sprite: 'monster_abyss_demon',
  },
];

// ==================== 主数组与查询 ====================

/** 所有普通怪物 */
export const ALL_MONSTERS: MonsterDefinition[] = [
  ...FLOOR_1_MONSTERS,
  ...FLOOR_2_MONSTERS,
  ...FLOOR_3_MONSTERS,
  ...FLOOR_4_MONSTERS,
  ...FLOOR_5_MONSTERS,
  ...FLOOR_6_MONSTERS,
  ...FLOOR_7_MONSTERS,
  ...FLOOR_8_MONSTERS,
  ...FLOOR_9_MONSTERS,
  ...FLOOR_10_MONSTERS,
];

/** 按ID查询怪物 */
export function getMonsterById(id: string): MonsterDefinition | undefined {
  return ALL_MONSTERS.find(m => m.id === id);
}

/** 按层数查询怪物 */
export function getMonstersByFloor(floor: number): MonsterDefinition[] {
  return ALL_MONSTERS.filter(m => m.floor === floor);
}

/** 按类型查询怪物 */
export function getMonstersByType(type: MonsterType): MonsterDefinition[] {
  return ALL_MONSTERS.filter(m => m.type === type);
}

/** 怪物总数 */
export const MONSTER_COUNT = ALL_MONSTERS.length;
