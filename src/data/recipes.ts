// 炼金配方数据 - 制作材料消耗 + 制作费用

/** 配方所需材料 */
export interface RecipeMaterial {
  itemId: string;
  count: number;
}

/** 炼金配方 */
export interface AlchemyRecipe {
  id: string;
  name: string;
  description: string;
  resultItemId: string;
  resultCount: number;
  materials: RecipeMaterial[];
  craftingCost: number; // 金币
  levelReq: number;
  category: 'potion' | 'material' | 'special';
}

// ==================== 药水配方 ====================

/** 恢复药水配方 */
const HEALING_RECIPES: AlchemyRecipe[] = [
  {
    id: 'recipe_hp_medium',
    name: '中型生命药水',
    description: '制作3瓶中型生命药水',
    resultItemId: 'potion_hp_medium',
    resultCount: 3,
    materials: [
      { itemId: 'potion_hp_small', count: 3 },
      { itemId: 'mat_herb', count: 2 },
    ],
    craftingCost: 10,
    levelReq: 1,
    category: 'potion',
  },
  {
    id: 'recipe_hp_large',
    name: '大型生命药水',
    description: '制作2瓶大型生命药水',
    resultItemId: 'potion_hp_large',
    resultCount: 2,
    materials: [
      { itemId: 'potion_hp_medium', count: 3 },
      { itemId: 'mat_herb', count: 3 },
    ],
    craftingCost: 25,
    levelReq: 5,
    category: 'potion',
  },
  {
    id: 'recipe_hp_xl',
    name: '特大生命药水',
    description: '制作2瓶特大生命药水',
    resultItemId: 'potion_hp_xl',
    resultCount: 2,
    materials: [
      { itemId: 'potion_hp_large', count: 3 },
      { itemId: 'mat_magic_essence', count: 2 },
    ],
    craftingCost: 50,
    levelReq: 15,
    category: 'potion',
  },
  {
    id: 'recipe_hp_hero',
    name: '英雄生命药水',
    description: '制作1瓶英雄生命药水',
    resultItemId: 'potion_hp_hero',
    resultCount: 1,
    materials: [
      { itemId: 'potion_hp_xl', count: 3 },
      { itemId: 'mat_magic_essence', count: 5 },
      { itemId: 'mat_rare_ore', count: 1 },
    ],
    craftingCost: 100,
    levelReq: 30,
    category: 'potion',
  },
  {
    id: 'recipe_hp_god',
    name: '神级生命药水',
    description: '制作1瓶神级生命药水',
    resultItemId: 'potion_hp_god',
    resultCount: 1,
    materials: [
      { itemId: 'potion_hp_hero', count: 3 },
      { itemId: 'mat_rare_ore', count: 3 },
      { itemId: 'mat_abyss_crystal', count: 1 },
    ],
    craftingCost: 300,
    levelReq: 50,
    category: 'potion',
  },
];

/** 增益药水配方 */
const BUFF_RECIPES: AlchemyRecipe[] = [
  {
    id: 'recipe_str_potion_2',
    name: '力量药水II',
    description: '制作2瓶力量药水II',
    resultItemId: 'potion_strength_2',
    resultCount: 2,
    materials: [
      { itemId: 'potion_strength_1', count: 3 },
      { itemId: 'mat_magic_essence', count: 1 },
    ],
    craftingCost: 20,
    levelReq: 5,
    category: 'potion',
  },
  {
    id: 'recipe_int_potion_2',
    name: '智力药水II',
    description: '制作2瓶智力药水II',
    resultItemId: 'potion_intelligence_2',
    resultCount: 2,
    materials: [
      { itemId: 'potion_intelligence_1', count: 3 },
      { itemId: 'mat_magic_essence', count: 1 },
    ],
    craftingCost: 20,
    levelReq: 5,
    category: 'potion',
  },
  {
    id: 'recipe_berserk_potion',
    name: '狂暴药水',
    description: '制作1瓶狂暴药水',
    resultItemId: 'potion_berserk',
    resultCount: 1,
    materials: [
      { itemId: 'potion_strength_2', count: 2 },
      { itemId: 'mat_ore', count: 3 },
      { itemId: 'mat_magic_essence', count: 2 },
    ],
    craftingCost: 50,
    levelReq: 15,
    category: 'potion',
  },
  {
    id: 'recipe_barrier_potion',
    name: '结界药水',
    description: '制作1瓶结界药水',
    resultItemId: 'potion_barrier',
    resultCount: 1,
    materials: [
      { itemId: 'potion_magic_shield', count: 2 },
      { itemId: 'mat_magic_essence', count: 3 },
      { itemId: 'mat_rare_ore', count: 1 },
    ],
    craftingCost: 80,
    levelReq: 25,
    category: 'potion',
  },
  {
    id: 'recipe_haste_potion',
    name: '急速药水',
    description: '制作1瓶急速药水',
    resultItemId: 'potion_haste',
    resultCount: 1,
    materials: [
      { itemId: 'potion_agility_2', count: 2 },
      { itemId: 'mat_magic_essence', count: 2 },
    ],
    craftingCost: 40,
    levelReq: 10,
    category: 'potion',
  },
];

