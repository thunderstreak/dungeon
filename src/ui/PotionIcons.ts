// 药水图标映射 - 将icon名称映射到精灵图帧索引
// 精灵图: consumables-potions_sheet.png (8x8网格, 32x32每帧)

/** icon名称 → 精灵图帧索引 */
const ICON_FRAME_MAP: Record<string, number> = {
  // 生命药水 (红色系)
  potion_hp_small: 1,
  potion_hp_medium: 21,
  potion_hp_large: 32,
  potion_hp_xlarge: 37,
  potion_hp_full: 53,

  // 魔力药水 (蓝色系)
  potion_mp_small: 10,
  potion_mp_medium: 42,
  potion_mp_large: 56,
  potion_mp_xlarge: 59,
  potion_mp_full: 49,

  // 双重药水
  potion_dual: 26,

  // 增益药水 - 力量/攻击 (红色/橙色)
  potion_str: 8,
  potion_str_2: 34,

  // 增益药水 - 智慧/魔法 (紫色/蓝色)
  potion_int: 3,
  potion_int_2: 12,

  // 增益药水 - 敏捷/攻速 (黄色/绿色)
  potion_agi: 6,
  potion_agi_2: 14,

  // 增益药水 - 防御 (绿色)
  potion_def: 19,
  potion_def_2: 25,

  // 增益药水 - 魔抗 (蓝色/青色)
  potion_mdef: 11,
  potion_mdef_2: 44,

  // 特殊增益药水
  potion_berserk: 36,
  potion_swift: 15,
  potion_iron: 27,

  // 特殊药水
  potion_cure: 4,
  potion_purify: 5,
  potion_revive: 23,
  potion_teleport: 46,
  potion_exp: 20,
  potion_gold: 7,
  potion_abyss: 52,
};

// ==================== 材料图标映射 ====================
// 精灵图: gems-materials_sheet.png (8x8网格, 32x32每帧)

const MATERIAL_FRAME_MAP: Record<string, number> = {
  mat_ore_common: 48,   // 铁矿石
  mat_ore_fine: 49,     // 精炼矿石
  mat_ore_mithril: 52,  // 秘银矿
  mat_ore_adamantine: 50, // 精金矿
  mat_abyss_crystal: 58, // 深渊水晶
  mat_herb: 28,         // 草药
  mat_magic_essence: 63, // 魔法精华
  mat_rare_ore: 53,     // 稀有矿石
  mat_protect: 62,      // 保护符
  mat_lucky: 60,        // 幸运符
  mat_perfect: 57,      // 完美宝石
  mat_repair: 61,       // 修理石
  mat_full_repair: 59,  // 完全修理石
};

const MATERIAL_DEFAULT_FRAME = 48;

/** 默认帧（未知icon时显示） */
const DEFAULT_FRAME = 4; // 绿色药水

/**
 * 获取药水icon的帧索引
 * @param iconName icon名称
 * @returns 精灵图帧索引
 */
export function getPotionFrame(iconName: string): number {
  return ICON_FRAME_MAP[iconName] ?? DEFAULT_FRAME;
}

/**
 * 创建药水icon精灵
 * @param scene Phaser场景
 * @param iconName icon名称
 * @param x X坐标
 * @param y Y坐标
 * @param scale 缩放比例
 * @returns Sprite对象
 */
export function createPotionIcon(
  scene: Phaser.Scene,
  iconName: string,
  x: number,
  y: number,
  scale = 1,
): Phaser.GameObjects.Sprite {
  const frame = getPotionFrame(iconName);
  const sprite = scene.add.sprite(x, y, 'potions_sheet', frame);
  sprite.setScale(scale);
  return sprite;
}

// ==================== 材料图标 ====================

/** 获取材料icon的帧索引 */
export function getMaterialFrame(iconName: string): number {
  return MATERIAL_FRAME_MAP[iconName] ?? MATERIAL_DEFAULT_FRAME;
}

/** 创建材料icon精灵 */
export function createMaterialIcon(
  scene: Phaser.Scene,
  iconName: string,
  x: number,
  y: number,
  scale = 1,
): Phaser.GameObjects.Sprite {
  const frame = getMaterialFrame(iconName);
  const sprite = scene.add.sprite(x, y, 'materials_sheet', frame);
  sprite.setScale(scale);
  return sprite;
}
