// 银行家NPC - 仓库存储、扩展仓库

import type { NPCData } from '@/config/types';
import { NPC } from '../NPC';

export class Banker extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  // 仓库逻辑将在UI层实现（WarehousePanel）
}
