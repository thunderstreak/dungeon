// HUD - 底部栏布局（匹配设计文档）
// [HP] [技能栏×8] [物品栏×8] [MP]
// [Lv.X ████████████████████████████ 经验: xxx/xxx]

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { getExpRequired } from '@/config/constants';
import type { Character } from '@/config/types';

export class Hud {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  // 底部栏
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private mpBarBg: Phaser.GameObjects.Rectangle;
  private mpBarFill: Phaser.GameObjects.Rectangle;
  private mpText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private expBarBg: Phaser.GameObjects.Rectangle;
  private expBarFill: Phaser.GameObjects.Rectangle;
  private expText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;

  // 技能栏占位
  private skillSlots: Phaser.GameObjects.Rectangle[] = [];
  private skillTexts: Phaser.GameObjects.Text[] = [];

  // 物品栏占位
  private itemSlots: Phaser.GameObjects.Rectangle[] = [];
  private itemTexts: Phaser.GameObjects.Text[] = [];

  private barWidth = 180;
  private barHeight = 14;
  private slotSize = 32;
  private slotGap = 4;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    const bottomY = CANVAS_HEIGHT - 10;

    // ===== 底部栏 =====

    // HP条（左侧）
    const hpX = 10;
    const hpY = bottomY - 50;

    this.hpBarBg = scene.add.rectangle(hpX, hpY, this.barWidth, this.barHeight, 0x333333)
      .setOrigin(0, 0);
    this.container.add(this.hpBarBg);

    this.hpBarFill = scene.add.rectangle(hpX + 1, hpY + 1, this.barWidth - 2, this.barHeight - 2, 0xcc3333)
      .setOrigin(0, 0);
    this.container.add(this.hpBarFill);

    this.hpText = scene.add.text(hpX + this.barWidth / 2, hpY + this.barHeight / 2, '', {
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(this.hpText);

    // MP条（右侧）
    const mpX = CANVAS_WIDTH - 10 - this.barWidth;
    const mpY = bottomY - 50;

    this.mpBarBg = scene.add.rectangle(mpX, mpY, this.barWidth, this.barHeight, 0x333333)
      .setOrigin(0, 0);
    this.container.add(this.mpBarBg);

    this.mpBarFill = scene.add.rectangle(mpX + 1, mpY + 1, this.barWidth - 2, this.barHeight - 2, 0x3366cc)
      .setOrigin(0, 0);
    this.container.add(this.mpBarFill);

    this.mpText = scene.add.text(mpX + this.barWidth / 2, mpY + this.barHeight / 2, '', {
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(this.mpText);

    // 技能栏 1-8（HP右侧）
    const skillStartX = hpX + this.barWidth + 15;
    for (let i = 0; i < 8; i++) {
      const sx = skillStartX + i * (this.slotSize + this.slotGap);
      const sy = bottomY - 50 - (this.slotSize - this.barHeight) / 2;

      const slot = scene.add.rectangle(sx, sy, this.slotSize, this.slotSize, 0x222233, 0.8)
        .setStrokeStyle(1, 0x555566)
        .setOrigin(0, 0);
      this.container.add(slot);
      this.skillSlots.push(slot);

      const keyText = scene.add.text(sx + this.slotSize / 2, sy + this.slotSize / 2, `${i + 1}`, {
        fontSize: '10px',
        color: '#888888',
      }).setOrigin(0.5);
      this.container.add(keyText);
      this.skillTexts.push(keyText);
    }

    // 物品栏 1-8（MP左侧）
    const itemEndX = mpX - 15;
    for (let i = 7; i >= 0; i--) {
      const ix = itemEndX - (7 - i) * (this.slotSize + this.slotGap) - this.slotSize;
      const iy = bottomY - 50 - (this.slotSize - this.barHeight) / 2;

      const slot = scene.add.rectangle(ix, iy, this.slotSize, this.slotSize, 0x222233, 0.8)
        .setStrokeStyle(1, 0x555566)
        .setOrigin(0, 0);
      this.container.add(slot);
      this.itemSlots.push(slot);

      const keyText = scene.add.text(ix + this.slotSize / 2, iy + this.slotSize / 2, `${i + 1}`, {
        fontSize: '10px',
        color: '#888888',
      }).setOrigin(0.5);
      this.container.add(keyText);
      this.itemTexts.push(keyText);
    }

    // 等级文本（左上角）
    this.levelText = scene.add.text(10, 10, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.container.add(this.levelText);

    // 金币文本（等级下方）
    this.goldText = scene.add.text(10, 30, '', {
      fontSize: '12px',
      color: '#ffdd44',
    });
    this.container.add(this.goldText);

    // ===== 经验条（最底部，全屏宽度）=====
    const expY = bottomY - 5;

    this.expBarBg = scene.add.rectangle(0, expY, CANVAS_WIDTH, 8, 0x222222)
      .setOrigin(0, 0);
    this.container.add(this.expBarBg);

    this.expBarFill = scene.add.rectangle(0, expY, 0, 8, 0x4488ff)
      .setOrigin(0, 0);
    this.container.add(this.expBarFill);

    this.expText = scene.add.text(CANVAS_WIDTH / 2, expY + 4, '', {
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(this.expText);
  }

  update(character: Character): void {
    // 等级
    const className = character.class === 'warrior' ? '战士' : '法师';
    this.levelText.setText(`Lv.${character.level} ${className}`);

    // HP
    const maxHp = character.class === 'warrior' ? 100 + (character.allocatedStats.stamina) * 20 : 60 + (character.allocatedStats.stamina) * 20;
    const currentHp = Math.min(character.stats.hp, maxHp);
    const hpFill = Math.max(0, currentHp / maxHp);
    this.hpBarFill.setSize(Math.max(0, (this.barWidth - 2) * hpFill), this.barHeight - 2);
    this.hpText.setText(`${Math.floor(currentHp)}/${maxHp}`);

    // MP
    const maxMp = character.class === 'warrior' ? 30 + (character.allocatedStats.spirit) * 15 : 80 + (character.allocatedStats.spirit) * 15;
    const currentMp = Math.min(character.stats.mp, maxMp);
    const mpFill = Math.max(0, currentMp / maxMp);
    this.mpBarFill.setSize(Math.max(0, (this.barWidth - 2) * mpFill), this.barHeight - 2);
    this.mpText.setText(`${Math.floor(currentMp)}/${maxMp}`);

    // 金币
    this.goldText.setText(`金币: ${character.gold}`);

    // 经验条
    const expForNext = getExpRequired(character.level);
    const expFill = expForNext > 0 ? Math.min(1, character.experience / expForNext) : 0;
    this.expBarFill.setSize(Math.max(0, CANVAS_WIDTH * expFill), 8);
    this.expText.setText(`Lv.${character.level}  ${character.experience}/${expForNext}`);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
