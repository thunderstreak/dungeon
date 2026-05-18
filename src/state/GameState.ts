// 全局游戏状态 - 场景间共享角色数据

import type { Character } from '@/config/types';
import type { DungeonState } from '@/systems/DungeonSystem';
import { recalculateStats } from '@/systems/LevelSystem';

class GameState {
  character: Character | null = null;
  dungeonState: DungeonState | null = null;
  currentFloor = 1;
  currentRoom = 0;

  setCharacter(character: Character): void {
    this.clear();
    // 旧存档可能缺少maxHp/maxMp，补全并恢复满值
    if (character.stats.maxHp === undefined || character.stats.maxMp === undefined) {
      recalculateStats(character);
      character.stats.hp = character.stats.maxHp;
      character.stats.mp = character.stats.maxMp;
    }
    this.character = character;
  }

  getCharacter(): Character {
    if (!this.character) throw new Error('角色数据未初始化');
    return this.character;
  }

  clear(): void {
    this.character = null;
    this.dungeonState = null;
    this.currentFloor = 1;
    this.currentRoom = 0;
  }
}

export const gameState = new GameState();
