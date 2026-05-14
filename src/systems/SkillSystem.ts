// 技能系统 - 学习/升级/遗忘、冷却管理、武器精通

import type { Character, SkillSlot, Skill } from '@/config/types';
import { eventBus } from './EventBus';
import { ALL_SKILLS, WARRIOR_INITIAL_SKILLS, MAGE_INITIAL_SKILLS } from '@/data/skills';
import type { SkillData } from '@/data/skills';

// ==================== 技能学习 ====================

/** 获取角色可学习的技能列表 */
export function getLearnableSkills(character: Character): SkillData[] {
  return ALL_SKILLS.filter(skill => {
    // 职业匹配
    if (skill.classRequirement && skill.classRequirement !== character.class) return false;
    // 转职匹配
    if (skill.specialization && skill.specialization !== character.specialization) return false;
    // 等级要求
    if (character.level < skill.unlockLevel) return false;
    // 未学习
    if (character.skills.some(s => s.skillId === skill.id)) return false;
    return true;
  });
}

/** 获取角色已学习的技能 */
export function getLearnedSkills(character: Character): SkillSlot[] {
  return character.skills;
}

/** 学习技能（消耗技能点） */
export function learnSkill(character: Character, skillId: string): boolean {
  const skillData = ALL_SKILLS.find(s => s.id === skillId);
  if (!skillData) return false;

  // 检查是否已学习
  if (character.skills.some(s => s.skillId === skillId)) return false;

  // 检查等级要求
  if (character.level < skillData.unlockLevel) return false;

  // 检查职业要求
  if (skillData.classRequirement && skillData.classRequirement !== character.class) return false;

  // 初始技能免费，其他技能消耗1技能点
  const isInitial = isInitialSkill(skillId, character.class);
  if (!isInitial && character.skillPoints <= 0) return false;

  if (!isInitial) {
    character.skillPoints--;
  }

  character.skills.push({
    skillId,
    level: 1,
    cooldownRemaining: 0,
  });

  return true;
}

/** 升级技能（消耗技能点） */
export function upgradeSkill(character: Character, skillId: string): boolean {
  const skillSlot = character.skills.find(s => s.skillId === skillId);
  if (!skillSlot) return false;

  const skillData = ALL_SKILLS.find(s => s.id === skillId);
  if (!skillData) return false;

  // 检查是否已满级
  if (skillSlot.level >= skillData.maxLevel) return false;

  // 检查技能点
  if (character.skillPoints <= 0) return false;

  character.skillPoints--;
  skillSlot.level++;
  return true;
}

/** 遗忘技能（返还技能点） */
export function forgetSkill(character: Character, skillId: string, cost: number = 500): boolean {
  const skillIndex = character.skills.findIndex(s => s.skillId === skillId);
  if (skillIndex === -1) return false;

  // 初始技能不可遗忘
  if (isInitialSkill(skillId, character.class)) return false;

  const skillSlot = character.skills[skillIndex];
  // 返还技能点（学习消耗1点 + 每级1点）
  const pointsToReturn = skillSlot.level; // level 1 = 1点
  character.skillPoints += pointsToReturn;

  character.skills.splice(skillIndex, 1);
  return true;
}

/** 检查是否是初始技能 */
function isInitialSkill(skillId: string, characterClass: 'warrior' | 'mage'): boolean {
  const initialSkills = characterClass === 'warrior' ? WARRIOR_INITIAL_SKILLS : MAGE_INITIAL_SKILLS;
  return initialSkills.some(s => s.id === skillId);
}

// ==================== 冷却管理 ====================

/** 获取技能冷却剩余时间 */
export function getSkillCooldown(character: Character, skillId: string): number {
  const skillSlot = character.skills.find(s => s.skillId === skillId);
  return skillSlot?.cooldownRemaining ?? 0;
}

