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

/** 精灵动画配置 */
interface SpriteAnimConfig {
  prefix: string;       // 动画键前缀，如 'octopus_' 或 'rat_brown_'
  idleKey: string;
  walkKey: string;
  runKey?: string;
  attackKey: string;
  hurtKey: string;
  deathKey: string;
  standKey?: string;
  scale: number;
}

const SPRITE_CONFIGS: Record<string, SpriteAnimConfig> = {
  octopus: {
    prefix: 'octopus_',
    idleKey: 'octopus_idle',
    walkKey: 'octopus_walk',
    attackKey: 'octopus_attack',
    hurtKey: 'octopus_dmg',
    deathKey: 'octopus_death_1',
    scale: 0.75,
  },
  rat_brown: {
    prefix: 'rat_brown_',
    idleKey: 'rat_brown_idle',
    walkKey: 'rat_brown_walk',
    runKey: 'rat_brown_run',
    attackKey: 'rat_brown_attack',
    hurtKey: 'rat_brown_hurt',
    deathKey: 'rat_brown_dead',
    standKey: 'rat_brown_stand',
    scale: 0.75,
  },
  rat_gray: {
    prefix: 'rat_gray_',
    idleKey: 'rat_gray_idle',
    walkKey: 'rat_gray_walk',
    runKey: 'rat_gray_run',
    attackKey: 'rat_gray_attack',
    hurtKey: 'rat_gray_hurt',
    deathKey: 'rat_gray_dead',
    standKey: 'rat_gray_stand',
    scale: 0.75,
  },
  rat_white: {
    prefix: 'rat_white_',
    idleKey: 'rat_white_idle',
    walkKey: 'rat_white_walk',
    runKey: 'rat_white_run',
    attackKey: 'rat_white_attack',
    hurtKey: 'rat_white_hurt',
    deathKey: 'rat_white_dead',
    standKey: 'rat_white_stand',
    scale: 0.75,
  },
};

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

