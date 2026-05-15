// 商店界面 - 买卖列表、价格显示、购买确认

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import type { Character } from '@/config/types';

export class ShopPanel extends BasePanel {
  private goldText!: Phaser.GameObjects.Text;
  private itemList: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const panelW = 400;
    const panelH = 350;
    const px = CANVAS_WIDTH / 2 - panelW / 2;
    const py = CANVAS_HEIGHT / 2 - panelH / 2;

    const bg = this.scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x5555aa);
    this.container.add(bg);

    const title = this.scene.add.text(CANVAS_WIDTH / 2, py + 20, '商店', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    this.goldText = this.scene.add.text(CANVAS_WIDTH / 2, py + 45, '金币: 0', {
      fontSize: '12px', color: '#ffdd44',
    }).setOrigin(0.5);
    this.container.add(this.goldText);

    const closeBtn = this.scene.add.text(px + panelW - 20, py + 10, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);
  }

  update(character: Character): void {
    this.goldText?.setText(`金币: ${character.gold}`);
  }
}
