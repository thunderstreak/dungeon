import type { Corridor, Vector2 } from '../config/types';

export interface FloorBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface FloorWalkability {
  bounds: FloorBounds;
  isWalkable(gridX: number, gridY: number): boolean;
}

interface WalkableLayout {
  walkableTiles: Vector2[];
}

export function createFloorWalkability(
  layouts: WalkableLayout[],
  corridors: Corridor[],
  corridorWidth: number,
): FloorWalkability {
  const walkableKeys = new Set<string>();
  const walkableTiles: Vector2[] = [];

  const addTile = (tile: Vector2): void => {
    const key = toKey(tile.x, tile.y);
    if (walkableKeys.has(key)) return;
    walkableKeys.add(key);
    walkableTiles.push(tile);
  };

  for (const layout of layouts) {
    for (const tile of layout.walkableTiles) {
      addTile(tile);
    }
  }

  for (const corridor of corridors) {
    const orientation = getCorridorOrientation(corridor.path);
    for (const tile of corridor.path) {
      for (const expanded of expandCorridorTile(tile, corridorWidth, orientation)) {
        addTile(expanded);
      }
    }
  }

  return {
    bounds: calculateBounds(walkableTiles),
    isWalkable: (gridX, gridY) => walkableKeys.has(toKey(gridX, gridY)),
  };
}

function getCorridorOrientation(path: Vector2[]): 'x' | 'y' {
  if (path.length < 2) return 'x';
  const dx = Math.abs(path[1].x - path[0].x);
  const dy = Math.abs(path[1].y - path[0].y);
  return dx >= dy ? 'x' : 'y';
}

function expandCorridorTile(tile: Vector2, corridorWidth: number, orientation: 'x' | 'y'): Vector2[] {
  if (corridorWidth <= 1) return [tile];

  // 向走廊垂直方向扩展（单方向，与渲染对齐）
  if (orientation === 'x') {
    return [tile, { x: tile.x, y: tile.y + 1 }];
  } else {
    return [tile, { x: tile.x - 1, y: tile.y }];
  }
}

function calculateBounds(tiles: Vector2[]): FloorBounds {
  if (tiles.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const tile of tiles) {
    minX = Math.min(minX, tile.x);
    maxX = Math.max(maxX, tile.x);
    minY = Math.min(minY, tile.y);
    maxY = Math.max(maxY, tile.y);
  }

  return { minX, maxX, minY, maxY };
}

function toKey(x: number, y: number): string {
  return `${x},${y}`;
}
