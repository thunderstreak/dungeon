// 玩家实体 - 集成Character数据、等距移动、战斗、Buff管理

import Phaser from 'phaser';
import type { Character, Vector2 } from '@/config/types';
import { TILE_SIZE, MIN_SPEED, MAX_SPEED, DEFAULT_MOVE_SPEED } from '@/config/constants';
import { isoToScreen, screenToIso, getDepthSort } from '@/utils/IsometricUtils';
import { createCombatEntityFromCharacter, applyDamage, applyHeal, calcPhysicalDamage } from '@/systems/BattleSystem';
import type { CombatEntity, DamageResult } from '@/systems/BattleSystem';
import type { Monster } from './Monster';
import type { Boss } from './Boss';
import { playAttackAnimation as playAttackTween } from '@/ui/AttackAnimation';
import { getPlayerMoveAnimationPose } from '@/ui/PixelBodies';
import { createRegenState, updateRegen, recordDamage } from '@/systems/RegenSystem';
import type { RegenState } from '@/systems/RegenSystem';

/** 玩家朝向 */
type FacingDirection = 'left' | 'right' | 'up' | 'down';

export class Player {
  readonly scene: Phaser.Scene;
  readonly character: Character;

  container: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Container;
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private isMage: boolean;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;

  combatEntity: CombatEntity;

  gridX: number;
  gridY: number;
  isMoving = false;
  facingDirection: FacingDirection = 'down';

  // 平滑移动
  visualX: number;
  visualY: number;
  private targetVisualX = 0;
  private targetVisualY = 0;
  private readonly LERP_SPEED = 0.2; // 插值速度（0~1）
  private moveAnimationTime = 0;

  private moveTarget: Vector2 | null = null;
  private moveThreshold = 4;
  private moveSpeed: number;
  private moveAccumulator = 0;
  private readonly BASE_MOVE_INTERVAL = 180; // 基础移动间隔(ms)

  // 攻击目标
  attackTarget: Monster | Boss | null = null;

  // 攻击动画状态
  private isAttacking = false;

  // 自动恢复状态
  private regenState: RegenState;

  /** 碰撞检测回调：返回目标格子是否可行走 */
  isWalkable: (gridX: number, gridY: number) => boolean = () => true;

