// 战斗管理 - 普通攻击、技能释放、弹道、怪物死亡处理

import Phaser from 'phaser';
import { gameState } from '@/state/GameState';
import { Monster } from '@/entities/Monster';
import { Boss } from '@/entities/Boss';
import { calcPhysicalDamage, applyDamage } from '@/systems/BattleSystem';
import { executeSkillDamage, isSkillReady, getPassiveTriggerEffects } from '@/systems/SkillSystem';
import { ALL_SKILLS } from '@/data/skills';
import type { SkillSlot, DebuffType } from '@/config/types';
import { calculateMonsterDrop, calculateBossDrop } from '@/systems/DropSystem';
import { addExperience } from '@/systems/LevelSystem';
import { addGold } from '@/systems/InventorySystem';
import { GroundLoot } from '@/entities/GroundLoot';
import { generateLootItems } from '@/systems/LootGenerator';
import { consumeDurability } from '@/systems/EquipmentSystem';
import { showNotification } from '@/ui/NotificationToast';
import { onBossDefeated } from '@/systems/DungeonSystem';
import type { DungeonContext } from '@/systems/DungeonContext';

/** 攻击怪物（普通攻击） */
export function attackMonster(ctx: DungeonContext, monster: Monster | Boss): void {
  const { scene, player } = ctx;

  const now = scene.time.now;
  const cooldown = 160000 / player.character.stats.attackSpeed;
  if (now - (scene as any).attackCooldown < cooldown) return;
  (scene as any).attackCooldown = now;

  player.playAttackAnimation({ x: monster.container.x, y: monster.container.y }, () => {
    const result = calcPhysicalDamage(player.combatEntity.stats, monster.combatEntity.stats);
    applyDamage(monster.combatEntity, result);
    monster.takeDamage(result.finalDamage, result.isCritical, false, player.combatEntity);
    monster.flashHit();

    // 被动技能触发效果
    if (!result.isDodged) {
      const triggers = getPassiveTriggerEffects(player.character);
      for (const trigger of triggers) {
        if (Math.random() * 100 >= trigger.value) continue;
        const validDebuffs: Record<string, DebuffType> = {
          bleed_chance: 'bleed',
          freeze_chance: 'freeze',
          stun_chance: 'stun',
          burn_on_hit: 'burn',
        };
        const debuffType = validDebuffs[trigger.type];
        if (debuffType) {
          monster.combatEntity.buffManager.addBuff({
            id: `passive_${trigger.type}_${monster.combatEntity.id}`,
            name: trigger.type,
            type: 'debuff',
            debuffType,
            duration: 3,
            maxDuration: 3,
            value: 1,
            maxStack: 1,
            source: 'passive',
            icon: 'passive',
          });
        }
      }
    }

    // 屏幕震动
    scene.cameras.main.shake(100, 0.005);

    // 武器耐久损耗
    const character = gameState.getCharacter();
    if (character.equipment.weapon) {
      consumeDurability(character, 'weapon', 1);
    }
  });
}

/** 释放魔法弹道（追踪目标当前位置） */
export function fireProjectile(ctx: DungeonContext, target: Monster | Boss, skillId: string, onHit: () => void): void {
  const { scene, player } = ctx;

  const colorMap: Record<string, { color: number; radius: number; speed: number }> = {
    mage_fireball: { color: 0xff4400, radius: 5, speed: 200 },
    mage_ice_bolt: { color: 0x44aaff, radius: 4, speed: 250 },
    mage_chain_lightning: { color: 0xffff44, radius: 3, speed: 300 },
  };
  const config = colorMap[skillId] ?? { color: 0xaa44ff, radius: 4, speed: 225 };

  const projectile = scene.add.circle(player.container.x, player.container.y - 20, config.radius, config.color);
  projectile.setDepth(2000);

  const hitDistance = 10;
  const timer = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      if (target.isDead || !target.container.active) {
        projectile.destroy();
        timer.destroy();
        return;
      }
      const tx = target.container.x;
      const ty = target.container.y;
      const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, tx, ty);
      if (dist <= hitDistance) {
        projectile.destroy();
        timer.destroy();
        onHit();
        return;
      }
      const speed = config.speed * (16 / 1000);
      const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, tx, ty);
      projectile.x += Math.cos(angle) * speed;
      projectile.y += Math.sin(angle) * speed;
    },
  });
}

