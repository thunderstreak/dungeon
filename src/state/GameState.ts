// 全局游戏状态 - 场景间共享角色数据

import type { Character } from '@/config/types';
import type { DungeonState } from '@/systems/DungeonSystem';

class GameState {
  character: Character | null = null;
  dungeonState: DungeonState | null = null;
  currentFloor = 1;
  currentRoom = 0;

  setCharacter(character: Character): void {
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
