// 地面掉落物实体 - 在怪物死亡位置显示物品名称，玩家走过去拾取

import Phaser from 'phaser';
import type { EquipmentRarity } from '@/config/types';
import { RARITY_COLORS } from '@/config/constants';
import { isoToScreen, getDepthSort } from '@/utils/IsometricUtils';

/** 地面掉落物品数据 */
export interface GroundLootItem {
  itemId: string;
  name: string;
  type: 'equipment' | 'potion' | 'material';
  rarity: EquipmentRarity;
  count: number;
}

export class GroundLoot {
  readonly container: Phaser.GameObjects.Container;
  readonly item: GroundLootItem;
  readonly gridX: number;
  readonly gridY: number;

  private nameText: Phaser.GameObjects.Text;
  private lifetime = 0;
  private flickering = false;
  private destroyed = false;

  private static readonly MAX_LIFETIME = 60_000;
  private static readonly FLICKER_START = 55_000;

  constructor(scene: Phaser.Scene, item: GroundLootItem, gridX: number, gridY: number) {
    this.item = item;
    this.gridX = gridX;
    this.gridY = gridY;

    const pos = isoToScreen(gridX, gridY);
    this.container = scene.add.container(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(gridY));
    this.container.setAlpha(0);

    const color = RARITY_COLORS[item.rarity] ?? '#ffffff';
    this.nameText = scene.add.text(0, 0, item.name, {
      fontSize: '11px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 淡入动画
    scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
    });
  }

  /** 更新生命周期，返回 false 表示应销毁 */
  update(_time: number, delta: number): boolean {
    if (this.destroyed) return false;

    this.lifetime += delta;

    if (this.lifetime >= GroundLoot.MAX_LIFETIME) {
      this.destroy();
      return false;
    }

    // 55秒后开始闪烁
    if (!this.flickering && this.lifetime >= GroundLoot.FLICKER_START) {
      this.flickering = true;
      this.container.scene.tweens.add({
        targets: this.container,
        alpha: 0.3,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }

    return true;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.container.destroy(true);
  }
}
