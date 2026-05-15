// UI面板基类 - 半透明遮罩 + 面板容器

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';

export class BasePanel {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected overlay: Phaser.GameObjects.Rectangle;
  isOpen = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(5000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // 半透明遮罩（初始不可交互，show时启用）
    this.overlay = scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.6);
    this.container.add(this.overlay);
  }

  show(): void {
    this.isOpen = true;
    this.container.setVisible(true);
    this.overlay.setInteractive();
  }

  hide(): void {
    this.isOpen = false;
    this.container.setVisible(false);
    this.overlay.disableInteractive();
  }

  toggle(): void {
    if (this.isOpen) this.hide();
    else this.show();
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
