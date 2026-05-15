import { CANVAS_HEIGHT, CANVAS_WIDTH, TILE_SIZE } from '../config/constants';

export const TOWN_WIDTH = 63;
export const TOWN_HEIGHT = 51;
export const TOWN_PAD = 15;

export function getTownWorldSize(): { width: number; height: number } {
  return {
    width: (TOWN_WIDTH - 1) * TILE_SIZE + TILE_SIZE / 2,
    height: (TOWN_HEIGHT - 1) * TILE_SIZE + TILE_SIZE / 2,
  };
}

export function getTownCameraScroll(playerX: number, playerY: number): { x: number; y: number } {
  const worldSize = getTownWorldSize();
  const maxScrollX = Math.max(0, worldSize.width - CANVAS_WIDTH);
  const maxScrollY = Math.max(0, worldSize.height - CANVAS_HEIGHT);

  return {
    x: clamp(playerX - CANVAS_WIDTH / 2, 0, maxScrollX),
    y: clamp(playerY - CANVAS_HEIGHT / 2, 0, maxScrollY),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isTownWalkable(gridX: number, gridY: number): boolean {
  return gridX >= 0 && gridX < TOWN_WIDTH && gridY >= 0 && gridY < TOWN_HEIGHT;
}

export function viewportToWorldPoint(
  viewportX: number,
  viewportY: number,
  scrollX: number,
  scrollY: number,
): { x: number; y: number } {
  return {
    x: viewportX + scrollX,
    y: viewportY + scrollY,
  };
}
