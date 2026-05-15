// 铁匠NPC - 强化/修理/分解

import type { NPCData } from '@/config/types';
import { NPC } from '../NPC';
import type { Equipment } from '@/config/types';
import { enhanceEquipment, repairEquipment, repairAllEquipment } from '@/systems/EquipmentSystem';
import type { Character } from '@/config/types';

export class Blacksmith extends NPC {
  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    super(scene, npcData, gridX, gridY);
  }

  /** 强化装备 */
  enhance(character: Character, equipment: Equipment, materialCount: number) {
    return enhanceEquipment(character, equipment, materialCount);
  }

  /** 修理装备 */
  repair(character: Character, slot: string): number {
    return repairEquipment(character, slot as any);
  }

  /** 修理全部装备 */
  repairAll(character: Character): number {
    return repairAllEquipment(character);
  }
}
