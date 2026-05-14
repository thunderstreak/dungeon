// 怪物实体 - 红色矩形 + AI追踪 + HP条

import Phaser from 'phaser';
import type { MonsterDefinition } from '@/data/monsters';
import type { CombatEntity } from '@/systems/BattleSystem';
import { createCombatEntityFromMonster, calcPhysicalDamage, calcMagicDamage, applyDamage } from '@/systems/BattleSystem';
import { showDamagePopup } from '@/ui/DamagePopup';

type MonsterAIState = 'idle' | 'chase' | 'attack' | 'dead';

export class MonsterEntity {
  container: Phaser.GameObjects.Container;
  private bodyRect: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBarFill: Phaser.GameObjects.Rectangle;

  combatEntity: CombatEntity;
  monsterData: MonsterDefinition;
  aiState: MonsterAIState = 'idle';
  private lastAttackTime = 0;
  private attackCooldown: number;
  private aggroRangePx: number;
  private attackRangePx = 40;
  scene: Phaser.Scene;
  isDead = false;
  onDeath: ((monster: MonsterEntity) => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, monsterData: MonsterDefinition) {
    this.scene = scene;
    this.monsterData = monsterData;

    // 创建战斗实体（使用1.0倍率，第1层）
    this.combatEntity = createCombatEntityFromMonster(monsterData, 1.0);

    // AI参数
    this.aggroRangePx = monsterData.aggroRange * 32; // TILE_SIZE=32
    this.attackCooldown = 10000 / monsterData.stats.attackSpeed; // 攻速转换为毫秒

    // 视觉
    this.container = scene.add.container(x, y);
    this.container.setDepth(5);

    // 怪物身体
    this.bodyRect = scene.add.rectangle(0, 0, 28, 28, 0xcc3333, 0.9)
      .setStrokeStyle(2, 0xff5555);
    this.container.add(this.bodyRect);

    // 名字
    this.nameText = scene.add.text(0, -22, monsterData.name, {
      fontSize: '10px',
      color: '#ff8888',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // HP条背景
    this.hpBarBg = scene.add.rectangle(0, -32, 30, 4, 0x333333)
      .setOrigin(0.5);
    this.container.add(this.hpBarBg);

    // HP条填充
    this.hpBarFill = scene.add.rectangle(-14, -32, 28, 2, 0xff3333)
      .setOrigin(0, 0.5);
    this.container.add(this.hpBarFill);

    // 启用物理
    scene.physics.add.existing(this.container);
    const physBody = this.container.body as Phaser.Physics.Arcade.Body;
    physBody.setSize(28, 28);

    // 可点击攻击（仅左键）
    this.bodyRect.setSize(40, 40);
    this.bodyRect.setInteractive({ useHandCursor: true });
    this.bodyRect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        scene.events.emit('monster:click', this);
      }
    });
  }

  update(playerPos: { x: number; y: number }, time: number): void {
    if (this.isDead) return;

    const physBody = this.container.body as Phaser.Physics.Arcade.Body;
    const dist = this.getDistanceTo(playerPos);

    switch (this.aiState) {
      case 'idle':
        if (dist < this.aggroRangePx) {
          this.aiState = 'chase';
        }
        physBody.setVelocity(0, 0);
        break;

      case 'chase':
        if (dist > this.aggroRangePx * 1.5) {
          this.aiState = 'idle';
          break;
        }
        if (dist < this.attackRangePx) {
          this.aiState = 'attack';
          break;
        }
        // 向玩家移动
        const angle = Phaser.Math.Angle.Between(
          this.container.x, this.container.y,
          playerPos.x, playerPos.y,
        );
        const speed = this.monsterData.stats.moveSpeed * 0.8;
        physBody.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
        );
        break;

      case 'attack':
        if (dist > this.attackRangePx * 1.5) {
          this.aiState = 'chase';
          break;
        }
        physBody.setVelocity(0, 0);
        // 攻击逻辑在外部调用
        break;
    }
  }

  canAttack(time: number): boolean {
    return this.aiState === 'attack' && time - this.lastAttackTime >= this.attackCooldown;
  }

  performAttack(playerEntity: CombatEntity): void {
    this.lastAttackTime = this.scene.time.now;

    let result;
    if (this.monsterData.type === 'ranged' || this.monsterData.type === 'caster') {
      result = calcMagicDamage(this.combatEntity.stats, playerEntity.stats);
    } else {
      result = calcPhysicalDamage(this.combatEntity.stats, playerEntity.stats);
    }

    applyDamage(playerEntity, result);

    showDamagePopup(
      this.scene,
      this.container.x,
      this.container.y - 20,
      result.finalDamage,
      result.isCritical ? 'critical' : 'normal',
    );
  }

  takeDamage(damage: number, isCritical: boolean): void {
    if (this.isDead) return;

    this.combatEntity.hp = Math.max(0, this.combatEntity.hp - damage);

    // 更新HP条
    const ratio = this.combatEntity.hp / this.combatEntity.maxHp;
    this.hpBarFill.setSize(Math.max(0, 28 * ratio), 2);

    showDamagePopup(this.scene, this.container.x, this.container.y - 20, damage, isCritical ? 'critical' : 'normal');

    if (this.combatEntity.hp <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;
    this.aiState = 'dead';

    const physBody = this.container.body as Phaser.Physics.Arcade.Body;
    physBody.setVelocity(0, 0);
    physBody.setEnable(false);

    // 死亡动画
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

  getDistanceTo(other: { x: number; y: number }): number {
    return Phaser.Math.Distance.Between(
      this.container.x, this.container.y,
      other.x, other.y,
    );
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
