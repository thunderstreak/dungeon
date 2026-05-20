// 小地图 - 右上角显示城镇/地牢布局、NPC、玩家标记

import Phaser from 'phaser';
import { CANVAS_WIDTH } from '@/config';

export interface MiniMapRoom {
  x: number; y: number; w: number; h: number;
  type: string; cleared: boolean;
}

export interface MiniMapNpc {
  x: number; y: number; label: string;
}

export interface MiniMapMonster {
  x: number; y: number; isBoss?: boolean;
}

export function getDungeonMiniMapScale(
  mapWidth: number,
  mapHeight: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  minCellPixels: number = 4,
  padding: number = 10,
): { scale: number; offsetX: number; offsetY: number } {
  const mapW = bounds.maxX - bounds.minX;
  const mapH = bounds.maxY - bounds.minY;

  if (mapW === 0 || mapH === 0) {
    return { scale: 0, offsetX: 0, offsetY: 0 };
  }

  const availableWidth = mapWidth - padding;
  const availableHeight = mapHeight - padding;
  const fitScaleX = availableWidth / mapW;
  const fitScaleY = availableHeight / mapH;
  const fitScale = Math.min(fitScaleX, fitScaleY);
  const finalScale = fitScale >= minCellPixels ? minCellPixels : fitScale;
  const offsetX = (mapWidth - mapW * finalScale) / 2 - bounds.minX * finalScale;
  const offsetY = (mapHeight - mapH * finalScale) / 2 - bounds.minY * finalScale;

  return { scale: finalScale, offsetX, offsetY };
}

export class MiniMap {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private mapWidth = 140;
  private mapHeight = 100;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(CANVAS_WIDTH - this.mapWidth - 10, 10);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    // 背景
    const bg = scene.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x111122, 0.8);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, 0x444466);
    this.container.add(bg);
  }

  /** 更新城镇小地图 */
  updateTown(
    gridW: number, gridH: number,
    playerGrid: { x: number; y: number },
    npcs: MiniMapNpc[],
    dungeonEntrance: { x: number; y: number } | null,
  ): void {
    this.clearMarks();

    const scaleX = this.mapWidth / gridW;
    const scaleY = this.mapHeight / gridH;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (this.mapWidth - gridW * scale) / 2;
    const offsetY = (this.mapHeight - gridH * scale) / 2;

    // 城镇区域
    const townBg = this.scene.add.rectangle(offsetX, offsetY, gridW * scale, gridH * scale, 0x1a2a1a, 0.4);
    townBg.setOrigin(0, 0);
    this.container.add(townBg);

    // NPC标记
    for (const npc of npcs) {
      const nx = offsetX + npc.x * scale;
      const ny = offsetY + npc.y * scale;
      const dot = this.scene.add.circle(nx, ny, 2, 0xffdd44);
      this.container.add(dot);
    }

    // 地牢入口标记
    if (dungeonEntrance) {
      const dx = offsetX + dungeonEntrance.x * scale;
      const dy = offsetY + dungeonEntrance.y * scale;
      const marker = this.scene.add.rectangle(dx, dy, 4, 4, 0xaa6633);
      marker.setOrigin(0.5, 0.5);
      this.container.add(marker);
    }

    // 玩家标记
    const px = offsetX + playerGrid.x * scale;
    const py = offsetY + playerGrid.y * scale;
    const playerDot = this.scene.add.circle(px, py, 3, 0x44ff44);
    this.container.add(playerDot);
  }

  /** 更新地牢小地图 */
  updateDungeon(
    rooms: MiniMapRoom[],
    playerGrid: { x: number; y: number },
    monsters: MiniMapMonster[],
  ): void {
    this.clearMarks();

    if (rooms.length === 0) return;

    // 计算所有房间的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const room of rooms) {
      minX = Math.min(minX, room.x);
      minY = Math.min(minY, room.y);
      maxX = Math.max(maxX, room.x + room.w);
      maxY = Math.max(maxY, room.y + room.h);
    }

    const { scale, offsetX, offsetY } = getDungeonMiniMapScale(
      this.mapWidth,
      this.mapHeight,
      { minX, minY, maxX, maxY },
    );
    if (scale === 0) return;

    // 绘制房间
    for (const room of rooms) {
      const rx = offsetX + room.x * scale;
      const ry = offsetY + room.y * scale;
      const rw = room.w * scale;
      const rh = room.h * scale;

      const color = room.cleared ? 0x336633 : room.type === 'boss' ? 0xcc3333 : 0x333366;
      const rect = this.scene.add.rectangle(rx, ry, rw, rh, color, 0.6);
      rect.setOrigin(0, 0);
      this.container.add(rect);
    }

    // 怪物标记
    for (const monster of monsters) {
      const mx = offsetX + monster.x * scale;
      const my = offsetY + monster.y * scale;
      const dot = this.scene.add.circle(mx, my, monster.isBoss ? 3 : 2, monster.isBoss ? 0xaa44ff : 0xff4444);
      this.container.add(dot);
    }

    // 玩家标记
    const px = offsetX + playerGrid.x * scale;
    const py = offsetY + playerGrid.y * scale;
    const dot = this.scene.add.circle(px, py, 3, 0x44ff44);
    this.container.add(dot);
  }

  private clearMarks(): void {
    while (this.container.list.length > 1) {
      this.container.list.pop()?.destroy();
    }
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
