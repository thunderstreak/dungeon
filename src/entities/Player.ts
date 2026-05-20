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
import { createPlayerPixelBody, getPlayerMoveAnimationPose } from '@/ui/PixelBodies';
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
      // 法师使用精灵图
      this.sprite = scene.add.sprite(0, 0, 'wizard');
      this.sprite.setScale(TILE_SIZE / 128);
      this.sprite.play('wizard_idle');
      this.container.add(this.sprite);
      // body 保留为空容器，避免 null 检查
      this.body = scene.add.container(0, 0);
      this.body.setVisible(false);
    } else {
      // 战士使用像素方块
      this.body = createPlayerPixelBody(scene);
      this.container.add(this.body);
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

    // 法师受伤动画
    if (this.isMage && this.sprite && this.combatEntity.hp > 0) {
      this.sprite.setTint(0xff8888);
      this.sprite.play('wizard_hurt');
      this.sprite.once('animationcomplete', () => {
        this.sprite?.clearTint();
        this.sprite?.play('wizard_idle');
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
    if (this.isMage && this.sprite) {
      this.sprite.play('wizard_death');
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
    if (this.isMage && this.sprite) {
      // 法师播放施法动画
      this.sprite.play('wizard_spell');
      this.sprite.once('animationcomplete', () => {
        this.sprite!.play('wizard_idle');
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
    if (this.isMage && this.sprite) {
      // 法师精灵动画
      if (this.isMoving) {
        if (this.sprite.anims.currentAnim?.key !== 'wizard_walk') {
          this.sprite.play('wizard_walk');
        }
      } else {
        if (this.sprite.anims.currentAnim?.key !== 'wizard_idle') {
          this.sprite.play('wizard_idle');
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

  private ensureWizardAnims(scene: Phaser.Scene): void {
    if (Player.wizardAnimsCreated) return;
    Player.wizardAnimsCreated = true;

    const COLS = 21;
    const wiz = (row: number, start: number, end: number) => {
      const s = row * COLS + start;
      const e = row * COLS + end;
      return scene.anims.generateFrameNumbers('wizard', { start: s, end: e });
    };
    scene.anims.create({ key: 'wizard_idle', frames: wiz(0, 0, 7), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'wizard_walk', frames: wiz(1, 0, 7), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: 'wizard_spell', frames: wiz(2, 0, 12), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_attack', frames: wiz(3, 0, 12), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_buff', frames: wiz(4, 0, 16), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_hurt', frames: wiz(5, 0, 4), frameRate: 15, repeat: 0 });
    scene.anims.create({ key: 'wizard_death', frames: wiz(6, 0, 9), frameRate: 10, repeat: 0 });
  }
}