const BASE_MONSTER_MOVE_INTERVAL = 440;

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
  private bodyRect!: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private spriteConfig: SpriteAnimConfig | null = null;
  private currentAnimKey = '';

  aiState: MonsterAIState = 'idle';
  isDead = false;

  // 格子坐标
  gridX: number;
  gridY: number;

  // 平滑移动
  private visualX: number;
  private visualY: number;
  private targetVisualX = 0;
  private targetVisualY = 0;
  private readonly LERP_SPEED = 0.18;

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
    this.attackCooldown = 160000 / monsterData.stats.attackSpeed;
    this.moveInterval = getMonsterMoveInterval(monsterData.stats.moveSpeed);
    this.aggroMeter = getAggroDecayConfig(false).startAggro;

    // 屏幕坐标
    const pos = isoToScreen(gridX, gridY);
    this.visualX = pos.screenX;
    this.visualY = pos.screenY;
    this.targetVisualX = pos.screenX;
    this.targetVisualY = pos.screenY;

    // 容器
    this.container = scene.add.container(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(gridY));

    const size = TILE_SIZE - 6;
    const cfg = SPRITE_CONFIGS[monsterData.sprite];
    const hasSprite = cfg && scene.textures.exists(cfg.idleKey);

    if (hasSprite && cfg) {
      this.spriteConfig = cfg;
      this.sprite = scene.add.sprite(0, 0, cfg.idleKey);
      this.sprite.setOrigin(0.5, 0.5);
      this.sprite.setScale(cfg.scale);
      this.container.add(this.sprite);
      this.sprite.play(cfg.idleKey);
      this.currentAnimKey = cfg.idleKey;

      // 点击交互在 sprite 上
      this.sprite.setInteractive({ useHandCursor: true });
      this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          scene.events.emit('monster:click', this);
        }
      });
    } else {
      // 矩形占位怪物
      this.bodyRect = scene.add.rectangle(0, 0, size, size, 0xcc3333);
      this.bodyRect.setOrigin(0.5, 0.5);
      this.bodyRect.setStrokeStyle(2, 0xff5555);
      this.container.add(this.bodyRect);

      this.bodyRect.setInteractive({ useHandCursor: true });
      this.bodyRect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          scene.events.emit('monster:click', this);
        }
      });
    }

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

    // 平滑插值视觉位置
    this.visualX += (this.targetVisualX - this.visualX) * this.LERP_SPEED;
    this.visualY += (this.targetVisualY - this.visualY) * this.LERP_SPEED;
    this.container.setPosition(this.visualX, this.visualY);

    // 同步动画
    this.syncAnim();
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
    this.targetVisualX = pos.screenX;
    this.targetVisualY = pos.screenY;
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

    const isRanged = this.monsterData.type === 'ranged' || this.monsterData.type === 'caster';

    // 精灵怪物播放攻击动画
    if (this.sprite && this.spriteConfig) {
      this.playOnceAnim(this.spriteConfig.attackKey);
    }

    if (isRanged) {
      // 远程/施法怪物：发射弹道
      this.fireProjectile(targetX, targetY, () => {
        const result = calcMagicDamage(this.combatEntity.stats, target.stats);
        applyDamage(target, result);
        showDamagePopup(this.scene, targetX, targetY - 20, result.finalDamage, result.isCritical ? 'critical' : 'normal');
        this.onAttack?.(this, target.id);
      });
    } else {
      // 近战怪物：瞬发攻击动画
      const direction = {
        x: Math.sign(targetX - this.container.x),
        y: Math.sign(targetY - this.container.y),
      };
      playAttackAnimation(this.scene, this.container, 'monster', direction, () => {
        const result = calcPhysicalDamage(this.combatEntity.stats, target.stats);
        applyDamage(target, result);
        showDamagePopup(this.scene, targetX, targetY - 20, result.finalDamage, result.isCritical ? 'critical' : 'normal');
        this.onAttack?.(this, target.id);
      });
    }
  }

  /** 受伤（skipHpReduce=true 时只更新视觉效果，HP已由外部扣减） */
  takeDamage(damage: number, isCritical: boolean, skipHpReduce = false): void {
    if (this.isDead) return;

    if (!skipHpReduce) {
      this.combatEntity.hp = Math.max(0, this.combatEntity.hp - damage);
    }
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

  /** 发射弹道（远程/施法怪物攻击用） */
  private fireProjectile(targetX: number, targetY: number, onHit: () => void): void {
    const color = this.monsterData.type === 'caster' ? 0xaa44ff : 0xff6622;
    const radius = 3;
    const speed = 350;

    const startX = this.container.x;
    const startY = this.container.y;

    const projectile = this.scene.add.circle(startX, startY, radius, color);
    projectile.setDepth(2000);

    const distance = Phaser.Math.Distance.Between(startX, startY, targetX, targetY);
    const duration = (distance / speed) * 1000;

    this.scene.tweens.add({
      targets: projectile,
      x: targetX,
      y: targetY,
      duration: Math.max(100, duration),
      ease: 'Linear',
      onComplete: () => {
        projectile.destroy();
        onHit();
      },
    });
  }

  /** 高亮显示（被选中目标） */
  highlight(): void {
    if (this.sprite) {
      this.sprite.setTint(0xffff88);
    } else {
      this.bodyRect.setStrokeStyle(3, 0xffff00);
    }
    this.hpBarBg.setVisible(true);
    this.hpBarFill.setVisible(true);
  }

  /** 取消高亮 */
  unhighlight(): void {
    if (this.sprite) {
      this.sprite.clearTint();
    } else {
      this.bodyRect.setStrokeStyle(2, 0xff5555);
    }
  }

  /** 受击闪白 */
  flashHit(): void {
    if (this.sprite && this.spriteConfig) {
      this.playOnceAnim(this.spriteConfig.hurtKey);
    } else {
      this.bodyRect.setFillStyle(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (!this.isDead) {
          this.bodyRect.setFillStyle(0xcc3333);
        }
      });
    }
  }

  /** 更新HP条 */
  private updateHpBar(): void {
    const ratio = Math.max(0, this.combatEntity.hp / this.combatEntity.maxHp);
    this.hpBarFill.displayWidth = (TILE_SIZE - 8) * ratio;
  }

  /** 死亡 */
  die(): void {
    this.isDead = true;
    this.aiState = 'dead';

    if (this.sprite && this.spriteConfig) {
      // 播放死亡动画，动画结束后销毁
      this.sprite.play(this.spriteConfig.deathKey);
      this.sprite.once('animationcomplete', () => {
        this.onDeath?.(this);
        this.container.destroy(true);
      });
      // 兜底：如果动画没触发complete（如时长问题），500ms后也销毁
      this.scene.time.delayedCall(1500, () => {
        if (this.container.active) {
          this.onDeath?.(this);
          this.container.destroy(true);
        }
      });
    } else {
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
  }

  /** 根据AI状态同步动画 */
  private syncAnim(): void {
    if (!this.sprite || !this.spriteConfig) return;

    let targetKey: string;
    switch (this.aiState) {
      case 'chase':
        targetKey = this.spriteConfig.runKey ?? this.spriteConfig.walkKey;
        break;
      case 'patrol':
        targetKey = this.spriteConfig.walkKey;
        break;
      case 'attack':
        return;
      case 'dead':
        return;
      default:
        targetKey = this.spriteConfig.idleKey;
        break;
    }

    if (this.currentAnimKey !== targetKey) {
      this.currentAnimKey = targetKey;
      this.sprite.play(targetKey);
    }
  }

  /** 播放一次性动画（攻击/受伤） */
  private playOnceAnim(key: string): void {
    if (!this.sprite) return;
    this.currentAnimKey = key;
    this.sprite.play(key);
    this.sprite.once('animationcomplete', () => {
      if (!this.isDead) {
        this.currentAnimKey = '';
        this.syncAnim();
      }
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
