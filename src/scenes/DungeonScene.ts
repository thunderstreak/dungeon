// 地牢场景 - 右键移动 + 左键攻击 + 房间战斗 + 掉落 + 关卡推进

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '@/config';
import { gameState } from '@/state/GameState';
import { getMonstersByFloor } from '@/data/monsters';
import type { MonsterDefinition } from '@/data/monsters';
import { PlayerEntity } from '@/entities/PlayerEntity';
import { MonsterEntity } from '@/entities/MonsterEntity';
import { Hud } from '@/ui/Hud';
import { showNotification } from '@/ui/NotificationToast';
import { calcPhysicalDamage, applyDamage, createCombatEntityFromCharacter } from '@/systems/BattleSystem';
import { calculateMonsterDrop, PityCounter } from '@/systems/DropSystem';
import { addExperience } from '@/systems/LevelSystem';
import { addGold } from '@/systems/InventorySystem';

const MAX_ROOMS = 5;

export class DungeonScene extends Phaser.Scene {
  private player!: PlayerEntity;
  private monsters: MonsterEntity[] = [];
  private hud!: Hud;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private playerCombatEntity!: ReturnType<typeof createCombatEntityFromCharacter>;
  private pity = new PityCounter();
  private roomNumber = 1;
  private roomCleared = false;
  private exitZone: Phaser.GameObjects.Rectangle | null = null;
  private floorMonsters: MonsterDefinition[] = [];
  private attackCooldown = 0;
  private playerDead = false;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  create(): void {
    this.monsters = [];
    this.roomNumber = 1;
    this.roomCleared = false;
    this.playerDead = false;
    this.exitZone = null;
    this.attackCooldown = 0;

    const character = gameState.getCharacter();
    this.playerCombatEntity = createCombatEntityFromCharacter(character);
    // 同步HP/MP到角色数据
    this.playerCombatEntity.hp = character.stats.hp;
    this.playerCombatEntity.maxHp = character.stats.hp;
    this.playerCombatEntity.mp = character.stats.mp;
    this.playerCombatEntity.maxMp = character.stats.mp;

    // 获取第1层怪物数据
    this.floorMonsters = getMonstersByFloor(1);

    // 背景
    this.cameras.main.setBackgroundColor('#111111');

    // 创建玩家
    this.player = new PlayerEntity(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80, character.name);

    // HUD
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

    // 禁用右键菜单
    this.input.mouse!.disableContextMenu();

    // 鼠标点击事件
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.playerDead || this.dialogBoxOpen()) return;

