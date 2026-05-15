import {
  TOWN_HEIGHT,
  TOWN_WIDTH,
  getTownCameraScroll,
  getTownWorldSize,
  isTownWalkable,
  viewportToWorldPoint,
} from './TownBounds';

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

assertEqual(worldSize.width, (TOWN_WIDTH - 1) * 32 + 16);
assertEqual(worldSize.height, (TOWN_HEIGHT - 1) * 32 + 16);

assertDeepEqual(getTownCameraScroll(worldSize.width - 16, worldSize.height - 16), {
  x: worldSize.width - 960,
  y: worldSize.height - 640,
});

assertEqual(isTownWalkable(0, 0), true);
assertEqual(isTownWalkable(TOWN_WIDTH - 1, TOWN_HEIGHT - 1), true);
assertEqual(isTownWalkable(TOWN_WIDTH, TOWN_HEIGHT - 1), false);
assertEqual(isTownWalkable(TOWN_WIDTH - 1, TOWN_HEIGHT), false);

assertDeepEqual(viewportToWorldPoint(900, 320, 1056, 512), { x: 1956, y: 832 });

console.log('TownBounds tests passed');
