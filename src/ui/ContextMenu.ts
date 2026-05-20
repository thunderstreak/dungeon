// 右键上下文菜单 - 在鼠标位置弹出操作选项

import Phaser from 'phaser';

export interface ContextMenuOption {
  label: string;
  color?: string;
  callback: () => void;
}

export class ContextMenu {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  isOpen = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = this.createContainer();
  }

  private createContainer(): Phaser.GameObjects.Container {
    const c = this.scene.add.container(0, 0);
    c.setDepth(7000);
    c.setScrollFactor(0);
    c.setVisible(false);
    return c;
  }

  show(x: number, y: number, options: ContextMenuOption[]): void {
    this.hide();
    this.isOpen = true;

    const optH = 28;
    const padY = 6;
    const menuW = 100;
    const menuH = options.length * optH + padY * 2;

    // 边界检查，防止菜单超出画面
    const cam = this.scene.cameras.main;
    const finalX = Math.min(x, cam.width - menuW - 4);
    const finalY = Math.min(y, cam.height - menuH - 4);

    // 背景
    const bg = this.scene.add.rectangle(
      finalX + menuW / 2, finalY + menuH / 2,
      menuW, menuH, 0x1a1a2e, 0.95,
    );
    bg.setStrokeStyle(1, 0x555577);
    this.container.add(bg);

    // 选项
    options.forEach((opt, i) => {
      const oy = finalY + padY + i * optH + optH / 2;

      const optBg = this.scene.add.rectangle(
        finalX + menuW / 2, oy,
        menuW - 4, optH - 2, 0x222244, 0,
      );
      optBg.setInteractive({ useHandCursor: true });

      optBg.on('pointerover', () => {
        optBg.setFillStyle(0x334466, 1);
      });
      optBg.on('pointerout', () => {
        optBg.setFillStyle(0x222244, 0);
      });
      optBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.hide();
        opt.callback();
      });

      const text = this.scene.add.text(finalX + menuW / 2, oy, opt.label, {
        fontSize: '12px',
        color: opt.color ?? '#cccccc',
      }).setOrigin(0.5);

      this.container.add(optBg);
      this.container.add(text);
    });

    this.container.setVisible(true);

    // 点击外部关闭 - 延迟一帧注册，避免当前右键事件立即触发关闭
    this.scene.time.delayedCall(0, () => {
      this.scene.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.isOpen) return;
        const bounds = this.container.getBounds();
        if (!bounds.contains(pointer.x, pointer.y)) {
          this.hide();
        }
      });
    });
  }

  hide(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    // 销毁整个容器及其所有子对象，确保无残留
    this.container.destroy(true);
    // 重建容器供下次使用
    this.container = this.createContainer();
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
