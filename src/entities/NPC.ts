// NPC基类 - 交互触发、对话系统、类型分化

import Phaser from 'phaser';
import type { NPCData } from '@/config/types';
import { TILE_SIZE } from '@/config/constants';
import { getDepthSort } from '@/utils/IsometricUtils';

/** NPC类型对应的功能标签 */
const NPC_TYPE_LABELS: Record<string, string> = {
  blacksmith: '铁匠',
  merchant: '商人',
  skill_trainer: '技能导师',
  class_trainer: '转职导师',
  banker: '银行家',
  fortune_teller: '占卜师',
  alchemist: '炼金师',
  teleporter: '传送师',
};

export class NPC {
  readonly scene: Phaser.Scene;
  readonly npcData: NPCData;

  container: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  private typeText: Phaser.GameObjects.Text;
  private InteractIcon: Phaser.GameObjects.Text;

  /** 交互范围（像素） */
  interactRange = 80;

  constructor(scene: Phaser.Scene, npcData: NPCData, gridX: number, gridY: number) {
    this.scene = scene;
    this.npcData = npcData;

    // 屏幕坐标（使用传入的格子坐标）
    const pos = { screenX: gridX * TILE_SIZE, screenY: gridY * TILE_SIZE };

    // 容器
    this.container = scene.add.container(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(gridY));

    // NPC占位正方形（绿色）
    const size = TILE_SIZE - 4;
    this.body = scene.add.rectangle(0, 0, size, size, 0x44aa44);
    this.body.setOrigin(0.5, 0.5);
    this.body.setStrokeStyle(2, 0x66cc66);
    this.container.add(this.body);

    // 名字
    this.nameText = scene.add.text(0, -size / 2 - 14, npcData.name, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 类型标签
    this.typeText = scene.add.text(0, size / 2 + 4, NPC_TYPE_LABELS[npcData.type] ?? npcData.type, {
      fontSize: '9px',
      color: '#aaffaa',
    }).setOrigin(0.5);
    this.container.add(this.typeText);

    // 交互图标（头顶感叹号）
    this.InteractIcon = scene.add.text(0, -size / 2 - 26, '!', {
      fontSize: '14px',
      color: '#ffdd00',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.InteractIcon);

    // 可点击
    this.body.setInteractive({ useHandCursor: true });
    this.body.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log(`[NPC] click: ${npcData.name} at (${this.container.x}, ${this.container.y})`);
      if (pointer.leftButtonDown()) {
        this.onInteract();
      }
    });
  }

  /** 点击交互（子类可覆盖） */
  protected onInteract(): void {
    this.scene.events.emit('npc:interact', this.npcData);
  }

  /** 检查玩家是否在交互范围内 */
  isPlayerInRange(playerX: number, playerY: number): boolean {
    const dist = Phaser.Math.Distance.Between(
      this.container.x, this.container.y,
      playerX, playerY,
    );
    return dist <= this.interactRange;
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
