// 技能栏 - 底部右侧，快捷键1~8，时钟式冷却动画

import Phaser from 'phaser';
import { SKILL_BAR_SLOTS } from '@/config/constants';
import type { SkillSlot } from '@/config/types';
import { ALL_SKILLS } from '@/data/skills';
import { BOTTOM_HUD_LAYOUT, getSkillBarSlotPosition } from './BottomHudLayout';

export class SkillBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private slots: Phaser.GameObjects.Container[] = [];
  private cooldownGraphics: Phaser.GameObjects.Graphics[] = [];
  private keyTexts: Phaser.GameObjects.Text[] = [];
  private slotSize = BOTTOM_HUD_LAYOUT.slotSize;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    for (let i = 0; i < SKILL_BAR_SLOTS; i++) {
      const { x, y } = getSkillBarSlotPosition(i);
      const slotContainer = this.scene.add.container(x, y);

      // 槽位背景
      const bg = this.scene.add.rectangle(0, 0, this.slotSize, this.slotSize, 0x17131b, 0.95);
      bg.setStrokeStyle(2, 0x7b552a);
      slotContainer.add(bg);

      const inner = this.scene.add.rectangle(0, 0, this.slotSize - 6, this.slotSize - 6, 0x20213a, 0.75);
      inner.setStrokeStyle(1, 0x2f3d86, 0.6);
      slotContainer.add(inner);

      // 技能名
      const nameText = this.scene.add.text(0, -2, '', {
        fontSize: '9px', color: '#d7d0bf',
      }).setOrigin(0.5);
      slotContainer.add(nameText);
      this.keyTexts.push(nameText);

      // 快捷键提示
      const keyLabel = this.scene.add.text(0, this.slotSize / 2 - 6, BOTTOM_HUD_LAYOUT.skillBarKeyLabels[i] ?? `${i + 1}`, {
        fontSize: '8px', color: '#8b7651',
      }).setOrigin(0.5);
      slotContainer.add(keyLabel);

      // 冷却扇形遮罩（用 Graphics 绘制从满到空的扇形）
      const cdGraphics = this.scene.add.graphics();
      cdGraphics.setVisible(false);
      slotContainer.add(cdGraphics);
      this.cooldownGraphics.push(cdGraphics);

      this.container.add(slotContainer);
      this.slots.push(slotContainer);
    }
  }

  update(skills: SkillSlot[]): void {
    // 先清空所有槽位，防止残留旧文本
    for (let i = 0; i < SKILL_BAR_SLOTS; i++) {
      this.keyTexts[i].setText('');
      this.cooldownGraphics[i].setVisible(false);
    }
    // 再根据当前skills设置
    for (let i = 0; i < Math.min(skills.length, SKILL_BAR_SLOTS); i++) {
      const skill = skills[i];
      if (!skill) continue;
      const nameText = this.keyTexts[i];
      const cdGfx = this.cooldownGraphics[i];
      const skillData = ALL_SKILLS.find(s => s.id === skill.skillId);
      nameText.setText(skillData ? skillData.name.slice(0, 2) : skill.skillId.slice(0, 2));
      nameText.setColor('#ffffff');

      if (skill.cooldownRemaining > 0 && skillData?.cooldown) {
        const ratio = skill.cooldownRemaining / skillData.cooldown;
        this.drawCooldownPie(cdGfx, ratio);
        cdGfx.setVisible(true);
      }
    }
  }

  /**
   * 绘制冷却扇形：从12点方向顺时针填满，冷却越久扇形越大
   * ratio = cooldownRemaining / maxCooldown (0~1)
   * ratio=1 → 满圆（全遮罩），ratio=0 → 无遮罩
   */
  private drawCooldownPie(gfx: Phaser.GameObjects.Graphics, ratio: number): void {
    gfx.clear();
    if (ratio <= 0) return;

    const r = this.slotSize / 2;
    const cx = 0;
    const cy = 0;

    gfx.fillStyle(0x000000, 0.65);
    gfx.beginPath();
    gfx.moveTo(cx, cy);

    // 从12点方向（-π/2）顺时针画扇形
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * ratio;

    // 分段画弧保证平滑
    const segments = Math.max(1, Math.ceil(ratio * 24));
    const step = (Math.PI * 2 * ratio) / segments;

    for (let s = 0; s <= segments; s++) {
      const angle = startAngle + step * s;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      gfx.lineTo(px, py);
    }

    gfx.closePath();
    gfx.fillPath();
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
