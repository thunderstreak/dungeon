// 地牢场景 - 等距视角 + 房间生成 + 战斗 + 掉落 + 关卡推进

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '@/config/constants';
import { gameState } from '@/state/GameState';
import { Player } from '@/entities/Player';
import { createMonster, createBoss, spawnMonstersInRoom } from '@/entities/monsters/MonsterFactory';
import { Monster } from '@/entities/Monster';
import { Boss } from '@/entities/Boss';
import { showNotification } from '@/ui/NotificationToast';
import { calcPhysicalDamage, applyDamage } from '@/systems/BattleSystem';
import { calculateMonsterDrop, PityCounter } from '@/systems/DropSystem';
import { addExperience } from '@/systems/LevelSystem';
import { addGold } from '@/systems/InventorySystem';
import { applyDeathPenalty } from '@/systems/DeathSystem';
import { createDungeonState, tryTriggerAbyss, getFloorMultiplier } from '@/systems/DungeonSystem';
import type { DungeonState } from '@/systems/DungeonSystem';
import { consumeDurability } from '@/systems/EquipmentSystem';
import { RoomGenerator } from '@/map/RoomGenerator';
import type { Room } from '@/map/Room';
import { isoToScreen } from '@/utils/IsometricUtils';
import { CORRIDOR_WIDTH } from '@/systems/MapGenerator';
import { createFloorWalkability, type FloorWalkability } from '@/systems/FloorWalkability';
import type { MiniMapMonster } from '@/ui/MiniMap';
import type { UIScene } from './UIScene';

export class DungeonScene extends Phaser.Scene {
  private player!: Player;
  private monsters: (Monster | Boss)[] = [];
  private roomMonsters = new Map<string, (Monster | Boss)[]>();
  private roomGenerator!: RoomGenerator;
  private currentRoom!: Room;
  private pity = new PityCounter();
  private roomCleared = false;
  private attackCooldown = 0;
  private playerDead = false;
  private floor = 1;
  private dungeonState!: DungeonState;
  private floorWalkability!: FloorWalkability;
  private roomsEntered = new Set<string>();

  constructor() {
    super({ key: 'DungeonScene' });
  }

