// 任务发布者NPC - 支线任务发布/完成

import type { NPCData } from '@/config/types';
import { NPC } from '../NPC';

export class QuestGiver extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  // 任务系统将在后续版本实现
}
