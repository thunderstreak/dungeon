// 游戏设置面板 - ESC键呼出，保存/切换存档、退出游戏

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import { gameState } from '@/state/GameState';
import { saveToSlot, loadFromSlot, deleteSlot, getAllSlots } from '@/utils/SaveUtils';
import { showNotification } from './NotificationToast';

/** 格式化存档时间 */
function formatSaveTime(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

export class SettingsPanel extends BasePanel {
  private mainContainer!: Phaser.GameObjects.Container;
  private slotContainer!: Phaser.GameObjects.Container;
  private confirmDialog!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const panelW = 300;
    const panelH = 250;
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // 背景
    const bg = this.scene.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x5555aa);
    this.container.add(bg);

    // 标题
    const title = this.scene.add.text(cx, cy - panelH / 2 + 20, '游戏设置', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // ===== 主菜单 =====
    this.mainContainer = this.scene.add.container(0, 0);
    this.container.add(this.mainContainer);

    const btnW = 200;
    const btnH = 36;
    const btnGap = 12;
    const startY = cy - 30;

    const buttons = [
      { label: '保存存档', color: 0x336633, stroke: 0x55aa55, action: () => this.doSave() },
      { label: '切换存档', color: 0x333366, stroke: 0x5555aa, action: () => this.showSlotList() },
      { label: '退出游戏', color: 0x663333, stroke: 0xaa5555, action: () => this.doExit() },
    ];

    buttons.forEach((btn, i) => {
      const y = startY + i * (btnH + btnGap);

      const btnBg = this.scene.add.rectangle(cx, y, btnW, btnH, btn.color)
        .setStrokeStyle(1, btn.stroke)
        .setInteractive({ useHandCursor: true });

      const label = this.scene.add.text(cx, y, btn.label, {
        fontSize: '14px', color: '#ffffff',
      }).setOrigin(0.5);

      btnBg.on('pointerover', () => btnBg.setFillStyle(btn.stroke));
      btnBg.on('pointerout', () => btnBg.setFillStyle(btn.color));
      btnBg.on('pointerdown', () => btn.action());

      this.mainContainer.add(btnBg);
      this.mainContainer.add(label);
    });

    // ===== 存档槽位列表（初始隐藏）=====
    this.slotContainer = this.scene.add.container(0, 0);
    this.slotContainer.setVisible(false);
    this.container.add(this.slotContainer);

    // ===== 退出确认对话框（初始隐藏）=====
    this.confirmDialog = this.scene.add.container(0, 0);
    this.confirmDialog.setVisible(false);
    this.container.add(this.confirmDialog);

    // 关闭按钮（最后添加确保最顶层）
    const closeBtn = this.scene.add.text(cx + panelW / 2 - 20, cy - panelH / 2 + 10, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.container.add(closeBtn);
  }

  show(): void {
    super.show();
    this.mainContainer.setVisible(true);
    this.slotContainer.setVisible(false);
    this.confirmDialog.setVisible(false);
  }

  // ===== 保存存档 =====

  private doSave(): void {
    const character = gameState.getCharacter();
    const ok = saveToSlot(0, { character, timestamp: Date.now(), version: '1.0' });
    if (ok) {
      showNotification(this.scene, '存档成功!', '#44ff44');
    } else {
      showNotification(this.scene, '存档失败', '#ff4444');
    }
  }

  // ===== 切换存档 =====

  private showSlotList(): void {
    this.mainContainer.setVisible(false);
    this.slotContainer.setVisible(true);
    this.slotContainer.removeAll(true);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const panelW = 300;
    const panelH = 250;

    // 标题
    const title = this.scene.add.text(cx, cy - panelH / 2 + 20, '选择存档', {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.slotContainer.add(title);

    // 返回按钮
    const backBtn = this.scene.add.text(cx - panelW / 2 + 20, cy - panelH / 2 + 10, '← 返回', {
      fontSize: '12px', color: '#88aaff',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.slotContainer.setVisible(false);
      this.mainContainer.setVisible(true);
    });
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#88aaff'));
    this.slotContainer.add(backBtn);

    // 获取槽位信息
    const utilsSlots = getAllSlots();
    const slots = utilsSlots.map((s, i) => {
      if (s.exists) {
        const data = loadFromSlot(i) as any;
        return {
          slot: i,
          exists: true,
          timestamp: data?.timestamp,
          playerName: data?.character?.name,
          playerLevel: data?.character?.level,
          playerClass: data?.character?.class,
        };
      }
      return { slot: i, exists: false };
    });

    const slotH = 36;
    const startY = cy - panelH / 2 + 50;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const y = startY + i * (slotH + 6);

      // 槽位背景
      const slotBg = this.scene.add.rectangle(cx, y, panelW - 30, slotH, 0x222233, 0.7);
      this.slotContainer.add(slotBg);

      if (slot.exists) {
        const classMap: Record<string, string> = { warrior: '战士', mage: '法师' };
        const info = `槽位${slot.slot + 1}  ${slot.playerName ?? '???'} Lv.${slot.playerLevel ?? '?'} ${classMap[slot.playerClass ?? ''] ?? ''}`;
        const infoText = this.scene.add.text(cx - (panelW - 30) / 2 + 10, y, info, {
          fontSize: '11px', color: '#cccccc',
        }).setOrigin(0, 0.5);
        this.slotContainer.add(infoText);

        const timeText = this.scene.add.text(cx + (panelW - 30) / 2 - 35, y, formatSaveTime(slot.timestamp!), {
          fontSize: '9px', color: '#888888',
        }).setOrigin(1, 0.5);
        this.slotContainer.add(timeText);

        // 删除按钮
        const delBtn = this.scene.add.text(cx + (panelW - 30) / 2 - 10, y, '删', {
          fontSize: '11px', color: '#ff6666',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        delBtn.on('pointerover', () => delBtn.setColor('#ffffff'));
        delBtn.on('pointerout', () => delBtn.setColor('#ff6666'));
        delBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          this.confirmDeleteSlot(slot.slot);
        });
        this.slotContainer.add(delBtn);

        // 点击加载
        slotBg.setInteractive({ useHandCursor: true });
        slotBg.on('pointerover', () => slotBg.setFillStyle(0x333355));
        slotBg.on('pointerout', () => slotBg.setFillStyle(0x222233, 0.7));
        slotBg.on('pointerdown', () => this.loadSlot(slot.slot));
      } else {
        const emptyText = this.scene.add.text(cx, y, `槽位${slot.slot + 1}  （空）`, {
          fontSize: '11px', color: '#666666',
        }).setOrigin(0.5);
        this.slotContainer.add(emptyText);
      }
    }

    // 关闭按钮
    const closeBtn = this.scene.add.text(cx + panelW / 2 - 20, cy - panelH / 2 + 10, '✕', {
      fontSize: '16px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
    this.slotContainer.add(closeBtn);
  }

  private loadSlot(slot: number): void {
    const data = loadFromSlot(slot) as any;
    if (data?.character) {
      gameState.setCharacter(data.character);
    } else {
      showNotification(this.scene, '读档失败', '#ff4444');
      return;
    }

    this.hide();
    showNotification(this.scene, `已加载槽位${slot + 1}`, '#44ff44');
    this.scene.scene.start('TownScene');
  }

  // ===== 删除存档 =====

  private confirmDeleteSlot(slot: number): void {
    this.slotContainer.setVisible(false);
    this.showConfirmDialog(
      `确定要删除槽位${slot + 1}的存档吗？`,
      () => {
        deleteSlot(slot);
        showNotification(this.scene, `已删除槽位${slot + 1}`, '#44ff44');
        this.confirmDialog.setVisible(false);
        this.showSlotList();
      },
      () => {
        this.confirmDialog.setVisible(false);
        this.slotContainer.setVisible(true);
      },
    );
  }

  // ===== 退出游戏 =====

  private doExit(): void {
    this.mainContainer.setVisible(false);
    this.showConfirmDialog(
      '确定要退出游戏吗？',
      () => { window.location.reload(); },
      () => {
        this.confirmDialog.setVisible(false);
        this.mainContainer.setVisible(true);
      },
    );
  }

  private showConfirmDialog(message: string, onConfirm: () => void, onCancel: () => void): void {
    this.confirmDialog.removeAll(true);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    const dimBg = this.scene.add.rectangle(cx, cy, 300, 250, 0x000000, 0.4);
    this.confirmDialog.add(dimBg);

    const text = this.scene.add.text(cx, cy - 20, message, {
      fontSize: '13px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5);
    this.confirmDialog.add(text);

    const confirmBg = this.scene.add.rectangle(cx - 55, cy + 25, 90, 30, 0x336633)
      .setStrokeStyle(1, 0x55aa55)
      .setInteractive({ useHandCursor: true });
    const confirmText = this.scene.add.text(cx - 55, cy + 25, '确认', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5);
    confirmBg.on('pointerdown', () => onConfirm());
    confirmBg.on('pointerover', () => confirmBg.setFillStyle(0x448844));
    confirmBg.on('pointerout', () => confirmBg.setFillStyle(0x336633));
    this.confirmDialog.add(confirmBg);
    this.confirmDialog.add(confirmText);

    const cancelBg = this.scene.add.rectangle(cx + 55, cy + 25, 90, 30, 0x443333)
      .setStrokeStyle(1, 0xaa5555)
      .setInteractive({ useHandCursor: true });
    const cancelText = this.scene.add.text(cx + 55, cy + 25, '取消', {
      fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5);
    cancelBg.on('pointerdown', () => onCancel());
    cancelBg.on('pointerover', () => cancelBg.setFillStyle(0x664444));
    cancelBg.on('pointerout', () => cancelBg.setFillStyle(0x443333));
    this.confirmDialog.add(cancelBg);
    this.confirmDialog.add(cancelText);

    this.confirmDialog.setVisible(true);
  }

  destroy(): void {
    super.destroy();
  }
}
