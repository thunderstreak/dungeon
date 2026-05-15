// 物品快捷栏 - 底部左侧，快捷键1~8，堆叠数量

import Phaser from 'phaser';
import { ITEM_BAR_SLOTS } from '@/config/constants';
import type { InventorySlot } from '@/config/types';
import { BOTTOM_HUD_LAYOUT, getHotBarSlotPosition } from './BottomHudLayout';

export class HotBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private slots: Phaser.GameObjects.Container[] = [];
  private nameTexts: Phaser.GameObjects.Text[] = [];
  private countTexts: Phaser.GameObjects.Text[] = [];
  private slotSize = BOTTOM_HUD_LAYOUT.slotSize;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(3000);
    this.container.setScrollFactor(0);

    const keyLabels = BOTTOM_HUD_LAYOUT.hotBarKeyLabels;

    for (let i = 0; i < ITEM_BAR_SLOTS; i++) {
      const { x, y } = getHotBarSlotPosition(i);
      const slotContainer = this.scene.add.container(x, y);

      const bg = this.scene.add.rectangle(0, 0, this.slotSize, this.slotSize, 0x17131b, 0.95);
      bg.setStrokeStyle(2, 0x7b552a);
      slotContainer.add(bg);

      const inner = this.scene.add.rectangle(0, 0, this.slotSize - 6, this.slotSize - 6, 0x2b2118, 0.75);
      inner.setStrokeStyle(1, 0x5f3b22, 0.6);
      slotContainer.add(inner);

      const nameText = this.scene.add.text(0, -2, '', {
        fontSize: '8px', color: '#d7d0bf',
      }).setOrigin(0.5);
      slotContainer.add(nameText);
      this.nameTexts.push(nameText);

      const countText = this.scene.add.text(this.slotSize / 2 - 4, this.slotSize / 2 - 6, '', {
        fontSize: '8px', color: '#ffcf5a',
      }).setOrigin(1, 1);
      slotContainer.add(countText);
      this.countTexts.push(countText);

      const keyLabel = this.scene.add.text(0, this.slotSize / 2 - 6, keyLabels[i] ?? `${i + 1}`, {
        fontSize: '8px', color: '#8b7651',
      }).setOrigin(0.5);
      slotContainer.add(keyLabel);

      this.container.add(slotContainer);
      this.slots.push(slotContainer);
    }
  }

  update(items: InventorySlot[]): void {
    for (let i = 0; i < ITEM_BAR_SLOTS; i++) {
      const slot = items[i];
      const nameText = this.nameTexts[i];
      const countText = this.countTexts[i];

      if (slot?.item) {
        nameText.setText(slot.item.name.slice(0, 3));
        nameText.setColor('#ffffff');
        countText.setText(slot.count > 1 ? `${slot.count}` : '');
      } else {
        nameText.setText('');
        countText.setText('');
      }
    }
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