  create(): void {
    this.monsters = [];
    this.roomCleared = false;
    this.playerDead = false;
    this.attackCooldown = 0;
    this.roomsEntered = new Set();
    this.roomMonsters = new Map();
    this.dungeonState = createDungeonState();

    const character = gameState.getCharacter();

    // 背景
    this.cameras.main.setBackgroundColor('#111111');

    // 生成地牢地图
    this.roomGenerator = new RoomGenerator();
    const { rooms, corridors, startRoom } = this.roomGenerator.generateFloor(this, this.floor);

    this.floorWalkability = createFloorWalkability(
      rooms.map(room => room.layout),
      corridors.map(corridor => ({
        startRoomId: corridor.startRoomId,
        endRoomId: corridor.endRoomId,
        path: corridor.path,
      })),
      CORRIDOR_WIDTH,
    );

    // 渲染所有房间（无偏移，摄像机自动跟随玩家居中）
    for (const room of rooms) {
      room.render(0, 0);
    }

    for (const corridor of corridors) {
      corridor.render(0, 0, CORRIDOR_WIDTH);
    }

    // 设置起始房间为当前房间
    this.currentRoom = startRoom;
    this.currentRoom.isEntered = true;

    // 为所有房间生成怪物
    for (const room of rooms) {
      if (room.type === 'boss') continue; // Boss房间不生成普通怪物
      this.spawnMonstersForRoom(room);
    }

    // 设置当前房间的怪物列表
    this.monsters = this.roomMonsters.get(this.currentRoom.id) ?? [];

    // 创建玩家（在当前房间中心）
    const playerGridX = this.currentRoom.roomData.position.x + this.currentRoom.roomData.position.width / 2;
    const playerGridY = this.currentRoom.roomData.position.y + this.currentRoom.roomData.position.height / 2;
    this.player = new Player(this, character, Math.round(playerGridX), Math.round(playerGridY));

    // 碰撞检测：整层房间 + 走廊都可探索，且不能走到怪物所在的格子
    this.player.isWalkable = (gx, gy) => {
      if (!this.floorWalkability.isWalkable(gx, gy)) return false;
      return !this.monsters.some(m => !m.isDead && m.gridX === gx && m.gridY === gy);
    };

    // 输入
    this.input.mouse!.disableContextMenu();

    // 鼠标悬停高亮怪物
    let hoveredMonster: Monster | Boss | null = null;
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // 取消之前的悬停高亮（如果不是锁定目标）
      if (hoveredMonster && hoveredMonster !== this.player.attackTarget) {
        hoveredMonster.unhighlight();
      }
      hoveredMonster = null;
      // 检查鼠标下方是否有怪物
      for (const monster of this.monsters) {
        if (!monster.isDead && monster.container.visible) {
          const bounds = monster.container.getBounds();
          if (bounds.contains(pointer.x, pointer.y)) {
            hoveredMonster = monster;
            if (monster !== this.player.attackTarget) {
              monster.highlight();
            }
            break;
          }
        }
      }
    });

    // 点击选择目标
    this.events.on('monster:click', (monster: Monster | Boss) => {
      if (!monster.isDead && !this.playerDead) {
        // 清除旧目标高亮
        this.player.clearTarget();
        this.player.setTarget(monster);
        monster.highlight();
      }
    });

    // 自动攻击回调（仅战士使用）
    this.player.onAutoAttack = (target: Monster | Boss) => {
      if (!target.isDead && !this.playerDead && this.player.character.class === 'warrior') {
        this.attackMonster(target);
      }
    };

    // 左键点击地面移动（如果没点到怪物）
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.playerDead) return;
      if (pointer.leftButtonDown()) {
        // 检查是否点击了怪物
        let clickedMonster = false;
        for (const monster of this.monsters) {
          if (!monster.isDead && monster.container.visible) {
            const bounds = monster.container.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
              clickedMonster = true;
              break;
            }
          }
        }
        // 没点到怪物 → 移动到点击位置
        if (!clickedMonster) {
          this.player.moveToScreen(pointer.x, pointer.y, this.cameras.main.scrollX, this.cameras.main.scrollY);
        }
      }
    });

    // Camera跟随
    this.cameras.main.startFollow(this.player.container, true, 0.1, 0.1);

    // 启动UI层
    this.scene.launch('UIScene');

    this.cameras.main.fadeIn(300);
  }

  update(_time: number, delta: number): void {
    if (this.playerDead) return;

    this.player.update(delta);

    // 检测房间切换
    this.checkRoomTransition();

    // 更新怪物AI
    const playerGrid = this.player.getGridPosition();
    for (const monster of this.monsters) {
      if (!monster.isDead) {
        monster.update(playerGrid.x, playerGrid.y, this.time.now);
        // Monster外部触发攻击
        if (monster instanceof Monster && monster.canAttack(this.time.now)) {
          monster.performAttack(this.player.combatEntity, this.player.container.x, this.player.container.y);
          this.cameras.main.shake(80, 0.003);
          // 受击装备耐久损耗
          const char = gameState.getCharacter();
          if (char.equipment.armor) consumeDurability(char, 'armor', 1);
          if (char.equipment.shield) consumeDurability(char, 'shield', 1);
        }
      }
    }

    // 每帧同步HP：头顶血条直接读combatEntity.hp，底部HUD读character.stats.hp
    this.player.syncHp();
    this.player.updateHpBar();

    // 检查玩家死亡
    if (this.player.combatEntity.hp <= 0 && !this.playerDead) {
      this.playerDied();
    }

    // 检查房间通关
    if (!this.roomCleared && this.monsters.every(m => m.isDead)) {
      this.roomCleared = true;
      this.onRoomCleared();
    }

    // 更新UIScene中的HUD
    const uiScene = this.scene.get('UIScene') as UIScene | null;
    if (uiScene) {
      uiScene.hud?.update(gameState.getCharacter());
    }
  }

  /** 在指定房间生成怪物 */
  private spawnMonstersForRoom(room: Room): void {
    const spawnPositions = room.getMonsterSpawnPositions();
    const density = 0.08;
    const floorMultiplier = getFloorMultiplier(this.floor, this.dungeonState.isAbyss);

    const roomMonsters = spawnMonstersInRoom(
      this,
      spawnPositions,
      this.floor,
      floorMultiplier,
      density,
    );

    this.roomMonsters.set(room.id, roomMonsters);

    // 设置死亡回调
    for (const monster of roomMonsters) {
      monster.onDeath = (m: Monster | Boss) => this.onMonsterDeath(m);
    }
  }

  /** 检测玩家是否进入了新房间 */
  private checkRoomTransition(): void {
    const pg = this.player.getGridPosition();
    for (const room of this.roomGenerator.getAllRooms()) {
      const pos = room.roomData.position;
      if (pg.x >= pos.x && pg.x < pos.x + pos.width
        && pg.y >= pos.y && pg.y < pos.y + pos.height) {
        if (room.id !== this.currentRoom.id) {
          this.enterRoom(room);
        }
        return;
      }
    }
  }

  /** 进入新房间 */
  private enterRoom(room: Room): void {
    // 始终切换当前房间和怪物列表
    this.currentRoom = room;
    this.monsters = this.roomMonsters.get(room.id) ?? [];

    // 如果这个房间之前已经触发过通关事件，不再重复触发
    if (this.roomsEntered.has(room.id)) {
      this.roomCleared = true;
      return;
    }

    if (room.isCleared) {
      // 已通关的房间，直接标记为已处理，不触发通关事件
      this.roomsEntered.add(room.id);
      this.roomCleared = true;
    } else {
      // 未通关的房间
      room.isEntered = true;
      this.roomCleared = false;
      this.applyMonsterWalkability();
    }
  }

  /** 攻击怪物 */
  private attackMonster(monster: Monster | Boss): void {
    if (this.playerDead) return;

    const now = this.time.now;
    if (now - this.attackCooldown < 500) return;
    this.attackCooldown = now;

    this.player.playAttackAnimation({ x: monster.container.x, y: monster.container.y }, () => {
      const result = calcPhysicalDamage(this.player.combatEntity.stats, monster.combatEntity.stats);
      applyDamage(monster.combatEntity, result);
      monster.takeDamage(result.finalDamage, result.isCritical);
      monster.flashHit();

      // 屏幕震动
      this.cameras.main.shake(100, 0.005);

      // 武器耐久损耗（每次攻击-1）
      const character = gameState.getCharacter();
      if (character.equipment.weapon) {
        consumeDurability(character, 'weapon', 1);
      }
    });
  }

  /** 怪物死亡 */
  private onMonsterDeath(monster: Monster | Boss): void {
    // 如果玩家正在攻击此怪物，清除目标
    if (this.player.attackTarget === monster) {
      this.player.clearTarget();
    }

    const character = gameState.getCharacter();

    // 掉落计算（Boss和Monster使用不同的数据结构）
    let drop;
    if (monster instanceof Monster) {
      drop = calculateMonsterDrop(monster.monsterData, 1.0, false, this.pity);
    } else {
      // Boss掉落：直接给固定奖励
      drop = { goldAmount: 100 * this.floor, expAmount: 50 * this.floor };
    }

    addGold(character, drop.goldAmount);
    const levelResult = addExperience(character, drop.expAmount);

    showNotification(this, `+${drop.goldAmount} 金币  +${drop.expAmount} 经验`, '#ffdd44');
    if (levelResult.levelsGained > 0) {
      showNotification(this, `升级! Lv.${levelResult.newLevel}`, '#ff88ff');
    }

    const idx = this.monsters.indexOf(monster);
    if (idx !== -1) this.monsters.splice(idx, 1);
  }

  /** 房间通关 */
  private onRoomCleared(): void {
    this.roomsEntered.add(this.currentRoom.id);
    showNotification(this, '房间已清除!', '#44ff44');
    this.currentRoom.markCleared();

    // 深渊模式判定（10%概率触发）
    const abyssTriggered = tryTriggerAbyss(this.dungeonState);
    if (abyssTriggered) {
      const uiScene = this.scene.get('UIScene') as UIScene | null;
      if (uiScene) {
        uiScene.showAbyssChoice(
          () => { this.dungeonState.isAbyss = true; },
          () => { this.dungeonState.isAbyss = false; },
        );
      }
    }

    // Boss房间检查
    if (this.currentRoom.roomData.type === 'boss') {
      this.spawnBossInRoom();
      return;
    }

    // 获取相邻房间
    const adjacent = this.roomGenerator.getAdjacentRooms(this.currentRoom.id);
    if (adjacent.length === 0) {
      // 没有相邻房间，通关
      showNotification(this, '地牢通关! 返回城镇', '#ffcc44');
      this.time.delayedCall(1500, () => this.backToTown());
      return;
    }

    // 指向出口方向
    showNotification(this, '走向相邻房间继续探索', '#66cc66');
  }

  /** 玩家死亡 */
  private playerDied(): void {
    this.playerDead = true;

    const character = gameState.getCharacter();
    const penalty = applyDeathPenalty(character);

    // 通过UIScene显示死亡面板
    const uiScene = this.scene.get('UIScene') as UIScene | null;
    if (uiScene) {
      uiScene.showDeathPenalty(penalty.expLost, penalty.goldLost, penalty.itemsLost, () => this.backToTown());
    } else {
      this.time.delayedCall(1500, () => this.backToTown());
    }
  }

  /** 返回城镇 */
  private backToTown(): void {
    const character = gameState.getCharacter();
    const maxHp = character.class === 'warrior' ? 100 : 60;
    character.stats.hp = maxHp;

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TownScene');
    });
  }

  /** 获取小地图数据 */
  getMinimapData(): {
    rooms: Array<{ x: number; y: number; w: number; h: number; type: string; cleared: boolean }>;
    playerGrid: { x: number; y: number };
    monsters: MiniMapMonster[];
  } {
    const allRooms = this.roomGenerator.getAllRooms();
    const rooms = allRooms.map(r => ({
      x: r.roomData.position.x,
      y: r.roomData.position.y,
      w: r.roomData.position.width,
      h: r.roomData.position.height,
      type: r.roomData.type,
      cleared: r.isCleared,
    }));

    // 收集所有房间的怪物（小地图显示全层怪物位置）
    const monsters: MiniMapMonster[] = [];
    for (const roomMonsters of this.roomMonsters.values()) {
      for (const monster of roomMonsters) {
        if (!monster.isDead) {
          monsters.push({
            x: monster.gridX,
            y: monster.gridY,
            isBoss: monster instanceof Boss,
          });
        }
      }
    }

    return { rooms, playerGrid: this.player.getGridPosition(), monsters };
  }

  /** 在Boss房间生成Boss */
  private spawnBossInRoom(): void {
    const spawnPositions = this.currentRoom.getMonsterSpawnPositions();
    if (spawnPositions.length === 0) return;

    const pos = spawnPositions[0];
    const floorMultiplier = getFloorMultiplier(this.floor, this.dungeonState.isAbyss);

    const boss = createBoss(this, {
      floor: this.floor,
      gridX: pos.x,
      gridY: pos.y,
      floorMultiplier,
    });

    boss.onDeath = (m) => this.onMonsterDeath(m);
    boss.isWalkable = (gx, gy) => {
      if (!this.floorWalkability.isWalkable(gx, gy)) return false;
      const pg = this.player.getGridPosition();
      if (pg.x === gx && pg.y === gy) return false;
      return !this.monsters.some(m => m !== boss && !m.isDead && m.gridX === gx && m.gridY === gy);
    };
    boss.setTarget(this.player.combatEntity);

    // 使用roomMonsters跟踪Boss
    const bossMonsters = [boss];
    this.roomMonsters.set(this.currentRoom.id, bossMonsters);
    this.monsters = bossMonsters;
    this.roomCleared = false;

    showNotification(this, `Boss出现: ${boss.bossData.name}!`, '#ff4444');
  }

  private applyMonsterWalkability(): void {
    for (const monster of this.monsters) {
      monster.isWalkable = (gx, gy) => {
        if (!this.floorWalkability.isWalkable(gx, gy)) return false;
        // 不能走到玩家所在格子
        const pg = this.player.getGridPosition();
        if (pg.x === gx && pg.y === gy) return false;
        // 不能走到其他怪物所在格子
        return !this.monsters.some(m => m !== monster && !m.isDead && m.gridX === gx && m.gridY === gy);
      };
    }
  }
}
