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
import { executeSkillDamage, isSkillReady } from '@/systems/SkillSystem';
import { ALL_SKILLS } from '@/data/skills';
import type { Equipment, SkillSlot } from '@/config/types';
import { calculateMonsterDrop, PityCounter } from '@/systems/DropSystem';
import { addExperience } from '@/systems/LevelSystem';
import { addGold, addEquipment, addItem } from '@/systems/InventorySystem';
import { GroundLoot } from '@/entities/GroundLoot';
import { generateLootItems } from '@/systems/LootGenerator';
import { getEquipmentById } from '@/data/equipment';
import { getPotionById, getMaterialById } from '@/data/items';
import { RARITY_COLORS } from '@/config/constants';
import type { Item } from '@/config/types';
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
  private groundLoots: GroundLoot[] = [];

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

    // 注册动画
    this.createAnimations();

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

    // 点击怪物标记（防止pointerdown同时触发移动）
    let monsterClickedThisFrame = false;

    // 点击选择目标 + 如果在攻击范围内直接攻击
    this.events.on('monster:click', (monster: Monster | Boss) => {
      monsterClickedThisFrame = true;
      if (!monster.isDead && !this.playerDead) {
        this.player.clearTarget();
        this.player.setTarget(monster);
        monster.highlight();

        // 在攻击范围内 → 直接攻击
        if (this.player.isInRange(monster)) {
          this.attackMonster(monster);
        }
      }
    });

    // 左键点击地面移动（如果没点到怪物，且不在底部HUD区域）
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.playerDead) return;
      if (pointer.leftButtonDown()) {
        // 底部HUD区域不触发移动
        if (pointer.y > CANVAS_HEIGHT - 94) return;
        // 本帧已点击怪物 → 不移动
        if (monsterClickedThisFrame) {
          monsterClickedThisFrame = false;
          return;
        }
        this.player.moveToScreen(pointer.x, pointer.y, this.cameras.main.scrollX, this.cameras.main.scrollY);
      }
    });

    // Camera跟随
    this.cameras.main.startFollow(this.player.container, true, 0.1, 0.1);

    // 启动UI层（先停止确保重新创建）
    this.scene.stop('UIScene');
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

    // 检测技能/DOT伤害导致的死亡（HP<=0但未触发die的怪物）
    for (const monster of this.monsters) {
      if (!monster.isDead && monster.combatEntity.hp <= 0) {
        monster.die();
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

    // 更新地面掉落物 + 拾取检测
    for (let i = this.groundLoots.length - 1; i >= 0; i--) {
      const loot = this.groundLoots[i];
      if (!loot.update(this.time.now, delta)) {
        loot.destroy();
        this.groundLoots.splice(i, 1);
        continue;
      }
      if (this.player.gridX === loot.gridX && this.player.gridY === loot.gridY) {
        this.pickupLoot(loot);
        this.groundLoots.splice(i, 1);
      }
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
    const density = 0.04;
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
    const cooldown = 160000 / this.player.character.stats.attackSpeed;
    if (now - this.attackCooldown < cooldown) return;
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

  /** 释放魔法弹道 */
  private fireProjectile(target: Monster | Boss, skillId: string, onHit: () => void): void {
    // 根据技能选择弹道颜色和大小
    const colorMap: Record<string, { color: number; radius: number; speed: number }> = {
      mage_fireball: { color: 0xff4400, radius: 5, speed: 400 },
      mage_ice_bolt: { color: 0x44aaff, radius: 4, speed: 500 },
      mage_chain_lightning: { color: 0xffff44, radius: 3, speed: 600 },
    };
    const config = colorMap[skillId] ?? { color: 0xaa44ff, radius: 4, speed: 450 };

    const startX = this.player.container.x;
    const startY = this.player.container.y;
    const endX = target.container.x;
    const endY = target.container.y;

    const projectile = this.add.circle(startX, startY, config.radius, config.color);
    projectile.setDepth(2000);

    const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    const duration = (distance / config.speed) * 1000;

    this.tweens.add({
      targets: projectile,
      x: endX,
      y: endY,
      duration: Math.max(100, duration),
      ease: 'Linear',
      onComplete: () => {
        projectile.destroy();
        onHit();
      },
    });
  }

  /** 释放技能（区分远程弹道和近战瞬发） */
  castSkillOnTarget(skillSlot: SkillSlot, target: Monster | Boss): void {
    if (this.playerDead || target.isDead) return;

    const skillData = ALL_SKILLS.find(s => s.id === skillSlot.skillId);
    if (!skillData) return;

    const character = gameState.getCharacter();
    if (!isSkillReady(character, skillSlot.skillId)) return;

    // 近战物理需要在攻击范围内（MP/冷却前检查）
    if (skillData.damage?.type !== 'magic' && !this.player.isInRange(target)) return;

    // 消耗MP和设置冷却（立即生效，防止连按）
    if (skillData.manaCost) character.stats.mp -= skillData.manaCost;
    if (skillData.cooldown) skillSlot.cooldownRemaining = skillData.cooldown;

    if (skillData.damage?.type === 'magic') {
      // 远程魔法：先弹道再伤害（无距离限制）
      this.fireProjectile(target, skillSlot.skillId, () => {
        const result = executeSkillDamage(this.player.combatEntity, target.combatEntity, skillSlot.skillId, skillSlot.level);
        if (result) {
          if (target instanceof Monster) {
            target.takeDamage(result.finalDamage, result.isCritical, true);
            target.flashHit();
          } else if (target instanceof Boss) {
            target.takeDamage(result.finalDamage, result.isCritical, true);
            target.flashHit();
          }
        }
        this.player.syncHp();
      });
    } else {
      // 近战物理
      const result = executeSkillDamage(this.player.combatEntity, target.combatEntity, skillSlot.skillId, skillSlot.level);
      if (result) {
        if (target instanceof Monster) {
          target.takeDamage(result.finalDamage, result.isCritical, true);
          target.flashHit();
        } else if (target instanceof Boss) {
          target.takeDamage(result.finalDamage, result.isCritical, true);
          target.flashHit();
        }
      }
      this.player.syncHp();
    }
  }

  /** 怪物死亡 */
  private onMonsterDeath(monster: Monster | Boss): void {
    // 如果玩家正在攻击此怪物，清除目标
    if (this.player.attackTarget === monster) {
      this.player.clearTarget();
    }

    const character = gameState.getCharacter();

    // 掉落计算（Boss和Monster使用不同的数据结构）
    let goldAmount: number;
    let expAmount: number;
    if (monster instanceof Monster) {
      const drop = calculateMonsterDrop(monster.monsterData, 1.0, false, this.pity);
      goldAmount = drop.goldAmount;
      expAmount = drop.expAmount;
      // 生成地面掉落物
      const lootItems = generateLootItems(drop, character.level);
      for (const item of lootItems) {
        const pos = this.findWalkableDropPosition(monster.gridX, monster.gridY);
        const loot = new GroundLoot(this, item, pos.x, pos.y);
        this.groundLoots.push(loot);
      }
    } else {
      // Boss掉落：直接给固定奖励
      goldAmount = 100 * this.floor;
      expAmount = 50 * this.floor;
    }

    addGold(character, goldAmount);
    const levelResult = addExperience(character, expAmount);

    showNotification(this, `+${goldAmount} 金币  +${expAmount} 经验`, '#ffdd44');
    if (levelResult.levelsGained > 0) {
      showNotification(this, `升级! Lv.${levelResult.newLevel}`, '#ff88ff');
      // 升级后恢复满HP/MP，同步combatEntity
      this.player.combatEntity.maxHp = character.stats.maxHp;
      this.player.combatEntity.maxMp = character.stats.maxMp;
      this.player.combatEntity.hp = character.stats.maxHp;
      this.player.combatEntity.mp = character.stats.maxMp;
      this.player.syncHp();
      this.player.updateHpBar();
    }

    const idx = this.monsters.indexOf(monster);
    if (idx !== -1) this.monsters.splice(idx, 1);
  }

  /** 从中心向外螺旋搜索可行走的掉落位置 */
  private findWalkableDropPosition(centerX: number, centerY: number): { x: number; y: number } {
    // 先试中心
    if (this.floorWalkability.isWalkable(centerX, centerY)) {
      return { x: centerX, y: centerY };
    }
    // 螺旋搜索半径1~3
    for (let r = 1; r <= 3; r++) {
      const candidates: { x: number; y: number }[] = [];
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const tx = centerX + dx;
          const ty = centerY + dy;
          if (this.floorWalkability.isWalkable(tx, ty)) {
            candidates.push({ x: tx, y: ty });
          }
        }
      }
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    return { x: centerX, y: centerY };
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
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;

    // 清理地面掉落物
    for (const loot of this.groundLoots) {
      loot.destroy();
    }
    this.groundLoots = [];

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UIScene');
      this.scene.start('TownScene');
    });
  }

  /** 拾取地面掉落物 */
  private pickupLoot(loot: GroundLoot): void {
    const character = gameState.getCharacter();
    const item = loot.item;
    let success = false;

    if (item.type === 'equipment') {
      const template = getEquipmentById(item.itemId);
      if (template) {
        const equipment: Equipment = {
          ...template,
          enhancementLevel: 0,
          durability: template.maxDurability,
        };
        success = addEquipment(character, equipment);
      }
    } else if (item.type === 'potion') {
      const potion = getPotionById(item.itemId);
      if (potion) {
        const consumableItem: Item = {
          id: potion.id,
          name: potion.name,
          type: 'consumable',
          icon: potion.icon,
          description: potion.description,
          isStackable: true,
          maxStack: potion.maxStack,
        };
        const added = addItem(character, consumableItem, item.count);
        success = added > 0;
      }
    } else if (item.type === 'material') {
      const mat = getMaterialById(item.itemId);
      if (mat) {
        const materialItem: Item = {
          id: mat.id,
          name: mat.name,
          type: 'material',
          icon: mat.icon,
          description: mat.description,
          isStackable: true,
          maxStack: mat.maxStack,
        };
        const added = addItem(character, materialItem, item.count);
        success = added > 0;
      }
    }

    if (success) {
      const color = RARITY_COLORS[item.rarity] ?? '#ffffff';
      showNotification(this, `拾取: ${item.name}`, color);
    } else {
      showNotification(this, '背包已满!', '#ff4444');
    }
    loot.destroy();
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

  /** 注册怪物动画 */
  private createAnimations(): void {
    if (this.anims.exists('octopus_idle')) return; // 已注册

    const rate = 12;

    // 章鱼动画
    this.anims.create({ key: 'octopus_idle', frames: this.anims.generateFrameNumbers('octopus_idle', { start: 0, end: 12 }), frameRate: rate, repeat: -1 });
    this.anims.create({ key: 'octopus_walk', frames: this.anims.generateFrameNumbers('octopus_walk', { start: 0, end: 12 }), frameRate: rate, repeat: -1 });
    this.anims.create({ key: 'octopus_attack', frames: this.anims.generateFrameNumbers('octopus_attack', { start: 0, end: 12 }), frameRate: 15, repeat: 0 });
    this.anims.create({ key: 'octopus_dmg', frames: this.anims.generateFrameNumbers('octopus_dmg', { start: 0, end: 12 }), frameRate: 15, repeat: 0 });
    this.anims.create({ key: 'octopus_death_1', frames: this.anims.generateFrameNumbers('octopus_death_1', { start: 0, end: 12 }), frameRate: rate, repeat: 0 });

    // 老鼠动画（棕/灰/白三色）
    const ratColors = ['brown', 'gray', 'white'];
    for (const color of ratColors) {
      const prefix = `rat_${color}`;
      this.anims.create({ key: `${prefix}_idle`, frames: this.anims.generateFrameNumbers(`${prefix}_idle`, { start: 0, end: 5 }), frameRate: rate, repeat: -1 });
      this.anims.create({ key: `${prefix}_walk`, frames: this.anims.generateFrameNumbers(`${prefix}_walk`, { start: 0, end: 3 }), frameRate: rate, repeat: -1 });
      this.anims.create({ key: `${prefix}_run`, frames: this.anims.generateFrameNumbers(`${prefix}_run`, { start: 0, end: 5 }), frameRate: 15, repeat: -1 });
      this.anims.create({ key: `${prefix}_attack`, frames: this.anims.generateFrameNumbers(`${prefix}_attack`, { start: 0, end: 5 }), frameRate: 15, repeat: 0 });
      this.anims.create({ key: `${prefix}_hurt`, frames: this.anims.generateFrameNumbers(`${prefix}_hurt`, { start: 0, end: 5 }), frameRate: 15, repeat: 0 });
      this.anims.create({ key: `${prefix}_dead`, frames: this.anims.generateFrameNumbers(`${prefix}_dead`, { start: 0, end: 5 }), frameRate: rate, repeat: 0 });
      this.anims.create({ key: `${prefix}_stand`, frames: this.anims.generateFrameNumbers(`${prefix}_stand`, { start: 0, end: 5 }), frameRate: rate, repeat: -1 });
    }
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
