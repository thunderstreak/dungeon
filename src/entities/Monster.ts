// 怪物基类 - 支持近战/远程/法术/辅助型AI，仇恨响应，巡逻路径

import Phaser from 'phaser';
import type { MonsterDefinition } from '@/data/monsters';
import type { CombatEntity } from '@/systems/BattleSystem';
import { createCombatEntityFromMonster, calcPhysicalDamage, calcMagicDamage, applyDamage } from '@/systems/BattleSystem';
import { TILE_SIZE } from '@/config/constants';
import { isoToScreen, screenToIso, getDepthSort } from '@/utils/IsometricUtils';
import { showDamagePopup } from '@/ui/DamagePopup';
import { playAttackAnimation } from '@/ui/AttackAnimation';

/** AI状态 */
type MonsterAIState = 'idle' | 'patrol' | 'chase' | 'attack' | 'flee' | 'dead';

/** 怪物类型对应的AI行为 */
const AI_CONFIG: Record<string, {
  aggroMultiplier: number;
  attackRange: number;
  prefersMelee: boolean;
  fleeThreshold: number; // HP百分比，低于此值逃跑
}> = {
  melee:   { aggroMultiplier: 1.0, attackRange: 40, prefersMelee: true,  fleeThreshold: 0 },
  ranged:  { aggroMultiplier: 0.8, attackRange: 160, prefersMelee: false, fleeThreshold: 0.2 },
  caster:  { aggroMultiplier: 0.6, attackRange: 200, prefersMelee: false, fleeThreshold: 0.3 },
  support: { aggroMultiplier: 0.5, attackRange: 180, prefersMelee: false, fleeThreshold: 0.4 },
};

const BASE_MONSTER_MOVE_INTERVAL = 220;

export function getMonsterMoveInterval(moveSpeedPercent: number): number {
  const clampedSpeed = Math.max(60, moveSpeedPercent);
  return BASE_MONSTER_MOVE_INTERVAL * (100 / clampedSpeed);
}

export function getAggroDecayConfig(isBoss: boolean): { decayPerGrid: number; minChaseAggro: number; startAggro: number } {
  return isBoss
    ? { decayPerGrid: 8, minChaseAggro: 35, startAggro: 140 }
    : { decayPerGrid: 14, minChaseAggro: 20, startAggro: 100 };
}

export class Monster {
  readonly scene: Phaser.Scene;
  readonly monsterData: MonsterDefinition;
  readonly combatEntity: CombatEntity;

  container: Phaser.GameObjects.Container;
  private bodyRect: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;

  aiState: MonsterAIState = 'idle';
  isDead = false;

  // 格子坐标
  gridX: number;
  gridY: number;

  // AI参数
  private aiConfig;
  private aggroRangePx: number;
  private attackRangePx: number;
  private attackCooldown: number;
  private lastAttackTime = 0;
  private lastSkillTime = 0;
  private moveAccumulator = 0;
  private moveInterval: number;
  private aggroMeter: number;
  private lastTrackedPlayerGridX: number | null = null;
  private lastTrackedPlayerGridY: number | null = null;

  // 巡逻
  private patrolTargets: { x: number; y: number }[] = [];
  private patrolIndex = 0;
  private patrolWaitTime = 0;
  private patrolWaitTimer = 0;

  // 仇恨
  aggroTarget: string | null = null;

  // 回调
  onDeath: ((monster: Monster) => void) | null = null;
  onAttack: ((monster: Monster, targetId: string) => void) | null = null;
  isWalkable: (gridX: number, gridY: number) => boolean = () => true;

  constructor(scene: Phaser.Scene, monsterData: MonsterDefinition, gridX: number, gridY: number, floorMultiplier: number = 1.0) {
    this.scene = scene;
    this.monsterData = monsterData;
    this.gridX = gridX;
    this.gridY = gridY;

    // 战斗实体
    this.combatEntity = createCombatEntityFromMonster(monsterData, floorMultiplier);

    // AI配置
    this.aiConfig = AI_CONFIG[monsterData.type] ?? AI_CONFIG.melee;
    this.aggroRangePx = monsterData.aggroRange * TILE_SIZE;
    this.attackRangePx = this.aiConfig.attackRange;
    this.attackCooldown = 100000 / monsterData.stats.attackSpeed;
    this.moveInterval = getMonsterMoveInterval(monsterData.stats.moveSpeed);
    this.aggroMeter = getAggroDecayConfig(false).startAggro;

    // 屏幕坐标
    const pos = isoToScreen(gridX, gridY);

    // 容器
    this.container = scene.add.container(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(gridY));

    // 怪物占位正方形（红色）
    const size = TILE_SIZE - 6;
    this.bodyRect = scene.add.rectangle(0, 0, size, size, 0xcc3333);
    this.bodyRect.setOrigin(0.5, 0.5);
    this.bodyRect.setStrokeStyle(2, 0xff5555);
    this.container.add(this.bodyRect);

    // 名字
    this.nameText = scene.add.text(0, -size / 2 - 12, monsterData.name, {
      fontSize: '10px',
      color: '#ff8888',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // HP条背景
    this.hpBarBg = scene.add.rectangle(0, -size / 2 - 6, TILE_SIZE - 8, 4, 0x333333);
    this.hpBarBg.setOrigin(0.5, 0.5);
    this.container.add(this.hpBarBg);

    // HP条填充
    this.hpBarFill = scene.add.rectangle(0, -size / 2 - 6, TILE_SIZE - 8, 4, 0xff3333);
    this.hpBarFill.setOrigin(0, 0.5);
    this.hpBarFill.setPosition(-(TILE_SIZE - 8) / 2, -size / 2 - 6);
    this.container.add(this.hpBarFill);

    // 可点击
    this.bodyRect.setInteractive({ useHandCursor: true });
    this.bodyRect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        scene.events.emit('monster:click', this);
      }
    });

