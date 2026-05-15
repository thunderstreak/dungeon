// 死亡惩罚系统 - 传送回城、损失经验/金币、随机物品丢失

import type { Character } from '@/config/types';
import { DEATH_EXP_LOSS, DEATH_GOLD_LOSS, DEATH_ITEM_LOSS_CHANCE, DEATH_ITEM_LOSS_COUNT } from '@/config/constants';
import { removeItem } from '@/systems/InventorySystem';

export interface DeathPenaltyResult {
  expLost: number;
  goldLost: number;
  itemsLost: number;
}

/** 计算死亡惩罚 */
export function calculateDeathPenalty(character: Character): DeathPenaltyResult {
  const expLost = Math.floor(character.experience * DEATH_EXP_LOSS);
  const goldLost = Math.floor(character.gold * DEATH_GOLD_LOSS);

  let itemsLost = 0;
  if (Math.random() < DEATH_ITEM_LOSS_CHANCE) {
    itemsLost = DEATH_ITEM_LOSS_COUNT[0] + Math.floor(Math.random() * (DEATH_ITEM_LOSS_COUNT[1] - DEATH_ITEM_LOSS_COUNT[0] + 1));
  }

  return { expLost, goldLost, itemsLost };
}

/** 执行死亡惩罚 */
export function applyDeathPenalty(character: Character): DeathPenaltyResult {
  const penalty = calculateDeathPenalty(character);

  // 损失经验
  character.experience = Math.max(0, character.experience - penalty.expLost);

  // 损失金币
  character.gold = Math.max(0, character.gold - penalty.goldLost);

  // 随机丢失物品
  if (penalty.itemsLost > 0) {
    let lost = 0;
    const allSlots = [
      ...character.inventory.categories.equipment,
      ...character.inventory.categories.consumable,
      ...character.inventory.categories.material,
      ...character.inventory.categories.other,
    ];
    const filledSlots = allSlots.filter(s => s.item !== null);

    for (let i = 0; i < penalty.itemsLost && filledSlots.length > 0; i++) {
      const idx = Math.floor(Math.random() * filledSlots.length);
      const slot = filledSlots[idx];
      if (slot.item) {
        removeItem(character, slot.item.id, 1);
        lost++;
        filledSlots.splice(idx, 1);
      }
    }
    penalty.itemsLost = lost;
  }

  // 恢复HP到最大值
  character.stats.hp = character.class === 'warrior' ? 100 : 60;

  return penalty;
}
