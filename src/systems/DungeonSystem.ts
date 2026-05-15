// 地牢系统 - 楼层进度、深渊模式

import type { Character } from '@/config/types';
import { TOTAL_DUNGEON_FLOORS, ABYSS_TRIGGER_RATE, FLOOR_DIFFICULTY_MULTIPLIER } from '@/config/constants';
import { eventBus } from './EventBus';

// ==================== 地牢状态 ====================

export interface DungeonFloor {
  floor: number;
  cleared: boolean;
  bossDefeated: boolean;
  explorationRate: number; // 0~100
  roomsCleared: number;
  totalRooms: number;
}

export interface DungeonState {
  currentFloor: number;
  isAbyss: boolean;
  floors: DungeonFloor[];
  currentRoomId: string | null;
  inCombat: boolean;
  bossDefeatedFloors: Set<number>;
}

// ==================== 初始化 ====================

/** 创建初始地牢状态 */
export function createDungeonState(): DungeonState {
  const floors: DungeonFloor[] = [];
  for (let i = 1; i <= TOTAL_DUNGEON_FLOORS; i++) {
    floors.push({
      floor: i,
      cleared: false,
      bossDefeated: false,
      explorationRate: 0,
      roomsCleared: 0,
      totalRooms: 0,
    });
  }

  return {
    currentFloor: 1,
    isAbyss: false,
    floors,
    currentRoomId: null,
    inCombat: false,
    bossDefeatedFloors: new Set(),
  };
}

// ==================== 楼层管理 ====================

/** 进入指定楼层 */
export function enterFloor(state: DungeonState, floor: number): boolean {
  if (floor < 1 || floor > TOTAL_DUNGEON_FLOORS) return false;

  state.currentFloor = floor;
  eventBus.emit('dungeon:enterFloor', { floor });
  return true;
}

/** 检查是否可以进入指定楼层 */
export function canEnterFloor(state: DungeonState, floor: number): boolean {
  if (floor < 1 || floor > TOTAL_DUNGEON_FLOORS) return false;
  if (floor === 1) return true;
  // 需要前一层Boss被击败
  return state.floors[floor - 2]?.bossDefeated ?? false;
}

/** 获取已解锁的楼层列表 */
export function getUnlockedFloors(state: DungeonState): number[] {
  const unlocked: number[] = [1]; // 第1层始终解锁
  for (let i = 2; i <= TOTAL_DUNGEON_FLOORS; i++) {
    if (state.floors[i - 2].bossDefeated) {
      unlocked.push(i);
    }
  }
  return unlocked;
}

// ==================== 深渊模式 ====================

/** 尝试触发深渊模式（仅判定概率，不修改状态） */
export function tryTriggerAbyss(state: DungeonState): boolean {
  if (state.isAbyss) return false; // 已经是深渊
  return Math.random() < ABYSS_TRIGGER_RATE;
}

/** 退出深渊模式 */
export function exitAbyss(state: DungeonState): void {
  state.isAbyss = false;
}

// ==================== 楼层难度 ====================

/** 获取当前楼层难度倍率 */
export function getFloorMultiplier(floor: number, isAbyss: boolean): number {
  const base = FLOOR_DIFFICULTY_MULTIPLIER[floor - 1] ?? 1.0;
  if (isAbyss) {
    // 深渊模式 ×2.0~2.5 (随机)
    return base * (2.0 + Math.random() * 0.5);
  }
  return base;
}

// ==================== Boss管理 ====================

/** Boss被击败 */
export function onBossDefeated(state: DungeonState, floor: number): void {
  const floorData = state.floors[floor - 1];
  if (floorData) {
    floorData.bossDefeated = true;
    floorData.cleared = true;
  }
  state.bossDefeatedFloors.add(floor);
  eventBus.emit('dungeon:bossDefeated', { floor });
}

/** 检查Boss是否已被击败 */
export function isBossDefeated(state: DungeonState, floor: number): boolean {
  return state.bossDefeatedFloors.has(floor);
}

// ==================== 房间管理 ====================

/** 房间清理完成 */
export function clearRoom(state: DungeonState, roomId: string): void {
  const floorData = state.floors[state.currentFloor - 1];
  if (floorData) {
    floorData.roomsCleared++;
    floorData.explorationRate = Math.min(100,
      (floorData.roomsCleared / Math.max(1, floorData.totalRooms)) * 100
    );
  }
  eventBus.emit('dungeon:clearRoom', { roomId });
}

// ==================== 传送 ====================

/** 传送冷却时间(秒) */
export const TELEPORT_COOLDOWN = 30;

/** 检查是否可以传送 */
export function canTeleport(state: DungeonState, cooldownRemaining: number): boolean {
  if (state.isAbyss) return false; // 深渊模式不可传送
  if (cooldownRemaining > 0) return false;
  return true;
}

// ==================== 游戏进度 ====================

/** 获取游戏总进度百分比 */
export function getGameProgress(state: DungeonState): number {
  const clearedFloors = state.floors.filter(f => f.bossDefeated).length;
  return (clearedFloors / TOTAL_DUNGEON_FLOORS) * 100;
}

/** 检查是否通关 */
export function isGameComplete(state: DungeonState): boolean {
  return state.floors.every(f => f.bossDefeated);
}
