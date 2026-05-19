// HP/MP 自动恢复系统

import type { Character } from '@/config/types';
import type { CombatEntity } from './BattleSystem';
import {
  BASE_HP_REGEN, BASE_MP_REGEN,
  STA_HP_REGEN_PER_POINT, SPI_MP_REGEN_PER_POINT,
  REGEN_SETTLE_INTERVAL, COMBAT_REGEN_DELAY,
} from '@/config/constants';

export interface RegenState {
  hpAccumulator: number;
  mpAccumulator: number;
  lastDamageTime: number;
}

export function createRegenState(): RegenState {
  return { hpAccumulator: 0, mpAccumulator: 0, lastDamageTime: 0 };
}

/** 记录受伤时间，用于脱战判断 */
export function recordDamage(state: RegenState, currentTime: number): void {
  state.lastDamageTime = currentTime;
}

/** 每帧更新恢复 */
export function updateRegen(
  entity: CombatEntity,
  character: Character,
  delta: number,
  state: RegenState,
  currentTime: number,
): void {
  // 脱战延迟内不恢复
  if (currentTime - state.lastDamageTime < COMBAT_REGEN_DELAY) return;

  // HP恢复
  state.hpAccumulator += delta;
  if (state.hpAccumulator >= REGEN_SETTLE_INTERVAL) {
    state.hpAccumulator -= REGEN_SETTLE_INTERVAL;
    const regenPerMin = BASE_HP_REGEN + character.stats.stamina * STA_HP_REGEN_PER_POINT;
    const regenPerTick = regenPerMin / 60;
    entity.hp = Math.min(entity.maxHp, entity.hp + Math.floor(regenPerTick));
  }

  // MP恢复
  state.mpAccumulator += delta;
  if (state.mpAccumulator >= REGEN_SETTLE_INTERVAL) {
    state.mpAccumulator -= REGEN_SETTLE_INTERVAL;
    const regenPerMin = BASE_MP_REGEN + character.stats.spirit * SPI_MP_REGEN_PER_POINT;
    const regenPerTick = regenPerMin / 60;
    entity.mp = Math.min(entity.maxMp, entity.mp + Math.floor(regenPerTick));
  }
}

/** 获取恢复速率 (每分钟) */
export function getRegenRates(character: Character) {
  return {
    hpPerMin: BASE_HP_REGEN + character.stats.stamina * STA_HP_REGEN_PER_POINT,
    mpPerMin: BASE_MP_REGEN + character.stats.spirit * SPI_MP_REGEN_PER_POINT,
  };
}
