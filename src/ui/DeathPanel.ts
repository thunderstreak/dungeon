// 死亡界面 - 死亡动画、惩罚结算、复活选择

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';

export class DeathPanel extends BasePanel {
  onRevive: (() => void) | null = null;
  onReturnTown: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    const bg = this.scene.add.rectangle(cx, cy, 350, 250, 0x2a0a0a, 0.95);
    bg.setStrokeStyle(2, 0xaa3333);
    this.container.add(bg);

    const title = this.scene.add.text(cx, cy - 90, '你被击败了', {
      fontSize: '18px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // 返回城镇按钮
    const townBtn = this.scene.add.rectangle(cx, cy + 20, 160, 36, 0x334466);
    townBtn.setStrokeStyle(1, 0x5577aa);
    townBtn.setInteractive({ useHandCursor: true });
    townBtn.on('pointerdown', () => {
      this.hide();
      this.onReturnTown?.();
    });
    this.container.add(townBtn);

    const townText = this.scene.add.text(cx, cy + 20, '返回城镇', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(townText);
  }

  showWithPenalty(expLoss: number, goldLoss: number): void {
    this.show();
    // 可以在这里更新惩罚显示
  }
}
