// 正交视角工具 - 坐标转换、瓦片渲染、深度排序

import { TILE_SIZE } from '@/config/constants';

// ==================== 坐标转换 ====================

/** 网格坐标转屏幕坐标 */
export function isoToScreen(x: number, y: number): { screenX: number; screenY: number } {
  return {
    screenX: x * TILE_SIZE,
    screenY: y * TILE_SIZE,
  };
}

/** 屏幕坐标转网格坐标 */
export function screenToIso(screenX: number, screenY: number): { x: number; y: number } {
  return {
    x: screenX / TILE_SIZE,
    y: screenY / TILE_SIZE,
  };
}

/** 获取瓦片的屏幕位置 (左上角) */
export function getTileScreenPosition(tileX: number, tileY: number): { x: number; y: number } {
  const pos = isoToScreen(tileX, tileY);
  return { x: pos.screenX, y: pos.screenY };
}

/** 获取瓦片的中心屏幕位置 */
export function getTileCenterPosition(tileX: number, tileY: number): { x: number; y: number } {
  const pos = isoToScreen(tileX, tileY);
  return {
    x: pos.screenX + TILE_SIZE / 2,
    y: pos.screenY + TILE_SIZE / 2,
  };
}

// ==================== 深度排序 ====================

/** 计算渲染深度 (Y越小越靠后) */
export function getDepthSort(y: number): number {
  return y;
}

/** 计算实体深度 (用于遮挡关系) */
export function getEntityDepth(entityY: number, entityHeight: number = 0): number {
  return entityY + entityHeight;
}

// ==================== 瓦片工具 ====================

/** 检查屏幕坐标是否在瓦片内 */
export function isPointInTile(
  screenX: number,
  screenY: number,
  tileX: number,
  tileY: number,
): boolean {
  const pos = isoToScreen(tileX, tileY);
  return (
    screenX >= pos.screenX &&
    screenX < pos.screenX + TILE_SIZE &&
    screenY >= pos.screenY &&
    screenY < pos.screenY + TILE_SIZE
  );
}

/** 获取屏幕坐标所在的瓦片坐标 */
export function getTileAtScreen(screenX: number, screenY: number): { x: number; y: number } {
  const iso = screenToIso(screenX, screenY);
  return {
    x: Math.floor(iso.x),
    y: Math.floor(iso.y),
  };
}

// ==================== 范围查询 ====================

/** 获取指定范围内的所有瓦片 */
export function getTilesInRange(
  centerTileX: number,
  centerTileY: number,
  range: number,
): Array<{ x: number; y: number }> {
  const tiles: Array<{ x: number; y: number }> = [];

  for (let x = centerTileX - range; x <= centerTileX + range; x++) {
    for (let y = centerTileY - range; y <= centerTileY + range; y++) {
      const dist = Math.abs(x - centerTileX) + Math.abs(y - centerTileY);
      if (dist <= range) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}

/** 获取扇形范围内的瓦片 */
export function getTilesInCone(
  centerTileX: number,
  centerTileY: number,
  range: number,
  direction: 'up' | 'down' | 'left' | 'right',
  angle: number = 90,
): Array<{ x: number; y: number }> {
  const allTiles = getTilesInRange(centerTileX, centerTileY, range);

  return allTiles.filter(tile => {
    const dx = tile.x - centerTileX;
    const dy = tile.y - centerTileY;

    switch (direction) {
      case 'down':
        return dy >= 0 && Math.abs(dx) <= dy * Math.tan((angle / 2) * Math.PI / 180);
      case 'up':
        return dy <= 0 && Math.abs(dx) <= Math.abs(dy) * Math.tan((angle / 2) * Math.PI / 180);
      case 'left':
        return dx <= 0 && Math.abs(dy) <= Math.abs(dx) * Math.tan((angle / 2) * Math.PI / 180);
      case 'right':
        return dx >= 0 && Math.abs(dy) <= dx * Math.tan((angle / 2) * Math.PI / 180);
      default:
        return true;
    }
  });
}

// ==================== 动画辅助 ====================

/** 计算从A到B的移动步进 */
export function getIsoStep(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  speed: number,
): { dx: number; dy: number } {
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { dx: 0, dy: 0 };

  return {
    dx: (dx / dist) * speed,
    dy: (dy / dist) * speed,
  };
}