  constructor(scene: Phaser.Scene, character: Character, spawnX: number, spawnY: number) {
    this.scene = scene;
    this.character = character;
    this.gridX = spawnX;
    this.gridY = spawnY;

    // 计算移动速度（基于 moveSpeed 百分比）
    this.moveSpeed = this.calcMoveSpeed(character.stats.moveSpeed);

    // 初始化战斗实体
    this.combatEntity = createCombatEntityFromCharacter(character);

    // 初始化恢复状态
    this.regenState = createRegenState();

    // 屏幕坐标
    const pos = isoToScreen(spawnX, spawnY);
    this.visualX = pos.screenX;
    this.visualY = pos.screenY;
    this.targetVisualX = pos.screenX;
    this.targetVisualY = pos.screenY;

    // 容器
    this.container = scene.add.container(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(spawnY));

    // 根据职业选择渲染方式
    this.isMage = character.class === 'mage';
    const size = TILE_SIZE - 4;

    if (this.isMage) {
      // 确保法师动画已创建（可能在任意场景中首次创建Player）
      this.ensureWizardAnims(scene);
      // 法师使用精灵图，origin设为底部中心（脚部对齐）
      this.sprite = scene.add.sprite(0, 0, 'wizard');
      this.sprite.setOrigin(0.5, 1.0);
      this.sprite.setScale(TILE_SIZE / 128, TILE_SIZE / 128);
      this.sprite.play('wizard_idle');
      this.container.add(this.sprite);
      // body 保留为空容器，避免 null 检查
      this.body = scene.add.container(0, 0);
      this.body.setVisible(false);
    } else {
      // 战士使用精灵图
      this.ensureWarriorAnims(scene);
      this.sprite = scene.add.sprite(0, 0, 'warrior');
      this.sprite.setOrigin(0.5, 1.0);
      this.sprite.setScale(TILE_SIZE / 32, TILE_SIZE / 32);
      this.sprite.play('warrior_idle');
      this.container.add(this.sprite);
      // body 保留为空容器，避免 null 检查
      this.body = scene.add.container(0, 0);
      this.body.setVisible(false);
    }

    // 血条背景
    this.hpBarBg = scene.add.rectangle(0, -size / 2 - 8, TILE_SIZE - 4, 4, 0x333333);
    this.hpBarBg.setOrigin(0.5, 0.5);
    this.container.add(this.hpBarBg);

    // 血条填充
    this.hpBarFill = scene.add.rectangle(0, -size / 2 - 8, TILE_SIZE - 4, 4, 0x44dd44);
    this.hpBarFill.setOrigin(0, 0.5);
    this.hpBarFill.setPosition(-(TILE_SIZE - 4) / 2, -size / 2 - 8);
    this.container.add(this.hpBarFill);

    // 名字
    this.nameText = scene.add.text(0, -size / 2 - 16, character.name, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    this.updateHpBar();
  }

  update(delta: number): void {
    // 更新Buff
    this.combatEntity.buffManager.update(delta / 1000);

    // 更新自动恢复
    updateRegen(this.combatEntity, this.character, delta, this.regenState, this.scene.time.now);

    // 处理点击移动
    this.handleClickMove(delta);

    // 平滑插值视觉位置
    this.visualX += (this.targetVisualX - this.visualX) * this.LERP_SPEED;
    this.visualY += (this.targetVisualY - this.visualY) * this.LERP_SPEED;
    this.container.setPosition(this.visualX, this.visualY);

    this.updateMoveAnimation(delta);

    // 同步HP和MP
    this.syncHp();
    this.syncMp();

    // 检查死亡
    if (this.combatEntity.hp <= 0) {
      this.die();
    }
  }

  /** 处理点击移动 */
  private handleClickMove(delta: number): void {
    if (!this.moveTarget) return;

    const pos = isoToScreen(this.gridX, this.gridY);
    const dist = Phaser.Math.Distance.Between(
      pos.screenX, pos.screenY,
      this.moveTarget.x, this.moveTarget.y,
    );

    if (dist < this.moveThreshold) {
      this.moveTarget = null;
      this.isMoving = false;
      return;
    }

    // 累积时间控制点击移动速度
    const interval = this.BASE_MOVE_INTERVAL * (100 / this.moveSpeed);
    this.moveAccumulator += delta;
    if (this.moveAccumulator < interval) return;
    this.moveAccumulator -= interval;

    // 计算目标格子
    const targetIso = screenToIso(this.moveTarget.x, this.moveTarget.y);
    const tgx = Math.round(targetIso.x);
    const tgy = Math.round(targetIso.y);

    // 向目标移动一步
    const ddx = Math.sign(tgx - this.gridX);
    const ddy = Math.sign(tgy - this.gridY);

    if (ddx !== 0 || ddy !== 0) {
      if (Math.abs(tgx - this.gridX) >= Math.abs(tgy - this.gridY)) {
        this.facingDirection = ddx > 0 ? 'right' : 'left';
      } else {
        this.facingDirection = ddy > 0 ? 'down' : 'up';
      }

      if (Math.abs(tgx - this.gridX) >= Math.abs(tgy - this.gridY)) {
        this.moveByGrid(ddx, 0);
      } else {
        this.moveByGrid(0, ddy);
      }
    } else {
      this.moveTarget = null;
      this.isMoving = false;
    }
  }

  /** 检查是否在攻击范围内（相邻1格） */
  isInRange(target: Monster | Boss): boolean {
    const dx = Math.abs(target.gridX - this.gridX);
    const dy = Math.abs(target.gridY - this.gridY);
    return dx + dy <= 1;
  }

  /** 网格移动（设置目标位置，由update平滑插值） */
  moveByGrid(dx: number, dy: number): boolean {
    const newX = this.gridX + dx;
    const newY = this.gridY + dy;

    if (!this.isWalkable(newX, newY)) return false;

    this.gridX = newX;
    this.gridY = newY;

    const pos = isoToScreen(newX, newY);
    this.targetVisualX = pos.screenX;
    this.targetVisualY = pos.screenY;
    this.container.setDepth(getDepthSort(newY));

    this.isMoving = true;
    return true;
  }

  /** 设置点击移动目标（屏幕坐标，可选摄像机偏移转为世界坐标） */
  moveToScreen(targetX: number, targetY: number, cameraScrollX = 0, cameraScrollY = 0): void {
    this.moveTarget = { x: targetX + cameraScrollX, y: targetY + cameraScrollY };
    this.moveAccumulator = 0;
  }

  /** 停止移动 */
  stopMoving(): void {
    this.moveTarget = null;
    this.isMoving = false;
  }

  /** 锁定攻击目标 */
  setTarget(target: Monster | Boss): void {
    this.attackTarget = target;
    this.moveTarget = null; // 取消点击移动
  }

  /** 清除攻击目标 */
  clearTarget(): void {
    if (this.attackTarget) {
      this.attackTarget.unhighlight();
    }
    this.attackTarget = null;
  }

  /** 使用技能 */
  useSkill(skillId: string): boolean {
    // 委托给SkillSystem（预留接口）
    return false;
  }

  /** 受伤 */
  takeDamage(result: DamageResult): number {
    if (result.isDodged) return 0;

    const actualDamage = applyDamage(this.combatEntity, result);
    recordDamage(this.regenState, this.scene.time.now);
    this.syncHp();
    this.updateHpBar();

    // 受伤动画
    if (this.sprite && this.combatEntity.hp > 0) {
      const hurtKey = this.isMage ? 'wizard_hurt' : 'warrior_hurt';
      const idleKey = this.isMage ? 'wizard_idle' : 'warrior_idle';
      this.sprite.setTint(0xff8888);
      this.sprite.play(hurtKey);
      this.sprite.once('animationcomplete', () => {
        this.sprite?.clearTint();
        this.sprite?.play(idleKey);
      });
    }

    return actualDamage;
  }

  /** 治疗 */
  heal(amount: number): number {
    const actualHeal = applyHeal(this.combatEntity, amount);
    this.syncHp();
    this.updateHpBar();
    return actualHeal;
  }

  /** 死亡处理 */
  die(): void {
    if (this.sprite) {
      const deathKey = this.isMage ? 'wizard_death' : 'warrior_death';
      this.sprite.play(deathKey);
    }
  }

  /** 获取等距格子坐标 */
  getGridPosition(): Vector2 {
    return { x: this.gridX, y: this.gridY };
  }

  /** 获取屏幕坐标（视觉位置） */
  getScreenPosition(): Vector2 {
    return { x: this.visualX, y: this.visualY };
  }

  playAttackAnimation(target: { x: number; y: number }, onStrike: () => void): void {
    if (this.sprite) {
      // 根据职业选择攻击动画
      this.isAttacking = true;
      const attackKeys = ['warrior_attack1', 'warrior_attack2', 'warrior_attack3'];
      const attackKey = this.isMage ? 'wizard_spell' : attackKeys[Math.floor(Math.random() * 3)];
      const idleKey = this.isMage ? 'wizard_idle' : 'warrior_idle';
      this.sprite.play(attackKey);
      this.sprite.once('animationcomplete', () => {
        this.isAttacking = false;
        this.sprite!.play(idleKey);
      });
      // 延迟触发打击点
      this.scene.time.delayedCall(300, () => onStrike());
      return;
    }
    this.body.setPosition(0, 0);
    this.body.setRotation(0);
    this.body.setScale(1);
    const direction = {
      x: Math.sign(target.x - this.container.x),
      y: Math.sign(target.y - this.container.y),
    };
    playAttackTween(this.scene, this.container, 'player', direction, onStrike);
  }

  private updateMoveAnimation(delta: number): void {
    if (this.sprite) {
      // 攻击动画播放中，不覆盖
      if (this.isAttacking) return;

      // 根据视觉位置与目标的距离判断是否还在移动
      const visualDist = Phaser.Math.Distance.Between(
        this.visualX, this.visualY,
        this.targetVisualX, this.targetVisualY,
      );
      const visuallyMoving = visualDist > 0.5;
      const curAnim = this.sprite.anims.currentAnim;

      if (visuallyMoving) {
        const dx = this.targetVisualX - this.visualX;
        const dy = this.targetVisualY - this.visualY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (this.isMage) {
          if (!curAnim || curAnim.key !== 'wizard_walk') {
            this.sprite.play('wizard_walk', true);
          }
        } else {
          // 战士：-Y用run_up，+Y用镜像run（向左跑），水平用run+镜像
          let walkKey = 'warrior_run';
          let flipX = false;
          if (absDy > absDx) {
            // 垂直移动为主
            if (dy < 0) {
              // -Y（屏幕向上）用 run_up
              walkKey = 'warrior_run_up';
            } else {
              // +Y（屏幕向下）用镜像 run（向左跑）
              walkKey = 'warrior_run';
              flipX = true;
            }
          } else {
            // 水平移动为主，向左时镜像
            walkKey = 'warrior_run';
            flipX = dx < 0;
          }
          if (!curAnim || curAnim.key !== walkKey) {
            this.sprite.play(walkKey, true);
          }
          this.sprite.setFlipX(flipX);
        }
      } else {
        const idleKey = this.isMage ? 'wizard_idle' : 'warrior_idle';
        if (!curAnim || curAnim.key !== idleKey) {
          this.sprite.play(idleKey, true);
        }
        // 停止时重置镜像
        if (!this.isMage) {
          this.sprite.setFlipX(false);
        }
      }
      return;
    }

    if (!this.isMoving) {
      this.moveAnimationTime = 0;
      this.body.setPosition(0, 0);
      this.body.setRotation(0);
      return;
    }

    this.moveAnimationTime += delta;
    const phase = (this.moveAnimationTime % 360) / 360;
    const pose = getPlayerMoveAnimationPose(this.facingDirection, phase);

    this.body.setPosition(pose.torsoOffsetX, pose.torsoOffsetY + pose.bobOffsetY);
    this.body.setRotation(pose.armSwing * 0.01);
    this.body.setScale(1, 1 + pose.legSwing * 0.01);
  }

  /** 同步战斗实体HP到角色数据 */
  syncHp(): void {
    this.character.stats.hp = Math.max(0, this.combatEntity.hp);
  }

  /** 同步战斗实体MP到角色数据 */
  syncMp(): void {
    this.character.stats.mp = Math.max(0, this.combatEntity.mp);
  }

  /** 更新血条显示 */
  updateHpBar(): void {
    const ratio = Math.max(0, this.combatEntity.hp / this.combatEntity.maxHp);
    const maxWidth = TILE_SIZE - 4;
    this.hpBarFill.displayWidth = maxWidth * ratio;

    // 根据血量变色
    if (ratio > 0.6) {
      this.hpBarFill.fillColor = 0x44dd44;
    } else if (ratio > 0.3) {
      this.hpBarFill.fillColor = 0xdddd44;
    } else {
      this.hpBarFill.fillColor = 0xdd4444;
    }
  }

  /** 根据 moveSpeed 百分比计算实际像素速度 */
  private calcMoveSpeed(moveSpeedPercent: number): number {
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, moveSpeedPercent));
    return 200 * (clamped / DEFAULT_MOVE_SPEED);
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private static wizardAnimsCreated = false;
  private static warriorAnimsCreated = false;

