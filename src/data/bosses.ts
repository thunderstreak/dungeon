// Boss数据 - 10个普通Boss + 10个深渊Boss

import type { EquipmentRarity, MonsterType, MonsterSkill, MonsterSkillType, DamageType, DebuffType } from '@/config/types';

// ==================== Boss数据结构 ====================

/** Boss阶段技能配置 */
export interface BossPhase {
  hpThreshold: number; // HP百分比阈值 (0~1，如0.7表示70%HP以下触发)
  name: string;
  skills: MonsterSkill[];
  statMultiplier?: number; // 属性倍率（变身等）
}

/** Boss定义 */
export interface BossDefinition {
  id: string;
  name: string;
  floor: number;
  isAbyss: boolean;
  type: MonsterType;
  aggression: '普通' | '激进';
  aggroRange: number;
  stats: {
    hp: number;
    mp: number;
    physicalAttack: [number, number];
    magicAttack: [number, number];
    physicalDefense: number;
    magicDefense: number;
    attackSpeed: number;
    moveSpeed: number;
    criticalRate: number;
    criticalDamage: number;
  };
  skills: MonsterSkill[];
  phases: BossPhase[];
  lootTable: {
    equipmentRarity: Record<EquipmentRarity, number>;
    potionChance: number;
    materialChance: number;
    guaranteedDrop?: { rarity: EquipmentRarity; chance: number };
  };
  expReward: number;
  goldReward: [number, number];
  description: string;
}

// ==================== 辅助函数 ====================

function skill(
  id: string,
  name: string,
  type: MonsterSkillType,
  dmgPct: number,
  damageType: DamageType,
  cooldown: number,
  effectType?: DebuffType,
  effectDuration?: number,
  effectValue?: number,
  aoe?: boolean,
): MonsterSkill {
  return {
    id,
    name,
    type,
    damage: {
      type: damageType,
      baseValue: dmgPct,
      scalingStat: damageType === 'physical' ? 'physicalAttack' : 'magicAttack',
      scalingFactor: dmgPct / 100,
      aoeRadius: aoe ? 3 : null,
    },
    effect: effectType && effectDuration ? {
      type: effectType,
      duration: effectDuration,
      value: effectValue ?? 0,
      stackable: false,
      maxStack: 1,
    } : null,
    cooldown,
    range: damageType === 'physical' ? 1 : 5,
    description: `${name} - ${dmgPct}%${damageType === 'physical' ? '物' : '魔'}伤害`,
  };
}

function buffSkill(id: string, name: string, cooldown: number, desc: string): MonsterSkill {
  return {
    id, name, type: 'buff', damage: null, effect: null,
    cooldown, range: 0, description: desc,
  };
}

function summonSkill(id: string, name: string, cooldown: number, desc: string): MonsterSkill {
  return {
    id, name, type: 'summon', damage: null, effect: null,
    cooldown, range: 0, description: desc,
  };
}

function specialSkill(id: string, name: string, cooldown: number, desc: string): MonsterSkill {
  return {
    id, name, type: 'special', damage: null, effect: null,
    cooldown, range: 0, description: desc,
  };
}

function makeBoss(
  id: string, name: string, floor: number, isAbyss: boolean,
  type: MonsterType, aggression: '普通' | '激进', aggroRange: number,
  stats: BossDefinition['stats'], skills: MonsterSkill[], phases: BossPhase[],
  lootTable: BossDefinition['lootTable'], expReward: number, goldReward: [number, number],
  description: string,
): BossDefinition {
  return { id, name, floor, isAbyss, type, aggression, aggroRange, stats, skills, phases, lootTable, expReward, goldReward, description };
}

// ==================== 普通Boss ====================

