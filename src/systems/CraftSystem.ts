// 炼金制作系统 - 配方验证、材料消耗、制作费用、产出

import type { Inventory } from '@/config/types';
import type { AlchemyRecipe, RecipeMaterial } from '@/data/recipes';
import { ALL_RECIPES, getRecipeById } from '@/data/recipes';
import { eventBus } from './EventBus';

// ==================== 制作结果 ====================

/** 制作结果 */
export interface CraftResult {
  success: boolean;
  recipeId: string;
  resultItemId: string;
  resultCount: number;
  goldCost: number;
  materialsConsumed: RecipeMaterial[];
  error?: string;
}

// ==================== 配方查询 ====================

/** 获取所有可用配方 */
export function getAllAvailableRecipes(): AlchemyRecipe[] {
  return ALL_RECIPES;
}

/** 根据ID获取配方 */
export function getRecipe(recipeId: string): AlchemyRecipe | null {
  return getRecipeById(recipeId) ?? null;
}

/** 获取指定类别的配方 */
export function getRecipesByCategory(category: AlchemyRecipe['category']): AlchemyRecipe[] {
  return ALL_RECIPES.filter((r: AlchemyRecipe) => r.category === category);
}

// ==================== 制作验证 ====================

/** 检查玩家等级是否满足 */
function checkLevelReq(recipe: AlchemyRecipe, playerLevel: number): boolean {
  return playerLevel >= recipe.levelReq;
}

/** 检查材料是否充足 */
function checkMaterials(recipe: AlchemyRecipe, inventory: Inventory): boolean {
  const equipmentSlots = inventory.categories.equipment;
  const consumableSlots = inventory.categories.consumable;
  const materialSlots = inventory.categories.material;

  for (const mat of recipe.materials) {
    let count = 0;

    // 在所有分类中查找材料
    for (const slot of [...equipmentSlots, ...consumableSlots, ...materialSlots]) {
      if (slot.item?.id === mat.itemId) {
        count += slot.count;
      }
    }

    if (count < mat.count) {
      return false;
    }
  }

  return true;
}

/** 检查金币是否充足 */
function checkGold(recipe: AlchemyRecipe, gold: number): boolean {
  return gold >= recipe.craftingCost;
}

/** 检查背包是否有空间 */
function checkInventorySpace(recipe: AlchemyRecipe, inventory: Inventory): boolean {
  // 检查消耗品分类是否有空间
  const consumableSlots = inventory.categories.consumable;
  const emptySlots = consumableSlots.filter(s => s.item === null).length;

  // 至少需要1个空槽位
  return emptySlots >= 1;
}

/** 完整验证配方 */
export function validateRecipe(
  recipeId: string,
  inventory: Inventory,
  playerLevel: number,
): { valid: boolean; error?: string } {
  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return { valid: false, error: '配方不存在' };
  }

  if (!checkLevelReq(recipe, playerLevel)) {
    return { valid: false, error: `等级不足，需要${recipe.levelReq}级` };
  }

  if (!checkGold(recipe, inventory.gold)) {
    return { valid: false, error: `金币不足，需要${recipe.craftingCost}金币` };
  }

  if (!checkMaterials(recipe, inventory)) {
    return { valid: false, error: '材料不足' };
  }

  if (!checkInventorySpace(recipe, inventory)) {
    return { valid: false, error: '背包空间不足' };
  }

  return { valid: true };
}

// ==================== 制作执行 ====================

/** 消耗材料 */
function consumeMaterials(
  recipe: AlchemyRecipe,
  inventory: Inventory,
): RecipeMaterial[] {
  const consumed: RecipeMaterial[] = [];
  const allSlots = [
    ...inventory.categories.equipment,
    ...inventory.categories.consumable,
    ...inventory.categories.material,
  ];

  for (const mat of recipe.materials) {
    let remaining = mat.count;

    for (const slot of allSlots) {
      if (slot.item?.id === mat.itemId && slot.count > 0) {
        const take = Math.min(slot.count, remaining);
        slot.count -= take;
        remaining -= take;

        if (slot.count === 0) {
          slot.item = null;
        }

        consumed.push({ itemId: mat.itemId, count: take });

        if (remaining <= 0) break;
      }
    }
  }

  return consumed;
}

/** 添加产出物品到背包 */
function addResultToInventory(
  recipe: AlchemyRecipe,
  inventory: Inventory,
): boolean {
  const consumableSlots = inventory.categories.consumable;

  // 查找已有的相同物品槽位
  for (const slot of consumableSlots) {
    if (slot.item?.id === recipe.resultItemId && slot.count < slot.item.maxStack) {
      const canAdd = slot.item.maxStack - slot.count;
      const toAdd = Math.min(canAdd, recipe.resultCount);
      slot.count += toAdd;

      if (toAdd === recipe.resultCount) {
        return true;
      }
    }
  }

  // 查找空槽位
  for (const slot of consumableSlots) {
    if (slot.item === null) {
      slot.item = {
        id: recipe.resultItemId,
        name: recipe.name,
        type: 'consumable',
        icon: '',
        description: recipe.description,
        isStackable: true,
        maxStack: 99,
      };
      slot.count = recipe.resultCount;
      return true;
    }
  }

  return false;
}

/** 执行制作 */
export function craftItem(
  recipeId: string,
  inventory: Inventory,
  playerLevel: number,
): CraftResult {
  // 验证
  const validation = validateRecipe(recipeId, inventory, playerLevel);
  if (!validation.valid) {
    return {
      success: false,
      recipeId,
      resultItemId: '',
      resultCount: 0,
      goldCost: 0,
      materialsConsumed: [],
      error: validation.error,
    };
  }

  const recipe = getRecipeById(recipeId)!;

  // 消耗材料
  const materialsConsumed = consumeMaterials(recipe, inventory);

  // 消耗金币
  inventory.gold -= recipe.craftingCost;

  // 添加产出
  const added = addResultToInventory(recipe, inventory);

  const result: CraftResult = {
    success: added,
    recipeId,
    resultItemId: recipe.resultItemId,
    resultCount: recipe.resultCount,
    goldCost: recipe.craftingCost,
    materialsConsumed,
  };

  if (added) {
    eventBus.emit('craft:success', {
      recipeId,
      resultItemId: recipe.resultItemId,
      resultCount: recipe.resultCount,
    });
  }

  return result;
}

// ==================== 事件声明 ====================

declare module './EventBus' {
  interface GameEvents {
    'craft:success': { recipeId: string; resultItemId: string; resultCount: number };
  }
}
