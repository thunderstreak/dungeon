// 占卜师NPC - 装备鉴定

import type { NPCData, Character } from '@/config/types';
import { NPC } from '../NPC';
import { identifyEquipment, canIdentify, calculateIdentifyCost } from '@/systems/IdentifySystem';
import type { UnidentifiedEquipment } from '@/systems/IdentifySystem';

export class FortuneTeller extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  /** 计算鉴定费用 */
  getIdentifyCost(rarity: string): number {
    return calculateIdentifyCost(rarity as any);
  }

  /** 检查是否可以鉴定 */
  checkIdentify(equipment: UnidentifiedEquipment, gold: number) {
    return canIdentify(equipment, gold);
  }

  /** 执行鉴定 */
  identify(equipment: UnidentifiedEquipment, gold: number) {
    return identifyEquipment(equipment, gold);
  }
}