      if (pointer.rightButtonDown()) {
        // 右键：移动到目标位置
        this.player.moveTo(pointer.x, pointer.y);
      }
    });

    // 怪物点击事件（左键点击怪物攻击）
    this.events.on('monster:click', (monster: MonsterEntity) => {
      if (!monster.isDead) {
        this.attackMonster(monster);
      }
    });

    // 生成第一关
    this.spawnRoom();

    // 入场动画
    this.cameras.main.fadeIn(300);
  }

  update(time: number, delta: number): void {
    if (this.playerDead) return;

    // 玩家移动（支持 WASD 和点击移动）
    this.player.update(this.cursors, this.wasd);

    // 更新怪物AI
    const playerPos = this.player.getPosition();
    for (const monster of this.monsters) {
      if (!monster.isDead) {
        monster.update(playerPos, time);
        if (monster.canAttack(time)) {
          monster.performAttack(this.playerCombatEntity);
          this.syncPlayerHp();
        }
      }
    }

    // 检查玩家死亡
    if (this.playerCombatEntity.hp <= 0 && !this.playerDead) {
      this.playerDied();
    }

    // 检查房间通关
    if (!this.roomCleared && this.monsters.every(m => m.isDead)) {
      this.roomCleared = true;
      this.onRoomCleared();
    }

    // 检查出口
    this.checkExit();

    // 更新HUD
    this.hud.update(gameState.getCharacter());
  }

  private spawnRoom(): void {
    this.roomCleared = false;

    // 房间墙壁
    this.drawRoom();

    // 随机生成2-3个怪物
    const count = 2 + Math.floor(Math.random() * 2);
    const positions = [
      { x: CANVAS_WIDTH * 0.3, y: CANVAS_HEIGHT * 0.3 },
      { x: CANVAS_WIDTH * 0.7, y: CANVAS_HEIGHT * 0.3 },
      { x: CANVAS_WIDTH * 0.5, y: CANVAS_HEIGHT * 0.25 },
      { x: CANVAS_WIDTH * 0.2, y: CANVAS_HEIGHT * 0.5 },
      { x: CANVAS_WIDTH * 0.8, y: CANVAS_HEIGHT * 0.5 },
    ];

    // 随机打乱位置
    const shuffled = Phaser.Utils.Array.Shuffle([...positions]);

    for (let i = 0; i < count && i < this.floorMonsters.length; i++) {
      const monsterData = this.floorMonsters[i % this.floorMonsters.length];
      const pos = shuffled[i];
      const monster = new MonsterEntity(this, pos.x, pos.y, monsterData);
      monster.onDeath = (m) => this.onMonsterDeath(m);
      this.monsters.push(monster);
    }

    // 房间信息
    this.add.text(CANVAS_WIDTH / 2, 25, `第${this.roomNumber}间`, {
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5).setDepth(100);
  }

  private drawRoom(): void {
    // 墙壁边框
    const wallColor = 0x333344;
    const wallThickness = 20;

    // 上墙
    this.add.rectangle(CANVAS_WIDTH / 2, wallThickness / 2, CANVAS_WIDTH, wallThickness, wallColor);
    // 下墙
    this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - wallThickness / 2, CANVAS_WIDTH, wallThickness, wallColor);
    // 左墙
    this.add.rectangle(wallThickness / 2, CANVAS_HEIGHT / 2, wallThickness, CANVAS_HEIGHT, wallColor);
    // 右墙
    this.add.rectangle(CANVAS_WIDTH - wallThickness / 2, CANVAS_HEIGHT / 2, wallThickness, CANVAS_HEIGHT, wallColor);

    // 地板格子
    for (let x = 40; x < CANVAS_WIDTH - 40; x += 48) {
      for (let y = 40; y < CANVAS_HEIGHT - 40; y += 48) {
        this.add.rectangle(x, y, 44, 44, 0x1a1a22, 0.3);
      }
    }
  }

  private attackMonster(monster: MonsterEntity): void {
    if (this.playerDead) return;

    // 攻击冷却
    const now = this.time.now;
    if (now - this.attackCooldown < 500) return; // 0.5秒冷却
    this.attackCooldown = now;

    // 计算伤害
    const result = calcPhysicalDamage(this.playerCombatEntity.stats, monster.combatEntity.stats);
    applyDamage(monster.combatEntity, result);

    // 同步显示
    monster.takeDamage(result.finalDamage, result.isCritical);
  }

  private onMonsterDeath(monster: MonsterEntity): void {
    // 计算掉落
    const drop = calculateMonsterDrop(monster.monsterData, 1.0, false, this.pity);

    // 加金币
    const character = gameState.getCharacter();
    addGold(character, drop.goldAmount);

    // 加经验
    const levelResult = addExperience(character, drop.expAmount);

    // 通知
    showNotification(this, `+${drop.goldAmount} 金币  +${drop.expAmount} 经验`, '#ffdd44');
    if (levelResult.levelsGained > 0) {
      showNotification(this, `升级! Lv.${levelResult.newLevel}`, '#ff88ff');
    }

    // 从列表移除
    const idx = this.monsters.indexOf(monster);
    if (idx !== -1) this.monsters.splice(idx, 1);
  }

  private onRoomCleared(): void {
    const character = gameState.getCharacter();
    showNotification(this, '房间已清除!', '#44ff44');

    if (this.roomNumber >= MAX_ROOMS) {
      // 通关
      showNotification(this, '地牢通关! 返回城镇', '#ffcc44');
      this.time.delayedCall(1500, () => this.backToTown());
      return;
    }

    // 显示出口
    this.exitZone = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30, 100, 40, 0x44aa44, 0.8)
      .setStrokeStyle(2, 0x66cc66)
      .setDepth(10);
    this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30, '→ 下一关', {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);

    // 出口提示
    showNotification(this, '走向出口进入下一关', '#66cc66');
  }

  private syncPlayerHp(): void {
    const character = gameState.getCharacter();
    // 将战斗实体的HP同步回角色数据
    character.stats.hp = this.playerCombatEntity.hp;
  }

  private playerDied(): void {
    this.playerDead = true;

    // 死亡惩罚：损失10%经验和10%金币
    const character = gameState.getCharacter();
    const expLoss = Math.floor(character.experience * 0.1);
    const goldLoss = Math.floor(character.gold * 0.1);
    character.experience = Math.max(0, character.experience - expLoss);
    character.gold = Math.max(0, character.gold - goldLoss);

    showNotification(this, `你被击败了! 损失${expLoss}经验 ${goldLoss}金币`, '#ff4444');

    // 清除怪物
    for (const m of this.monsters) {
      m.destroy();
    }
    this.monsters = [];

    this.time.delayedCall(1500, () => this.backToTown());
  }

  private backToTown(): void {
    // 恢复玩家HP到最大
    const character = gameState.getCharacter();
    const maxHp = character.class === 'warrior' ? 100 : 60;
    character.stats.hp = maxHp;

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TownScene');
    });
  }

  private dialogBoxOpen(): boolean {
    return false; // Demo中无对话框在地牢
  }

  // 地牢update中的出口检测
  private checkExit(): void {
    if (!this.exitZone || !this.roomCleared) return;

    const playerPos = this.player.getPosition();
    const exitBounds = this.exitZone.getBounds();
    if (exitBounds.contains(playerPos.x, playerPos.y)) {
      this.roomNumber++;
      this.clearRoom();
      this.spawnRoom();
    }
  }

  private clearRoom(): void {
    // 清除旧怪物
    for (const m of this.monsters) {
      m.destroy();
    }
    this.monsters = [];

    // 清除出口
    if (this.exitZone) {
      this.exitZone.destroy();
      this.exitZone = null;
    }
  }
}
