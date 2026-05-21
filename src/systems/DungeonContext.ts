// 地牢上下文 - 战斗/房间管理模块共享的状态接口

import type Phaser from 'phaser';
import type { Player } from '@/entities/Player';
import type { Monster } from '@/entities/Monster';
import type { Boss } from '@/entities/Boss';
import type { Room } from '@/map/Room';
import type { RoomGenerator } from '@/map/RoomGenerator';
import type { DungeonState } from '@/systems/DungeonSystem';
import type { FloorWalkability } from '@/systems/FloorWalkability';
import type { GroundLoot } from '@/entities/GroundLoot';
import type { PityCounter } from '@/systems/DropSystem';

export interface DungeonContext {
  scene: Phaser.Scene;
  player: Player;
  monsters: (Monster | Boss)[];
  roomMonsters: Map<string, (Monster | Boss)[]>;
  currentRoom: Room;
  roomGenerator: RoomGenerator;
  floor: number;
  dungeonState: DungeonState;
  floorWalkability: FloorWalkability;
  roomsEntered: Set<string>;
  groundLoots: GroundLoot[];
  roomCleared: boolean;
  pity: PityCounter;
}
