// 随机地图生成系统 - 房间+走廊算法、可达性验证、障碍物生成

import type { Room, Corridor, DungeonMap, RoomType, Vector2, Rectangle } from '@/config/types';
import { TOTAL_DUNGEON_FLOORS } from '@/config/constants';

// ==================== 障碍物类型 ====================

/** 障碍物类型 */
export type ObstacleType = 'wall' | 'pillar' | 'pit' | 'water' | 'rubble';

/** 障碍物定义 */
export interface Obstacle {
  type: ObstacleType;
  position: Rectangle;
  walkable: boolean; // 是否可通行
}

/** 房间扩展信息 (含障碍物) */
export interface RoomLayout {
  room: Room;
  obstacles: Obstacle[];
  walkableTiles: Vector2[]; // 可通行的格子
}

// ==================== 配置 ====================

/** 房间尺寸配置 */
const ROOM_CONFIG = {
  minWidth: 24,
  maxWidth: 36,
  minHeight: 20,
  maxHeight: 30,
  padding: 5, // 房间之间的最小间距
};

/** 走廊宽度 */
export const CORRIDOR_WIDTH = 2;

/** 障碍物密度 (0~1) */
const OBSTACLE_DENSITY = 0.15;

/** 每层房间数量范围 */
function getRoomCount(floor: number): { min: number; max: number } {
  const base = 5 + Math.floor(floor / 2);
  return { min: base, max: base + 3 };
}

// ==================== 房间生成 ====================

/** 生成随机房间尺寸 */
function randomRoomSize(): { width: number; height: number } {
  const width = ROOM_CONFIG.minWidth + Math.floor(Math.random() * (ROOM_CONFIG.maxWidth - ROOM_CONFIG.minWidth + 1));
  const height = ROOM_CONFIG.minHeight + Math.floor(Math.random() * (ROOM_CONFIG.maxHeight - ROOM_CONFIG.minHeight + 1));
  return { width, height };
}

/** 检查房间是否重叠 */
function isRoomOverlapping(newRoom: Rectangle, existingRooms: Rectangle[]): boolean {
  const padding = ROOM_CONFIG.padding;
  for (const room of existingRooms) {
    if (
      newRoom.x - padding < room.x + room.width + padding &&
      newRoom.x + newRoom.width + padding > room.x - padding &&
      newRoom.y - padding < room.y + room.height + padding &&
      newRoom.y + newRoom.height + padding > room.y - padding
    ) {
      return true;
    }
  }
  return false;
}

/** 随机放置房间 */
function placeRooms(count: number): Rectangle[] {
  const rooms: Rectangle[] = [];
  const maxAttempts = 1000;
  const mapSize = 180; // 地图边界

  for (let i = 0; i < count; i++) {
    const { width, height } = randomRoomSize();
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * (mapSize - width));
      const y = Math.floor(Math.random() * (mapSize - height));
      const newRoom: Rectangle = { x, y, width, height };

      if (!isRoomOverlapping(newRoom, rooms)) {
        rooms.push(newRoom);
        placed = true;
        break;
      }
    }

    if (!placed) {
      console.warn(`无法放置第 ${i + 1} 个房间`);
    }
  }

  return rooms;
}

// ==================== 障碍物生成 ====================

/** 随机选择障碍物类型 */
function randomObstacleType(): ObstacleType {
  const types: ObstacleType[] = ['wall', 'pillar', 'pit', 'water', 'rubble'];
  return types[Math.floor(Math.random() * types.length)];
}

/** 生成单个障碍物 */
function generateObstacle(roomRect: Rectangle, existingObstacles: Obstacle[]): Obstacle | null {
  const margin = 1; // 离房间边缘至少1格
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const width = 1 + Math.floor(Math.random() * 2); // 1-2格宽
    const height = 1 + Math.floor(Math.random() * 2); // 1-2格高
    const x = roomRect.x + margin + Math.floor(Math.random() * (roomRect.width - width - margin * 2));
    const y = roomRect.y + margin + Math.floor(Math.random() * (roomRect.height - height - margin * 2));

    const newObstacle: Obstacle = {
      type: randomObstacleType(),
      position: { x, y, width, height },
      walkable: false,
    };

    // 检查是否与现有障碍物重叠
    const overlaps = existingObstacles.some(obs =>
      newObstacle.position.x < obs.position.x + obs.position.width &&
      newObstacle.position.x + newObstacle.position.width > obs.position.x &&
      newObstacle.position.y < obs.position.y + obs.position.height &&
      newObstacle.position.y + newObstacle.position.height > obs.position.y
    );

    if (!overlaps) {
      return newObstacle;
    }
  }

  return null;
}

