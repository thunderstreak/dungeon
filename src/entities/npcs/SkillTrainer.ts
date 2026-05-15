// 技能导师NPC - 学习/遗忘/查看技能树

import type { NPCData, Character } from '@/config/types';
import { NPC } from '../NPC';
import { learnSkill, forgetSkill, getLearnableSkills, getLearnedSkills } from '@/systems/SkillSystem';

export class SkillTrainer extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  /** 获取可学习技能 */
  getLearnable(character: Character) {
    return getLearnableSkills(character);
  }

  /** 获取已学技能 */
  getLearned(character: Character) {
    return getLearnedSkills(character);
  }

  /** 学习技能 */
  learn(character: Character, skillId: string): boolean {
    return learnSkill(character, skillId);
  }

  /** 遗忘技能 */
  forget(character: Character, skillId: string, cost: number = 500): boolean {
    return forgetSkill(character, skillId, cost);
  }
}
