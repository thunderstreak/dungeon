// Boss基类 - 多阶段切换、专属技能释放

import Phaser from 'phaser';
import type { BossDefinition, BossPhase } from '@/data/bosses';
import type { MonsterSkill } from '@/config/types';
import type { CombatEntity } from '@/systems/BattleSystem';
import { createCombatEntityFromBoss, calcPhysicalDamage, calcMagicDamage, applyDamage } from '@/systems/BattleSystem';
import { TILE_SIZE } from '@/config/constants';
import { isoToScreen, screenToIso, getDepthSort } from '@/utils/IsometricUtils';
import { showDamagePopup } from '@/ui/DamagePopup';
import { playAttackAnimation } from '@/ui/AttackAnimation';

type BossAIState = 'idle' | 'chase' | 'attack' | 'phase_transition' | 'dead';

const BASE_BOSS_MOVE_INTERVAL = 190;

export function getBossMoveInterval(moveSpeedPercent: number): number {
  const clampedSpeed = Math.max(70, moveSpeedPercent);
  return BASE_BOSS_MOVE_INTERVAL * (100 / clampedSpeed);
}

export class Boss {
  readonly scene: Phaser.Scene;
  readonly bossData: BossDefinition;
  readonly combatEntity: CombatEntity;

  container: Phaser.GameObjects.Container;
  private bodyRect: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private hpBarBorder: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private phaseText: Phaser.GameObjects.Text;

  aiState: BossAIState = 'idle';
  isDead = false;

  gridX: number;
  gridY: number;

  // 阶段
  currentPhase = 0;
  private phases: BossPhase[];
  private phaseSkills: MonsterSkill[];

  // AI
  private aggroRangePx: number;
  private attackRangePx = 60;
  private attackCooldown: number;
  private lastAttackTime = 0;
  private lastSkillTime = 0;
  private skillCooldown = 3000;
  private playerInRange = false;
  private lastPlayerScreenX = 0;
  private lastPlayerScreenY = 0;
  private targetEntity: CombatEntity | null = null;
  private moveInterval: number;
  private lastMoveTime = 0;
  private aggroMeter = 140;
  private lastTrackedPlayerGridX: number | null = null;
  private lastTrackedPlayerGridY: number | null = null;

  onDeath: ((boss: Boss) => void) | null = null;
  isWalkable: (gridX: number, gridY: number) => boolean = () => true;

