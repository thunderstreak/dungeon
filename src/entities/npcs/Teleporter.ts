// 传送师NPC - 楼层传送

import type { NPCData } from '@/config/types';
import { NPC } from '../NPC';

export class Teleporter extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  // 传送逻辑将在DungeonSystem中实现
}
