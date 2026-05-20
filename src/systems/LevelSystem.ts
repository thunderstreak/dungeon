// 等级系统 - 经验计算、升级奖励、属性计算

import type { Character, CharacterStats, AllocatedStats } from '@/config/types';
import { MAX_LEVEL, ATTRIBUTE_POINTS_PER_LEVEL, getExpRequired } from '@/config/constants';
import { eventBus } from './EventBus';
import { CLASSES } from '@/data/classes';
import { WARRIOR_INITIAL_SKILLS, MAGE_INITIAL_SKILLS } from '@/data/skills';

// ==================== 经验计算 ====================

/** 获取当前等级升级所需经验 */
export function getExpToNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return getExpRequired(level);
}

/** 获取当前等级进度百分比 (0~1) */
export function getExpProgress(level: number, experience: number): number {
  if (level >= MAX_LEVEL) return 1;
  const required = getExpRequired(level);
  return Math.min(experience / required, 1);
}

// ==================== 升级处理 ====================

export interface LevelUpResult {
  newLevel: number;
  levelsGained: number;
  attributePointsGained: number;
  skillPointsGained: number;
}

/**
 * 给角色添加经验值，处理升级
 * 返回升级结果（可能包含多次升级）
 */
export function addExperience(character: Character, amount: number): LevelUpResult {
  const initialLevel = character.level;
  let levelsGained = 0;

  character.experience += amount;

  // 连续升级处理
  while (character.level < MAX_LEVEL) {
    const required = getExpRequired(character.level);
    if (character.experience < required) break;

    character.experience -= required;
    character.level++;
    levelsGained++;

    // 每级获得属性点和技能点
    character.attributePoints += ATTRIBUTE_POINTS_PER_LEVEL;
    character.skillPoints += 1;

    eventBus.emit('player:levelup', { level: character.level });
  }

  // 满级时经验溢出清零
  if (character.level >= MAX_LEVEL) {
    character.experience = 0;
  }

  const result: LevelUpResult = {
    newLevel: character.level,
    levelsGained,
    attributePointsGained: levelsGained * ATTRIBUTE_POINTS_PER_LEVEL,
    skillPointsGained: levelsGained,
  };

  // 升级后重新计算属性
  if (levelsGained > 0) {
    recalculateStats(character);
  }

  return result;
}

// ==================== 属性点分配 ====================

/** 可分配的属性类型 */
export type AllocatableStat = keyof AllocatedStats;

/** 分配属性点 */
export function allocateStat(character: Character, stat: AllocatableStat, points: number): boolean {
  if (character.attributePoints < points) return false;
  if (points <= 0) return false;

  character.attributePoints -= points;
  character.allocatedStats[stat] += points;
  character.allocatedStatsSaved = false;

  recalculateStats(character);
  return true;
}

/** 重置属性点分配（需付费） */
export function resetAllocatedStats(character: Character): void {
  character.attributePoints += character.allocatedStats.strength
    + character.allocatedStats.intelligence
    + character.allocatedStats.stamina
    + character.allocatedStats.spirit;

  character.allocatedStats = { strength: 0, intelligence: 0, stamina: 0, spirit: 0 };
  character.allocatedStatsSaved = false;

  recalculateStats(character);
}

/** 确认加点（保存后不可调整） */
export function confirmAllocatedStats(character: Character): void {
  character.allocatedStatsSaved = true;
}

// ==================== 属性计算 ====================

/**
 * 从基础属性 + 分配点数 计算战斗属性
 * 转换规则:
 * - 力量: +2物攻, +0.5%物伤
 * - 智力: +2魔攻, +0.5%魔伤
 * - 体力: +20HP, +1物防
 * - 精神: +15MP, +1魔防
 * - 敏捷: +0.3%闪避, +0.5%攻速, +0.2%暴击
 */
export function recalculateStats(character: Character): void {
  const classData = CLASSES[character.class];
  const base = classData.baseStats;
  const alloc = character.allocatedStats;

  // 总属性 = 职业基础 + 分配点数
  const totalStr = base.strength + alloc.strength;
  const totalInt = base.intelligence + alloc.intelligence;
  const totalSta = base.stamina + alloc.stamina;
  const totalSpi = base.spirit + alloc.spirit;

  const stats = character.stats;

  // 基础属性
  stats.strength = totalStr;
  stats.intelligence = totalInt;
  stats.stamina = totalSta;
  stats.spirit = totalSpi;

  // 战斗属性（基础值，不含装备/Buff加成）
  stats.physicalAttack = 10 + totalStr * 2;
  stats.magicAttack = 10 + totalInt * 2;
  stats.physicalDefense = totalSta * 1;
  stats.magicDefense = totalSpi * 1;
  stats.criticalRate = 0;
  stats.dodgeRate = 0;
  stats.attackSpeed = 100;
  stats.moveSpeed = 100;

  // HP/MP基础值（不含装备加成）
  const baseHp = character.class === 'warrior' ? 100 : 60;
  const baseMp = character.class === 'warrior' ? 30 : 80;
  stats.maxHp = baseHp + totalSta * 20;
  stats.maxMp = baseMp + totalSpi * 15;
  stats.hp = stats.maxHp;
  stats.mp = stats.maxMp;

  // 暴击伤害固定150%
  stats.criticalDamage = 150;

  // 施法速度基础100%
  stats.castSpeed = 100;

  // 被动技能加成重置（由applyPassiveStats叠加）
  stats.lifesteal = 0;
  stats.swordDamage = 0;
  stats.iceDamage = 0;
  stats.fireDamage = 0;
}

// ==================== 创建初始角色 ====================

/** 创建新角色 */
export function createCharacter(name: string, characterClass: 'warrior' | 'mage'): Character {
  const stats: CharacterStats = {
    strength: 0, intelligence: 0, stamina: 0, spirit: 0,
    hp: 0, mp: 0, maxHp: 0, maxMp: 0, physicalAttack: 0, magicAttack: 0,
    physicalDefense: 0, magicDefense: 0,
    criticalRate: 0, criticalDamage: 150,
    dodgeRate: 0, attackSpeed: 100, castSpeed: 100, moveSpeed: 100,
    lifesteal: 0, swordDamage: 0, iceDamage: 0, fireDamage: 0,
  };

  const character: Character = {
    id: `player_${Date.now()}`,
    name,
    class: characterClass,
    specialization: null,
    level: 1,
    experience: 0,
    skillPoints: 0,
    attributePoints: 0,
    allocatedStats: { strength: 0, intelligence: 0, stamina: 0, spirit: 0 },
    allocatedStatsSaved: false,
    gold: 0,
    stats,
    equipment: {
      weapon: null, helmet: null, armor: null, shield: null,
      belt: null, boots: null, necklace: null,
      ring1: null, ring2: null, bracelet1: null, bracelet2: null, rune: null,
    },
    inventory: {
      categories: {
        equipment: Array.from({ length: 30 }, () => ({ item: null, count: 0 })),
        consumable: Array.from({ length: 20 }, () => ({ item: null, count: 0 })),
        material: Array.from({ length: 20 }, () => ({ item: null, count: 0 })),
        other: Array.from({ length: 10 }, () => ({ item: null, count: 0 })),
      },
      maxSlotsPerCategory: 30,
      gold: 0,
    },
    skills: [],
    weaponMasteries: [],
    position: { x: 0, y: 0 },
  };

  recalculateStats(character);

  // 初始技能点为0，通过升级获得
  character.skillPoints = 0;

  return character;
}
