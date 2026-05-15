// NPC对话框UI - 居中显示 + 关闭按钮

import Phaser from 'phaser';
import type { NPCData, Dialog } from '@/config/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private nameText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private closeBtn: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Rectangle;
  private optionBtns: Phaser.GameObjects.Text[] = [];
  isOpen = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(2000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // 背景遮罩（点击关闭，初始不可交互）
    this.overlay = scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.4);
    this.overlay.on('pointerdown', () => this.hide());
    this.container.add(this.overlay);

    // 对话框背景（居中）
    const boxWidth = 500;
    const boxHeight = 200;
    const bg = scene.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, boxWidth, boxHeight, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x555577);
    this.container.add(bg);

    // NPC名字（居中顶部）
    this.nameText = scene.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - boxHeight / 2 + 20, '', {
      fontSize: '16px',
      color: '#ffcc44',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 对话内容（居中）
    this.contentText = scene.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: boxWidth - 60 },
      lineSpacing: 6,
      align: 'center',
    }).setOrigin(0.5);
    this.container.add(this.contentText);

    // 关闭按钮（右上角 X）
    this.closeBtn = scene.add.container(CANVAS_WIDTH / 2 + boxWidth / 2 - 20, CANVAS_HEIGHT / 2 - boxHeight / 2 + 15);
    const closeBg = scene.add.rectangle(0, 0, 24, 24, 0x444455, 0.8)
      .setStrokeStyle(1, 0x888899);
    const closeText = scene.add.text(0, 0, '×', {
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5);
    this.closeBtn.add(closeBg);
    this.closeBtn.add(closeText);

    closeBg.setInteractive({ useHandCursor: true });
    closeBg.on('pointerover', () => {
      closeBg.setFillStyle(0x666677, 1);
      closeText.setColor('#ffffff');
    });
    closeBg.on('pointerout', () => {
      closeBg.setFillStyle(0x444455, 0.8);
      closeText.setColor('#cccccc');
    });
    closeBg.on('pointerdown', () => this.hide());
    this.container.add(this.closeBtn);

    // 底部关闭文字按钮
    const closeBtnText = scene.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + boxHeight / 2 - 30, '[ 关闭 ]', {
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtnText.on('pointerover', () => closeBtnText.setColor('#cccccc'));
    closeBtnText.on('pointerout', () => closeBtnText.setColor('#888888'));
    closeBtnText.on('pointerdown', () => this.hide());
    this.container.add(closeBtnText);
  }

  show(npcData: NPCData, dialogId: string = 'greeting'): void {
    const dialog = npcData.dialogs.find(d => d.id === dialogId) ?? npcData.dialogs[0];
    if (!dialog) {
      console.log('[DialogBox] no dialog found for', npcData.name);
      return;
    }
    console.log('[DialogBox] showing:', npcData.name, dialog.text.slice(0, 30));

    this.nameText.setText(npcData.name);
    this.contentText.setText(dialog.text);

    // 清除旧选项
    for (const btn of this.optionBtns) {
      btn.destroy();
    }
    this.optionBtns = [];

    // 显示对话选项（居中排列）
    if (dialog.options && dialog.options.length > 0) {
      const optionY = CANVAS_HEIGHT / 2 + 60;
      const totalWidth = dialog.options.length * 140;
      const startX = CANVAS_WIDTH / 2 - totalWidth / 2 + 70;

      dialog.options.forEach((opt, i) => {
        const btn = this.scene.add.text(startX + i * 140, optionY, `[ ${opt.text} ]`, {
          fontSize: '13px',
          color: '#5599ff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#88bbff'));
        btn.on('pointerout', () => btn.setColor('#5599ff'));
        btn.on('pointerdown', () => {
          if (opt.action) {
            this.scene.events.emit('npc:action', opt.action, npcData);
          }
          if (opt.nextDialogId) {
            this.show(npcData, opt.nextDialogId);
          } else {
            this.hide();
          }
        });

        this.optionBtns.push(btn);
        this.container.add(btn);
      });
    }

    this.container.setVisible(true);
    this.overlay.setInteractive();
    this.isOpen = true;
  }

  hide(): void {
    this.container.setVisible(false);
    this.overlay.disableInteractive();
    this.isOpen = false;
  }

  destroy(): void {
    this.container.destroy(true);
    this.optionBtns = [];
    this.isOpen = false;
  }
}
