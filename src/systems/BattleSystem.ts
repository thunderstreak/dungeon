// 战斗系统 - 伤害计算、暴击/闪避/格挡/反伤

import type { Character, MonsterStats } from '@/config/types';
import type { BossDefinition } from '@/data/bosses';
import type { MonsterDefinition } from '@/data/monsters';
import { eventBus } from './EventBus';
import { BuffManager, calcPoisonDamage, calcBleedDamage, calcBurnDamage } from './BuffSystem';

// ==================== 伤害计算 ====================

export interface DamageResult {
  rawDamage: number;
  finalDamage: number;
  isCritical: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  isAbsorbed: boolean;
  shieldDamage: number;
}

/** 计算物理伤害 */
export function calcPhysicalDamage(
  attacker: { physicalAttack: number; criticalRate: number; criticalDamage: number },
  defender: { physicalDefense: number; dodgeRate: number; blockRate?: number },
): DamageResult {
  // 闪避判定
  if (Math.random() * 100 < defender.dodgeRate) {
    return { rawDamage: 0, finalDamage: 0, isCritical: false, isDodged: true, isBlocked: false, isAbsorbed: false, shieldDamage: 0 };
  }

  // 基础伤害 = 攻击力 × (100 / (100 + 防御力))
  const defenseMultiplier = 100 / (100 + defender.physicalDefense);
  let rawDamage = attacker.physicalAttack * defenseMultiplier;

  // 暴击判定
  let isCritical = false;
  if (Math.random() * 100 < attacker.criticalRate) {
    isCritical = true;
    rawDamage *= attacker.criticalDamage / 100;
  }

  // 格挡判定
  let isBlocked = false;
  if (defender.blockRate && Math.random() * 100 < defender.blockRate) {
    isBlocked = true;
    rawDamage *= 0.5; // 格挡减伤50%
  }

  // 随机浮动 ±10%
  rawDamage *= 0.9 + Math.random() * 0.2;

  const finalDamage = Math.max(1, Math.floor(rawDamage));
  return { rawDamage, finalDamage, isCritical, isDodged: false, isBlocked, isAbsorbed: false, shieldDamage: 0 };
}

/** 计算魔法伤害 */
export function calcMagicDamage(
  attacker: { magicAttack: number; criticalRate: number; criticalDamage: number },
  defender: { magicDefense: number; dodgeRate: number },
): DamageResult {
  // 魔法不可闪避（除非特殊）
  const defenseMultiplier = 100 / (100 + defender.magicDefense);
  let rawDamage = attacker.magicAttack * defenseMultiplier;

  // 暴击判定
  let isCritical = false;
  if (Math.random() * 100 < attacker.criticalRate) {
    isCritical = true;
    rawDamage *= attacker.criticalDamage / 100;
  }

  rawDamage *= 0.9 + Math.random() * 0.2;
  const finalDamage = Math.max(1, Math.floor(rawDamage));
  return { rawDamage, finalDamage, isCritical, isDodged: false, isBlocked: false, isAbsorbed: false, shieldDamage: 0 };
}

/** 计算真实伤害 (无视防御) */
export function calcTrueDamage(baseDamage: number): DamageResult {
  const finalDamage = Math.max(1, Math.floor(baseDamage));
  return { rawDamage: baseDamage, finalDamage, isCritical: false, isDodged: false, isBlocked: false, isAbsorbed: false, shieldDamage: 0 };
}

// ==================== 实体接口 ====================

export interface CombatEntity {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: {
    physicalAttack: number;
    magicAttack: number;
    physicalDefense: number;
    magicDefense: number;
    criticalRate: number;
    criticalDamage: number;
    dodgeRate: number;
    attackSpeed: number;
    moveSpeed: number;
  };
  buffManager: BuffManager;
  shieldHp: number; // 护盾值
}

/** 从Character创建战斗实体 */
export function createCombatEntityFromCharacter(character: Character): CombatEntity {
  return {
    id: character.id,
    name: character.name,
    hp: character.stats.maxHp,
    maxHp: character.stats.maxHp,
    mp: character.stats.maxMp,
    maxMp: character.stats.maxMp,
    stats: {
      physicalAttack: character.stats.physicalAttack,
      magicAttack: character.stats.magicAttack,
      physicalDefense: character.stats.physicalDefense,
      magicDefense: character.stats.magicDefense,
      criticalRate: character.stats.criticalRate,
      criticalDamage: character.stats.criticalDamage,
      dodgeRate: character.stats.dodgeRate,
      attackSpeed: character.stats.attackSpeed,
      moveSpeed: character.stats.moveSpeed,
    },
    buffManager: new BuffManager(),
    shieldHp: 0,
  };
}

