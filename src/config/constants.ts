// ============================================================
// 全局常量定义
// ============================================================

import type {
  CharacterClass, EquipmentRarity, EquipmentSlot,
  EffectValueType, AggroAction,
} from './types';

// ==================== 游戏基础配置 ====================

/** 游戏版本号 */
export const GAME_VERSION = '1.0.0';

/** 画布尺寸 */
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;

/** 瓦片大小 (像素) — 正方形 */
export const TILE_SIZE = 32;

/** 兼容旧代码 */
export const ISO_TILE_WIDTH = TILE_SIZE;
export const ISO_TILE_HEIGHT = TILE_SIZE;

// ==================== 角色常量 ====================

/** 最高等级 */
export const MAX_LEVEL = 60;

/** 转职等级 */
export const CLASS_CHANGE_LEVEL = 20;

/** 每级获得技能点 */
export const SKILL_POINTS_PER_LEVEL = 3;

/** 技能最高等级 */
export const MAX_SKILL_LEVEL = 10;

/** 武器精通最高等级 */
export const MAX_WEAPON_MASTERY_LEVEL = 20;

/** 武器精通每级所需熟练度 */
export const MASTERY_EXP_PER_LEVEL = 100;

/** 速度下限 (%) */
export const MIN_SPEED = 10;

/** 速度上限 (%) */
export const MAX_SPEED = 300;

// ==================== 属性点系统 ====================

/** 每级获得属性点 */
export const ATTRIBUTE_POINTS_PER_LEVEL = 5;

/** 可分配属性总数 (59级 × 5点) */
export const TOTAL_ATTRIBUTE_POINTS = (MAX_LEVEL - 1) * ATTRIBUTE_POINTS_PER_LEVEL;

/** 属性点转换 - 力量 */
export const STR_PHYSICAL_ATTACK_PER_POINT = 2;       // 物理攻击力
export const STR_PHYSICAL_DAMAGE_BONUS_PER_POINT = 0.5; // 物理伤害加成 (%)

/** 属性点转换 - 智力 */
export const INT_MAGIC_ATTACK_PER_POINT = 2;           // 魔法攻击力
export const INT_MAGIC_DAMAGE_BONUS_PER_POINT = 0.5;   // 魔法伤害加成 (%)

/** 属性点转换 - 体力 */
export const STA_HP_PER_POINT = 20;                    // 生命值上限
export const STA_PHYSICAL_DEFENSE_PER_POINT = 1;       // 物理防御力

/** 属性点转换 - 精神 */
export const SPI_MP_PER_POINT = 15;                    // 魔法值上限
export const SPI_MAGIC_DEFENSE_PER_POINT = 1;          // 魔法防御力

/** 属性点转换 - 敏捷 */
export const AGI_DODGE_RATE_PER_POINT = 0.3;           // 闪避率 (%)
export const AGI_ATTACK_SPEED_PER_POINT = 0.5;         // 攻击速度 (%)
export const AGI_CRITICAL_RATE_PER_POINT = 0.2;        // 暴击率 (%)

/** 战士基础属性 */
export const WARRIOR_BASE_STATS = {
  strength: 15,
  intelligence: 5,
  stamina: 12,
  spirit: 5,
} as const;

/** 法师基础属性 */
export const MAGE_BASE_STATS = {
  strength: 5,
  intelligence: 15,
  stamina: 8,
  spirit: 12,
} as const;

/** 战士战斗基础值 (不含属性点和装备) */
export const WARRIOR_BASE_COMBAT = {
  hp: 100,
  mp: 30,
  physicalAttack: 10,
  magicAttack: 0,
  physicalDefense: 5,
  magicDefense: 0,
} as const;

/** 法师战斗基础值 (不含属性点和装备) */
export const MAGE_BASE_COMBAT = {
  hp: 60,
  mp: 80,
  physicalAttack: 0,
  magicAttack: 10,
  physicalDefense: 0,
  magicDefense: 5,
} as const;

// ==================== 背包与仓库 ====================

/** 背包每类初始容量 */
export const INVENTORY_INITIAL_SLOTS = 20;

/** 转职后每类增加容量 */
export const INVENTORY_CLASS_CHANGE_BONUS = 5;

/** 仓库初始容量 */
export const WAREHOUSE_INITIAL_SLOTS = 100;

