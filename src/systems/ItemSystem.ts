// 物品使用系统 - 药水使用、效果应用、冷却管理

import type { Character } from '@/config/types';
import type { CombatEntity } from './BattleSystem';
import { applyHeal } from './BattleSystem';
import { getPotionById, type ItemEffect, type PotionData } from '@/data/items';
import { removeItem, getItemCount } from './InventorySystem';

/** 药水冷却记录 (itemId → 上次使用时间戳) */
const cooldowns = new Map<string, number>();

/** 获取冷却剩余秒数 */
export function getPotionCooldown(itemId: string, now: number): number {
  const lastUse = cooldowns.get(itemId) ?? 0;
  const potion = getPotionById(itemId);
  if (!potion) return 0;
  const elapsed = (now - lastUse) / 1000;
  return Math.max(0, potion.cooldown - elapsed);
}

/** 检查药水是否可用 */
function canUsePotion(character: Character, itemId: string, now: number): boolean {
  if (getItemCount(character, itemId) <= 0) return false;
  if (getPotionCooldown(itemId, now) > 0) return false;
  return true;
}

/**
 * 使用药水
 * @returns 是否使用成功
 */
export function usePotion(character: Character, itemId: string, combatEntity: CombatEntity, now: number): boolean {
  if (!canUsePotion(character, itemId, now)) return false;

  const potion = getPotionById(itemId);
  if (!potion) return false;

  // 记录冷却
  if (potion.cooldown > 0) {
    cooldowns.set(itemId, now);
  }

  // 应用所有效果
  for (const effect of potion.effects) {
    applyItemEffect(effect, potion, character, combatEntity);
  }

  // 消耗物品
  removeItem(character, itemId, 1);

  return true;
}

/** 应用单个物品效果 */
function applyItemEffect(
  effect: ItemEffect,
  potion: PotionData,
  character: Character,
  combatEntity: CombatEntity,
): void {
  const { stat, type, value, duration } = effect;

  // 特殊效果（不走buff系统）
  switch (stat) {
    case 'cure_poison':
      combatEntity.buffManager.removeDebuffByType('poison');
      return;
    case 'cure_all_debuff':
      combatEntity.buffManager.clearAllDebuffs();
      return;
    case 'revive':
      // 复活药水：在DungeonScene.playerDied()中检查背包是否有此物品
      return;
    case 'teleport_town':
      // 传送药水：由DungeonScene监听处理
      return;
    case 'debuff_immune':
      // 通过buff实现免疫
      if (duration && duration > 0) {
        combatEntity.buffManager.addBuff({
          id: `item_${potion.id}_immune`,
          name: '负面免疫',
          type: 'buff',
          duration,
          maxDuration: duration,
          value: 1,
          maxStack: 1,
          source: potion.id,
          icon: potion.icon,
        });
      }
      return;
    case 'all_stats':
      // 全属性buff
      if (duration && duration > 0) {
        const stats = ['physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense'] as const;
        for (const s of stats) {
          combatEntity.buffManager.addBuff({
            id: `item_${potion.id}_${s}`,
            name: `${potion.name} - ${s}`,
            type: 'buff',
            duration,
            maxDuration: duration,
            value,
            maxStack: 1,
            source: potion.id,
            icon: potion.icon,
          });
        }
      }
      return;
  }

  // 即时效果（无duration）
  if (!duration || duration <= 0) {
    switch (stat) {
      case 'hp':
        if (type === 'percent') {
          const healAmount = Math.floor(combatEntity.maxHp * value / 100);
          applyHeal(combatEntity, healAmount);
          character.stats.hp = combatEntity.hp;
        } else {
          applyHeal(combatEntity, value);
          character.stats.hp = combatEntity.hp;
        }
        break;
      case 'mp':
        if (type === 'percent') {
          combatEntity.mp = Math.min(combatEntity.maxMp, Math.floor(combatEntity.maxMp * value / 100));
        } else {
          combatEntity.mp = Math.min(combatEntity.maxMp, combatEntity.mp + value);
        }
        character.stats.mp = combatEntity.mp;
        break;
    }
    return;
  }

  // 持续buff效果（有duration）
  combatEntity.buffManager.addBuff({
    id: `item_${potion.id}_${stat}`,
    name: `${potion.name} - ${stat}`,
    type: 'buff',
    duration,
    maxDuration: duration,
    value: type === 'percent' ? value : value,
    maxStack: 1,
    source: potion.id,
    icon: potion.icon,
  });
}