/** 从怪物创建战斗实体 */
export function createCombatEntityFromMonster(monster: MonsterDefinition, floorMultiplier: number): CombatEntity {
  const stats = monster.stats;
  return {
    id: monster.id,
    name: monster.name,
    hp: Math.floor(stats.hp * floorMultiplier),
    maxHp: Math.floor(stats.hp * floorMultiplier),
    mp: Math.floor(stats.mp * floorMultiplier),
    maxMp: Math.floor(stats.mp * floorMultiplier),
    stats: {
      physicalAttack: Math.floor((stats.physicalAttack[0] + stats.physicalAttack[1]) / 2 * floorMultiplier),
      magicAttack: Math.floor((stats.magicAttack[0] + stats.magicAttack[1]) / 2 * floorMultiplier),
      physicalDefense: Math.floor(stats.physicalDefense * floorMultiplier),
      magicDefense: Math.floor(stats.magicDefense * floorMultiplier),
      criticalRate: stats.criticalRate,
      criticalDamage: stats.criticalDamage,
      dodgeRate: 0, // 怪物默认无闪避
      attackSpeed: stats.attackSpeed,
      moveSpeed: stats.moveSpeed,
    },
    buffManager: new BuffManager(),
    shieldHp: 0,
  };
}

/** 从Boss创建战斗实体 */
export function createCombatEntityFromBoss(boss: BossDefinition): CombatEntity {
  const stats = boss.stats;
  return {
    id: boss.id,
    name: boss.name,
    hp: stats.hp,
    maxHp: stats.hp,
    mp: stats.mp,
    maxMp: stats.mp,
    stats: {
      physicalAttack: Math.floor((stats.physicalAttack[0] + stats.physicalAttack[1]) / 2),
      magicAttack: Math.floor((stats.magicAttack[0] + stats.magicAttack[1]) / 2),
      physicalDefense: stats.physicalDefense,
      magicDefense: stats.magicDefense,
      criticalRate: stats.criticalRate,
      criticalDamage: stats.criticalDamage,
      dodgeRate: 0,
      attackSpeed: stats.attackSpeed,
      moveSpeed: stats.moveSpeed,
    },
    buffManager: new BuffManager(),
    shieldHp: 0,
  };
}

// ==================== 伤害应用 ====================

/** 应用伤害到实体 */
export function applyDamage(target: CombatEntity, result: DamageResult): number {
  let damage = result.finalDamage;

  // 护盾吸收
  if (target.shieldHp > 0) {
    const absorbed = Math.min(target.shieldHp, damage);
    target.shieldHp -= absorbed;
    damage -= absorbed;
  }

  target.hp = Math.max(0, target.hp - damage);

  if (damage > 0) {
    eventBus.emit('battle:damage', {
      targetId: target.id,
      amount: damage,
      type: result.isCritical ? 'critical' : 'normal',
      isCritical: result.isCritical,
    });
  }

  return damage;
}

/** 应用治疗 */
export function applyHeal(target: CombatEntity, amount: number): number {
  const healed = Math.min(amount, target.maxHp - target.hp);
  target.hp += healed;

  if (healed > 0) {
    eventBus.emit('battle:heal', { targetId: target.id, amount: healed });
  }

  return healed;
}

/** 处理持续伤害 (每秒调用) */
export function processDamageOverTime(target: CombatEntity, deltaSeconds: number): void {
  const buffs = target.buffManager.getActiveDebuffs();

  for (const debuff of buffs) {
    if (debuff.debuffType === 'poison') {
      const dps = calcPoisonDamage(target.maxHp, debuff.stackCount);
      const damage = Math.floor(dps * deltaSeconds);
      if (damage > 0) {
        target.hp = Math.max(0, target.hp - damage);
      }
    } else if (debuff.debuffType === 'bleed') {
      const dps = calcBleedDamage(target.hp, debuff.stackCount);
      const damage = Math.floor(dps * deltaSeconds);
      if (damage > 0) {
        target.hp = Math.max(0, target.hp - damage);
      }
    } else if (debuff.debuffType === 'burn') {
      const dps = calcBurnDamage(target.maxHp, debuff.stackCount);
      const damage = Math.floor(dps * deltaSeconds);
      if (damage > 0) {
        target.hp = Math.max(0, target.hp - damage);
      }
    }
  }
}

// ==================== 反伤 ====================

/** 计算反伤伤害 */
export function calcThornsDamage(attackerDamage: number, thornsPercent: number): number {
  return Math.floor(attackerDamage * thornsPercent / 100);
}

// ==================== 仇恨系统 ====================

export interface ThreatEntry {
  entityId: string;
  threat: number;
}

/** 仇恨管理器 */
export class ThreatManager {
  private threats = new Map<string, number>();

  /** 添加仇恨 */
  addThreat(entityId: string, amount: number): void {
    this.threats.set(entityId, (this.threats.get(entityId) ?? 0) + amount);
  }

  /** 衰减仇恨 (每秒调用) */
  decay(rate: number): void {
    for (const [id, threat] of this.threats) {
      const newThreat = threat * (1 - rate);
      if (newThreat < 1) {
        this.threats.delete(id);
      } else {
        this.threats.set(id, newThreat);
      }
    }
  }

  /** 获取最高仇恨目标 */
  getHighestThreat(): string | null {
    let maxThreat = 0;
    let targetId: string | null = null;
    for (const [id, threat] of this.threats) {
      if (threat > maxThreat) {
        maxThreat = threat;
        targetId = id;
      }
    }
    return targetId;
  }

  /** 清除所有仇恨 */
  clear(): void {
    this.threats.clear();
  }

  /** 移除实体仇恨 */
  remove(entityId: string): void {
    this.threats.delete(entityId);
  }
}
