// 技能面板 - 展示已学习/可学习/未解锁技能

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import { gameState } from '@/state/GameState';
import { ALL_SKILLS } from '@/data/skills';
import type { SkillData } from '@/data/skills';
import { getLearnableSkills, learnSkill, upgradeSkill } from '@/systems/SkillSystem';
import { Tooltip } from './Tooltip';

export class SkillPanel extends BasePanel {
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScroll = 0;
  private tooltip!: Tooltip;
  private contentBottom = 0;

  private panelW = 380;
  private panelH = 420;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.tooltip = new Tooltip(scene);
    this.createContent();
  }

  private createContent(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const panelX = cx - this.panelW / 2;
    const panelY = cy - this.panelH / 2;

    // 面板背景
    const bg = this.scene.add.rectangle(cx, cy, this.panelW, this.panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x4444aa);
    this.container.add(bg);

    // 关闭按钮
    const closeBtn = this.scene.add.rectangle(cx + 175, cy - 190, 24, 24, 0x663333, 0.8);
    closeBtn.setStrokeStyle(1, 0xaa5555);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x884444));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x663333));
    this.container.add(closeBtn);

    const closeText = this.scene.add.text(cx + 175, cy - 190, 'X', {
      fontSize: '14px', color: '#ff8888', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(closeText);

    // 标题
    const title = this.scene.add.text(cx, cy - 190, '技能 (K)', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // 可滚动内容容器
    this.scrollContainer = this.scene.add.container(0, 0);
    this.container.add(this.scrollContainer);

    // 创建遮罩
    const maskShape = this.scene.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(panelX + 5, panelY + 30, this.panelW - 10, this.panelH - 40);
    const mask = maskShape.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // 滚轮支持
    this.scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (!this.isOpen) return;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScroll);
      this.scrollContainer.y = -this.scrollY;
    });
  }

  show(): void {
    this.scrollY = 0;
    if (this.scrollContainer) this.scrollContainer.y = 0;
    this.populateSkills();
    super.show();
  }

  hide(): void {
    this.tooltip.hide();
    super.hide();
  }

  private populateSkills(): void {
    // 清空旧内容
    this.scrollContainer.removeAll(true);

    const char = gameState.getCharacter();
    const cx = CANVAS_WIDTH / 2;
    const startY = CANVAS_HEIGHT / 2 - 160;
    let y = startY;

    // 获取各类技能
    const classSkills = ALL_SKILLS.filter(s =>
      !s.classRequirement || s.classRequirement === char.class,
    );
    const learnedSlots = char.skills;
    const learnedIds = new Set(learnedSlots.map(s => s.skillId));
    const learnable = getLearnableSkills(char);

    const learned = classSkills.filter(s => learnedIds.has(s.id));
    const available = learnable;
    const locked = classSkills.filter(s => !learnedIds.has(s.id) && !learnable.includes(s));

    // === 已学习 ===
    if (learned.length > 0) {
      y = this.addSectionTitle(cx, y, '已学习', '#ffdd44');
      for (const skill of learned) {
        const slot = learnedSlots.find(s => s.skillId === skill.id)!;
        y = this.addSkillRow(cx, y, skill, {
          levelText: `Lv.${slot.level}/${skill.maxLevel}`,
          canUpgrade: slot.level < skill.maxLevel && char.skillPoints > 0,
          onUpgrade: () => {
            upgradeSkill(char, skill.id);
            this.populateSkills();
          },
        });
      }
    }

    // === 可学习 ===
    if (available.length > 0) {
      y = this.addSectionTitle(cx, y, '可学习', '#44ff88');
      for (const skill of available) {
        y = this.addSkillRow(cx, y, skill, {
          levelText: `Lv.${skill.unlockLevel}解锁`,
          canLearn: true,
          onLearn: () => {
            learnSkill(char, skill.id);
            this.populateSkills();
          },
        });
      }
    }

    // === 未解锁 ===
    if (locked.length > 0) {
      y = this.addSectionTitle(cx, y, '未解锁', '#666688');
      for (const skill of locked) {
        const reqText = skill.classRequirement && skill.classRequirement !== char.class
          ? `需要${skill.classRequirement === 'warrior' ? '战士' : '法师'}职业`
          : `需要Lv.${skill.unlockLevel}`;
        y = this.addSkillRow(cx, y, skill, {
          levelText: reqText,
          locked: true,
        });
      }
    }

    // 计算滚动范围
    this.contentBottom = y;
    const visibleTop = CANVAS_HEIGHT / 2 - this.panelH / 2 + 30;
    const visibleBottom = CANVAS_HEIGHT / 2 + this.panelH / 2 - 10;
    const visibleHeight = visibleBottom - visibleTop;
    this.maxScroll = Math.max(0, (this.contentBottom - startY) - visibleHeight);
  }

  private addSectionTitle(cx: number, y: number, text: string, color: string): number {
    const title = this.scene.add.text(cx - 170, y, text, {
      fontSize: '13px', color, fontStyle: 'bold',
    });
    this.scrollContainer.add(title);

    const line = this.scene.add.rectangle(cx, y + 14, 340, 1, 0x333355);
    this.scrollContainer.add(line);

    return y + 28;
  }

  private addSkillRow(
    cx: number, y: number, skill: SkillData, opts: {
      levelText: string;
      canUpgrade?: boolean;
      canLearn?: boolean;
      locked?: boolean;
      onUpgrade?: () => void;
      onLearn?: () => void;
    },
  ): number {
    const rowX = cx - 170;
    const rowW = 340;
    const rowH = 26;

    // 行背景（可交互区域）
    const rowBg = this.scene.add.rectangle(cx, y + 6, rowW, rowH, 0x000000, 0);
    rowBg.setInteractive({ useHandCursor: !opts.locked });
    this.scrollContainer.add(rowBg);

    // 悬停效果
    rowBg.on('pointerover', () => {
      if (!opts.locked) rowBg.setFillStyle(0x333355, 0.5);
      const tooltip = (this.scene as any).tooltip ?? this.tooltip;
      tooltip.showSkill(skill, rowBg.x + rowW / 2 + 10, rowBg.y);
    });
    rowBg.on('pointerout', () => {
      rowBg.setFillStyle(0x000000, 0);
      const tooltip = (this.scene as any).tooltip ?? this.tooltip;
      tooltip.hide();
    });

    // 技能名
    const nameColor = opts.locked ? '#555577' : '#ffffff';
    const name = this.scene.add.text(rowX + 4, y + 6, skill.name, {
      fontSize: '12px', color: nameColor,
    }).setOrigin(0, 0.5);
    this.scrollContainer.add(name);

    // 等级/需求文本
    const lvlColor = opts.locked ? '#444466' : '#aaaaaa';
    const lvl = this.scene.add.text(rowX + 120, y + 6, opts.levelText, {
      fontSize: '11px', color: lvlColor,
    }).setOrigin(0, 0.5);
    this.scrollContainer.add(lvl);

    // 操作按钮
    if (opts.canUpgrade && opts.onUpgrade) {
      const btn = this.scene.add.rectangle(rowX + rowW - 30, y + 6, 50, 20, 0x334433);
      btn.setStrokeStyle(1, 0x55aa55);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', opts.onUpgrade);
      btn.on('pointerover', () => btn.setFillStyle(0x446644));
      btn.on('pointerout', () => btn.setFillStyle(0x334433));
      this.scrollContainer.add(btn);

      const btnText = this.scene.add.text(rowX + rowW - 30, y + 6, '升级', {
        fontSize: '10px', color: '#88ff88',
      }).setOrigin(0.5);
      this.scrollContainer.add(btnText);
    } else if (opts.canLearn && opts.onLearn) {
      const btn = this.scene.add.rectangle(rowX + rowW - 30, y + 6, 50, 20, 0x334433);
      btn.setStrokeStyle(1, 0x55aa55);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', opts.onLearn);
      btn.on('pointerover', () => btn.setFillStyle(0x446644));
      btn.on('pointerout', () => btn.setFillStyle(0x334433));
      this.scrollContainer.add(btn);

      const btnText = this.scene.add.text(rowX + rowW - 30, y + 6, '学习', {
        fontSize: '10px', color: '#88ff88',
      }).setOrigin(0.5);
      this.scrollContainer.add(btnText);
    }

    return y + rowH + 2;
  }

  destroy(): void {
    this.tooltip?.destroy();
    super.destroy();
  }
}
