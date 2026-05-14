// 角色选择场景 - 存档槽位展示、新建角色弹窗

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { getAllSlots, loadFromSlot, saveToSlot } from '@/utils/SaveUtils';
import { createCharacter } from '@/systems/LevelSystem';
import { gameState } from '@/state/GameState';
import { CLASSES } from '@/data/classes';
import type { Character, CharacterClass } from '@/config/types';

/** 存档槽位数据 */
interface SlotData {
  slot: number;
  exists: boolean;
  character?: Character;
  timestamp?: number;
}

/** 角色选择场景 */
export class CharacterSelectScene extends Phaser.Scene {
  private slots: SlotData[] = [];
  private slotContainers: Phaser.GameObjects.Container[] = [];
  private popupContainer: Phaser.GameObjects.Container | null = null;
  private selectedClass: CharacterClass | null = null;
  private nameText: Phaser.GameObjects.Text | null = null;
  private nameInput = '';
  private errorMessage: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    this.slots = [];
    this.slotContainers = [];
    this.popupContainer = null;
    this.selectedClass = null;
    this.nameInput = '';
    this.errorMessage = null;

    const centerX = CANVAS_WIDTH / 2;

    // 标题
    this.add.text(centerX, 50, '选择角色', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 加载存档数据
    this.loadSlots();

    // 渲染槽位
    this.renderSlots();

    // 返回按钮
    const backBtn = this.add.text(centerX, CANVAS_HEIGHT - 40, '[ 返回主菜单 ]', {
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#bbbbbb'));
    backBtn.on('pointerout', () => backBtn.setColor('#888888'));
    backBtn.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  /** 加载所有存档槽位 */
  private loadSlots(): void {
    const slotInfos = getAllSlots();
    for (const info of slotInfos) {
      if (info.exists) {
        const data = loadFromSlot(info.slot) as { character?: Character; timestamp?: number } | null;
        this.slots.push({
          slot: info.slot,
          exists: true,
          character: data?.character,
          timestamp: data?.timestamp,
        });
      } else {
        this.slots.push({ slot: info.slot, exists: false });
      }
    }
  }

  /** 渲染所有槽位 */
  private renderSlots(): void {
    const startX = CANVAS_WIDTH / 2 - 200;
    const slotY = CANVAS_HEIGHT / 2 - 30;
    const slotWidth = 180;
    const slotHeight = 220;
    const gap = 20;

    for (let i = 0; i < this.slots.length; i++) {
      const x = startX + i * (slotWidth + gap);
      const slot = this.slots[i];
      const container = this.add.container(x + slotWidth / 2, slotY + slotHeight / 2);

      // 槽位背景
      const bg = this.add.rectangle(0, 0, slotWidth, slotHeight, 0x222233, 0.8)
        .setStrokeStyle(2, 0x444466);
      container.add(bg);

      if (slot.exists && slot.character) {
        // 已有存档 - 显示角色信息
        const className = CLASSES[slot.character.class]?.name ?? slot.character.class;
        const classColor = slot.character.class === 'warrior' ? '#ff8844' : '#44aaff';

        container.add(this.add.text(0, -80, slot.character.name, {
          fontSize: '20px',
          color: '#ffffff',
          fontStyle: 'bold',
        }).setOrigin(0.5));

        container.add(this.add.text(0, -50, className, {
          fontSize: '16px',
          color: classColor,
        }).setOrigin(0.5));

        container.add(this.add.text(0, -25, `Lv.${slot.character.level}`, {
          fontSize: '14px',
          color: '#cccccc',
        }).setOrigin(0.5));

        // 保存时间
        if (slot.timestamp) {
          const date = new Date(slot.timestamp);
          const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          container.add(this.add.text(0, 0, timeStr, {
            fontSize: '12px',
            color: '#888888',
          }).setOrigin(0.5));
        }

        // 删除按钮
        const delBtn = this.add.text(0, 60, '[ 删除 ]', {
          fontSize: '14px',
          color: '#ff6666',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        delBtn.on('pointerdown', () => {
          this.showDeleteConfirm(slot.slot, container);
        });
        container.add(delBtn);

        // 使整个槽位可点击进入游戏
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          this.startGame(slot.slot);
        });
      } else {
        // 空槽位 - 显示新建角色
        container.add(this.add.text(0, -20, '空槽位', {
          fontSize: '16px',
          color: '#666666',
        }).setOrigin(0.5));

        const addBtn = this.add.text(0, 20, '[ 新建角色 ]', {
          fontSize: '16px',
          color: '#5599ff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        addBtn.on('pointerover', () => addBtn.setColor('#88bbff'));
        addBtn.on('pointerout', () => addBtn.setColor('#5599ff'));
        addBtn.on('pointerdown', () => {
          this.showCreationPopup(slot.slot);
        });
        container.add(addBtn);
      }

      this.slotContainers.push(container);
    }
  }

  /** 显示创建角色弹窗 */
  private showCreationPopup(slot: number): void {
    if (this.popupContainer) return;

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.popupContainer = this.add.container(0, 0);

    // 半透明遮罩
    const overlay = this.add.rectangle(centerX, centerY, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.6)
      .setInteractive(); // 阻止点击穿透
    this.popupContainer.add(overlay);

    // 弹窗背景
    const popupBg = this.add.rectangle(centerX, centerY, 500, 380, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x555577);
    this.popupContainer.add(popupBg);

    // 标题
    this.popupContainer.add(
      this.add.text(centerX, centerY - 160, '新建角色', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5)
    );

    // 职业选择区
    const classKeys: CharacterClass[] = ['warrior', 'mage'];
    const classDescs: Record<CharacterClass, string> = {
      warrior: '近战物理\n高HP · 高防御\n力量型输出',
      mage: '远程魔法\n高MP · 高魔攻\n智力型输出',
    };
    const classColors: Record<CharacterClass, number> = {
      warrior: 0xff8844,
      mage: 0x44aaff,
    };

    const cardWidth = 180;
    const cardHeight = 120;
    const cardGap = 40;
    const cardStartX = centerX - (cardWidth * 2 + cardGap) / 2 + cardWidth / 2;
    const cardY = centerY - 40;

    for (let i = 0; i < classKeys.length; i++) {
      const cls = classKeys[i];
      const cx = cardStartX + i * (cardWidth + cardGap);
      const classData = CLASSES[cls];

      const card = this.add.container(cx, cardY);

      const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x2a2a44, 0.9)
        .setStrokeStyle(2, 0x444466);
      card.add(cardBg);

      card.add(this.add.text(0, -35, classData.name, {
        fontSize: '20px',
        color: `#${classColors[cls].toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
      }).setOrigin(0.5));

      card.add(this.add.text(0, 5, classDescs[cls], {
        fontSize: '12px',
        color: '#cccccc',
        align: 'center',
      }).setOrigin(0.5));

      // 属性预览
      const base = classData.baseStats;
      const attrText = `力${base.strength} 智${base.intelligence} 体${base.stamina}`;
      card.add(this.add.text(0, 38, attrText, {
        fontSize: '11px',
        color: '#999999',
      }).setOrigin(0.5));

      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on('pointerdown', () => {
        this.selectedClass = cls;
        this.highlightClassCard(card, cardBg, classColors[cls]);
      });
      cardBg.on('pointerover', () => {
        if (this.selectedClass !== cls) {
          cardBg.setStrokeStyle(2, 0x8888aa);
        }
      });
      cardBg.on('pointerout', () => {
        if (this.selectedClass !== cls) {
          cardBg.setStrokeStyle(2, 0x444466);
        }
      });

      this.popupContainer!.add(card);
    }

    // 名字输入区
    this.popupContainer.add(
      this.add.text(centerX, centerY + 55, '角色名：', {
        fontSize: '16px',
        color: '#cccccc',
      }).setOrigin(0.5)
    );

    // 名字输入框背景
    const inputBg = this.add.rectangle(centerX, centerY + 85, 260, 32, 0x333355, 0.9)
      .setStrokeStyle(1, 0x666688);
    this.popupContainer.add(inputBg);

    this.nameText = this.add.text(centerX, centerY + 85, '点击输入名字', {
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);
    this.popupContainer.add(this.nameText);

    // 错误提示
    this.errorMessage = this.add.text(centerX, centerY + 110, '', {
      fontSize: '13px',
      color: '#ff6666',
    }).setOrigin(0.5);
    this.popupContainer.add(this.errorMessage);

    // 名字输入交互
    inputBg.setInteractive({ useHandCursor: true });
    inputBg.on('pointerdown', () => {
      this.startNameInput();
    });

    // 确认按钮
    const confirmBtn = this.add.text(centerX - 60, centerY + 145, '[ 确认创建 ]', {
      fontSize: '18px',
      color: '#55cc55',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    confirmBtn.on('pointerover', () => confirmBtn.setColor('#77ee77'));
    confirmBtn.on('pointerout', () => confirmBtn.setColor('#55cc55'));
    confirmBtn.on('pointerdown', () => {
      this.confirmCreation(slot);
    });
    this.popupContainer.add(confirmBtn);

    // 取消按钮
    const cancelBtn = this.add.text(centerX + 60, centerY + 145, '[ 取消 ]', {
      fontSize: '18px',
      color: '#cc6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    cancelBtn.on('pointerover', () => cancelBtn.setColor('#ee8888'));
    cancelBtn.on('pointerout', () => cancelBtn.setColor('#cc6666'));
    cancelBtn.on('pointerdown', () => {
      this.closeCreationPopup();
    });
    this.popupContainer.add(cancelBtn);
  }

  /** 高亮选中的职业卡片 */
  private highlightClassCard(
    card: Phaser.GameObjects.Container,
    bg: Phaser.GameObjects.Rectangle,
    color: number,
  ): void {
    // 重置所有卡片边框（通过遍历弹窗容器）
    if (this.popupContainer) {
      const children = this.popupContainer.list;
      for (const child of children) {
        if (child instanceof Phaser.GameObjects.Container) {
          const innerBg = child.list.find(c => c instanceof Phaser.GameObjects.Rectangle) as Phaser.GameObjects.Rectangle | undefined;
          if (innerBg && innerBg !== bg) {
            innerBg.setStrokeStyle(2, 0x444466);
          }
        }
      }
    }
    bg.setStrokeStyle(3, color);
  }

  /** 开始名字输入 */
  private startNameInput(): void {
    this.nameInput = '';
    this.updateNameDisplay();

    // 监听键盘输入
    this.input.keyboard?.once('keydown', (event: KeyboardEvent) => {
      this.handleKeyInput(event);
    });
  }

  /** 处理键盘输入 */
  private handleKeyInput(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'Escape') {
      return;
    }

    if (event.key === 'Backspace') {
      this.nameInput = this.nameInput.slice(0, -1);
    } else if (event.key.length === 1 && this.nameInput.length < 8) {
      // 只允许中文、字母、数字
      if (/[一-龥a-zA-Z0-9]/.test(event.key)) {
        this.nameInput += event.key;
      }
    }

    this.updateNameDisplay();

    // 继续监听下一个按键
    if (this.popupContainer) {
      this.input.keyboard?.once('keydown', (e: KeyboardEvent) => {
        this.handleKeyInput(e);
      });
    }
  }

  /** 更新名字显示 */
  private updateNameDisplay(): void {
    if (this.nameText) {
      if (this.nameInput.length > 0) {
        this.nameText.setText(this.nameInput);
        this.nameText.setColor('#ffffff');
      } else {
        this.nameText.setText('点击输入名字');
        this.nameText.setColor('#666666');
      }
    }
  }

  /** 校验角色名 */
  private validateName(name: string): string | null {
    if (name.length === 0) return '请输入角色名';
    if (name.length > 8) return '角色名最长8个字符';

    // 检查是否与已有存档中的角色名重复
    for (const slot of this.slots) {
      if (slot.exists && slot.character && slot.character.name === name) {
        return '角色名已存在';
      }
    }

    return null;
  }

  /** 确认创建角色 */
  private confirmCreation(slot: number): void {
    if (!this.errorMessage) return;

    // 校验职业
    if (!this.selectedClass) {
      this.errorMessage.setText('请选择职业');
      return;
    }

    // 校验名字
    const nameError = this.validateName(this.nameInput);
    if (nameError) {
      this.errorMessage.setText(nameError);
      return;
    }

    // 创建角色
    const character = createCharacter(this.nameInput, this.selectedClass);

    // 保存到槽位
    const saveData = {
      character,
      timestamp: Date.now(),
      version: '1.0.0',
    };

    const success = saveToSlot(slot, saveData);
    if (!success) {
      this.errorMessage.setText('存档失败，请重试');
      return;
    }

    // 设置游戏状态并进入城镇
    gameState.setCharacter(character);
    this.scene.start('TownScene');
  }

  /** 关闭创建弹窗 */
  private closeCreationPopup(): void {
    if (this.popupContainer) {
      this.popupContainer.destroy(true);
      this.popupContainer = null;
    }
    this.selectedClass = null;
    this.nameInput = '';
    this.errorMessage = null;
    this.nameText = null;
  }

  /** 刷新槽位显示 */
  private refreshSlots(): void {
    // 清除旧的槽位容器
    for (const container of this.slotContainers) {
      container.destroy(true);
    }
    this.slotContainers = [];

    // 重新加载并渲染
    this.loadSlots();
    this.renderSlots();
  }

  /** 显示删除确认 */
  private showDeleteConfirm(slot: number, _container: Phaser.GameObjects.Container): void {
    if (this.popupContainer) return;

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.popupContainer = this.add.container(0, 0);

    const overlay = this.add.rectangle(centerX, centerY, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.6)
      .setInteractive();
    this.popupContainer.add(overlay);

    const popupBg = this.add.rectangle(centerX, centerY, 320, 150, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x555577);
    this.popupContainer.add(popupBg);

    this.popupContainer.add(
      this.add.text(centerX, centerY - 35, '确定删除该存档？', {
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5)
    );

    this.popupContainer.add(
      this.add.text(centerX, centerY - 10, '此操作不可撤销', {
        fontSize: '13px',
        color: '#ff6666',
      }).setOrigin(0.5)
    );

    // 确认删除
    const confirmBtn = this.add.text(centerX - 50, centerY + 35, '[ 确认 ]', {
      fontSize: '16px',
      color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    confirmBtn.on('pointerdown', () => {
      import('@/utils/SaveUtils').then(({ deleteSlot }) => {
        deleteSlot(slot);
        this.closeCreationPopup();
        this.refreshSlots();
      });
    });
    this.popupContainer.add(confirmBtn);

    // 取消
    const cancelBtn = this.add.text(centerX + 50, centerY + 35, '[ 取消 ]', {
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    cancelBtn.on('pointerdown', () => {
      this.closeCreationPopup();
    });
    this.popupContainer.add(cancelBtn);
  }

  /** 加载存档并进入游戏 */
  private startGame(slot: number): void {
    const data = loadFromSlot(slot) as { character?: Character } | null;
    if (data?.character) {
      gameState.setCharacter(data.character);
      this.scene.start('TownScene');
    }
  }
}
