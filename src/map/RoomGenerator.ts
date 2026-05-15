// 房间生成器 - 将MapGenerator的数据转换为Room和Corridor实例

import type { DungeonMap } from '@/config/types';
import { generateDungeonMap, generateAllRoomLayouts } from '@/systems/MapGenerator';
import { Room } from './Room';
import { Corridor } from './Corridor';

// ==================== RoomGenerator 类 ====================

export class RoomGenerator {
  private rooms = new Map<string, Room>();
  private corridors = new Map<string, Corridor>();
  private roomList: Room[] = [];
  private corridorList: Corridor[] = [];
  private currentRoomIndex = 0;

  /** 生成楼层的所有房间和走廊 */
  generateFloor(scene: Phaser.Scene, floor: number): {
    dungeonMap: DungeonMap;
    rooms: Room[];
    corridors: Corridor[];
    startRoom: Room;
    bossRoom: Room;
  } {
    // 清理旧数据
    this.destroy();

    // 生成地图数据
    const dungeonMap = generateDungeonMap(floor);

    // 生成房间布局
    const layouts = generateAllRoomLayouts(dungeonMap);

    // 创建Room实例
    for (const layout of layouts) {
      const room = new Room(scene, layout.room, layout);
      this.rooms.set(room.id, room);
      this.roomList.push(room);
    }

    // 创建Corridor实例
    for (const corridorData of dungeonMap.corridors) {
      const corridor = new Corridor(scene, corridorData);
      const key = `${corridor.startRoomId}_${corridor.endRoomId}`;
      this.corridors.set(key, corridor);
      this.corridorList.push(corridor);
    }

    // 找出起始和Boss房间
    const startRoom = this.rooms.get(dungeonMap.startRoom.id)!;
    const bossRoom = this.rooms.get(dungeonMap.bossRoom.id)!;

    // 设置起始房间为当前房间
    this.currentRoomIndex = 0;

    return { dungeonMap, rooms: this.roomList, corridors: this.corridorList, startRoom, bossRoom };
  }

  /** 根据ID获取房间 */
  getRoomById(id: string): Room | null {
    return this.rooms.get(id) ?? null;
  }

  /** 获取当前房间 */
  getCurrentRoom(): Room | null {
    return this.roomList[this.currentRoomIndex] ?? null;
  }

  /** 设置当前房间 */
  setCurrentRoom(roomId: string): boolean {
    const index = this.roomList.findIndex(r => r.id === roomId);
    if (index === -1) return false;
    this.currentRoomIndex = index;
    return true;
  }

  /** 获取相邻房间 */
  getAdjacentRooms(roomId: string): Room[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.roomData.connectedRooms
      .map(id => this.rooms.get(id))
      .filter((r): r is Room => r !== undefined);
  }

  /** 获取连接两个房间的走廊 */
  getCorridorBetween(roomId1: string, roomId2: string): Corridor | null {
    const key1 = `${roomId1}_${roomId2}`;
    const key2 = `${roomId2}_${roomId1}`;
    return this.corridors.get(key1) ?? this.corridors.get(key2) ?? null;
  }

  /** 获取所有房间 */
  getAllRooms(): Room[] {
    return this.roomList;
  }

  /** 获取所有走廊 */
  getAllCorridors(): Corridor[] {
    return this.corridorList;
  }

  /** 销毁所有实例 */
  destroy(): void {
    for (const room of this.roomList) {
      room.destroy();
    }
    for (const corridor of this.corridorList) {
      corridor.destroy();
    }
    this.rooms.clear();
    this.corridors.clear();
    this.roomList = [];
    this.corridorList = [];
    this.currentRoomIndex = 0;
  }
}
