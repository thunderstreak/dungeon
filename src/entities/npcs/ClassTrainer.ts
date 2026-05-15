// 转职导师NPC - 20级转职选择

import type { NPCData, Character } from '@/config/types';
import { NPC } from '../NPC';
import { CLASS_CHANGE_LEVEL } from '@/config/constants';

export class ClassTrainer extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  /** 检查是否可以转职 */
  canClassChange(character: Character): boolean {
    return character.level >= CLASS_CHANGE_LEVEL && character.specialization === null;
  }

  /** 执行转职（修改角色数据） */
  classChange(character: Character, specialization: string): boolean {
    if (!this.canClassChange(character)) return false;
    character.specialization = specialization as any;
    return true;
  }
}
