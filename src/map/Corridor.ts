// 走廊类 - 封装走廊数据、渲染走廊

import type { Corridor as CorridorData, Vector2 } from '@/config/types';
import { TILE_SIZE } from '@/config/constants';
import { isoToScreen, getDepthSort } from '@/utils/IsometricUtils';

// ==================== 颜色配置 ====================

/** 走廊地板颜色 */
const CORRIDOR_FLOOR_COLOR = 0x252535;

// ==================== Corridor 类 ====================

export class Corridor {
  readonly startRoomId: string;
  readonly endRoomId: string;
  readonly path: Vector2[];

  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, corridorData: CorridorData) {
    this.scene = scene;
    this.startRoomId = corridorData.startRoomId;
    this.endRoomId = corridorData.endRoomId;
    this.path = corridorData.path;

    this.container = scene.add.container(0, 0);
  }

  /** 渲染走廊 */
  render(offsetX: number, offsetY: number, width: number = 1): void {
    this.clearGraphics();

    for (const tile of this.path) {
      const tiles = width <= 1 ? [tile] : [tile, { x: tile.x, y: tile.y + 1 }];
      for (const expandedTile of tiles) {
        const pos = isoToScreen(expandedTile.x, expandedTile.y);
        const screenX = pos.screenX + offsetX;
        const screenY = pos.screenY + offsetY;

        const tileRect = this.createTile(screenX, screenY, CORRIDOR_FLOOR_COLOR);
        tileRect.setDepth(getDepthSort(expandedTile.y));
        this.container.add(tileRect);
      }
    }
  }

  /** 创建正方形瓦片 */
  private createTile(x: number, y: number, color: number): Phaser.GameObjects.Rectangle {
    const rect = this.scene.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, color);
    rect.setOrigin(0.5, 0.5);
    return rect;
  }

  /** 清除所有图形 */
  private clearGraphics(): void {
    this.container.removeAll(true);
  }

  /** 检查是否连接指定房间 */
  connectsTo(roomId: string): boolean {
    return this.startRoomId === roomId || this.endRoomId === roomId;
  }

  /** 获取另一个房间ID */
  getOtherRoomId(roomId: string): string | null {
    if (this.startRoomId === roomId) return this.endRoomId;
    if (this.endRoomId === roomId) return this.startRoomId;
    return null;
  }

  /** 获取容器 */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /** 销毁 */
  destroy(): void {
    this.container.destroy();
  }
}