/** 技能快捷栏槽位数 */
export const SKILL_BAR_SLOTS = 8;

/** 物品快捷栏槽位数 */
export const ITEM_BAR_SLOTS = 8;

/** 每种药水携带上限 */
export const MAX_POTION_STACK = 20;

// ==================== 经验与升级 ====================

/**
 * 计算升级所需经验
 * 公式: floor(100 * level^1.5)
 */
export function getExpRequired(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// ==================== 地牢系统 ====================

/** 地牢总层数 */
export const TOTAL_DUNGEON_FLOORS = 10;

/** 深渊触发概率 */
export const ABYSS_TRIGGER_RATE = 0.1;

/** 各层难度倍率 (HP/攻击/防御) */
export const FLOOR_DIFFICULTY_MULTIPLIER: readonly number[] = [
  1.0,   // 第1层
  1.25,  // 第2层
  1.56,  // 第3层
  1.95,  // 第4层
  2.44,  // 第5层
  3.05,  // 第6层
  3.81,  // 第7层
  4.76,  // 第8层
  5.95,  // 第9层
  7.44,  // 第10层
];

/** 各层经验倍率 */
export const FLOOR_EXP_MULTIPLIER: readonly number[] = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.8, 3.5, 4.5, 5.5, 7.0,
];

/** 各层金币倍率 */
export const FLOOR_GOLD_MULTIPLIER: readonly number[] = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.8, 3.5, 4.5, 5.5, 7.0,
];

/** 深渊模式怪物属性倍率 */
export const ABYSS_STAT_MULTIPLIER = 2.25;

/** 深渊模式经验倍率 */
export const ABYSS_EXP_MULTIPLIER = 2;

/** 深渊模式金币倍率 */
export const ABYSS_GOLD_MULTIPLIER = 2;

/** 深渊模式粉/橙掉落倍率 */
export const ABYSS_RARE_DROP_MULTIPLIER = 3;

// ==================== 精英怪 ====================

/** 精英怪 HP 倍率 */
export const ELITE_HP_MULTIPLIER = 1.5;

/** 精英怪攻击倍率 */
export const ELITE_ATTACK_MULTIPLIER = 1.5;

/** 精英怪防御倍率 */
export const ELITE_DEFENSE_MULTIPLIER = 1.5;

/** 精英怪经验倍率 */
export const ELITE_EXP_MULTIPLIER = 2;

/** 精英怪金币倍率 */
export const ELITE_GOLD_MULTIPLIER = 3;

// ==================== 战斗系统 ====================

/** 默认暴击伤害倍率 (%) */
export const DEFAULT_CRITICAL_DAMAGE = 150;

/** 默认攻击速度 (%) */
export const DEFAULT_ATTACK_SPEED = 100;

/** 默认移动速度 (%) */
export const DEFAULT_MOVE_SPEED = 100;

/** 默认施法速度 (%) */
export const DEFAULT_CAST_SPEED = 100;

/** 暴击率上限 (%) */
export const MAX_CRITICAL_RATE = 100;

/** 闪避率上限 (%) */
export const MAX_DODGE_RATE = 100;

// ==================== 自动恢复 ====================

/** 基础HP恢复 (每分钟) */
export const BASE_HP_REGEN = 10;

/** 基础MP恢复 (每分钟) */
export const BASE_MP_REGEN = 5;

/** 每点体力额外HP恢复 (每分钟) */
export const STA_HP_REGEN_PER_POINT = 2;

/** 每点精神额外MP恢复 (每分钟) */
export const SPI_MP_REGEN_PER_POINT = 1.5;

/** 恢复结算间隔 (毫秒) */
export const REGEN_SETTLE_INTERVAL = 1000;

/** 脱战恢复延迟 (毫秒) */
export const COMBAT_REGEN_DELAY = 5000;

// ==================== 仇恨系统 ====================

/** 仇恨衰减率 (每秒) */
export const AGGRO_DECAY_RATE = 0.05;

/** 造成伤害仇恨系数 */
export const AGGRO_DAMAGE_RATE = 1.0;

/** 治疗仇恨系数 */
export const AGGRO_HEAL_RATE = 0.5;

/** 嘲讽固定仇恨值 */
export const AGGRO_TAUNT_VALUE = 500;

/** 进入警戒范围仇恨值 */
export const AGGRO_ENTER_RANGE_VALUE = 100;

// ==================== 金币系统 ====================