/** 释放技能（区分远程弹道和近战瞬发） */
export function castSkillOnTarget(ctx: DungeonContext, skillSlot: SkillSlot, target: Monster | Boss): void {
  const { scene, player } = ctx;
  const playerDead = (scene as any).playerDead as boolean;
  if (playerDead || target.isDead) return;

  const skillData = ALL_SKILLS.find(s => s.id === skillSlot.skillId);
  if (!skillData) return;

  const character = gameState.getCharacter();
  if (!isSkillReady(character, skillSlot.skillId)) return;

  if (skillData.damage?.type !== 'magic' && !player.isInRange(target)) return;

  if (skillData.manaCost) character.stats.mp -= skillData.manaCost;
  if (skillData.cooldown) skillSlot.cooldownRemaining = skillData.cooldown;

  const applyDamageToTarget = () => {
    const result = executeSkillDamage(player.combatEntity, target.combatEntity, skillSlot.skillId, skillSlot.level, player.character);
    if (result) {
      target.takeDamage(result.finalDamage, result.isCritical, true, player.combatEntity);
      target.flashHit();
    }
    player.syncHp();
  };

  if (skillData.damage?.type === 'magic') {
    fireProjectile(ctx, target, skillSlot.skillId, applyDamageToTarget);
  } else {
    applyDamageToTarget();
  }
}

/** 怪物死亡处理 */
export function onMonsterDeath(ctx: DungeonContext, monster: Monster | Boss): void {
  const { scene, player, monsters, groundLoots, pity, dungeonState, floor } = ctx;

  if (player.attackTarget === monster) {
    player.clearTarget();
  }

  const character = gameState.getCharacter();

  let goldAmount: number;
  let expAmount: number;
  if (monster instanceof Monster) {
    const drop = calculateMonsterDrop(monster.monsterData, 1.0, false, pity);
    goldAmount = drop.goldAmount;
    expAmount = drop.expAmount;
    const lootItems = generateLootItems(drop, character.level);
    for (const item of lootItems) {
      const pos = findWalkableDropPosition(ctx, monster.gridX, monster.gridY);
      const loot = new GroundLoot(scene, item, pos.x, pos.y);
      groundLoots.push(loot);
    }
  } else {
    const boss = monster as Boss;
    const isFirstKill = !dungeonState.bossDefeatedFloors.has(floor);
    const drop = calculateBossDrop(boss.bossData, isFirstKill);
    goldAmount = drop.goldAmount;
    expAmount = drop.expAmount;
    const lootItems = generateLootItems(drop, character.level);
    for (const item of lootItems) {
      const pos = findWalkableDropPosition(ctx, monster.gridX, monster.gridY);
      const loot = new GroundLoot(scene, item, pos.x, pos.y);
      groundLoots.push(loot);
    }
  }

  addGold(character, goldAmount);
  const levelResult = addExperience(character, expAmount);

  showNotification(scene, `+${goldAmount} 金币  +${expAmount} 经验`, '#ffdd44');
  if (levelResult.levelsGained > 0) {
    showNotification(scene, `升级! Lv.${levelResult.newLevel}`, '#ff88ff');
    player.combatEntity.maxHp = character.stats.maxHp;
    player.combatEntity.maxMp = character.stats.maxMp;
    player.combatEntity.hp = character.stats.maxHp;
    player.combatEntity.mp = character.stats.maxMp;
    player.syncHp();
    player.updateHpBar();
  }

  const idx = monsters.indexOf(monster);
  if (idx !== -1) monsters.splice(idx, 1);

  if (monster instanceof Boss) {
    ctx.roomCleared = true;
    onBossDefeated(dungeonState, floor);
  }
}

/** 从中心向外螺旋搜索可行走的掉落位置 */
function findWalkableDropPosition(ctx: DungeonContext, centerX: number, centerY: number): { x: number; y: number } {
  if (ctx.floorWalkability.isWalkable(centerX, centerY)) {
    return { x: centerX, y: centerY };
  }
  for (let r = 1; r <= 3; r++) {
    const candidates: { x: number; y: number }[] = [];
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const tx = centerX + dx;
        const ty = centerY + dy;
        if (ctx.floorWalkability.isWalkable(tx, ty)) {
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