/** 为房间生成障碍物 */
function generateRoomObstacles(roomRect: Rectangle, roomType: RoomType): Obstacle[] {
  const obstacles: Obstacle[] = [];

  // 不同房间类型有不同的障碍物密度
  let density = OBSTACLE_DENSITY;
  switch (roomType) {
    case 'normal':
      density = 0.12 + Math.random() * 0.08; // 12%~20%
      break;
    case 'treasure':
      density = 0.08 + Math.random() * 0.06; // 8%~14% (宝箱房间较空)
      break;
    case 'shop':
      density = 0.05 + Math.random() * 0.05; // 5%~10% (商店房间很空)
      break;
    case 'event':
      density = 0.15 + Math.random() * 0.10; // 15%~25% (事件房间障碍多)
      break;
    case 'boss':
      density = 0.08 + Math.random() * 0.07; // 8%~15% (Boss房间适中)
      break;
    case 'start':
      density = 0.05; // 起始房间很少障碍
      break;
  }

  const totalTiles = roomRect.width * roomRect.height;
  const targetCount = Math.floor(totalTiles * density);

  for (let i = 0; i < targetCount; i++) {
    const obstacle = generateObstacle(roomRect, obstacles);
    if (obstacle) {
      obstacles.push(obstacle);
    }
  }

  return obstacles;
}

/** 计算可通行格子 */
function calculateWalkableTiles(roomRect: Rectangle, obstacles: Obstacle[]): Vector2[] {
  const walkable: Vector2[] = [];

  for (let x = roomRect.x; x < roomRect.x + roomRect.width; x++) {
    for (let y = roomRect.y; y < roomRect.y + roomRect.height; y++) {
      const isBlocked = obstacles.some(obs =>
        x >= obs.position.x && x < obs.position.x + obs.position.width &&
        y >= obs.position.y && y < obs.position.y + obs.position.height
      );

      if (!isBlocked) {
        walkable.push({ x, y });
      }
    }
  }

  return walkable;
}

// ==================== 走廊生成 ====================

/** 计算两个矩形中心点 */
function getRoomCenter(room: Rectangle): Vector2 {
  return {
    x: room.x + Math.floor(room.width / 2),
    y: room.y + Math.floor(room.height / 2),
  };
}

/** 生成L形走廊 */
function generateCorridorPath(start: Vector2, end: Vector2): Vector2[] {
  const path: Vector2[] = [];
  const midX = start.x;
  const midY = end.y;

  // 先水平后垂直
  if (Math.random() < 0.5) {
    // 水平 -> 垂直
    const stepsX = Math.abs(end.x - start.x);
    const stepsY = Math.abs(end.y - start.y);
    const dirX = end.x > start.x ? 1 : -1;
    const dirY = end.y > start.y ? 1 : -1;

    for (let i = 0; i <= stepsX; i++) {
      path.push({ x: start.x + i * dirX, y: start.y });
    }
    for (let i = 1; i <= stepsY; i++) {
      path.push({ x: end.x, y: start.y + i * dirY });
    }
  } else {
    // 垂直 -> 水平
    const stepsX = Math.abs(end.x - start.x);
    const stepsY = Math.abs(end.y - start.y);
    const dirX = end.x > start.x ? 1 : -1;
    const dirY = end.y > start.y ? 1 : -1;

    for (let i = 0; i <= stepsY; i++) {
      path.push({ x: start.x, y: start.y + i * dirY });
    }
    for (let i = 1; i <= stepsX; i++) {
      path.push({ x: start.x + i * dirX, y: end.y });
    }
  }

  return path;
}

/** 使用Prim算法生成最小生成树连接房间 */
function generateConnections(roomCount: number): [number, number][] {
  const connections: [number, number][] = [];
  const connected = new Set<number>();
  const unconnected = new Set<number>();

  // 初始化
  for (let i = 0; i < roomCount; i++) {
    unconnected.add(i);
  }

  // 从第一个房间开始
  connected.add(0);
  unconnected.delete(0);

  while (unconnected.size > 0) {
    let bestDist = Infinity;
    let bestFrom = -1;
    let bestTo = -1;

    // 找最近的已连接和未连接房间对
    for (const from of connected) {
      for (const to of unconnected) {
        // 使用简单距离（实际应该用房间中心距离）
        const dist = Math.abs(from - to); // 简化：使用索引距离
        if (dist < bestDist) {
          bestDist = dist;
          bestFrom = from;
          bestTo = to;
        }
      }
    }

    if (bestFrom !== -1 && bestTo !== -1) {
      connections.push([bestFrom, bestTo]);
      connected.add(bestTo);
      unconnected.delete(bestTo);
    }
  }

  return connections;
}

/** 生成走廊 */
function generateCorridors(rooms: Rectangle[], connections: [number, number][]): Corridor[] {
  const corridors: Corridor[] = [];

  for (const [fromIdx, toIdx] of connections) {
    const fromCenter = getRoomCenter(rooms[fromIdx]);
    const toCenter = getRoomCenter(rooms[toIdx]);
    const path = generateCorridorPath(fromCenter, toCenter);

    corridors.push({
      startRoomId: `room_${fromIdx}`,
      endRoomId: `room_${toIdx}`,
      path,
    });
  }

  return corridors;
}

// ==================== 可达性验证 ====================