    // 生成巡逻路径（周围4格）
    this.generatePatrol();
  }

  update(playerGridX: number, playerGridY: number, time: number): void {
    if (this.isDead) return;

    this.updateAggroMeter(playerGridX, playerGridY, time);

    const playerScreen = isoToScreen(playerGridX, playerGridY);
    const dist = Phaser.Math.Distance.Between(
      this.container.x, this.container.y,
      playerScreen.screenX, playerScreen.screenY,
    );

    switch (this.aiState) {
      case 'idle':
        this.updateIdle(dist, time);
        break;
      case 'patrol':
        this.updatePatrol(time);
        break;
      case 'chase':
        this.updateChase(dist, playerScreen, time);
        break;
      case 'attack':
        this.updateAttack(dist, time);
        break;
      case 'flee':
        this.updateFlee(playerScreen);
        break;
    }
  }

  private updateIdle(dist: number, time: number): void {
    // 检查仇恨
    if (dist < this.aggroRangePx) {
      this.resetAggroTracking();
      this.aiState = 'chase';
      return;
    }
    // 开始巡逻
    this.patrolWaitTimer += 16; // 约1帧
    if (this.patrolWaitTimer >= this.patrolWaitTime) {
      this.aiState = 'patrol';
      this.patrolWaitTimer = 0;
    }
  }

  private updatePatrol(_time: number): void {
    if (this.patrolTargets.length === 0) {
      this.aiState = 'idle';
      return;
    }

    const target = this.patrolTargets[this.patrolIndex];
    const pos = isoToScreen(this.gridX, this.gridY);
    const dist = Phaser.Math.Distance.Between(
      pos.screenX, pos.screenY,
      target.x, target.y,
    );

    if (dist < 8) {
      // 到达巡逻点
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolTargets.length;
      this.aiState = 'idle';
      this.patrolWaitTime = 1000 + Math.random() * 2000;
      return;
    }

    // 向巡逻点移动
    const targetIso = screenToIso(target.x, target.y);
    const dx = Math.sign(targetIso.x - this.gridX);
    const dy = Math.sign(targetIso.y - this.gridY);
    this.moveByGrid(dx, dy);
  }

  private updateChase(dist: number, playerScreen: { screenX: number; screenY: number }, _time: number): void {
    const aggroConfig = getAggroDecayConfig(false);

    // 脱战
    if (dist > this.aggroRangePx * 2 || this.aggroMeter <= aggroConfig.minChaseAggro) {
      this.leaveCombat();
      return;
    }

    // 进入攻击范围
    if (dist < this.attackRangePx) {
      this.aiState = 'attack';
      return;
    }

    // 向玩家移动
    const targetIso = screenToIso(playerScreen.screenX, playerScreen.screenY);
    const dx = Math.sign(targetIso.x - this.gridX);
    const dy = Math.sign(targetIso.y - this.gridY);
    this.tryMoveByGrid(dx, dy, _time);
  }

  private updateAttack(dist: number, _time: number): void {
    if (dist > this.attackRangePx * 1.5) {
      this.aiState = 'chase';
      return;
    }

    // 检查逃跑
    const hpRatio = this.combatEntity.hp / this.combatEntity.maxHp;
    if (hpRatio <= this.aiConfig.fleeThreshold) {
      this.aiState = 'flee';
      return;
    }
  }

  private updateFlee(playerScreen: { screenX: number; screenY: number }): void {
    // 远离玩家
    const targetIso = screenToIso(playerScreen.screenX, playerScreen.screenY);
    const dx = -Math.sign(targetIso.x - this.gridX);
    const dy = -Math.sign(targetIso.y - this.gridY);
    this.tryMoveByGrid(dx, dy, this.scene.time.now);

    // 逃跑后重新评估
    const hpRatio = this.combatEntity.hp / this.combatEntity.maxHp;
    if (hpRatio > this.aiConfig.fleeThreshold + 0.1) {
      this.aiState = 'chase';
    }
  }

  /** 等距格子移动 */
  private moveByGrid(dx: number, dy: number): boolean {
    const newX = this.gridX + dx;
    const newY = this.gridY + dy;

    if (!this.isWalkable(newX, newY)) return false;

    this.gridX = newX;
    this.gridY = newY;

    const pos = isoToScreen(newX, newY);
    this.container.setPosition(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(newY));
    return true;
  }

  private tryMoveByGrid(dx: number, dy: number, time: number): boolean {
    if (dx === 0 && dy === 0) return false;
    if (time - this.moveAccumulator < this.moveInterval) return false;
    this.moveAccumulator = time;
    return this.moveByGrid(dx, dy);
  }

  private updateAggroMeter(playerGridX: number, playerGridY: number, _time: number): void {
    if (this.lastTrackedPlayerGridX === null || this.lastTrackedPlayerGridY === null) {
      this.lastTrackedPlayerGridX = playerGridX;
      this.lastTrackedPlayerGridY = playerGridY;
      return;
    }

    const movedDistance = Math.abs(playerGridX - this.lastTrackedPlayerGridX) + Math.abs(playerGridY - this.lastTrackedPlayerGridY);
    if (movedDistance > 0 && (this.aiState === 'chase' || this.aiState === 'attack')) {
      const aggroConfig = getAggroDecayConfig(false);
      this.aggroMeter = Math.max(0, this.aggroMeter - movedDistance * aggroConfig.decayPerGrid);
    }

    this.lastTrackedPlayerGridX = playerGridX;
    this.lastTrackedPlayerGridY = playerGridY;
  }

  private resetAggroTracking(): void {
    this.aggroMeter = getAggroDecayConfig(false).startAggro;
  }

  private leaveCombat(): void {
    this.aiState = 'idle';
    this.aggroTarget = null;
    this.resetAggroTracking();
  }

  /** 是否可以攻击 */
  canAttack(time: number): boolean {
    return this.aiState === 'attack' && time - this.lastAttackTime >= this.attackCooldown;
  }

  /** 执行攻击 */
  performAttack(target: CombatEntity, targetX: number, targetY: number): void {
    this.lastAttackTime = this.scene.time.now;

    const direction = {
      x: Math.sign(targetX - this.container.x),
      y: Math.sign(targetY - this.container.y),
    };

    playAttackAnimation(this.scene, this.container, 'monster', direction, () => {
      let result;
      if (this.monsterData.type === 'ranged' || this.monsterData.type === 'caster') {
        result = calcMagicDamage(this.combatEntity.stats, target.stats);
      } else {
        result = calcPhysicalDamage(this.combatEntity.stats, target.stats);
      }

      applyDamage(target, result);
      showDamagePopup(
        this.scene,
        targetX,
        targetY - 20,
        result.finalDamage,
        result.isCritical ? 'critical' : 'normal',
      );

      this.onAttack?.(this, target.id);
    });
  }

  /** 受伤 */
  takeDamage(damage: number, isCritical: boolean): void {
    if (this.isDead) return;

    this.combatEntity.hp = Math.max(0, this.combatEntity.hp - damage);
    this.updateHpBar();

    showDamagePopup(this.scene, this.container.x, this.container.y - 20, damage, isCritical ? 'critical' : 'normal');

    // 被攻击后仇恨转向攻击者
    if (this.aiState === 'idle' || this.aiState === 'patrol') {
      this.resetAggroTracking();
      this.aiState = 'chase';
    }

    if (this.combatEntity.hp <= 0) {
      this.die();
    }
  }

  /** 高亮显示（被选中目标） */
  highlight(): void {
    this.bodyRect.setStrokeStyle(3, 0xffff00);
    this.hpBarBg.setVisible(true);
    this.hpBarFill.setVisible(true);
  }

  /** 取消高亮 */
  unhighlight(): void {
    this.bodyRect.setStrokeStyle(2, 0xff5555);
  }

  /** 受击闪白 */
  flashHit(): void {
    this.bodyRect.setFillStyle(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.isDead) {
        this.bodyRect.setFillStyle(0xcc3333);
      }
    });
  }

  /** 更新HP条 */
  private updateHpBar(): void {
    const ratio = Math.max(0, this.combatEntity.hp / this.combatEntity.maxHp);
    this.hpBarFill.displayWidth = (TILE_SIZE - 8) * ratio;
  }

  /** 死亡 */
  private die(): void {
    this.isDead = true;
    this.aiState = 'dead';

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.onDeath?.(this);
        this.container.destroy(true);
      },
    });
  }

  /** 生成巡逻路径 */
  private generatePatrol(): void {
    const offsets = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    ];
    for (const off of offsets) {
      const pos = isoToScreen(this.gridX + off.dx, this.gridY + off.dy);
      this.patrolTargets.push({ x: pos.screenX, y: pos.screenY });
    }
    // 随机打乱
    for (let i = this.patrolTargets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.patrolTargets[i], this.patrolTargets[j]] = [this.patrolTargets[j], this.patrolTargets[i]];
    }
    this.patrolWaitTime = 500 + Math.random() * 1500;
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
