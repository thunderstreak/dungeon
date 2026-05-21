// 房间管理 - 房间切换、怪物生成、Boss生成、通关处理

import { createBoss, spawnMonstersInRoom } from '@/entities/monsters/MonsterFactory';
import { Monster } from '@/entities/Monster';
import { Boss } from '@/entities/Boss';
import { getFloorMultiplier } from '@/systems/DungeonSystem';
import { showNotification } from '@/ui/NotificationToast';
import type { Room } from '@/map/Room';
import type { DungeonContext } from '@/systems/DungeonContext';

/** 检测玩家是否进入了新房间 */
export function checkRoomTransition(ctx: DungeonContext): void {
  const pg = ctx.player.getGridPosition();
  for (const room of ctx.roomGenerator.getAllRooms()) {
    const pos = room.roomData.position;
    if (pg.x >= pos.x && pg.x < pos.x + pos.width
      && pg.y >= pos.y && pg.y < pos.y + pos.height) {
      if (room.id !== ctx.currentRoom.id) {
        enterRoom(ctx, room);
      }
      return;
    }
  }
}

/** 进入新房间 */
export function enterRoom(ctx: DungeonContext, room: Room): void {
  ctx.currentRoom = room;
  ctx.monsters = ctx.roomMonsters.get(room.id) ?? [];

  if (ctx.roomsEntered.has(room.id)) {
    ctx.roomCleared = true;
    return;
  }

  if (room.isCleared) {
    ctx.roomsEntered.add(room.id);
    ctx.roomCleared = true;
  } else {
    room.isEntered = true;
    ctx.roomCleared = false;
    // 需要从DungeonScene调用applyMonsterWalkability
    (ctx.scene as any).applyMonsterWalkability?.();
  }
}

/** 在指定房间生成怪物 */
export function spawnMonstersForRoom(ctx: DungeonContext, room: Room): void {
  const spawnPositions = room.getMonsterSpawnPositions();
  const density = 0.04;
  const floorMultiplier = getFloorMultiplier(ctx.floor, ctx.dungeonState.isAbyss);

  const roomMonsters = spawnMonstersInRoom(
    ctx.scene,
    spawnPositions,
    ctx.floor,
    floorMultiplier,
    density,
  );

  ctx.roomMonsters.set(room.id, roomMonsters);

  // 死亡回调由DungeonScene注入
}

/** 为所有非Boss房间生成普通怪物 */
export function spawnAllRoomMonsters(ctx: DungeonContext, onMonsterDeath: (m: Monster | Boss) => void): void {
  const allRooms = ctx.roomGenerator.getAllRooms();
  for (const room of allRooms) {
    if (room.type === 'boss') continue;
    spawnMonstersForRoom(ctx, room);
    // 注入死亡回调
    const monsters = ctx.roomMonsters.get(room.id);
    if (monsters) {
      for (const monster of monsters) {
        monster.onDeath = onMonsterDeath;
      }
    }
  }
  ctx.monsters = ctx.roomMonsters.get(ctx.currentRoom.id) ?? [];
}

/** 在Boss房间生成Boss */
export function spawnBossInRoom(ctx: DungeonContext, onMonsterDeath: (m: Monster | Boss) => void): void {
  const spawnPositions = ctx.currentRoom.getMonsterSpawnPositions();
  if (spawnPositions.length === 0) return;

  const pos = spawnPositions[0];
  const floorMultiplier = getFloorMultiplier(ctx.floor, ctx.dungeonState.isAbyss);

  const boss = createBoss(ctx.scene, {
    floor: ctx.floor,
    gridX: pos.x,
    gridY: pos.y,
    floorMultiplier,
  }, ctx.dungeonState.isAbyss);

  boss.onDeath = onMonsterDeath;
  boss.isWalkable = (gx, gy) => {
    if (!ctx.floorWalkability.isWalkable(gx, gy)) return false;
    const occupied = (ctx.scene as any).isOccupied?.(gx, gy, boss);
    return !occupied;
  };
  boss.setTarget(ctx.player.combatEntity);

  const bossMonsters = [boss];
  ctx.roomMonsters.set(ctx.currentRoom.id, bossMonsters);
  ctx.monsters = bossMonsters;
  ctx.roomCleared = false;

  showNotification(ctx.scene, `Boss出现: ${boss.bossData.name}!`, '#ff4444');
}

/** 房间通关 */
export function onRoomCleared(ctx: DungeonContext): void {
  ctx.roomsEntered.add(ctx.currentRoom.id);
  showNotification(ctx.scene, '房间已清除!', '#44ff44');
  ctx.currentRoom.markCleared();

  if (ctx.currentRoom.roomData.type === 'boss') {
    spawnBossInRoom(ctx, (m) => (ctx.scene as any).onMonsterDeath?.(m));
    return;
  }

  const adjacent = ctx.roomGenerator.getAdjacentRooms(ctx.currentRoom.id);
  if (adjacent.length === 0) {
    showNotification(ctx.scene, '地牢通关! 返回城镇', '#ffcc44');
    ctx.scene.time.delayedCall(1500, () => (ctx.scene as any).backToTown?.());
    return;
  }

  showNotification(ctx.scene, '走向相邻房间继续探索', '#66cc66');
}