/** 检查所有房间是否可达 (BFS) */
function validateReachability(rooms: Rectangle[], corridors: Corridor[]): boolean {
  if (rooms.length === 0) return true;

  const adjacency = new Map<number, Set<number>>();

  // 初始化邻接表
  for (let i = 0; i < rooms.length; i++) {
    adjacency.set(i, new Set());
  }

  // 添加走廊连接
  for (const corridor of corridors) {
    const fromIdx = parseInt(corridor.startRoomId.replace('room_', ''));
    const toIdx = parseInt(corridor.endRoomId.replace('room_', ''));

    adjacency.get(fromIdx)?.add(toIdx);
    adjacency.get(toIdx)?.add(fromIdx);
  }

  // BFS检查可达性
  const visited = new Set<number>();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current);

    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  return visited.size === rooms.length;
}

// ==================== 房间类型分配 ====================

/** 分配房间类型 */
function assignRoomTypes(rooms: Rectangle[]): RoomType[] {
  const types: RoomType[] = [];
  const count = rooms.length;

  if (count === 0) return types;

  // 第一个房间是起始房间
  types.push('start');

  // 最后一个房间是Boss房间
  for (let i = 1; i < count - 1; i++) {
    const roll = Math.random();
    if (roll < 0.60) {
      types.push('normal');
    } else if (roll < 0.75) {
      types.push('treasure');
    } else if (roll < 0.85) {
      types.push('shop');
    } else {
      types.push('event');
    }
  }

  // 最后一个房间是Boss
  types.push('boss');

  return types;
}

// ==================== 主生成函数 ====================

/** 生成地牢地图 */
export function generateDungeonMap(floor: number): DungeonMap {
  const { min, max } = getRoomCount(floor);
  const roomCount = min + Math.floor(Math.random() * (max - min + 1));

  // 1. 放置房间
  let roomsRects = placeRooms(roomCount);
  let attempts = 0;

  // 确保至少有3个房间
  while (roomsRects.length < 3 && attempts < 10) {
    roomsRects = placeRooms(roomCount);
    attempts++;
  }

  // 2. 生成连接
  const connections = generateConnections(roomsRects.length);

  // 3. 生成走廊
  const corridors = generateCorridors(roomsRects, connections);

  // 4. 验证可达性
  if (!validateReachability(roomsRects, corridors)) {
    console.warn('地图不可达，重新生成');
    return generateDungeonMap(floor); // 递归重新生成
  }

  // 5. 分配房间类型
  const roomTypes = assignRoomTypes(roomsRects);

  // 6. 构建房间对象
  const rooms: Room[] = roomsRects.map((rect, index) => ({
    id: `room_${index}`,
    type: roomTypes[index],
    position: rect,
    monsters: [],
    items: [],
    connectedRooms: corridors
      .filter(c => c.startRoomId === `room_${index}` || c.endRoomId === `room_${index}`)
      .map(c => c.startRoomId === `room_${index}` ? c.endRoomId : c.startRoomId),
  }));

  // 7. 找出特殊房间
  const startRoom = rooms.find(r => r.type === 'start')!;
  const bossRoom = rooms.find(r => r.type === 'boss')!;
  const specialRooms = rooms.filter(r => r.type !== 'normal' && r.type !== 'start' && r.type !== 'boss');

  return {
    rooms,
    corridors,
    startRoom,
    bossRoom,
    specialRooms,
  };
}

/** 生成房间布局 (含障碍物) */
export function generateRoomLayout(room: Room): RoomLayout {
  const obstacles = generateRoomObstacles(room.position, room.type);
  const walkableTiles = calculateWalkableTiles(room.position, obstacles);

  return {
    room,
    obstacles,
    walkableTiles,
  };
}

/** 批量生成所有房间布局 */
export function generateAllRoomLayouts(dungeonMap: DungeonMap): RoomLayout[] {
  return dungeonMap.rooms.map(room => generateRoomLayout(room));
}

/** 检查某个位置是否可通行 */
export function isTileWalkable(layout: RoomLayout, x: number, y: number): boolean {
  // 首先检查是否在房间范围内
  const { position } = layout.room;
  if (x < position.x || x >= position.x + position.width ||
      y < position.y || y >= position.y + position.height) {
    return false;
  }

  // 检查是否被障碍物阻挡
  return !layout.obstacles.some(obs =>
    x >= obs.position.x && x < obs.position.x + obs.position.width &&
    y >= obs.position.y && y < obs.position.y + obs.position.height
  );
}

/** 获取随机可通行位置 (用于怪物/物品刷新) */
export function getRandomWalkablePosition(layout: RoomLayout): Vector2 | null {
  if (layout.walkableTiles.length === 0) return null;
  return layout.walkableTiles[Math.floor(Math.random() * layout.walkableTiles.length)];
}

/** 获取楼层信息 */
export function getFloorInfo(floor: number): {
  roomCount: { min: number; max: number };
  hasShop: boolean;
  hasTreasure: boolean;
} {
  const { min, max } = getRoomCount(floor);
  return {
    roomCount: { min, max },
    hasShop: floor >= 2,
    hasTreasure: true,
  };
}
