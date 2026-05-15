import type { Corridor } from '../config/types';
import { createFloorWalkability } from './FloorWalkability';

interface TestRoomLayout {
  room: {
    id: string;
    type: 'start' | 'normal';
    position: { x: number; y: number; width: number; height: number };
    monsters: [];
    items: [];
    connectedRooms: string[];
  };
  obstacles: [];
  walkableTiles: Array<{ x: number; y: number }>;
}

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const layouts: TestRoomLayout[] = [
  {
    room: {
      id: 'room_0',
      type: 'start',
      position: { x: 0, y: 0, width: 2, height: 2 },
      monsters: [],
      items: [],
      connectedRooms: ['room_1'],
    },
    obstacles: [],
    walkableTiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    room: {
      id: 'room_1',
      type: 'normal',
      position: { x: 4, y: 0, width: 2, height: 2 },
      monsters: [],
      items: [],
      connectedRooms: ['room_0'],
    },
    obstacles: [],
    walkableTiles: [
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
    ],
  },
];

const corridors: Corridor[] = [{
  startRoomId: 'room_0',
  endRoomId: 'room_1',
  path: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
  ],
}];

const floor = createFloorWalkability(layouts, corridors, 2);

assertEqual(floor.isWalkable(0, 0), true);
assertEqual(floor.isWalkable(4, 1), true);
assertEqual(floor.isWalkable(2, 0), true);
assertEqual(floor.isWalkable(2, 1), true);
assertEqual(floor.isWalkable(2, 2), false);
assertEqual(floor.bounds.minX, 0);
assertEqual(floor.bounds.maxX, 5);
assertEqual(floor.bounds.minY, 0);
assertEqual(floor.bounds.maxY, 1);

console.log('FloorWalkability tests passed');