  constructor(scene: Phaser.Scene, bossData: BossDefinition, gridX: number, gridY: number) {
    this.scene = scene;
    this.bossData = bossData;
    this.gridX = gridX;
    this.gridY = gridY;

    // 战斗实体
    this.combatEntity = createCombatEntityFromBoss(bossData);

    // 阶段配置
    this.phases = bossData.phases.sort((a, b) => b.hpThreshold - a.hpThreshold);
    this.phaseSkills = bossData.skills;

    // AI参数
    this.aggroRangePx = bossData.aggroRange * TILE_SIZE;
    this.attackCooldown = 160000 / bossData.stats.attackSpeed;
    this.moveInterval = getBossMoveInterval(bossData.stats.moveSpeed);

    // 屏幕坐标
    const pos = isoToScreen(gridX, gridY);

    // 容器
    this.container = scene.add.container(pos.screenX, pos.screenY);
    this.container.setDepth(getDepthSort(gridY));

    // Boss占位正方形（紫色，更大）
    const size = TILE_SIZE;
    this.bodyRect = scene.add.rectangle(0, 0, size, size, 0x8833aa);
    this.bodyRect.setOrigin(0.5, 0.5);
    this.bodyRect.setStrokeStyle(3, 0xaa55cc);
    this.container.add(this.bodyRect);

    // Boss名字（金色）
    this.nameText = scene.add.text(0, -size / 2 - 18, `★ ${bossData.name} ★`, {
      fontSize: '13px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 阶段文本
    this.phaseText = scene.add.text(0, -size / 2 - 30, '', {
      fontSize: '10px',
      color: '#ff8888',
    }).setOrigin(0.5);
    this.container.add(this.phaseText);

    // HP条背景（Boss用更大的血条）
    this.hpBarBg = scene.add.rectangle(0, -size / 2 - 6, TILE_SIZE + 20, 6, 0x333333);
    this.hpBarBg.setOrigin(0.5, 0.5);
    this.container.add(this.hpBarBg);

    // HP条边框
    this.hpBarBorder = scene.add.rectangle(0, -size / 2 - 6, TILE_SIZE + 20, 6);
    this.hpBarBorder.setOrigin(0.5, 0.5);
    this.hpBarBorder.setStrokeStyle(1, 0xffffff);
    this.hpBarBorder.fillColor = 0x000000;
    this.hpBarBorder.fillAlpha = 0;
    this.container.add(this.hpBarBorder);

    // HP条填充
    this.hpBarFill = scene.add.rectangle(0, -size / 2 - 6, TILE_SIZE + 20, 6, 0xdd3333);
    this.hpBarFill.setOrigin(0, 0.5);
    this.hpBarFill.setPosition(-(TILE_SIZE + 20) / 2, -size / 2 - 6);
    this.container.add(this.hpBarFill);

    // 可点击
    this.bodyRect.setInteractive({ useHandCursor: true });
    this.bodyRect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        scene.events.emit('monster:click', this);
      }
    });
  }

  /** 设置攻击目标 */
  setTarget(targetEntity: CombatEntity): void {
    this.targetEntity = targetEntity;
  }

  update(playerGridX: number, playerGridY: number, time: number): void {
    if (this.isDead) return;

    // 检查阶段切换
    this.checkPhaseTransition();
    this.updateAggroMeter(playerGridX, playerGridY);

    const playerScreen = isoToScreen(playerGridX, playerGridY);
    this.lastPlayerScreenX = playerScreen.screenX;
    this.lastPlayerScreenY = playerScreen.screenY;
    const dist = Phaser.Math.Distance.Between(
      this.container.x, this.container.y,
      playerScreen.screenX, playerScreen.screenY,
    );
    this.playerInRange = dist < this.aggroRangePx;

    switch (this.aiState) {
      case 'idle':
        if (this.playerInRange) {
          this.resetAggroTracking();
          this.aiState = 'chase';
        }
        break;

      case 'chase':
        if (!this.playerInRange || this.aggroMeter <= 35) {
          this.leaveCombat();
          break;
        }
        if (dist < this.attackRangePx) {
          this.aiState = 'attack';
          break;
        }
        // 向玩家移动，主方向被堵时尝试替代方向
        {
          const targetIso = screenToIso(playerScreen.screenX, playerScreen.screenY);
          const dx = Math.sign(targetIso.x - this.gridX);
          const dy = Math.sign(targetIso.y - this.gridY);
          // 检查移动间隔
          if (time - this.lastMoveTime >= this.moveInterval) {
            this.lastMoveTime = time;
            if (!this.moveByGrid(dx, dy)) {
              // 主方向被堵，尝试替代方向
              if (dx !== 0 && dy !== 0) {
                this.moveByGrid(dx, 0) || this.moveByGrid(0, dy);
              } else if (dx !== 0) {
                this.moveByGrid(0, 1) || this.moveByGrid(0, -1);
              } else if (dy !== 0) {
                this.moveByGrid(1, 0) || this.moveByGrid(-1, 0);
              }
            }
          }
        }
        break;

      case 'attack':
        if (dist > this.attackRangePx * 1.5) {
          this.aiState = 'chase';
          break;
        }
        // 尝试释放技能
        this.tryUseSkill(time);
        break;

      case 'phase_transition':
        // 阶段切换动画中，等待完成
        break;
    }
  }

  /** 检查阶段切换 */
  private checkPhaseTransition(): void {
    const hpRatio = this.combatEntity.hp / this.combatEntity.maxHp;

    for (let i = 0; i < this.phases.length; i++) {
      const phase = this.phases[i];
      if (hpRatio <= phase.hpThreshold && this.currentPhase <= i) {
        this.enterPhase(i);
        break;
      }
    }
  }

  /** 进入新阶段 */
  private enterPhase(phaseIndex: number): void {
    this.currentPhase = phaseIndex;
    const phase = this.phases[phaseIndex];

    // 更新阶段文本
    this.phaseText.setText(`- ${phase.name} -`);

    // 应用属性倍率
    if (phase.statMultiplier) {
      const mult = phase.statMultiplier;
      this.combatEntity.stats.physicalAttack *= mult;
      this.combatEntity.stats.magicAttack *= mult;
      this.combatEntity.stats.physicalDefense *= mult;
      this.combatEntity.stats.magicDefense *= mult;
    }

    // 切换到该阶段技能
    this.phaseSkills = phase.skills;

    // 阶段切换动画（短暂无敌）
    this.aiState = 'phase_transition';
    this.scene.tweens.add({
      targets: this.bodyRect,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        if (this.aiState === 'phase_transition') {
          this.aiState = this.playerInRange ? 'chase' : 'idle';
        }
      },
    });
  }

  /** 尝试使用技能 */
  private tryUseSkill(time: number): void {
    if (time - this.lastSkillTime < this.skillCooldown) return;
    if (this.phaseSkills.length === 0) return;
    if (!this.targetEntity) return;

    this.lastSkillTime = time;

    const skill = this.phaseSkills[Math.floor(Math.random() * this.phaseSkills.length)];
    if (!skill.damage) return;

    const isMagic = skill.damage.type === 'magic';

    if (isMagic) {
      // 魔法技能：发射弹道
      this.fireProjectile(this.lastPlayerScreenX, this.lastPlayerScreenY, () => {
        const result = calcMagicDamage(this.combatEntity.stats, this.targetEntity!.stats);
        applyDamage(this.targetEntity!, result);
        showDamagePopup(this.scene, this.lastPlayerScreenX, this.lastPlayerScreenY - 30, result.finalDamage, result.isCritical ? 'critical' : 'normal');
      });
    } else {
      // 物理技能：近战动画
      const direction = {
        x: Math.sign(this.lastPlayerScreenX - this.container.x),
        y: Math.sign(this.lastPlayerScreenY - this.container.y),
      };
      playAttackAnimation(this.scene, this.container, 'boss', direction, () => {
        const result = calcPhysicalDamage(this.combatEntity.stats, this.targetEntity!.stats);
        applyDamage(this.targetEntity!, result);
        showDamagePopup(this.scene, this.lastPlayerScreenX, this.lastPlayerScreenY - 30, result.finalDamage, result.isCritical ? 'critical' : 'normal');
      });
    }
  }

  /** 发射弹道（Boss魔法技能用） */
  private fireProjectile(targetX: number, targetY: number, onHit: () => void): void {
    const radius = 5;
    const speed = 300;

    const startX = this.container.x;
    const startY = this.container.y;

    const projectile = this.scene.add.circle(startX, startY, radius, 0xaa44ff);
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
    if (time - this.lastMoveTime < this.moveInterval) return false;
    this.lastMoveTime = time;
    return this.moveByGrid(dx, dy);
  }

  private updateAggroMeter(playerGridX: number, playerGridY: number): void {
    if (this.lastTrackedPlayerGridX === null || this.lastTrackedPlayerGridY === null) {
      this.lastTrackedPlayerGridX = playerGridX;
      this.lastTrackedPlayerGridY = playerGridY;
      return;
    }

    const movedDistance = Math.abs(playerGridX - this.lastTrackedPlayerGridX) + Math.abs(playerGridY - this.lastTrackedPlayerGridY);
    if (movedDistance > 0 && (this.aiState === 'chase' || this.aiState === 'attack')) {
      this.aggroMeter = Math.max(0, this.aggroMeter - movedDistance * 8);
    }

    this.lastTrackedPlayerGridX = playerGridX;
    this.lastTrackedPlayerGridY = playerGridY;
  }

  private resetAggroTracking(): void {
    this.aggroMeter = 140;
  }

  private leaveCombat(): void {
    this.aiState = 'idle';
    this.resetAggroTracking();
  }

  /** 受伤（skipHpReduce=true 时只更新视觉效果，HP已由外部扣减） */
  takeDamage(damage: number, isCritical: boolean, skipHpReduce = false): void {
    if (this.isDead) return;

    if (!skipHpReduce) {
      this.combatEntity.hp = Math.max(0, this.combatEntity.hp - damage);
    }
    this.updateHpBar();

    showDamagePopup(this.scene, this.container.x, this.container.y - 30, damage, isCritical ? 'critical' : 'normal');

    if (this.combatEntity.hp <= 0) {
      this.die();
    }
  }

  /** 高亮显示 */
  highlight(): void {
    this.bodyRect.setStrokeStyle(3, 0xffff00);
  }

  /** 取消高亮 */
  unhighlight(): void {
    this.bodyRect.setStrokeStyle(2, 0xaa44ff);
  }

  /** 受击闪白 */
  flashHit(): void {
    this.bodyRect.setFillStyle(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.isDead) {
        this.bodyRect.setFillStyle(0x6622aa);
      }
    });
  }

  /** 更新HP条 */
  private updateHpBar(): void {
    const ratio = Math.max(0, this.combatEntity.hp / this.combatEntity.maxHp);
    this.hpBarFill.displayWidth = (TILE_SIZE + 20) * ratio;

    // Boss血条始终红色
    if (ratio > 0.5) {
      this.hpBarFill.fillColor = 0xdd3333;
    } else if (ratio > 0.2) {
      this.hpBarFill.fillColor = 0xdd6633;
    } else {
      this.hpBarFill.fillColor = 0xdd2222;
    }
  }

  /** 死亡 */
  die(): void {
    this.isDead = true;
    this.aiState = 'dead';

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      onComplete: () => {
        this.onDeath?.(this);
        this.container.destroy(true);
      },
    });
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
