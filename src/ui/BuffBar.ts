// Buff状态栏 - 左上角显示激活的buff/debuff图标

import Phaser from 'phaser';
import { CANVAS_WIDTH } from '@/config';
import type { ActiveBuff } from '@/systems/BuffSystem';

export class BuffBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(10, 50);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);
  }

  update(buffs: ActiveBuff[]): void {
    // 清除旧图标
    for (const icon of this.icons) {
      icon.destroy();
    }
    this.icons = [];

    // 绘制新图标
    buffs.forEach((buff, i) => {
      const iconContainer = this.scene.add.container(i * 36, 0);

      const bg = this.scene.add.rectangle(0, 0, 32, 32, buff.type === 'buff' ? 0x334488 : 0x883333, 0.8);
      bg.setStrokeStyle(1, buff.type === 'buff' ? 0x5577cc : 0xcc5555);
      iconContainer.add(bg);

      const text = this.scene.add.text(0, 0, buff.name.charAt(0), {
        fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5);
      iconContainer.add(text);

      this.container.add(iconContainer);
      this.icons.push(iconContainer);
    });
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
