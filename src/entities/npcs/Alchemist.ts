// 炼金师NPC - 炼金制作

import type { NPCData, Character } from '@/config/types';
import { NPC } from '../NPC';
import { craftItem, validateRecipe, getAllAvailableRecipes } from '@/systems/CraftSystem';
import type { Inventory } from '@/config/types';

export class Alchemist extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  /** 获取所有可用配方 */
  getRecipes() {
    return getAllAvailableRecipes();
  }

  /** 验证配方 */
  validate(recipeId: string, inventory: Inventory, level: number) {
    return validateRecipe(recipeId, inventory, level);
  }

  /** 执行制作 */
  craft(recipeId: string, inventory: Inventory, level: number) {
    return craftItem(recipeId, inventory, level);
  }
}
