import {
  TOWN_HEIGHT,
  TOWN_WIDTH,
  getTownCameraScroll,
  getTownWorldSize,
  isTownWalkable,
  viewportToWorldPoint,
} from './TownBounds';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertDeepEqual(
  actual: { x: number; y: number },
  expected: { x: number; y: number },
): void {
  assertEqual(actual.x, expected.x);
  assertEqual(actual.y, expected.y);
}

const worldSize = getTownWorldSize();

assertEqual(worldSize.width, (TOWN_WIDTH - 1) * TILE_SIZE + TILE_SIZE / 2);
assertEqual(worldSize.height, (TOWN_HEIGHT - 1) * TILE_SIZE + TILE_SIZE / 2);

assertDeepEqual(getTownCameraScroll(worldSize.width - TILE_SIZE / 2, worldSize.height - TILE_SIZE / 2), {
  x: worldSize.width - CANVAS_WIDTH,
  y: worldSize.height - CANVAS_HEIGHT,
});

assertEqual(isTownWalkable(0, 0), true);
assertEqual(isTownWalkable(TOWN_WIDTH - 1, TOWN_HEIGHT - 1), true);
assertEqual(isTownWalkable(TOWN_WIDTH, TOWN_HEIGHT - 1), false);
assertEqual(isTownWalkable(TOWN_WIDTH - 1, TOWN_HEIGHT), false);

assertDeepEqual(viewportToWorldPoint(900, 320, 1056, 512), { x: 1956, y: 832 });

console.log('TownBounds tests passed');
