// 修理界面 - 耐久显示、修理费用

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';

export class RepairPanel extends BasePanel {
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const bg = this.scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 350, 250, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x5555aa);
    this.container.add(bg);

    const title = this.scene.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 105, '装备修理', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    const closeBtn = this.scene.add.text(CANVAS_WIDTH / 2 + 155, CANVAS_HEIGHT / 2 - 115, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);
  }
}
