// 技能系统 - 学习/升级/遗忘、冷却管理、武器精通

import type { Character, SkillSlot } from '@/config/types';
import { eventBus } from './EventBus';
import { ALL_SKILLS, WARRIOR_INITIAL_SKILLS, MAGE_INITIAL_SKILLS } from '@/data/skills';
import type { SkillData } from '@/data/skills';
import type { CombatEntity, DamageResult } from './BattleSystem';
import { calcPhysicalDamage, calcMagicDamage, calcTrueDamage, applyDamage } from './BattleSystem';

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

/** 使用技能（设置冷却、消耗MP，可选对目标造成伤害） */
export function useSkill(
  character: Character,
  skillId: string,
  attacker?: CombatEntity,
  target?: CombatEntity,
): boolean {
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

  // 如果有攻击者和目标，执行技能伤害
  if (attacker && target && skillData.damage) {
    executeSkillDamage(attacker, target, skillId, skillSlot.level, character);
  }

  eventBus.emit('skill:cast', { skillId, targetId: target?.id ?? null });
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

// ==================== 技能伤害执行 ====================

/** 执行技能伤害计算并应用 */
export function executeSkillDamage(
  attacker: CombatEntity,
  defender: CombatEntity,
  skillId: string,
  skillLevel: number,
  attackerCharacter?: Character,
): DamageResult | null {
  const skillData = ALL_SKILLS.find(s => s.id === skillId);
  if (!skillData?.damage) return null;

  const multiplier = getSkillDamageMultiplier(skillId, skillLevel);

  // 根据缩放属性选择攻击力
  let effectiveAttack: number;
  switch (skillData.damage.scalingStat) {
    case 'intelligence':
      effectiveAttack = Math.floor(attacker.stats.magicAttack * multiplier * skillData.damage.scalingFactor);
      break;
    case 'strength':
    default:
      effectiveAttack = Math.floor(attacker.stats.physicalAttack * multiplier * skillData.damage.scalingFactor);
      break;
  }

  let result: DamageResult;
  switch (skillData.damage.type) {
    case 'magic':
      result = calcMagicDamage(
        { magicAttack: effectiveAttack, criticalRate: attacker.stats.criticalRate, criticalDamage: attacker.stats.criticalDamage },
        { magicDefense: defender.stats.magicDefense, dodgeRate: 0 },
      );
      break;
    case 'true':
      result = calcTrueDamage(effectiveAttack);
      break;
    case 'physical':
    default:
      result = calcPhysicalDamage(
        { physicalAttack: effectiveAttack, criticalRate: attacker.stats.criticalRate, criticalDamage: attacker.stats.criticalDamage },
        { physicalDefense: defender.stats.physicalDefense, dodgeRate: defender.stats.dodgeRate },
      );
      break;
  }

  // 应用伤害
  applyDamage(defender, result);

  // 应用技能附带效果（debuff）
  if (skillData.effects) {
    for (const effect of skillData.effects) {
      defender.buffManager.addBuff({
        id: `skill_${skillId}_${effect.type}`,
        name: `${skillData.name} - ${effect.type}`,
        type: 'debuff',
        debuffType: effect.type as import('@/config/types').DebuffType,
        duration: effect.duration,
        maxDuration: effect.duration,
        value: effect.value,
        maxStack: 1,
        source: skillId,
        icon: skillData.id,
      });
    }
  }

  // 被动技能触发效果
  if (attackerCharacter && !result.isDodged) {
    const triggers = getPassiveTriggerEffects(attackerCharacter);
    for (const trigger of triggers) {
      if (Math.random() * 100 >= trigger.value) continue; // 概率判定
      const validDebuffs: Record<string, import('@/config/types').DebuffType> = {
        bleed_chance: 'bleed',
        freeze_chance: 'freeze',
        stun_chance: 'stun',
        burn_on_hit: 'burn',
      };
      const debuffType = validDebuffs[trigger.type];
      if (debuffType) {
        defender.buffManager.addBuff({
          id: `passive_${trigger.type}_${defender.id}`,
          name: trigger.type,
          type: 'debuff',
          debuffType,
          duration: 3,
          maxDuration: 3,
          value: 1,
          maxStack: 1,
          source: 'passive',
          icon: 'passive',
        });
      }
    }
  }

  eventBus.emit('skill:hit', { skillId, targetId: defender.id, damage: result.finalDamage });
  return result;
}

// ==================== 被动技能属性加成 ====================

/** 被动效果type → character.stats字段映射 */
const PASSIVE_STAT_MAP: Record<string, { stat: string; mode: 'percent' | 'flat' }> = {
  maxHp_percent: { stat: 'maxHp', mode: 'percent' },
  physicalAttack_percent: { stat: 'physicalAttack', mode: 'percent' },
  magicAttack_percent: { stat: 'magicAttack', mode: 'percent' },
  physicalDefense_percent: { stat: 'physicalDefense', mode: 'percent' },
  magicDefense_percent: { stat: 'magicDefense', mode: 'percent' },
  criticalDamage_percent: { stat: 'criticalDamage', mode: 'percent' },
  dodgeRate_percent: { stat: 'dodgeRate', mode: 'percent' },
  attackSpeed_percent: { stat: 'attackSpeed', mode: 'percent' },
  moveSpeed_percent: { stat: 'moveSpeed', mode: 'percent' },
  mp_regen_percent: { stat: 'maxMp', mode: 'percent' },
  lifesteal_percent: { stat: 'lifesteal', mode: 'percent' },
  sword_damage_percent: { stat: 'swordDamage', mode: 'percent' },
  ice_damage_percent: { stat: 'iceDamage', mode: 'percent' },
  fire_damage_percent: { stat: 'fireDamage', mode: 'percent' },
};

/** 应用被动技能的永久属性加成到角色stats */
export function applyPassiveStats(character: Character): void {
  const stats = character.stats;

  for (const skillSlot of character.skills) {
    const skillData = ALL_SKILLS.find(s => s.id === skillSlot.skillId);
    if (!skillData?.effects) continue;

    for (const effect of skillData.effects) {
      // 只处理永久效果（duration === -1）
      if (effect.duration !== -1) continue;

      const mapping = PASSIVE_STAT_MAP[effect.type];
      if (!mapping) continue;

      const key = mapping.stat as keyof typeof stats;
      const baseVal = stats[key] as number;

      if (mapping.mode === 'percent') {
        stats[key] = baseVal * (1 + effect.value / 100) as typeof stats[typeof key];
      } else {
        stats[key] = baseVal + effect.value as typeof stats[typeof key];
      }
    }
  }

  // HP/MP同步
  stats.hp = stats.maxHp;
  stats.mp = stats.maxMp;
}

// ==================== 战斗触发效果 ====================

/** 获取角色已学习被动技能的所有触发效果 */
export function getPassiveTriggerEffects(character: Character): Array<{ type: string; value: number }> {
  const triggers: Array<{ type: string; value: number }> = [];
  for (const skillSlot of character.skills) {
    const skillData = ALL_SKILLS.find(s => s.id === skillSlot.skillId);
    if (!skillData?.effects) continue;
    for (const effect of skillData.effects) {
      if (effect.duration !== -1) continue;
      // 触发类效果（非属性加成）
      if (!PASSIVE_STAT_MAP[effect.type]) {
        triggers.push({ type: effect.type, value: effect.value });
      }
    }
  }
  return triggers;
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
