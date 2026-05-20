// 怪物工厂 - 从数据创建Monster/Boss实例

import type Phaser from 'phaser';
import { Monster } from '../Monster';
import { Boss } from '../Boss';
import { ALL_MONSTERS, type MonsterDefinition } from '@/data/monsters';
import { ALL_BOSSES, type BossDefinition } from '@/data/bosses';
import { getMonstersByFloor } from '@/data/monsters';
import { getBossesByFloor, getNormalBosses, getAbyssBosses } from '@/data/bosses';
import { shouldSpawnElite, createEliteCombatEntity } from '@/systems/EliteSystem';

/** 怪物生成选项 */
export interface SpawnOptions {
  floor: number;
  gridX: number;
  gridY: number;
  floorMultiplier?: number;
  forceElite?: boolean;
}

/** 从楼层数据获取可用怪物列表 */
function getMonstersForFloor(floor: number): MonsterDefinition[] {
  return getMonstersByFloor(floor);
}

/** 从楼层数据获取可用Boss列表 */
function getBossesForFloor(floor: number): BossDefinition[] {
  return getBossesByFloor(floor);
}

/** 随机选择 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 创建普通怪物 */
export function createMonster(scene: Phaser.Scene, options: SpawnOptions): Monster {
  const monsters = getMonstersForFloor(options.floor);
  if (monsters.length === 0) {
    // 降级：使用第一个怪物
    return new Monster(scene, ALL_MONSTERS[0], options.gridX, options.gridY, options.floorMultiplier ?? 1.0);
  }

  const data = pickRandom(monsters);
  const multiplier = options.floorMultiplier ?? 1.0;
  const monster = new Monster(scene, data, options.gridX, options.gridY, multiplier);

  // 精英怪判定
  const isElite = options.forceElite || shouldSpawnElite();
  if (isElite) {
    // 精英怪：属性增强（通过修改combatEntity实现）
    monster.combatEntity.stats.physicalAttack *= 1.5;
    monster.combatEntity.stats.magicAttack *= 1.5;
    monster.combatEntity.stats.physicalDefense *= 1.5;
    monster.combatEntity.stats.magicDefense *= 1.5;
    monster.combatEntity.maxHp *= 1.5;
    monster.combatEntity.hp = monster.combatEntity.maxHp;

    // 精英怪视觉标记（蓝色边框）
    monster.nameText.setColor('#44aaff');
    monster.nameText.setText(`◆ ${data.name} ◆`);
  }

  return monster;
}

/** 创建Boss */
export function createBoss(scene: Phaser.Scene, options: SpawnOptions, isAbyss = false): Boss {
  const pool = isAbyss
    ? getAbyssBosses().filter(b => b.floor === options.floor)
    : getNormalBosses().filter(b => b.floor === options.floor);
  const bosses = pool.length > 0 ? pool : getBossesForFloor(options.floor);
  if (bosses.length === 0) {
    return new Boss(scene, ALL_BOSSES[0], options.gridX, options.gridY);
  }

  const data = pickRandom(bosses);
  return new Boss(scene, data, options.gridX, options.gridY);
}

/** 创建指定ID的怪物 */
export function createMonsterById(scene: Phaser.Scene, monsterId: string, gridX: number, gridY: number, floorMultiplier: number = 1.0): Monster | null {
  const data = ALL_MONSTERS.find(m => m.id === monsterId);
  if (!data) return null;
  return new Monster(scene, data, gridX, gridY, floorMultiplier);
}

/** 创建指定ID的Boss */
export function createBossById(scene: Phaser.Scene, bossId: string, gridX: number, gridY: number): Boss | null {
  const data = ALL_BOSSES.find(b => b.id === bossId);
  if (!data) return null;
  return new Boss(scene, data, gridX, gridY);
}

/** 批量生成房间怪物 */
export function spawnMonstersInRoom(
  scene: Phaser.Scene,
  spawnPositions: { x: number; y: number }[],
  floor: number,
  floorMultiplier: number,
  density: number = 0.6,
): Monster[] {
  const monsters: Monster[] = [];
  const count = Math.floor(spawnPositions.length * density);

  // 随机打乱位置
  const shuffled = [...spawnPositions].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const pos = shuffled[i];
    const monster = createMonster(scene, {
      floor,
      gridX: pos.x,
      gridY: pos.y,
      floorMultiplier,
    });
    monsters.push(monster);
  }

  return monsters;
}