/** 检查技能是否可用（冷却完毕、MP足够） */
export function isSkillReady(character: Character, skillId: string): boolean {
  const skillSlot = character.skills.find(s => s.skillId === skillId);
  if (!skillSlot) return false;
  if (skillSlot.cooldownRemaining > 0) return false;

  const skillData = ALL_SKILLS.find(s => s.id === skillId);
  if (!skillData) return false;
  if (skillData.manaCost && character.stats.mp < skillData.manaCost) return false;

  return true;
}

/** 使用技能（设置冷却、消耗MP） */
export function useSkill(character: Character, skillId: string): boolean {
  if (!isSkillReady(character, skillId)) return false;

  const skillSlot = character.skills.find(s => s.skillId === skillId)!;
  const skillData = ALL_SKILLS.find(s => s.id === skillId)!;

  // 消耗MP
  if (skillData.manaCost) {
    character.stats.mp -= skillData.manaCost;
  }

  // 设置冷却
  if (skillData.cooldown) {
    skillSlot.cooldownRemaining = skillData.cooldown;
  }

  eventBus.emit('skill:cast', { skillId, targetId: null });
  return true;
}

/** 更新所有技能冷却 (每秒调用) */
export function updateCooldowns(character: Character, deltaSeconds: number): void {
  for (const skill of character.skills) {
    if (skill.cooldownRemaining > 0) {
      skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - deltaSeconds);
      if (skill.cooldownRemaining === 0) {
        eventBus.emit('skill:cooldownEnd', { skillId: skill.skillId });
      }
    }
  }
}

// ==================== 技能数据查询 ====================

/** 获取技能完整数据（含当前等级信息） */
export function getSkillInfo(character: Character, skillId: string): SkillData | undefined {
  return ALL_SKILLS.find(s => s.id === skillId);
}

/** 获取技能当前等级的伤害倍率 */
export function getSkillDamageMultiplier(skillId: string, level: number): number {
  const skillData = ALL_SKILLS.find(s => s.id === skillId);
  if (!skillData?.damage) return 0;
  // 每级+10%基础伤害
  return skillData.damage.baseValue * (1 + (level - 1) * 0.1) / 100;
}

// ==================== 武器精通 ====================

export interface MasteryBonus {
  stat: string;
  type: 'flat' | 'percent';
  value: number;
}

/** 武器精通经验表 */
const MASTERY_EXP_PER_LEVEL = [100, 200, 350, 550, 800, 1100, 1500, 2000, 2700, 3500];

/** 获取武器精通等级上限 */
export const MAX_MASTERY_LEVEL = 10;

/** 添加武器精通经验 */
export function addMasteryExp(character: Character, weaponType: string, exp: number): void {
  const mastery = character.weaponMasteries.find(m => m.weaponType === weaponType);
  if (!mastery) return;

  mastery.currentExp += exp;

  // 升级检查
  while (mastery.currentLevel < MAX_MASTERY_LEVEL) {
    const required = MASTERY_EXP_PER_LEVEL[mastery.currentLevel];
    if (mastery.currentExp < required) break;
    mastery.currentExp -= required;
    mastery.currentLevel++;
  }
}

/** 获取武器精通加成 */
export function getMasteryBonuses(character: Character, weaponType: string): MasteryBonus[] {
  const mastery = character.weaponMasteries.find(m => m.weaponType === weaponType);
  if (!mastery) return [];

  const level = mastery.currentLevel;
  const bonuses: MasteryBonus[] = [];

  // 每级+1%对应属性伤害
  if (['sword', 'blade', 'axe'].includes(weaponType)) {
    bonuses.push({ stat: 'physicalAttack', type: 'percent', value: level });
  } else {
    bonuses.push({ stat: 'magicAttack', type: 'percent', value: level });
  }

  // 5级+暴击，10级+攻速
  if (level >= 5) bonuses.push({ stat: 'criticalRate', type: 'flat', value: 2 });
  if (level >= 10) bonuses.push({ stat: 'attackSpeed', type: 'percent', value: 5 });

  return bonuses;
}