const FLOOR_1_BOSS = makeBoss(
  'boss_skeleton_king', '骷髅王', 1, false,
  'melee', '普通', 5,
  { hp: 500, mp: 100, physicalAttack: [25, 35], magicAttack: [15, 25], physicalDefense: 15, magicDefense: 10, attackSpeed: 90, moveSpeed: 80, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss1_heavy_strike', '骷髅重击', 'attack', 150, 'physical', 4),
    summonSkill('boss1_summon', '召唤骷髅', 15, '召唤3只骷髅兵'),
    skill('boss1_whirlwind', '骷髅旋风', 'attack', 120, 'physical', 8, undefined, undefined, undefined, true),
    buffSkill('boss1_aura', '亡者领域', 20, '周围骷髅攻击+30%'),
  ],
  [{ hpThreshold: 0, name: '骷髅王', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  200, [100, 200],
  '第1层地牢的守关Boss，操控骷髅军团的不死之王。',
);

const FLOOR_2_BOSS = makeBoss(
  'boss_shadow_lord', '暗影领主', 2, false,
  'caster', '普通', 5,
  { hp: 650, mp: 150, physicalAttack: [35, 45], magicAttack: [25, 35], physicalDefense: 20, magicDefense: 15, attackSpeed: 100, moveSpeed: 100, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss2_shadow_bolt', '暗影弹', 'attack', 140, 'magic', 4),
    summonSkill('boss2_summon', '召唤暗影', 12, '召唤2只暗影分身'),
    specialSkill('boss2_teleport', '暗影传送', 10, '瞬移到玩家背后'),
    skill('boss2_curse', '暗影诅咒', 'control', 0, 'magic', 15, 'slow', 5, 50),
  ],
  [{ hpThreshold: 0, name: '暗影领主', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  300, [150, 250],
  '操控暗影之力的神秘领主，擅长瞬移和诅咒。',
);

const FLOOR_3_BOSS = makeBoss(
  'boss_poison_dragon', '毒龙', 3, false,
  'melee', '激进', 5,
  { hp: 800, mp: 200, physicalAttack: [45, 55], magicAttack: [35, 45], physicalDefense: 25, magicDefense: 20, attackSpeed: 90, moveSpeed: 90, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss3_breath', '毒息', 'attack', 150, 'magic', 5, 'poison', 5, 0),
    skill('boss3_spit', '毒液喷射', 'attack', 120, 'magic', 4),
    skill('boss3_poison_circle', '毒圈', 'attack', 100, 'magic', 10, 'poison', 3, 0, true),
    summonSkill('boss3_summon', '召唤毒蛇', 15, '召唤2只毒蛇'),
  ],
  [{ hpThreshold: 0, name: '毒龙', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  450, [200, 350],
  '盘踞在毒沼泽深处的剧毒巨龙，吐息可腐蚀一切。',
);

const FLOOR_4_BOSS = makeBoss(
  'boss_fire_giant', '火焰巨人', 4, false,
  'melee', '普通', 5,
  { hp: 1000, mp: 250, physicalAttack: [55, 70], magicAttack: [45, 55], physicalDefense: 30, magicDefense: 25, attackSpeed: 80, moveSpeed: 70, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss4_punch', '巨拳重击', 'attack', 160, 'physical', 4),
    skill('boss4_rain', '火焰雨', 'attack', 100, 'magic', 12, undefined, undefined, undefined, true),
    skill('boss4_eruption', '熔岩喷发', 'attack', 130, 'magic', 8, undefined, undefined, undefined, true),
    buffSkill('boss4_enrage', '狂暴', 20, '攻击+40%，持续10秒'),
  ],
  [{ hpThreshold: 0, name: '火焰巨人', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  600, [300, 500],
  '火山地带的统治者，身躯由熔岩构成，力大无穷。',
);

const FLOOR_5_BOSS = makeBoss(
  'boss_ice_dragon', '冰霜巨龙', 5, false,
  'caster', '普通', 6,
  { hp: 1200, mp: 300, physicalAttack: [65, 80], magicAttack: [55, 65], physicalDefense: 35, magicDefense: 30, attackSpeed: 90, moveSpeed: 90, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss5_ice_breath', '冰息', 'attack', 140, 'magic', 5, 'freeze', 2, 0),
    skill('boss5_icicle', '召唤冰柱', 'attack', 100, 'magic', 10, undefined, undefined, undefined, true),
    skill('boss5_nova', '冰霜新星', 'attack', 100, 'magic', 15, 'freeze', 1, 0, true),
    buffSkill('boss5_armor', '寒冰护甲', 20, '防御+50%，持续8秒'),
  ],
  [{ hpThreshold: 0, name: '冰霜巨龙', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  800, [400, 650],
  '冰霜深渊的守护者，吐息可冻结一切的远古巨龙。',
);

const FLOOR_6_BOSS = makeBoss(
  'boss_shadow_demon', '暗影魔王', 6, false,
  'caster', '激进', 6,
  { hp: 1500, mp: 400, physicalAttack: [80, 95], magicAttack: [70, 85], physicalDefense: 40, magicDefense: 35, attackSpeed: 100, moveSpeed: 110, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss6_impact', '暗影冲击', 'attack', 150, 'magic', 4),
    summonSkill('boss6_summon', '召唤暗影军团', 15, '召唤4只暗影怪'),
    skill('boss6_curse', '暗影诅咒', 'control', 0, 'magic', 12, 'slow', 5, 50),
    specialSkill('boss6_clone', '暗影分身', 20, '召唤2个分身'),
  ],
  [{ hpThreshold: 0, name: '暗影魔王', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  1000, [500, 800],
  '暗影深渊的王者，掌控暗影之力的恐怖存在。',
);

const FLOOR_7_BOSS = makeBoss(
  'boss_thunder_god', '雷神', 7, false,
  'caster', '激进', 6,
  { hp: 1800, mp: 500, physicalAttack: [95, 110], magicAttack: [85, 100], physicalDefense: 45, magicDefense: 40, attackSpeed: 110, moveSpeed: 120, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss7_wrath', '雷神之怒', 'attack', 120, 'magic', 6, undefined, undefined, undefined, true),
    skill('boss7_orb', '召唤雷球', 'attack', 100, 'magic', 10),
    skill('boss7_chain', '连锁闪电', 'attack', 100, 'magic', 8, undefined, undefined, undefined, false),
    skill('boss7_field', '雷霆领域', 'attack', 100, 'magic', 20, undefined, undefined, undefined, true),
  ],
  [{ hpThreshold: 0, name: '雷神', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  1200, [600, 1000],
  '雷霆领域的主宰，操控雷电之力的远古神明。',
);

const FLOOR_8_BOSS = makeBoss(
  'boss_lich_king', '亡灵君王', 8, false,
  'caster', '普通', 6,
  { hp: 2200, mp: 600, physicalAttack: [110, 130], magicAttack: [100, 120], physicalDefense: 50, magicDefense: 45, attackSpeed: 100, moveSpeed: 80, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss8_impact', '亡灵冲击', 'attack', 160, 'magic', 5),
    summonSkill('boss8_resurrect', '复活大军', 20, '复活所有死亡小怪'),
    skill('boss8_curse', '死亡诅咒', 'control', 0, 'magic', 12, 'curse', 5, 20),
    skill('boss8_domain', '亡者领域', 'attack', 100, 'magic', 15, 'bleed', 3, 3, true),
  ],
  [{ hpThreshold: 0, name: '亡灵君王', skills: [] }],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  1500, [750, 1200],
  '亡灵之地的至高统治者，可复活一切死者为其战斗。',
);

const FLOOR_9_BOSS = makeBoss(
  'boss_demon_lord', '恶魔领主', 9, false,
  'melee', '激进', 5,
  { hp: 2800, mp: 700, physicalAttack: [130, 150], magicAttack: [120, 140], physicalDefense: 55, magicDefense: 50, attackSpeed: 100, moveSpeed: 100, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss9_heavy', '恶魔重击', 'attack', 180, 'physical', 5),
    skill('boss9_blast', '暗影爆破', 'attack', 100, 'magic', 10, undefined, undefined, undefined, true),
    specialSkill('boss9_transform', '变身', 30, '变身形态，属性翻倍'),
    summonSkill('boss9_summon', '恶魔军团', 15, '召唤3只恶魔'),
  ],
  [
    { hpThreshold: 0, name: '恶魔领主', skills: [] },
    { hpThreshold: 0.3, name: '恶魔领主·狂暴', statMultiplier: 1.5, skills: [
      skill('boss9_heavy_enraged', '恶魔重击·强化', 'attack', 220, 'physical', 4),
      skill('boss9_blast_enraged', '暗影爆破·强化', 'attack', 150, 'magic', 8, undefined, undefined, undefined, true),
    ] },
  ],
  { equipmentRarity: { white: 0.30, blue: 0.35, purple: 0.25, pink: 0.08, orange: 0.02 }, potionChance: 1.0, materialChance: 0.8, guaranteedDrop: { rarity: 'pink', chance: 1.0 } },
  1800, [900, 1500],
  '深渊裂隙中的魔王，拥有变身能力的恐怖恶魔。',
);

const FLOOR_10_BOSS = makeBoss(
  'boss_abyss_demon', '深渊魔王', 10, false,
  'melee', '激进', 6,
  { hp: 3500, mp: 800, physicalAttack: [160, 185], magicAttack: [150, 175], physicalDefense: 60, magicDefense: 55, attackSpeed: 100, moveSpeed: 100, criticalRate: 5, criticalDamage: 180 },
  [
    skill('boss10_impact', '深渊冲击', 'attack', 180, 'physical', 4),
    skill('boss10_blast', '暗影爆破', 'attack', 100, 'magic', 8, undefined, undefined, undefined, true),
    summonSkill('boss10_summon', '召唤深渊守卫', 15, '召唤2只守卫'),
  ],
  [
    { hpThreshold: 0.7, name: '深渊魔王·第一形态', skills: [
      skill('boss10_p1_impact', '深渊冲击', 'attack', 180, 'physical', 4),
      skill('boss10_p1_blast', '暗影爆破', 'attack', 100, 'magic', 8, undefined, undefined, undefined, true),
      summonSkill('boss10_p1_summon', '召唤深渊守卫', 15, '召唤2只守卫'),
    ] },
    { hpThreshold: 0.3, name: '深渊魔王·第二形态', statMultiplier: 1.5, skills: [
      skill('boss10_p2_rage', '深渊之怒', 'attack', 200, 'magic', 5),
      skill('boss10_p2_domain', '深渊领域', 'attack', 100, 'magic', 12, undefined, undefined, undefined, true),
      specialSkill('boss10_p2_transform', '变身', 30, '属性+50%'),
    ] },
    { hpThreshold: 0, name: '深渊魔王·最终形态', statMultiplier: 2.0, skills: [
      skill('boss10_p3_ultimate', '终极深渊', 'attack', 300, 'magic', 20, undefined, undefined, undefined, true),
      summonSkill('boss10_p3_summon_all', '无尽深渊', 15, '召唤所有类型怪物'),
      buffSkill('boss10_p3_fury', '深渊狂暴', 0, '全属性+100%'),
    ] },
  ],
  { equipmentRarity: { white: 0.20, blue: 0.30, purple: 0.30, pink: 0.12, orange: 0.08 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.5 } },
  2500, [1500, 2500],
  '最终Boss，深渊的至高统治者。拥有三种形态，每种形态都会变得更加强大。',
);

// ==================== 深渊Boss ====================

const ABYSS_FLOOR_1_BOSS = makeBoss(
  'boss_abyss_skeleton_king', '深渊骷髅王', 1, true,
  'melee', '普通', 5,
  { hp: 1000, mp: 200, physicalAttack: [50, 70], magicAttack: [30, 50], physicalDefense: 30, magicDefense: 20, attackSpeed: 90, moveSpeed: 80, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss1_heavy_strike', '骷髅重击·深渊', 'attack', 180, 'physical', 4),
    summonSkill('aboss1_summon', '召唤深渊骷髅', 12, '召唤5只骷髅兵'),
    skill('aboss1_whirlwind', '骷髅旋风·深渊', 'attack', 150, 'physical', 6, undefined, undefined, undefined, true),
    buffSkill('aboss1_aura', '亡者领域·深渊', 18, '周围骷髅攻击+50%'),
  ],
  [{ hpThreshold: 0, name: '深渊骷髅王', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.15 } },
  400, [200, 400],
  '深渊中被强化的骷髅王，力量远超普通形态。',
);

const ABYSS_FLOOR_2_BOSS = makeBoss(
  'boss_abyss_shadow_lord', '深渊暗影领主', 2, true,
  'caster', '普通', 5,
  { hp: 1300, mp: 300, physicalAttack: [70, 90], magicAttack: [50, 70], physicalDefense: 40, magicDefense: 30, attackSpeed: 100, moveSpeed: 100, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss2_shadow_bolt', '暗影弹·深渊', 'attack', 170, 'magic', 4),
    summonSkill('aboss2_summon', '召唤深渊暗影', 10, '召唤4只暗影分身'),
    specialSkill('aboss2_teleport', '暗影传送·深渊', 8, '瞬移到玩家背后'),
    skill('aboss2_curse', '暗影诅咒·深渊', 'control', 0, 'magic', 12, 'slow', 6, 70),
  ],
  [{ hpThreshold: 0, name: '深渊暗影领主', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.15 } },
  600, [300, 500],
  '深渊中被强化的暗影领主，暗影之力更加凶猛。',
);

const ABYSS_FLOOR_3_BOSS = makeBoss(
  'boss_abyss_poison_dragon', '深渊毒龙', 3, true,
  'melee', '激进', 5,
  { hp: 1600, mp: 400, physicalAttack: [90, 110], magicAttack: [70, 90], physicalDefense: 50, magicDefense: 40, attackSpeed: 90, moveSpeed: 90, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss3_breath', '毒息·深渊', 'attack', 180, 'magic', 4, 'poison', 7, 0),
    skill('aboss3_spit', '毒液喷射·深渊', 'attack', 150, 'magic', 3),
    skill('aboss3_poison_circle', '毒圈·深渊', 'attack', 100, 'magic', 8, 'poison', 5, 0, true),
    summonSkill('aboss3_summon', '召唤深渊毒蛇', 12, '召唤4只毒蛇'),
  ],
  [{ hpThreshold: 0, name: '深渊毒龙', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.18 } },
  900, [400, 700],
  '深渊中被强化的毒龙，毒液可腐蚀深渊中的一切。',
);

const ABYSS_FLOOR_4_BOSS = makeBoss(
  'boss_abyss_fire_giant', '深渊火焰巨人', 4, true,
  'melee', '普通', 5,
  { hp: 2000, mp: 500, physicalAttack: [110, 140], magicAttack: [90, 110], physicalDefense: 60, magicDefense: 50, attackSpeed: 80, moveSpeed: 70, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss4_punch', '巨拳重击·深渊', 'attack', 190, 'physical', 3),
    skill('aboss4_rain', '火焰雨·深渊', 'attack', 130, 'magic', 10, undefined, undefined, undefined, true),
    skill('aboss4_eruption', '熔岩喷发·深渊', 'attack', 160, 'magic', 6, undefined, undefined, undefined, true),
    buffSkill('aboss4_enrage', '狂暴·深渊', 18, '攻击+60%，持续12秒'),
  ],
  [{ hpThreshold: 0, name: '深渊火焰巨人', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.18 } },
  1200, [600, 1000],
  '深渊中被强化的火焰巨人，熔岩之怒更加恐怖。',
);

const ABYSS_FLOOR_5_BOSS = makeBoss(
  'boss_abyss_ice_dragon', '深渊冰霜巨龙', 5, true,
  'caster', '普通', 6,
  { hp: 2400, mp: 600, physicalAttack: [130, 160], magicAttack: [110, 130], physicalDefense: 70, magicDefense: 60, attackSpeed: 90, moveSpeed: 90, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss5_ice_breath', '冰息·深渊', 'attack', 170, 'magic', 4, 'freeze', 3, 0),
    skill('aboss5_icicle', '召唤冰柱·深渊', 'attack', 100, 'magic', 8, undefined, undefined, undefined, true),
    skill('aboss5_nova', '冰霜新星·深渊', 'attack', 130, 'magic', 12, 'freeze', 2, 0, true),
    buffSkill('aboss5_armor', '寒冰护甲·深渊', 18, '防御+70%，持续10秒'),
  ],
  [{ hpThreshold: 0, name: '深渊冰霜巨龙', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.20 } },
  1600, [800, 1300],
  '深渊中被强化的冰霜巨龙，冰霜之力可冻结深渊。',
);

const ABYSS_FLOOR_6_BOSS = makeBoss(
  'boss_abyss_shadow_demon', '深渊暗影魔王', 6, true,
  'caster', '激进', 6,
  { hp: 3000, mp: 800, physicalAttack: [160, 190], magicAttack: [140, 170], physicalDefense: 80, magicDefense: 70, attackSpeed: 100, moveSpeed: 110, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss6_impact', '暗影冲击·深渊', 'attack', 180, 'magic', 3),
    summonSkill('aboss6_summon', '召唤深渊暗影军团', 12, '召唤6只暗影怪'),
    skill('aboss6_curse', '暗影诅咒·深渊', 'control', 0, 'magic', 10, 'slow', 7, 50),
    specialSkill('aboss6_clone', '暗影分身·深渊', 18, '召唤3个分身'),
  ],
  [{ hpThreshold: 0, name: '深渊暗影魔王', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.20 } },
  2000, [1000, 1600],
  '深渊中被强化的暗影魔王，暗影军团更加庞大。',
);

const ABYSS_FLOOR_7_BOSS = makeBoss(
  'boss_abyss_thunder_god', '深渊雷神', 7, true,
  'caster', '激进', 6,
  { hp: 3600, mp: 1000, physicalAttack: [190, 220], magicAttack: [170, 200], physicalDefense: 90, magicDefense: 80, attackSpeed: 110, moveSpeed: 120, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss7_wrath', '雷神之怒·深渊', 'attack', 150, 'magic', 5, undefined, undefined, undefined, true),
    skill('aboss7_orb', '召唤雷球·深渊', 'attack', 100, 'magic', 8),
    skill('aboss7_chain', '连锁闪电·深渊', 'attack', 120, 'magic', 6),
    skill('aboss7_field', '雷霆领域·深渊', 'attack', 100, 'magic', 16, undefined, undefined, undefined, true),
  ],
  [{ hpThreshold: 0, name: '深渊雷神', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.22 } },
  2400, [1200, 2000],
  '深渊中被强化的雷神，雷霆之力更加狂暴。',
);

const ABYSS_FLOOR_8_BOSS = makeBoss(
  'boss_abyss_lich_king', '深渊亡灵君王', 8, true,
  'caster', '普通', 6,
  { hp: 4400, mp: 1200, physicalAttack: [220, 260], magicAttack: [200, 240], physicalDefense: 100, magicDefense: 90, attackSpeed: 100, moveSpeed: 80, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss8_impact', '亡灵冲击·深渊', 'attack', 190, 'magic', 4),
    summonSkill('aboss8_resurrect', '复活大军·深渊', 16, '复活所有死亡小怪并强化'),
    skill('aboss8_curse', '死亡诅咒·深渊', 'control', 0, 'magic', 10, 'curse', 8, 25),
    skill('aboss8_domain', '亡者领域·深渊', 'attack', 100, 'magic', 12, 'bleed', 5, 5, true),
  ],
  [{ hpThreshold: 0, name: '深渊亡灵君王', skills: [] }],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.22 } },
  3000, [1500, 2400],
  '深渊中被强化的亡灵君王，亡灵大军无穷无尽。',
);

const ABYSS_FLOOR_9_BOSS = makeBoss(
  'boss_abyss_demon_lord', '深渊恶魔领主', 9, true,
  'melee', '激进', 5,
  { hp: 5600, mp: 1400, physicalAttack: [260, 300], magicAttack: [240, 280], physicalDefense: 110, magicDefense: 100, attackSpeed: 100, moveSpeed: 100, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss9_heavy', '恶魔重击·深渊', 'attack', 220, 'physical', 4),
    skill('aboss9_blast', '暗影爆破·深渊', 'attack', 180, 'magic', 8, undefined, undefined, undefined, true),
    specialSkill('aboss9_transform', '变身·深渊', 25, '变身形态，属性×2'),
    summonSkill('aboss9_summon', '恶魔军团·深渊', 12, '召唤5只恶魔'),
  ],
  [
    { hpThreshold: 0, name: '深渊恶魔领主', skills: [] },
    { hpThreshold: 0.3, name: '深渊恶魔领主·狂暴', statMultiplier: 2.0, skills: [
      skill('aboss9_heavy_enraged', '恶魔重击·深渊狂暴', 'attack', 280, 'physical', 3),
      skill('aboss9_blast_enraged', '暗影爆破·深渊狂暴', 'attack', 220, 'magic', 6, undefined, undefined, undefined, true),
    ] },
  ],
  { equipmentRarity: { white: 0.10, blue: 0.25, purple: 0.30, pink: 0.20, orange: 0.15 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.25 } },
  3600, [1800, 3000],
  '深渊中被强化的恶魔领主，变身之力更加恐怖。',
);

const ABYSS_FLOOR_10_BOSS = makeBoss(
  'boss_abyss_final_demon', '深渊魔王·终焉', 10, true,
  'melee', '激进', 6,
  { hp: 7000, mp: 1600, physicalAttack: [320, 370], magicAttack: [300, 350], physicalDefense: 120, magicDefense: 110, attackSpeed: 100, moveSpeed: 100, criticalRate: 5, criticalDamage: 180 },
  [
    skill('aboss10_impact', '深渊冲击·终焉', 'attack', 220, 'physical', 3),
    skill('aboss10_blast', '暗影爆破·终焉', 'attack', 200, 'magic', 6, undefined, undefined, undefined, true),
    summonSkill('aboss10_summon', '召唤深渊守卫·终焉', 10, '召唤4只守卫'),
  ],
  [
    { hpThreshold: 0.7, name: '深渊魔王·终焉·第一形态', skills: [
      skill('aboss10_p1_impact', '深渊冲击·终焉', 'attack', 220, 'physical', 3),
      skill('aboss10_p1_blast', '暗影爆破·终焉', 'attack', 200, 'magic', 6, undefined, undefined, undefined, true),
      summonSkill('aboss10_p1_summon', '召唤深渊守卫·终焉', 10, '召唤4只守卫'),
    ] },
    { hpThreshold: 0.3, name: '深渊魔王·终焉·第二形态', statMultiplier: 1.8, skills: [
      skill('aboss10_p2_rage', '深渊之怒·终焉', 'attack', 250, 'magic', 4),
      skill('aboss10_p2_domain', '深渊领域·终焉', 'attack', 100, 'magic', 10, undefined, undefined, undefined, true),
      specialSkill('aboss10_p2_transform', '变身·终焉', 25, '属性+80%'),
    ] },
    { hpThreshold: 0, name: '深渊魔王·终焉·最终形态', statMultiplier: 2.5, skills: [
      skill('aboss10_p3_ultimate', '终极深渊·终焉', 'attack', 400, 'magic', 15, undefined, undefined, undefined, true),
      summonSkill('aboss10_p3_summon_all', '无尽深渊·终焉', 10, '召唤所有类型怪物'),
      buffSkill('aboss10_p3_fury', '深渊狂暴·终焉', 0, '全属性+150%'),
    ] },
  ],
  { equipmentRarity: { white: 0.05, blue: 0.15, purple: 0.30, pink: 0.25, orange: 0.25 }, potionChance: 1.0, materialChance: 1.0, guaranteedDrop: { rarity: 'orange', chance: 0.30 } },
  5000, [3000, 5000],
  '深渊的最终统治者，拥有三种毁灭性形态。击败它，才能真正结束这场噩梦。',
);

// ==================== 主数组与查询 ====================

/** 所有Boss */
export const ALL_BOSSES: BossDefinition[] = [
  FLOOR_1_BOSS, FLOOR_2_BOSS, FLOOR_3_BOSS, FLOOR_4_BOSS, FLOOR_5_BOSS,
  FLOOR_6_BOSS, FLOOR_7_BOSS, FLOOR_8_BOSS, FLOOR_9_BOSS, FLOOR_10_BOSS,
  ABYSS_FLOOR_1_BOSS, ABYSS_FLOOR_2_BOSS, ABYSS_FLOOR_3_BOSS, ABYSS_FLOOR_4_BOSS, ABYSS_FLOOR_5_BOSS,
  ABYSS_FLOOR_6_BOSS, ABYSS_FLOOR_7_BOSS, ABYSS_FLOOR_8_BOSS, ABYSS_FLOOR_9_BOSS, ABYSS_FLOOR_10_BOSS,
];

/** 按ID查询Boss */
export function getBossById(id: string): BossDefinition | undefined {
  return ALL_BOSSES.find(b => b.id === id);
}

/** 按楼层查询Boss */
export function getBossesByFloor(floor: number): BossDefinition[] {
  return ALL_BOSSES.filter(b => b.floor === floor);
}

/** 获取普通Boss */
export function getNormalBosses(): BossDefinition[] {
  return ALL_BOSSES.filter(b => !b.isAbyss);
}

/** 获取深渊Boss */
export function getAbyssBosses(): BossDefinition[] {
  return ALL_BOSSES.filter(b => b.isAbyss);
}

/** 楼层对应普通Boss ID映射 */
export const FLOOR_BOSS_MAP: Record<number, string> = {
  1: 'boss_skeleton_king',
  2: 'boss_shadow_lord',
  3: 'boss_poison_dragon',
  4: 'boss_fire_giant',
  5: 'boss_ice_dragon',
  6: 'boss_shadow_demon',
  7: 'boss_thunder_god',
  8: 'boss_lich_king',
  9: 'boss_demon_lord',
  10: 'boss_abyss_demon',
};

/** 楼层对应深渊Boss ID映射 */
export const FLOOR_ABYSS_BOSS_MAP: Record<number, string> = {
  1: 'boss_abyss_skeleton_king',
  2: 'boss_abyss_shadow_lord',
  3: 'boss_abyss_poison_dragon',
  4: 'boss_abyss_fire_giant',
  5: 'boss_abyss_ice_dragon',
  6: 'boss_abyss_shadow_demon',
  7: 'boss_abyss_thunder_god',
  8: 'boss_abyss_lich_king',
  9: 'boss_abyss_demon_lord',
  10: 'boss_abyss_final_demon',
};

/** Boss总数 */
export const BOSS_COUNT = ALL_BOSSES.length;