  private ensureWizardAnims(scene: Phaser.Scene): void {
    if (Player.wizardAnimsCreated) return;
    Player.wizardAnimsCreated = true;

    // 所有动画从独立精灵表加载 (128x128每帧)
    scene.anims.create({ key: 'wizard_idle', frames: scene.anims.generateFrameNumbers('wizard_walk', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });
    scene.anims.create({ key: 'wizard_walk', frames: scene.anims.generateFrameNumbers('wizard_walk', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'wizard_attack', frames: scene.anims.generateFrameNumbers('wizard_attack', { start: 0, end: 7 }), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_spell', frames: scene.anims.generateFrameNumbers('wizard_attack', { start: 0, end: 7 }), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_buff', frames: scene.anims.generateFrameNumbers('wizard_attack', { start: 0, end: 7 }), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_hurt', frames: scene.anims.generateFrameNumbers('wizard_death', { start: 0, end: 0 }), frameRate: 1, repeat: 0 });
    scene.anims.create({ key: 'wizard_death', frames: scene.anims.generateFrameNumbers('wizard_death', { start: 0, end: 17 }), frameRate: 10, repeat: 0 });
  }

  private ensureWarriorAnims(scene: Phaser.Scene): void {
    if (Player.warriorAnimsCreated) return;
    Player.warriorAnimsCreated = true;

    // Adventurer-Sprite-Sheet: 416x480, 15排, 每帧32x32, 最多13列
    const COLS = 13;
    const war = (row: number, start: number, end: number) => {
      const s = row * COLS + start;
      const e = row * COLS + end;
      return scene.anims.generateFrameNumbers('warrior', { start: s, end: e });
    };
    // 第0排: 空闲 13帧
    scene.anims.create({ key: 'warrior_idle', frames: war(0, 0, 12), frameRate: 10, repeat: -1 });
    // 第1排: 向右跑 8帧
    scene.anims.create({ key: 'warrior_run', frames: war(1, 0, 7), frameRate: 12, repeat: -1 });
    // 第2排: 攻击1 10帧
    scene.anims.create({ key: 'warrior_attack1', frames: war(2, 0, 9), frameRate: 15, repeat: 0 });
    // 第3排: 攻击2 10帧
    scene.anims.create({ key: 'warrior_attack2', frames: war(3, 0, 9), frameRate: 15, repeat: 0 });
    // 第4排: 攻击3 10帧
    scene.anims.create({ key: 'warrior_attack3', frames: war(4, 0, 9), frameRate: 15, repeat: 0 });
    // 第5排: 跳跃 6帧
    scene.anims.create({ key: 'warrior_jump', frames: war(5, 0, 5), frameRate: 10, repeat: 0 });
    // 第6排: 受伤 4帧
    scene.anims.create({ key: 'warrior_hurt', frames: war(6, 0, 3), frameRate: 12, repeat: 0 });
    // 第7排: 死亡 7帧
    scene.anims.create({ key: 'warrior_death', frames: war(7, 0, 6), frameRate: 10, repeat: 0 });
    // 第8排: 攀爬 4帧
    scene.anims.create({ key: 'warrior_climb', frames: war(8, 0, 3), frameRate: 8, repeat: -1 });
    // 第9排: 弓箭射击 8帧
    scene.anims.create({ key: 'warrior_bow', frames: war(9, 0, 7), frameRate: 12, repeat: 0 });
    // 第10排: 施法 6帧
    scene.anims.create({ key: 'warrior_spell', frames: war(10, 0, 5), frameRate: 12, repeat: 0 });
    // 第11排: 向上奔跑 8帧
    scene.anims.create({ key: 'warrior_run_up', frames: war(11, 0, 7), frameRate: 12, repeat: -1 });
    // 第12排: 翻滚 5帧
    scene.anims.create({ key: 'warrior_roll', frames: war(12, 0, 4), frameRate: 12, repeat: 0 });
    // 第13排: 推箱子 8帧
    scene.anims.create({ key: 'warrior_push', frames: war(13, 0, 7), frameRate: 10, repeat: -1 });
    // 第14排: 传送 7帧
    scene.anims.create({ key: 'warrior_teleport', frames: war(14, 0, 6), frameRate: 12, repeat: 0 });
  }
}
