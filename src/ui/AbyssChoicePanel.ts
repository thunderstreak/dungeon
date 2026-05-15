// 深渊模式选择界面 - 触发弹窗、进入深渊/普通地牢选择

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';

export class AbyssChoicePanel extends BasePanel {
  onChooseAbyss: (() => void) | null = null;
  onChooseNormal: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    const bg = this.scene.add.rectangle(cx, cy, 400, 250, 0x1a0a2a, 0.95);
    bg.setStrokeStyle(2, 0x8833aa);
    this.container.add(bg);

    const title = this.scene.add.text(cx, cy - 90, '深渊模式已触发!', {
      fontSize: '16px', color: '#aa44ff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    const desc = this.scene.add.text(cx, cy - 60, '难度大幅提升，但掉落更丰厚', {
      fontSize: '11px', color: '#8866aa',
    }).setOrigin(0.5);
    this.container.add(desc);

    // 深渊按钮
    const abyssBtn = this.scene.add.rectangle(cx - 80, cy + 20, 140, 40, 0x442266);
    abyssBtn.setStrokeStyle(2, 0xaa44ff);
    abyssBtn.setInteractive({ useHandCursor: true });
    abyssBtn.on('pointerdown', () => {
      this.hide();
      this.onChooseAbyss?.();
    });
    this.container.add(abyssBtn);

    const abyssText = this.scene.add.text(cx - 80, cy + 20, '进入深渊', {
      fontSize: '13px', color: '#cc88ff',
    }).setOrigin(0.5);
    this.container.add(abyssText);

    // 普通按钮
    const normalBtn = this.scene.add.rectangle(cx + 80, cy + 20, 140, 40, 0x334466);
    normalBtn.setStrokeStyle(1, 0x5577aa);
    normalBtn.setInteractive({ useHandCursor: true });
    normalBtn.on('pointerdown', () => {
      this.hide();
      this.onChooseNormal?.();
    });
    this.container.add(normalBtn);

    const normalText = this.scene.add.text(cx + 80, cy + 20, '普通模式', {
      fontSize: '13px', color: '#aaaacc',
    }).setOrigin(0.5);
    this.container.add(normalText);
  }
}
