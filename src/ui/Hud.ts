// HUD - 底部栏布局
// 最底部: 经验条
// 倒数第二层: HP(左) | 物品栏(8) | 职业名 | 技能栏(8) | MP(右)

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { getExpRequired } from '@/config/constants';
import type { Character } from '@/config/types';
import { BOTTOM_HUD_LAYOUT } from './BottomHudLayout';

export class Hud {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  private hpBarBg: Phaser.GameObjects.Arc;
  private hpBarFill: Phaser.GameObjects.Arc;
  private hpText: Phaser.GameObjects.Text;
  private hpMask: Phaser.GameObjects.Graphics;

  private mpBarBg: Phaser.GameObjects.Arc;
  private mpBarFill: Phaser.GameObjects.Arc;
  private mpText: Phaser.GameObjects.Text;
  private mpMask: Phaser.GameObjects.Graphics;

  private classText: Phaser.GameObjects.Text;
  private expBarBg: Phaser.GameObjects.Rectangle;
  private expBarFill: Phaser.GameObjects.Rectangle;
  private expText: Phaser.GameObjects.Text;

  private orbSize = BOTTOM_HUD_LAYOUT.orbSize;
  private hpX = BOTTOM_HUD_LAYOUT.hpOrbX;
  private mpX = BOTTOM_HUD_LAYOUT.mpOrbX;
  private orbY = BOTTOM_HUD_LAYOUT.orbY;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    // ===== 暗黑地牢风格底部面板 =====
    const panel = scene.add.rectangle(
      CANVAS_WIDTH / 2,
      BOTTOM_HUD_LAYOUT.panelY + BOTTOM_HUD_LAYOUT.panelHeight / 2,
      CANVAS_WIDTH - 24,
      BOTTOM_HUD_LAYOUT.panelHeight,
      0x120d0b,
      0.88,
    ).setStrokeStyle(2, 0x5b3a20);
    this.container.add(panel);

    const topTrim = scene.add.rectangle(CANVAS_WIDTH / 2, BOTTOM_HUD_LAYOUT.panelY + 5, CANVAS_WIDTH - 42, 2, 0xa06a2a, 0.75);
    this.container.add(topTrim);

    // ===== HP血球（左侧）=====
    this.hpBarBg = scene.add.circle(this.hpX, this.orbY, this.orbSize / 2, 0x260707, 0.98)
      .setStrokeStyle(3, 0x7a3a23);
    this.container.add(this.hpBarBg);

    this.hpBarFill = scene.add.circle(this.hpX, this.orbY, this.orbSize / 2 - 5, 0xc42d2d, 0.9)
      .setStrokeStyle(1, 0xff6b4a, 0.45);
    this.container.add(this.hpBarFill);

    // HP遮罩 - 从上往下缩减（mask图形不渲染，只用于裁剪）
    this.hpMask = new Phaser.GameObjects.Graphics(scene);
    this.hpBarFill.setMask(this.hpMask.createGeometryMask());

    this.hpText = scene.add.text(this.hpX, this.orbY, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.hpText);

    // ===== MP法球（右侧）=====
    this.mpBarBg = scene.add.circle(this.mpX, this.orbY, this.orbSize / 2, 0x081126, 0.98)
      .setStrokeStyle(3, 0x284a85);
    this.container.add(this.mpBarBg);

    this.mpBarFill = scene.add.circle(this.mpX, this.orbY, this.orbSize / 2 - 5, 0x2d6fd3, 0.9)
      .setStrokeStyle(1, 0x72b7ff, 0.45);
    this.container.add(this.mpBarFill);

    // MP遮罩 - 从上往下缩减（mask图形不渲染，只用于裁剪）
    this.mpMask = new Phaser.GameObjects.Graphics(scene);
    this.mpBarFill.setMask(this.mpMask.createGeometryMask());

    this.mpText = scene.add.text(this.mpX, this.orbY, '', {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.mpText);

    // 职业文本（HotBar和SkillBar中间）
    this.classText = scene.add.text(BOTTOM_HUD_LAYOUT.classTextX, BOTTOM_HUD_LAYOUT.classTextY + 1, '', {
      fontSize: '12px',
      color: '#d6b56d',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.classText);

    const classDivider = scene.add.text(BOTTOM_HUD_LAYOUT.classTextX, BOTTOM_HUD_LAYOUT.classTextY + 15, '职业', {
      fontSize: '8px',
      color: '#8b7651',
    }).setOrigin(0.5);
    this.container.add(classDivider);

    // ===== 经验条（最底部，全屏宽度）=====
    const expY = BOTTOM_HUD_LAYOUT.expY;

    this.expBarBg = scene.add.rectangle(0, expY, CANVAS_WIDTH, 8, 0x120d0b)
      .setOrigin(0, 0);
    this.container.add(this.expBarBg);

    this.expBarFill = scene.add.rectangle(0, expY, 0, 8, 0xb78937)
      .setOrigin(0, 0);
    this.container.add(this.expBarFill);

    this.expText = scene.add.text(CANVAS_WIDTH / 2, expY + 4, '', {
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.container.add(this.expText);
  }

  update(character: Character): void {
    const className = character.class === 'warrior' ? '战士' : '法师';
    this.classText.setText(className);

    const maxHp = character.class === 'warrior' ? 100 + (character.allocatedStats.stamina) * 20 : 60 + (character.allocatedStats.stamina) * 20;
    const currentHp = Math.min(character.stats.hp, maxHp);
    const hpFill = maxHp > 0 ? Math.max(0, currentHp / maxHp) : 0;
    this.updateOrbMask(this.hpMask, this.hpX, this.orbY, hpFill);
    this.hpText.setText(`${Math.floor(currentHp)}/${maxHp}`);

    const maxMp = character.class === 'warrior' ? 30 + (character.allocatedStats.spirit) * 15 : 80 + (character.allocatedStats.spirit) * 15;
    const currentMp = Math.min(character.stats.mp, maxMp);
    const mpFill = maxMp > 0 ? Math.max(0, currentMp / maxMp) : 0;
    this.updateOrbMask(this.mpMask, this.mpX, this.orbY, mpFill);
    this.mpText.setText(`${Math.floor(currentMp)}/${maxMp}`);

    const expForNext = getExpRequired(character.level);
    const expFill = expForNext > 0 ? Math.min(1, character.experience / expForNext) : 0;
    this.expBarFill.setSize(Math.max(0, CANVAS_WIDTH * expFill), 8);
    this.expText.setText(`Lv.${character.level}  ${character.experience}/${expForNext}`);
  }

  /** 更新血球/蓝球遮罩，实现从上往下缩减效果 */
  private updateOrbMask(mask: Phaser.GameObjects.Graphics, cx: number, cy: number, fillRatio: number): void {
    const r = this.orbSize / 2;
    mask.clear();
    mask.fillStyle(0xffffff);
    // 遮罩矩形从 orb 顶部往下延伸，fillRatio=1 时覆盖整个圆，fillRatio=0 时只露出底部一小条
    const maskTop = cy - r;
    const maskBottom = cy + r;
    const maskHeight = (maskBottom - maskTop) * fillRatio;
    mask.fillRect(cx - r, maskTop, this.orbSize, maskHeight);
  }

  destroy(): void {
    this.container.destroy(true);
    this.hpMask?.destroy();
    this.mpMask?.destroy();
  }
}
