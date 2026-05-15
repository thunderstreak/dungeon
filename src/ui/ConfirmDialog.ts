// 确认对话框 - 确认/取消按钮

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';

export class ConfirmDialog {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Rectangle;
  isOpen = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(6000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // 遮罩（初始不可交互，show时启用）
    this.overlay = scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.5);
    this.overlay.on('pointerdown', () => this.hide());
    this.container.add(this.overlay);

    // 背景
    const bg = scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 320, 140, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x555577);
    this.container.add(bg);
  }

  show(message: string, onConfirm: () => void, onCancel?: () => void): void {
    this.isOpen = true;
    this.overlay.setInteractive();

    const text = this.scene.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 25, message, {
      fontSize: '14px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5);
    this.container.add(text);

    // 确认按钮
    const confirmBg = this.scene.add.rectangle(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2 + 30, 80, 30, 0x336633)
      .setStrokeStyle(1, 0x55aa55)
      .setInteractive({ useHandCursor: true });
    this.container.add(confirmBg);
    const confirmText = this.scene.add.text(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2 + 30, '确认', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(confirmText);

    // 取消按钮
    const cancelBg = this.scene.add.rectangle(CANVAS_WIDTH / 2 + 50, CANVAS_HEIGHT / 2 + 30, 80, 30, 0x443333)
      .setStrokeStyle(1, 0xaa5555)
      .setInteractive({ useHandCursor: true });
    this.container.add(cancelBg);
    const cancelText = this.scene.add.text(CANVAS_WIDTH / 2 + 50, CANVAS_HEIGHT / 2 + 30, '取消', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(cancelText);

    const close = () => {
      this.hide();
    };

    confirmBg.on('pointerdown', () => { close(); onConfirm(); });
    cancelBg.on('pointerdown', () => { close(); onCancel?.(); });

    this.container.setVisible(true);
  }

  hide(): void {
    // 移除动态创建的元素（保留overlay和bg）
    const children = this.container.list.slice();
    for (let i = children.length - 1; i >= 2; i--) {
      children[i].destroy();
    }
    this.container.setVisible(false);
    this.overlay.disableInteractive();
    this.isOpen = false;
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
