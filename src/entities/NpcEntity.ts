// NPC实体 - 绿色矩形 + 点击对话

import Phaser from 'phaser';
import type { NPCData } from '@/config/types';

export class NpcEntity {
  container: Phaser.GameObjects.Container;
  nameText: Phaser.GameObjects.Text;
  typeText: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Rectangle;
  npcData: NPCData;

  constructor(scene: Phaser.Scene, npcData: NPCData) {
    this.npcData = npcData;
    const { x, y } = npcData.position;

    this.container = scene.add.container(x, y);
    this.container.setDepth(5);

    // NPC身体
    this.bg = scene.add.rectangle(0, 0, 28, 36, 0x44aa44, 0.9)
      .setStrokeStyle(2, 0x66cc66);
    this.container.add(this.bg);

    // 名字
    this.nameText = scene.add.text(0, -26, npcData.name, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 类型标签
    const typeMap: Record<string, string> = {
      blacksmith: '铁匠', merchant: '商人', skill_trainer: '技能',
      class_trainer: '转职', banker: '银行', fortune_teller: '占卜',
      alchemist: '炼金', teleporter: '传送',
    };
    this.typeText = scene.add.text(0, 26, typeMap[npcData.type] ?? npcData.type, {
      fontSize: '9px',
      color: '#aaffaa',
    }).setOrigin(0.5);
    this.container.add(this.typeText);

    // 可点击（仅左键）
    this.bg.setSize(40, 50);
    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        scene.events.emit('npc:interact', this.npcData);
      }
    });
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
