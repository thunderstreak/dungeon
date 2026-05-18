// 装备界面 - 角色底板 + 装备槽位环绕布局

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import type { Character, EquipmentSlot } from '@/config/types';
import { unequipItem } from '@/systems/EquipmentSystem';
import { addEquipment } from '@/systems/InventorySystem';
import { gameState } from '@/state/GameState';

/** 槽位定义：slot + 标签 + 相对于角色中心的偏移 */
const EQUIP_SLOTS: { slot: EquipmentSlot; label: string; ox: number; oy: number }[] = [
  { slot: 'helmet',    label: '头盔',   ox: 0,    oy: -100 },
  { slot: 'necklace',  label: '项链',   ox: 0,    oy: -60 },
  { slot: 'armor',     label: '胸甲',   ox: 0,    oy: -20 },
  { slot: 'weapon',    label: '武器',   ox: -90,  oy: -40 },
  { slot: 'shield',    label: '盾牌',   ox: 90,   oy: -40 },
  { slot: 'belt',      label: '腰带',   ox: 0,    oy: 20 },
  { slot: 'bracelet1', label: '手镯1',  ox: -90,  oy: 0 },
  { slot: 'bracelet2', label: '手镯2',  ox: 90,   oy: 0 },
  { slot: 'ring1',     label: '戒指1',  ox: -90,  oy: 40 },
  { slot: 'ring2',     label: '戒指2',  ox: 90,   oy: 40 },
  { slot: 'boots',     label: '鞋子',   ox: 0,    oy: 60 },
  { slot: 'rune',      label: '符文',   ox: 0,    oy: 100 },
];

const SLOT_W = 68;
const SLOT_H = 44;

const RARITY_COLORS: Record<string, string> = {
  white: '#cccccc', blue: '#4488ff', purple: '#aa44ff', pink: '#ff44aa', orange: '#ff8800',
};

export class EquipmentPanel extends BasePanel {
  private slotTexts: Map<EquipmentSlot, Phaser.GameObjects.Text> = new Map();
  private slotBgs: Map<EquipmentSlot, Phaser.GameObjects.Rectangle> = new Map();
  private character: Character | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // 面板背景
    const panelW = 460;
    const panelH = 420;
    const bg = this.scene.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x5555aa);
    this.container.add(bg);

    // 标题
    const title = this.scene.add.text(cx, cy - 190, '装备', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // 关闭按钮
    const closeBtn = this.scene.add.text(cx + panelW / 2 - 20, cy - 190, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);

    // ===== 角色剪影（居中）=====
    this.drawCharacterSilhouette(cx, cy);

    // ===== 装备槽位（环绕角色）=====
    for (const { slot, label, ox, oy } of EQUIP_SLOTS) {
      const sx = cx + ox;
      const sy = cy + oy;

      // 槽位背景
      const slotBg = this.scene.add.rectangle(sx, sy, SLOT_W, SLOT_H, 0x222244, 0.85);
      slotBg.setStrokeStyle(1, 0x444466);
      slotBg.setInteractive({ useHandCursor: true });
      slotBg.on('pointerover', () => {
        const equip = this.character?.equipment[slot];
        if (equip) {
          const tooltip = (this.scene as any).tooltip;
          tooltip?.showEquipment(equip, slotBg.x, slotBg.y);
        }
      });
      slotBg.on('pointerout', () => {
        (this.scene as any).tooltip?.hide();
      });
      slotBg.on('pointerdown', () => {
        const equip = this.character?.equipment[slot];
        if (!equip) return;

        const character = gameState.getCharacter();
        if (!character) return;

        const unequipped = unequipItem(character, slot);
        if (unequipped) {
          addEquipment(character, unequipped);
          this.update(character);
          const uiScene = this.scene.scene.get('UIScene') as any;
          uiScene?.inventoryPanel?.refreshSlots?.();
        }
      });
      this.container.add(slotBg);
      this.slotBgs.set(slot, slotBg);

      // 部位标签（顶部小字）
      const labelText = this.scene.add.text(sx, sy - SLOT_H / 2 + 8, label, {
        fontSize: '8px', color: '#777799',
      }).setOrigin(0.5);
      this.container.add(labelText);

      // 装备名称（中间）
      const itemText = this.scene.add.text(sx, sy + 4, '空', {
        fontSize: '10px', color: '#555555',
      }).setOrigin(0.5);
      this.container.add(itemText);
      this.slotTexts.set(slot, itemText);
    }
  }

  /** 绘制简易角色剪影 */
  private drawCharacterSilhouette(cx: number, cy: number): void {
    const color = 0x334455;
    const alpha = 0.5;

    // 头
    const head = this.scene.add.circle(cx, cy - 80, 18, color, alpha);
    this.container.add(head);

    // 脖子
    const neck = this.scene.add.rectangle(cx, cy - 58, 8, 12, color, alpha);
    this.container.add(neck);

    // 身体
    const body = this.scene.add.rectangle(cx, cy - 20, 40, 60, color, alpha);
    this.container.add(body);

    // 左臂
    const leftArm = this.scene.add.rectangle(cx - 34, cy - 30, 14, 50, color, alpha);
    this.container.add(leftArm);

    // 右臂
    const rightArm = this.scene.add.rectangle(cx + 34, cy - 30, 14, 50, color, alpha);
    this.container.add(rightArm);

    // 左腿
    const leftLeg = this.scene.add.rectangle(cx - 12, cy + 30, 14, 40, color, alpha);
    this.container.add(leftLeg);

    // 右腿
    const rightLeg = this.scene.add.rectangle(cx + 12, cy + 30, 14, 40, color, alpha);
    this.container.add(rightLeg);
  }

  update(character: Character): void {
    this.character = character;
    // 更新装备槽位
    for (const { slot } of EQUIP_SLOTS) {
      const equipped = character.equipment[slot];
      const text = this.slotTexts.get(slot);
      if (!text) continue;

      if (equipped) {
        text.setText(equipped.name.length > 5 ? equipped.name.slice(0, 5) + '..' : equipped.name);
        text.setColor(RARITY_COLORS[equipped.rarity] ?? '#cccccc');
      } else {
        text.setText('空');
        text.setColor('#555555');
      }
    }
  }

  show(): void {
    const character = gameState.getCharacter();
    if (character) {
      this.update(character);
    }
    super.show();
  }
}
