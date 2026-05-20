// 精英怪系统 - 精英怪生成、属性加成、掉落规则

import type { MonsterDefinition } from '@/data/monsters';
import type { CombatEntity } from './BattleSystem';
import { BuffManager } from './BuffSystem';

// ==================== 精英怪配置 ====================

/** 精英怪生成概率 (每房间) */
export const ELITE_SPAWN_CHANCE = 0.10; // 10%

/** 精英怪属性加成倍率 */
export const ELITE_MODIFIERS = {
  hpMultiplier: 1.5,
  attackMultiplier: 1.5,
  defenseMultiplier: 1.5,
  expMultiplier: 2,
  goldMultiplier: 3,
  guaranteedBlueDrop: true, // 必定掉落蓝色以上
} as const;

// ==================== 精英怪生成 ====================

/** 判断房间是否生成精英怪 */
export function shouldSpawnElite(): boolean {
  return Math.random() < ELITE_SPAWN_CHANCE;
}

/** 创建精英怪战斗实体 (属性×1.5) */
export function createEliteCombatEntity(
  monster: MonsterDefinition,
  floorMultiplier: number,
): CombatEntity {
  const stats = monster.stats;
  const mod = ELITE_MODIFIERS;

  return {
    id: `${monster.id}_elite_${Date.now()}`,
    name: `  ${monster.name}`,
    hp: Math.floor(stats.hp * floorMultiplier * mod.hpMultiplier),
    maxHp: Math.floor(stats.hp * floorMultiplier * mod.hpMultiplier),
    mp: Math.floor(stats.mp * floorMultiplier),
    maxMp: Math.floor(stats.mp * floorMultiplier),
    stats: {
      physicalAttack: Math.floor((stats.physicalAttack[0] + stats.physicalAttack[1]) / 2 * floorMultiplier * mod.attackMultiplier),
      magicAttack: Math.floor((stats.magicAttack[0] + stats.physicalAttack[1]) / 2 * floorMultiplier * mod.attackMultiplier),
      physicalDefense: Math.floor(stats.physicalDefense * floorMultiplier * mod.defenseMultiplier),
      magicDefense: Math.floor(stats.magicDefense * floorMultiplier * mod.defenseMultiplier),
      criticalRate: stats.criticalRate,
      criticalDamage: stats.criticalDamage,
      dodgeRate: 0,
      attackSpeed: stats.attackSpeed,
      moveSpeed: stats.moveSpeed,
      lifesteal: 0,
      swordDamage: 0,
      iceDamage: 0,
      fireDamage: 0,
    },
    buffManager: new BuffManager(),
    shieldHp: 0,
  };
}

/** 获取精英怪经验奖励 (×2) */
export function getEliteExpReward(baseExp: number): number {
  return Math.floor(baseExp * ELITE_MODIFIERS.expMultiplier);
}

/** 获取精英怪金币奖励 (×3) */
export function getEliteGoldReward(baseGold: [number, number]): [number, number] {
  return [
    Math.floor(baseGold[0] * ELITE_MODIFIERS.goldMultiplier),
    Math.floor(baseGold[1] * ELITE_MODIFIERS.goldMultiplier),
  ];
}
