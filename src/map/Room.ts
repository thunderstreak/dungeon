// 房间基类 - 封装房间数据、渲染等距地板和障碍物

import type { Room as RoomData, RoomType, Vector2 } from '@/config/types';
import type { RoomLayout, Obstacle } from '@/systems/MapGenerator';
import { TILE_SIZE } from '@/config/constants';
import { isoToScreen, getDepthSort } from '@/utils/IsometricUtils';
import { getTemplate, type RoomDecoration } from './templates/RoomTemplate';

// ==================== 颜色配置 ====================

/** 障碍物颜色 */
const OBSTACLE_COLORS: Record<string, number> = {
  wall: 0x1a1a1a,
  pillar: 0x4a4a4a,
  pit: 0x0a0a0a,
  water: 0x1a2a4a,
  rubble: 0x3a3a3a,
};

/** 装饰物颜色 */
const DECORATION_COLORS: Record<string, number> = {
  torch: 0xffaa00,
  banner: 0x8b0000,
  chest: 0xdaa520,
  shopCounter: 0x8b4513,
  altar: 0x4169e1,
  throne: 0xdaa520,
};

// ==================== Room 类 ====================

export class Room {
  readonly id: string;
  readonly type: RoomType;
  readonly roomData: RoomData;
  readonly layout: RoomLayout;

  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  isCleared = false;
  isEntered = false;

  constructor(scene: Phaser.Scene, roomData: RoomData, layout: RoomLayout) {
    this.scene = scene;
    this.roomData = roomData;
    this.layout = layout;
    this.id = roomData.id;
    this.type = roomData.type;

    this.container = scene.add.container(0, 0);
  }

  /** 渲染房间 (offsetX/offsetY为屏幕偏移) */
  render(offsetX: number, offsetY: number): void {
    this.clearGraphics();

    // 获取模板配置
    const template = getTemplate(this.type);
    const floorColor = template?.floorColor ?? 0x2a2a3a;

    // 绘制地板
    for (const tile of this.layout.walkableTiles) {
      const pos = isoToScreen(tile.x, tile.y);
      const screenX = pos.screenX + offsetX;
      const screenY = pos.screenY + offsetY;

      const tileRect = this.createTile(screenX, screenY, floorColor);
      tileRect.setDepth(getDepthSort(tile.y));
      this.container.add(tileRect);
    }

    // 绘制障碍物
    for (const obstacle of this.layout.obstacles) {
      this.renderObstacle(obstacle, offsetX, offsetY);
    }

    // 绘制装饰物
    if (template) {
      this.renderDecorations(template.decorations, offsetX, offsetY);
    }
  }

  /** 渲染装饰物 */
  private renderDecorations(decorations: RoomDecoration[], offsetX: number, offsetY: number): void {
    // 获取房间中心的等距坐标
    const centerX = this.roomData.position.x + this.roomData.position.width / 2;
    const centerY = this.roomData.position.y + this.roomData.position.height / 2;

    for (const deco of decorations) {
      const decoX = centerX + deco.offsetX;
      const decoY = centerY + deco.offsetY;
      const pos = isoToScreen(decoX, decoY);
      const screenX = pos.screenX + offsetX;
      const screenY = pos.screenY + offsetY;

      const color = DECORATION_COLORS[deco.type] ?? 0xffffff;

      const shape = this.createDecorationShape(deco.type, screenX, screenY, color);
      shape.setDepth(getDepthSort(decoY));
      this.container.add(shape);
    }
  }

  /** 根据装饰类型创建对应形状 */
  private createDecorationShape(
    type: RoomDecoration['type'],
    x: number,
    y: number,
    color: number,
  ): Phaser.GameObjects.Shape {
    switch (type) {
      case 'torch': {
        // 火把：小菱形+光晕
        const torch = this.scene.add.polygon(x, y - 8, [
          0, -6, 4, 0, 0, 6, -4, 0,
        ], color);
        torch.setOrigin(0.5, 0.5);
        return torch;
      }
      case 'banner': {
        // 旗帜：竖长方形
        const banner = this.scene.add.rectangle(x, y - 12, 6, 20, color);
        banner.setOrigin(0.5, 0.5);
        return banner;
      }
      case 'chest': {
        // 宝箱：扁长方形
        const chest = this.scene.add.rectangle(x, y - 4, 16, 10, color);
        chest.setOrigin(0.5, 0.5);
        return chest;
      }
      case 'shopCounter': {
        // 商店柜台：长方形
        const counter = this.scene.add.rectangle(x, y - 6, 24, 12, color);
        counter.setOrigin(0.5, 0.5);
        return counter;
      }
      case 'altar': {
        // 祭坛：菱形
        const altar = this.scene.add.polygon(x, y - 4, [
          0, -8, 10, 0, 0, 8, -10, 0,
        ], color);
        altar.setOrigin(0.5, 0.5);
        return altar;
      }
      case 'throne': {
        // 王座：大菱形+小菱形
        const throne = this.scene.add.polygon(x, y - 6, [
          0, -10, 12, 0, 0, 10, -12, 0,
        ], color);
        throne.setOrigin(0.5, 0.5);
        return throne;
      }
      default: {
        // 默认小圆点
        const dot = this.scene.add.circle(x, y, 4, color);
        dot.setOrigin(0.5, 0.5);
        return dot;
      }
    }
  }

  /** 渲染单个障碍物 */
  private renderObstacle(obstacle: Obstacle, offsetX: number, offsetY: number): void {
    const pos = isoToScreen(obstacle.position.x, obstacle.position.y);
    const screenX = pos.screenX + offsetX;
    const screenY = pos.screenY + offsetY;

    const color = OBSTACLE_COLORS[obstacle.type] ?? 0x2a2a2a;

    // 绘制正方形
    const rect = this.scene.add.rectangle(
      screenX + TILE_SIZE / 2,
      screenY + TILE_SIZE / 2,
      TILE_SIZE * obstacle.position.width,
      TILE_SIZE * obstacle.position.height,
      color,
    );
    rect.setDepth(getDepthSort(obstacle.position.y + obstacle.position.height));
    this.container.add(rect);
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

  /** 获取房间中心屏幕坐标 */
  getCenterScreenPos(offsetX: number = 0, offsetY: number = 0): Vector2 {
    const centerX = this.roomData.position.x + this.roomData.position.width / 2;
    const centerY = this.roomData.position.y + this.roomData.position.height / 2;
    const pos = isoToScreen(centerX, centerY);
    return { x: pos.screenX + offsetX, y: pos.screenY + offsetY };
  }

  /** 获取怪物刷新位置 */
  getMonsterSpawnPositions(safeDistance: number = 6): Vector2[] {
    // 过滤掉靠近中心的位置（玩家出生点）
    const centerX = this.roomData.position.x + this.roomData.position.width / 2;
    const centerY = this.roomData.position.y + this.roomData.position.height / 2;

    return this.layout.walkableTiles.filter(tile => {
      const dist = Math.abs(tile.x - centerX) + Math.abs(tile.y - centerY);
      return dist > safeDistance;
    });
  }

  /** 获取物品刷新位置 */
  getItemSpawnPositions(): Vector2[] {
    return [...this.layout.walkableTiles];
  }

  /** 检查格子是否可行走 */
  isWalkable(gridX: number, gridY: number): boolean {
    return this.layout.walkableTiles.some(t => t.x === gridX && t.y === gridY);
  }

  /** 标记房间已清理 */
  markCleared(): void {
    this.isCleared = true;
  }

  /** 获取容器 (用于添加到场景) */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /** 销毁所有Phaser对象 */
  destroy(): void {
    this.container.destroy();
  }
}