/** 特殊药水配方 */
const SPECIAL_RECIPES: AlchemyRecipe[] = [
  {
    id: 'recipe_resurrection',
    name: '复活药水',
    description: '制作1瓶复活药水',
    resultItemId: 'potion_resurrection',
    resultCount: 1,
    materials: [
      { itemId: 'potion_hp_xl', count: 2 },
      { itemId: 'mat_magic_essence', count: 5 },
      { itemId: 'mat_rare_ore', count: 1 },
    ],
    craftingCost: 200,
    levelReq: 30,
    category: 'special',
  },
  {
    id: 'recipe_town_scroll',
    name: '回城卷轴',
    description: '制作3张回城卷轴',
    resultItemId: 'potion_town_scroll',
    resultCount: 3,
    materials: [
      { itemId: 'mat_herb', count: 5 },
      { itemId: 'mat_magic_essence', count: 1 },
    ],
    craftingCost: 15,
    levelReq: 1,
    category: 'special',
  },
  {
    id: 'recipe_identify_scroll',
    name: '鉴定卷轴',
    description: '制作2张鉴定卷轴',
    resultItemId: 'potion_identify_scroll',
    resultCount: 2,
    materials: [
      { itemId: 'mat_herb', count: 3 },
      { itemId: 'mat_magic_essence', count: 2 },
    ],
    craftingCost: 30,
    levelReq: 10,
    category: 'special',
  },
];

// ==================== 材料合成配方 ====================

const MATERIAL_RECIPES: AlchemyRecipe[] = [
  {
    id: 'recipe_refined_iron',
    name: '精炼铁矿合成',
    description: '将普通矿石精炼为精炼铁矿',
    resultItemId: 'mat_refined_iron',
    resultCount: 1,
    materials: [
      { itemId: 'mat_ore', count: 5 },
    ],
    craftingCost: 20,
    levelReq: 1,
    category: 'material',
  },
  {
    id: 'recipe_magic_essence',
    name: '魔力精华合成',
    description: '将魔力碎片合成魔力精华',
    resultItemId: 'mat_magic_essence',
    resultCount: 1,
    materials: [
      { itemId: 'mat_magic_shard', count: 5 },
    ],
    craftingCost: 30,
    levelReq: 5,
    category: 'material',
  },
  {
    id: 'recipe_mithril',
    name: '秘银矿合成',
    description: '将精炼铁矿合成秘银矿',
    resultItemId: 'mat_mithril',
    resultCount: 1,
    materials: [
      { itemId: 'mat_refined_iron', count: 5 },
      { itemId: 'mat_magic_essence', count: 2 },
    ],
    craftingCost: 100,
    levelReq: 20,
    category: 'material',
  },
  {
    id: 'recipe_adamantite',
    name: '精金矿合成',
    description: '将秘银矿合成为精金矿',
    resultItemId: 'mat_adamantite',
    resultCount: 1,
    materials: [
      { itemId: 'mat_mithril', count: 5 },
      { itemId: 'mat_rare_ore', count: 2 },
    ],
    craftingCost: 500,
    levelReq: 35,
    category: 'material',
  },
];

// ==================== 主数组 ====================

/** 所有炼金配方 */
export const ALL_RECIPES: AlchemyRecipe[] = [
  ...HEALING_RECIPES,
  ...BUFF_RECIPES,
  ...SPECIAL_RECIPES,
  ...MATERIAL_RECIPES,
];

/** 按ID查询配方 */
export function getRecipeById(id: string): AlchemyRecipe | undefined {
  return ALL_RECIPES.find(r => r.id === id);
}

/** 按类别查询配方 */
export function getRecipesByCategory(category: AlchemyRecipe['category']): AlchemyRecipe[] {
  return ALL_RECIPES.filter(r => r.category === category);
}

/** 按等级查询可用配方 */
export function getRecipesByLevel(level: number): AlchemyRecipe[] {
  return ALL_RECIPES.filter(r => r.levelReq <= level);
}

/** 配方总数 */
export const RECIPE_COUNT = ALL_RECIPES.length;