/** 装备出售价格倍率 (购买价的比例) */
export const SELL_PRICE_RATIO = 0.3;

/** 各品质装备出售价格系数 (等级 × 系数) */
export const EQUIPMENT_SELL_FACTOR: Record<EquipmentRarity, number> = {
  white: 2,
  blue: 5,
  purple: 15,
  pink: 40,
  orange: 100,
};

/** 各品质修理系数 */
export const REPAIR_COST_FACTOR: Record<EquipmentRarity, number> = {
  white: 1,
  blue: 2,
  purple: 5,
  pink: 10,
  orange: 20,
};

// ==================== 死亡惩罚 ====================

/** 死亡经验损失比例 */
export const DEATH_EXP_LOSS = 0.1;

/** 死亡金币损失比例 */
export const DEATH_GOLD_LOSS = 0.1;

/** 死亡物品丢失概率 */
export const DEATH_ITEM_LOSS_CHANCE = 0.2;

/** 死亡物品丢失数量范围 [min, max] */
export const DEATH_ITEM_LOSS_COUNT: [number, number] = [1, 5];

// ==================== 装备强化 ====================

/** 强化最高等级 */
export const MAX_ENHANCEMENT_LEVEL = 20;

/** 各等级段强化成功率 */
export const ENHANCEMENT_SUCCESS_RATE: Record<string, number> = {
  '1_5': 0.95,    // +1~+5: 95%
  '6_10': 0.80,   // +6~+10: 80%
  '11_15': 0.40,  // +11~+15: 40%
  '16_20': 0.15,  // +16~+20: 15%
};

/** 强化失败降级规则: [最高等级, 降级数] */
export const ENHANCEMENT_PENALTY: readonly [number, number][] = [
  [10, 0],   // +1~+10: 失败不变
  [15, 1],   // +11~+15: 失败降1级
  [20, 2],   // +16~+20: 失败降2级
];

/** 装备最大耐久 - 武器 */
export const MAX_DURABILITY_WEAPON: [number, number] = [35, 50];

/** 装备最大耐久 - 防具/饰品 */
export const MAX_DURABILITY_ARMOR: [number, number] = [25, 35];

// ==================== 符文合成 ====================

/** 符文合成成功率 */
export const RUNE_CRAFT_SUCCESS_RATE: Record<string, number> = {
  'white_to_blue': 0.80,
  'blue_to_purple': 0.50,
  'purple_to_pink': 0.20,
  'pink_to_orange': 0.05,
};

// ==================== 药水冷却 ====================

/** 恢复类药水冷却时间 (秒) */
export const POTION_HEAL_COOLDOWN = 10;

/** 强效恢复药水冷却时间 (秒) */
export const POTION_HEAL_STRONG_COOLDOWN = 30;

/** 增益类药水冷却时间 (秒) */
export const POTION_BUFF_COOLDOWN = 120;

/** 高级增益药水冷却时间 (秒) */
export const POTION_BUFF_ADVANCED_COOLDOWN = 180;

/** 解除类药水冷却时间 (秒) */
export const POTION_CURE_COOLDOWN = 5;

// ==================== 传送 ====================

/** 传送冷却时间 (秒) */
export const TELEPORT_COOLDOWN = 30;

// ==================== 怪物金币掉落 ====================

/** 怪物金币掉落基础范围 [min, max] */
export const MONSTER_GOLD_DROP_BASE: [number, number] = [5, 15];

/** Boss 金币掉落基础范围 [min, max] */
export const BOSS_GOLD_DROP_BASE: [number, number] = [100, 300];

// ==================== NPC 类型映射 ====================

/** 物品类型 → 背包分类 */
export const ITEM_CATEGORY_MAP: Record<string, string> = {
  equipment: 'equipment',
  consumable: 'consumable',
  material: 'material',
  quest: 'other',
  skillbook: 'other',
  other: 'other',
};

// ==================== 颜色配置 ====================

/** 品质对应颜色 */
export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  white: '#ffffff',
  blue: '#5599ff',
  purple: '#aa55ff',
  pink: '#ff55aa',
  orange: '#ff9900',
};

/** 伤害飘字颜色 */
export const DAMAGE_COLORS = {
  physical: '#ffffff',
  magic: '#5599ff',
  true: '#ff5555',
  critical: '#ffff00',
  heal: '#55ff55',
} as const;
