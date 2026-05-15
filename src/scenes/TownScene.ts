// 城镇场景 - 等距视角 + NPC交互 + 地牢入口

import Phaser from 'phaser';
import { TILE_SIZE } from '@/config/constants';
import { gameState } from '@/state/GameState';
import { ALL_NPCS } from '@/data/npcs';
import { Player } from '@/entities/Player';
import { NPC } from '@/entities/NPC';
import { setAutoSaveDataGetter, startAutoSave } from '@/systems/SaveSystem';
import { saveToSlot as saveToUtilsSlot } from '@/utils/SaveUtils';
import { Hud } from '@/ui/Hud';
import { isoToScreen, getDepthSort } from '@/utils/IsometricUtils';
import {
  TOWN_HEIGHT,
  TOWN_PAD,
  TOWN_WIDTH,
  getTownCameraScroll,
  getTownWorldSize,
  isTownWalkable,
} from '@/utils/TownBounds';
import type { NPCData } from '@/config/types';

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private hud!: Hud;
  private floorContainer!: Phaser.GameObjects.Container;
  private worldWidth = 0;
  private worldHeight = 0;
  private entranceConfirmShowing = false;
  private wasInEntranceZone = false;

  constructor() {
    super({ key: 'TownScene' });
  }

  create(): void {
    const character = gameState.getCharacter();

    // 背景
    this.cameras.main.setBackgroundColor('#1a2a1a');

    // 等距地板容器
    this.floorContainer = this.add.container(0, 0);

    // 绘制城镇等距地板
    this.renderFloor();

    // 区域标签（等距坐标）
    this.renderAreaLabels();

    // 创建NPC
    this.spawnNpcs();

    // 地牢入口标记
    this.renderDungeonEntrance();

    // 创建玩家（城镇中心）
    const spawnX = Math.floor(TOWN_WIDTH / 2);
    const spawnY = Math.floor(TOWN_HEIGHT / 2);
    this.player = new Player(this, character, spawnX, spawnY);

    // 设置碰撞检测：城镇绘制了哪些格子，就允许玩家走到哪些格子
    this.player.isWalkable = isTownWalkable;

    // HUD
    this.hud = new Hud(this);
    this.hud.update(character);

    // NPC交互事件 → 转发给UIScene的对话框
    this.events.on('npc:interact', (npcData: NPCData) => {
      const uiScene = this.scene.get('UIScene') as import('./UIScene').UIScene | null;
      if (uiScene && !uiScene.dialogBox.isOpen) {
        this.player.stopMoving();
        uiScene.showDialog(npcData);
      }
    });

    // 禁用右键菜单
    this.input.mouse!.disableContextMenu();

    // 左键点击移动
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const uiScene = this.scene.get('UIScene') as import('./UIScene').UIScene | null;
      if (uiScene?.isAnyPanelOpen()) return;
      if (pointer.leftButtonDown()) {
        this.player.moveToScreen(
          pointer.x, pointer.y,
          this.cameras.main.scrollX, this.cameras.main.scrollY,
        );
      }
    });

    // 手动控制摄像机（不设bounds，世界足够大不会显示黑色区域）
    const worldSize = getTownWorldSize();
    this.worldWidth = worldSize.width;
    this.worldHeight = worldSize.height;
    // 启动UI层
    this.scene.launch('UIScene');

    // 启动自动存档（5分钟间隔）
    // 同时写入 SaveUtils（供加载时读取）和 SaveSystem
    setAutoSaveDataGetter(() => {
      const char = gameState.getCharacter();
      // 同步写入 SaveUtils，确保"继续游戏"能读到最新数据
      saveToUtilsSlot(0, { character: char, timestamp: Date.now(), version: '1.0' });
      return {
        version: '1.0',
        timestamp: Date.now(),
        slot: 0,
        player: char,
        dungeon: { currentFloor: 1, highestFloor: 1, isAbyss: false, roomsCleared: 0 },
        inventory: char.inventory,
        settings: { bgmVolume: 80, sfxVolume: 80, showDamageNumbers: true, autoPickup: false, difficulty: 1 },
      };
    });
    startAutoSave();
    // 进入城镇立即存档一次
    const char = gameState.getCharacter();
    saveToUtilsSlot(0, { character: char, timestamp: Date.now(), version: '1.0' });

    this.cameras.main.fadeIn(300);
  }

  update(_time: number, delta: number): void {
    const uiScene = this.scene.get('UIScene') as import('./UIScene').UIScene | null;
    if (uiScene?.isAnyPanelOpen()) return;

    this.player.update(delta);

    // 手动居中摄像机在玩家身上，限制玩家可视区域不超出画布
    const px = this.player.visualX;
    const py = this.player.visualY;
    const cameraScroll = getTownCameraScroll(px, py);
    this.cameras.main.scrollX = cameraScroll.x;
    this.cameras.main.scrollY = cameraScroll.y;

    // 检查地牢入口
    this.checkDungeonEntrance();

    // 更新HUD
    this.hud.update(gameState.getCharacter());
  }

  /** 渲染正方形地板 */
  private renderFloor(): void {
    for (let y = 0; y < TOWN_HEIGHT; y++) {
      for (let x = 0; x < TOWN_WIDTH; x++) {
        const pos = isoToScreen(x, y);

        const tile = this.add.rectangle(pos.screenX, pos.screenY, TILE_SIZE, TILE_SIZE, 0x2a3a28);
        tile.setOrigin(0.5, 0.5);
        tile.setDepth(getDepthSort(y));
        this.floorContainer.add(tile);
      }
    }
  }

  /** 渲染区域标签 */
  private renderAreaLabels(): void {
    // 军事区（左上）
    const militaryPos = isoToScreen(8 + TOWN_PAD, 4 + TOWN_PAD);
    this.add.text(militaryPos.screenX, militaryPos.screenY - 20, '军事区', {
      fontSize: '12px', color: '#668866',
    }).setOrigin(0.5).setDepth(1000);

    // 商业区（右上）
    const commercialPos = isoToScreen(38 + TOWN_PAD, 4 + TOWN_PAD);
    this.add.text(commercialPos.screenX, commercialPos.screenY - 20, '商业区', {
      fontSize: '12px', color: '#668866',
    }).setOrigin(0.5).setDepth(1000);
  }

  /** 生成NPC */
  private spawnNpcs(): void {
    // NPC网格位置分配（分散摆放，+PAD偏移到padding区域内）
    const npcPositions: Record<string, { x: number; y: number }> = {
      npc_blacksmith: { x: 8 + TOWN_PAD, y: 6 + TOWN_PAD },
      npc_skill_trainer: { x: 6 + TOWN_PAD, y: 10 + TOWN_PAD },
      npc_class_trainer: { x: 10 + TOWN_PAD, y: 8 + TOWN_PAD },
      npc_merchant: { x: 36 + TOWN_PAD, y: 6 + TOWN_PAD },
      npc_banker: { x: 40 + TOWN_PAD, y: 8 + TOWN_PAD },
      npc_fortune_teller: { x: 38 + TOWN_PAD, y: 12 + TOWN_PAD },
      npc_alchemist: { x: 42 + TOWN_PAD, y: 10 + TOWN_PAD },
      npc_teleporter: { x: 24 + TOWN_PAD, y: 30 + TOWN_PAD },
    };

    for (const npcData of ALL_NPCS) {
      const gridPos = npcPositions[npcData.id] ?? { x: 10, y: 8 };
      // NPC构造函数内部会将grid坐标转换为屏幕坐标
      const npc = new NPC(this, npcData, gridPos.x, gridPos.y);
      this.npcs.push(npc);
    }
  }

  /** 渲染地牢入口 */
  private renderDungeonEntrance(): void {
    const entranceGrid = { x: 10 + TOWN_PAD, y: 14 + TOWN_PAD };
    const pos = isoToScreen(entranceGrid.x, entranceGrid.y);

    const entrance = this.add.rectangle(pos.screenX, pos.screenY, TILE_SIZE, TILE_SIZE, 0x554433);
    entrance.setOrigin(0.5, 0.5);
    entrance.setDepth(getDepthSort(entranceGrid.y));
    entrance.setStrokeStyle(2, 0xaa8844);

    this.add.text(pos.screenX, pos.screenY - 16, '↓ 地牢入口 ↓', {
      fontSize: '11px', color: '#ffcc44', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1001);
  }

  /** 检查地牢入口 - 仅在进入区域时触发，离开后才能再次触发 */
  private checkDungeonEntrance(): void {
    const gridPos = this.player.getGridPosition();
    const inZone = gridPos.x >= 9 + TOWN_PAD && gridPos.x <= 11 + TOWN_PAD
      && gridPos.y >= 13 + TOWN_PAD && gridPos.y <= 15 + TOWN_PAD;

    // 离开区域后重置所有标志，允许再次触发
    if (!inZone) {
      this.wasInEntranceZone = false;
      this.entranceConfirmShowing = false;
      return;
    }

    // 在区域内，且之前不在区域内 → 首次进入，触发对话
    if (!this.wasInEntranceZone && !this.entranceConfirmShowing) {
      this.entranceConfirmShowing = true;
      this.player.stopMoving();
      const uiScene = this.scene.get('UIScene') as import('./UIScene').UIScene | null;
      uiScene?.showConfirm('是否进入地牢？', () => {
        this.enterDungeon();
      }, () => {
        this.entranceConfirmShowing = false;
      });
    }
    this.wasInEntranceZone = true;
  }

  private enterDungeon(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DungeonScene');
    });
  }

  /** 获取小地图数据 */
  getMinimapData(): {
    gridW: number; gridH: number;
    playerGrid: { x: number; y: number };
    npcs: Array<{ x: number; y: number; label: string }>;
    dungeonEntrance: { x: number; y: number };
  } {
    const npcs = this.npcs.map(npc => ({
      x: npc.container.x / TILE_SIZE,
      y: npc.container.y / TILE_SIZE,
      label: npc.npcData.name,
    }));
    return {
      gridW: TOWN_WIDTH,
      gridH: TOWN_HEIGHT,
      playerGrid: this.player.getGridPosition(),
      npcs,
      dungeonEntrance: { x: 10 + TOWN_PAD, y: 14 + TOWN_PAD },
    };
  }
}
