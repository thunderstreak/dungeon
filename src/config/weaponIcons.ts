// 武器icon映射配置

/** 法杖icon帧索引映射 */
export const STAFF_ICON_MAP: Record<string, number> = {
  // 长杖 (帧 0-7)
  'weapon_long_staff_0': 0,   // 生锈的长杖
  'weapon_long_staff_1': 1,   // 铁长杖
  'weapon_long_staff_2': 2,   // 钢长杖
  'weapon_long_staff_3': 3,   // 精钢长杖
  'weapon_long_staff_4': 4,   // 黑铁长杖
  'weapon_long_staff_5': 5,   // 秘银长杖
  'weapon_long_staff_6': 6,   // 精金长杖
  'weapon_long_staff_7': 7,   // 魔化长杖及以上

  // 短杖 (帧 8-15)
  'weapon_short_staff_0': 8,  // 生锈的短杖
  'weapon_short_staff_1': 9,  // 铁短杖
  'weapon_short_staff_2': 10, // 钢短杖
  'weapon_short_staff_3': 11, // 精钢短杖
  'weapon_short_staff_4': 12, // 黑铁短杖
  'weapon_short_staff_5': 13, // 秘银短杖
  'weapon_short_staff_6': 14, // 精金短杖
  'weapon_short_staff_7': 15, // 魔化短杖及以上

  // 魔杖 (帧 16-17，共2帧)
  'weapon_wand_0': 16,
  'weapon_wand_1': 17,
};

/** 法杖类型基础icon前缀 */
export const STAFF_TYPE_PREFIX = {
  long_staff: 'weapon_long_staff',
  short_staff: 'weapon_short_staff',
  wand: 'weapon_wand',
} as const;

/** 根据法杖等级获取icon key */
export function getStaffIconKey(staffType: 'long_staff' | 'short_staff' | 'wand', level: number): string {
  const prefix = STAFF_TYPE_PREFIX[staffType];
  if (staffType === 'wand') return `${prefix}_0`;
  // 等级分段：1-10, 15-25, 30-40, 45-60
  if (level <= 10) return `${prefix}_0`;
  if (level <= 25) return `${prefix}_1`;
  if (level <= 40) return `${prefix}_2`;
  return `${prefix}_3`;
}

/** 获取法杖icon帧索引 */
export function getStaffIconFrame(iconKey: string): number {
  return STAFF_ICON_MAP[iconKey] ?? 0;
}

/** 获取法师武器的精灵图纹理和帧（返回null表示非法师武器） */
export function getMageWeaponIcon(equipmentType: string, iconKey: string): { texture: string; frame: number } | null {
  if (equipmentType === 'long_staff' || equipmentType === 'short_staff' || equipmentType === 'wand') {
    return { texture: 'staff_icons', frame: getStaffIconFrame(iconKey) };
  }
  return null;
}
