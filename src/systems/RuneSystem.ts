// 符文系统 - 符文穿戴、属性加成、符文槽管理

import type { Character, EquipmentRarity, StatBonus } from '@/config/types';
import type { RuneDefinition, RuneLevelEffect, RuneEffect } from '@/data/runes';
import { ALL_RUNES, getRuneById } from '@/data/runes';
import { eventBus } from './EventBus';

// ==================== 符文槽位 ====================

/** 符文槽信息 */
export interface RuneSlot {
  runeId: string | null;
  rarity: EquipmentRarity | null;
}

/** 符文穿戴状态 */
export interface RuneState {
  equipped: RuneSlot[];
  maxSlots: number;
}

// ==================== 配置 ====================

const MAX_RUNE_SLOTS = 3; // 最多3个符文槽

// ==================== 初始化 ====================

/** 创建初始符文状态 */
export function createRuneState(): RuneState {
  return {
    equipped: Array(MAX_RUNE_SLOTS).fill(null).map(() => ({
      runeId: null,
      rarity: null,
    })),
    maxSlots: MAX_RUNE_SLOTS,
  };
}

// ==================== 符文查询 ====================

/** 获取所有符文定义 */
export function getAllRuneDefinitions(): RuneDefinition[] {
  return ALL_RUNES;
}

/** 根据ID获取符文定义 */
export function getRuneDefinition(runeId: string): RuneDefinition | null {
  return getRuneById(runeId) ?? null;
}

/** 获取符文在指定品质下的效果 */
export function getRuneEffect(runeId: string, rarity: EquipmentRarity): RuneLevelEffect | null {
  const rune = getRuneById(runeId);
  if (!rune) return null;

  return rune.levels.find(l => l.rarity === rarity) ?? null;
}

// ==================== 符文穿戴 ====================

/** 检查符文是否可以穿戴 */
export function canEquipRune(
  runeId: string,
  rarity: EquipmentRarity,
  playerLevel: number,
  state: RuneState,
): { canEquip: boolean; error?: string } {
  const rune = getRuneById(runeId);
  if (!rune) {
    return { canEquip: false, error: '符文不存在' };
  }

  const levelEffect = rune.levels.find(l => l.rarity === rarity);
  if (!levelEffect) {
    return { canEquip: false, error: '该品质符文不存在' };
  }

  if (playerLevel < levelEffect.levelReq) {
    return { canEquip: false, error: `等级不足，需要${levelEffect.levelReq}级` };
  }

  // 检查是否有空槽位
  const emptySlot = state.equipped.find(s => s.runeId === null);
  if (!emptySlot) {
    return { canEquip: false, error: '符文槽已满' };
  }

  return { canEquip: true };
}

/** 穿戴符文 */
export function equipRune(
  runeId: string,
  rarity: EquipmentRarity,
  state: RuneState,
): boolean {
  const emptyIndex = state.equipped.findIndex(s => s.runeId === null);
  if (emptyIndex === -1) return false;

  state.equipped[emptyIndex] = { runeId, rarity };

  eventBus.emit('rune:equip', { runeId, slot: emptyIndex });
  return true;
}

/** 卸下符文 */
export function unequipRune(slotIndex: number, state: RuneState): boolean {
  if (slotIndex < 0 || slotIndex >= state.equipped.length) return false;
  if (state.equipped[slotIndex].runeId === null) return false;

  const runeId = state.equipped[slotIndex].runeId;
  state.equipped[slotIndex] = { runeId: null, rarity: null };

  eventBus.emit('rune:unequip', { runeId, slot: slotIndex });
  return true;
}

/** 获取已装备的符文列表 */
export function getEquippedRunes(state: RuneState): Array<{ slot: number; runeId: string; rarity: EquipmentRarity }> {
  return state.equipped
    .map((s, i) => ({
      slot: i,
      runeId: s.runeId!,
      rarity: s.rarity!,
    }))
    .filter(s => s.runeId !== null);
}

// ==================== 属性计算 ====================

/** 计算符文总属性加成 */
export function calculateRuneBonuses(state: RuneState): StatBonus[] {
  const bonuses: StatBonus[] = [];

  for (const slot of state.equipped) {
    if (!slot.runeId || !slot.rarity) continue;

    const levelEffect = getRuneEffect(slot.runeId, slot.rarity);
    if (!levelEffect) continue;

    for (const effect of levelEffect.effects) {
      bonuses.push({
        stat: effect.stat,
        type: effect.type,
        value: effect.value,
      });
    }
  }

  return bonuses;
}

/** 应用符文属性到角色 */
export function applyRuneBonuses(character: Character, state: RuneState): void {
  const bonuses = calculateRuneBonuses(state);

  for (const bonus of bonuses) {
    const statKey = bonus.stat as keyof typeof character.stats;
    if (statKey in character.stats) {
      const currentValue = character.stats[statKey] as number;
      if (bonus.type === 'percent') {
        (character.stats as unknown as Record<string, number>)[statKey] = currentValue * (1 + bonus.value / 100);
      } else {
        (character.stats as unknown as Record<string, number>)[statKey] = currentValue + bonus.value;
      }
    }
  }
}

// ==================== 事件声明 ====================

declare module './EventBus' {
  interface GameEvents {
    'rune:equip': { runeId: string; slot: number };
    'rune:unequip': { runeId: string | null; slot: number };
  }
}
