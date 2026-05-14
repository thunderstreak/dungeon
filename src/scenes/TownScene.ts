// 城镇场景 - 右键移动 + 左键NPC交互 + 地牢入口

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { gameState } from '@/state/GameState';
import { ALL_NPCS } from '@/data/npcs';
import { PlayerEntity } from '@/entities/PlayerEntity';
import { NpcEntity } from '@/entities/NpcEntity';
import { DialogBox } from '@/ui/DialogBox';
import { Hud } from '@/ui/Hud';
import type { NPCData } from '@/config/types';

export class TownScene extends Phaser.Scene {
  private player!: PlayerEntity;
  private npcs: NpcEntity[] = [];
  private dialogBox!: DialogBox;
  private hud!: Hud;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private dungeonEntrance!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'TownScene' });
  }

  create(): void {
    const character = gameState.getCharacter();

    // 背景
    this.cameras.main.setBackgroundColor('#1a2a1a');

    // 地面（深绿色区域）
    this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x1a3318);

    // 城镇区域标记
    this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 40, 0x1e3a1c, 0.3)
      .setStrokeStyle(1, 0x2a5a28);

    // 区域标签
    this.add.text(200, 180, '军事区', { fontSize: '12px', color: '#446644' }).setOrigin(0.5);
    this.add.text(500, 180, '商业区', { fontSize: '12px', color: '#446644' }).setOrigin(0.5);

    // 创建NPC
    for (const npcData of ALL_NPCS) {
      this.npcs.push(new NpcEntity(this, npcData));
    }

    // 地牢入口
    this.dungeonEntrance = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, 120, 50, 0x555555, 0.8)
      .setStrokeStyle(2, 0x888888);
    this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, '地牢入口', {
      fontSize: '14px',
      color: '#ffcc44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 地牢入口箭头提示
    this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 70, '↓ 进入地牢 ↓', {
      fontSize: '11px',
      color: '#aaaa66',
    }).setOrigin(0.5);

    // 创建玩家
    this.player = new PlayerEntity(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, character.name);

    // 对话框
    this.dialogBox = new DialogBox(this);

    // HUD（底部栏布局，匹配设计文档）
    this.hud = new Hud(this);
    this.hud.update(character);

    // 输入
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    };

    // 右键点击地面移动
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.dialogBox.isOpen) return;
      // 右键：移动到目标位置
      if (pointer.rightButtonDown()) {
        this.player.moveTo(pointer.x, pointer.y);
      }
    });

    // 禁用右键菜单
    this.input.mouse!.disableContextMenu();

    // NPC交互事件（左键点击NPC触发）
    this.events.on('npc:interact', (npcData: NPCData) => {
      if (!this.dialogBox.isOpen) {
        this.player.stopMoving();
        this.dialogBox.show(npcData);
      }
    });

    // 场景入场动画
    this.cameras.main.fadeIn(300);
  }

  update(): void {
    if (this.dialogBox.isOpen) return;

    // 玩家移动（支持 WASD 和点击移动）
    this.player.update(this.cursors, this.wasd);

    // 检查地牢入口
    const playerPos = this.player.getPosition();
    const entranceBounds = this.dungeonEntrance.getBounds();
    if (entranceBounds.contains(playerPos.x, playerPos.y)) {
      this.enterDungeon();
    }

    // 更新HUD
    this.hud.update(gameState.getCharacter());
  }

  private enterDungeon(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DungeonScene');
    });
  }
}
