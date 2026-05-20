// 背包界面 - 4分类标签页、物品列表、hover详情预览

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import type { Character, Equipment, InventoryCategory, InventorySlot } from '@/config/types';
import { getEquipmentById } from '@/data/equipment';
import { equipItem } from '@/systems/EquipmentSystem';
import { removeItem, addEquipment } from '@/systems/InventorySystem';
import { gameState } from '@/state/GameState';
import { ContextMenu } from './ContextMenu';
import { GroundLoot } from '@/entities/GroundLoot';
import type { GroundLootItem } from '@/entities/GroundLoot';
import type { EquipmentRarity } from '@/config/types';
import { showNotification } from './NotificationToast';

const CATEGORIES: InventoryCategory[] = ['equipment', 'consumable', 'material', 'other'];
const CATEGORY_NAMES: Record<InventoryCategory, string> = {
  equipment: '装备', consumable: '消耗品', material: '材料', other: '其他',
};

const RARITY_COLORS: Record<string, string> = {
  white: '#cccccc', blue: '#4488ff', purple: '#aa44ff', pink: '#ff44aa', orange: '#ff8800',
};

export class InventoryPanel extends BasePanel {
  private categoryBtns: Phaser.GameObjects.Rectangle[] = [];
  private categoryTexts: Phaser.GameObjects.Text[] = [];
  private slotBgs: Phaser.GameObjects.Rectangle[] = [];
  private slotTexts: Phaser.GameObjects.Text[] = [];
  private countTexts: Phaser.GameObjects.Text[] = [];
  private currentCategory: InventoryCategory = 'equipment';
  private goldText!: Phaser.GameObjects.Text;
  private slots: InventorySlot[] = [];
  private itemCount = 20;
  private contextMenu: ContextMenu;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.contextMenu = new ContextMenu(scene);
    this.createContent();
  }

  private createContent(): void {
    const panelW = 400;
    const panelH = 350;
    const px = CANVAS_WIDTH / 2 - panelW / 2;
    const py = CANVAS_HEIGHT / 2 - panelH / 2;
    const cx = CANVAS_WIDTH / 2;

    // 面板背景
    const bg = this.scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x5555aa);
    this.container.add(bg);

    // 标题
    const title = this.scene.add.text(CANVAS_WIDTH / 2, py + 20, '背包', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // 分类标签
    const tabW = 70;
    const tabGap = 10;
    const totalTabW = CATEGORIES.length * tabW + (CATEGORIES.length - 1) * tabGap;
    const tabStartX = cx - totalTabW / 2 + tabW / 2;
    CATEGORIES.forEach((cat, i) => {
      const btnX = tabStartX + i * (tabW + tabGap);
      const btnY = py + 50;
      const isSelected = cat === this.currentCategory;

      const btn = this.scene.add.rectangle(btnX, btnY, 70, 24, isSelected ? 0x445588 : 0x333355);
      btn.setStrokeStyle(1, isSelected ? 0x7799cc : 0x5555aa);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.switchCategory(cat));

      const text = this.scene.add.text(btnX, btnY, CATEGORY_NAMES[cat], {
        fontSize: '11px', color: isSelected ? '#ffffff' : '#aaaacc',
      }).setOrigin(0.5);

      this.container.add(btn);
      this.container.add(text);
      this.categoryBtns.push(btn);
      this.categoryTexts.push(text);
    });

    // 物品格子 (5列×4行)
    const cols = 5;
    const slotSize = 48;
    const gap = 4;
    const gridW = cols * slotSize + (cols - 1) * gap;
    const startX = px + (panelW - gridW) / 2;
    const startY = py + 80;

    for (let i = 0; i < this.itemCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = startX + col * (slotSize + gap);
      const sy = startY + row * (slotSize + gap);
      const cx = sx + slotSize / 2;
      const cy = sy + slotSize / 2;

      // 槽位背景
      const slotBg = this.scene.add.rectangle(cx, cy, slotSize, slotSize, 0x222244, 0.8);
      slotBg.setStrokeStyle(1, 0x444466);
      slotBg.setInteractive({ useHandCursor: true });

      const idx = i;
      slotBg.on('pointerover', () => {
        const slot = this.slots[idx];
        if (slot?.item) {
          const tooltip = (this.scene as any).tooltip;
          if (tooltip) {
            if (slot.item.type === 'equipment') {
              let equip = slot.equipmentData;
              if (!equip) {
                const template = getEquipmentById(slot.item.id);
                if (template) {
                  equip = {
                    ...template,
                    enhancementLevel: 0,
                    durability: template.maxDurability,
                  } as Equipment;
                }
              }
              if (equip) {
                tooltip.showEquipment(equip, cx, cy);
              } else {
                tooltip.showItem(slot.item, slot.count, cx, cy);
              }
            } else {
              tooltip.showItem(slot.item, slot.count, cx, cy);
            }
          }
        }
      });
      slotBg.on('pointerout', () => {
        (this.scene as any).tooltip?.hide();
      });
      // 点击穿戴装备
      slotBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // 如果右键菜单已打开，不处理slot点击
        if (this.contextMenu.isOpen) return;

        const slot = this.slots[idx];
        if (!slot?.item) return;

        // 右键弹出上下文菜单
        if (pointer.button === 2) {
          this.showContextMenu(pointer.x, pointer.y, slot, idx);
          return;
        }

        // 左键：仅装备类物品可穿脱
        if (slot.item.type !== 'equipment') return;

        const character = gameState.getCharacter();
        if (!character) return;

        let equipment = slot.equipmentData;
        if (!equipment) {
          const template = getEquipmentById(slot.item.id);
          if (template) {
            equipment = {
              ...template,
              enhancementLevel: 0,
              durability: template.maxDurability,
            } as Equipment;
          }
        }
        if (!equipment) return;

        // 如果该槽位已装备相同装备，不做任何操作
        const currentEquipped = character.equipment[equipment.slot];
        if (currentEquipped && currentEquipped.id === equipment.id) return;

        const result = equipItem(character, equipment, equipment.slot);
        if (result.success) {
          removeItem(character, slot.item.id, 1);
          if (result.unequipped) {
            addEquipment(character, result.unequipped);
          }
          this.refreshSlots();
          const uiScene = this.scene.scene.get('UIScene') as any;
          uiScene?.equipmentPanel?.update(character);
        }
      });

      this.container.add(slotBg);
      this.slotBgs.push(slotBg);

      // 物品名
      const text = this.scene.add.text(cx, cy - 2, '', {
        fontSize: '9px', color: '#888888',
      }).setOrigin(0.5);
      this.container.add(text);
      this.slotTexts.push(text);

      // 堆叠数量
      const countText = this.scene.add.text(cx + slotSize / 2 - 4, cy + slotSize / 2 - 6, '', {
        fontSize: '8px', color: '#ffdd44',
      }).setOrigin(1, 1);
      this.container.add(countText);
      this.countTexts.push(countText);
    }

    // 金币
    this.goldText = this.scene.add.text(CANVAS_WIDTH / 2, py + panelH - 25, '金币: 0', {
      fontSize: '12px', color: '#ffdd44',
    }).setOrigin(0.5);
    this.container.add(this.goldText);

    // 关闭按钮
    const closeBtn = this.scene.add.text(px + panelW - 20, py + 10, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);
  }

  show(): void {
    super.show();
    this.refreshSlots();
  }

  hide(): void {
    this.contextMenu.hide();
    super.hide();
  }

  private switchCategory(cat: InventoryCategory): void {
    this.currentCategory = cat;
    CATEGORIES.forEach((c, i) => {
      const selected = c === cat;
      this.categoryBtns[i].fillColor = selected ? 0x445588 : 0x333355;
      this.categoryBtns[i].setStrokeStyle(1, selected ? 0x7799cc : 0x5555aa);
      this.categoryTexts[i].setColor(selected ? '#ffffff' : '#aaaacc');
    });
    this.refreshSlots();
  }

  private showContextMenu(x: number, y: number, slot: InventorySlot, _slotIdx: number): void {
    this.contextMenu.show(x, y, [
      {
        label: '丢弃',
        color: '#ff6666',
        callback: () => this.discardItem(slot),
      },
      {
        label: '关闭',
        callback: () => {},
      },
    ]);
  }

  private discardItem(slot: InventorySlot): void {
    const character = gameState.getCharacter();
    if (!character || !slot.item) return;

    // 获取玩家位置
    const dungeonScene = this.scene.scene.get('DungeonScene') as any;
    const player = dungeonScene?.player;
    if (!player) {
      showNotification(this.scene, '无法丢弃', '#ff6666');
      return;
    }

    const item = slot.item;
    const count = slot.count;
    const rarity = slot.equipmentData?.rarity ?? 'white';

    // 直接清除被点击的槽位（避免removeItem按ID搜索删错槽位）
    slot.item = null;
    slot.count = 0;
    slot.equipmentData = undefined;

    // 构建地面掉落物数据
    const groundItem: GroundLootItem = {
      itemId: item.id,
      name: item.name,
      type: item.type === 'equipment' ? 'equipment' : item.type === 'consumable' ? 'potion' : 'material',
      rarity: rarity as EquipmentRarity,
      count,
    };

    // 在角色当前位置创建地面掉落物
    const loot = new GroundLoot(dungeonScene, groundItem, player.gridX, player.gridY);
    dungeonScene.groundLoots.push(loot);

    this.refreshSlots();
    showNotification(this.scene, `丢弃了 ${item.name}`, '#cccccc');
  }

  private refreshSlots(): void {
    const char = gameState.getCharacter();
    if (!char) return;
    this.slots = char.inventory.categories[this.currentCategory];

    for (let i = 0; i < this.itemCount; i++) {
      const slot = this.slots[i];
      const text = this.slotTexts[i];
      const countText = this.countTexts[i];
      const slotBg = this.slotBgs[i];

      if (slot?.item) {
        const name = slot.item.name.length > 4 ? slot.item.name.slice(0, 4) + '..' : slot.item.name;
        text.setText(name);
        // 装备按稀有度着色
        if (slot.item.type === 'equipment' && slot.equipmentData) {
          text.setColor(RARITY_COLORS[slot.equipmentData.rarity] ?? '#cccccc');
        } else {
          text.setColor('#cccccc');
        }
        countText.setText(slot.item.isStackable && slot.count >= 1 ? `x${slot.count}` : '');
        slotBg.setStrokeStyle(1, 0x555577);
      } else {
        text.setText('');
        countText.setText('');
        slotBg.setStrokeStyle(1, 0x444466);
      }
    }
  }

  update(character: Character): void {
    this.goldText.setText(`金币: ${character.gold}`);
    this.refreshSlots();
  }
}
