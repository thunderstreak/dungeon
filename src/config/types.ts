// ============================================================
// 全局类型定义
// ============================================================

// ==================== 枚举类型 ====================

/** 角色职业 */
export type CharacterClass = 'warrior' | 'mage';

/** 转职方向 */
export type Specialization =
  | 'berserker' | 'swordsman' | 'blademaster'   // 战士
  | 'ice_mage' | 'thunder_mage' | 'fire_mage';   // 法师

/** 装备品质 */
export type EquipmentRarity = 'white' | 'blue' | 'purple' | 'pink' | 'orange';

/** 装备部位 */
export type EquipmentSlot =
  | 'weapon' | 'helmet' | 'armor' | 'shield' | 'belt' | 'boots'
  | 'necklace' | 'ring1' | 'ring2' | 'bracelet1' | 'bracelet2' | 'rune';

/** 装备类型 (武器子类型) */
export type EquipmentType =
  | 'sword' | 'blade' | 'axe'               // 战士武器
  | 'long_staff' | 'short_staff' | 'wand';   // 法师武器

/** 伤害类型 */
export type DamageType = 'physical' | 'magic' | 'true';

/** 技能类别 */
export type SkillCategory = 'active' | 'passive';

/** 技能类型 */
export type SkillType = 'attack' | 'defense' | 'support' | 'utility';

/** 技能强化类型 */
export type SkillEnhancementType = 'damage' | 'range' | 'form' | 'effect';

/** 怪物类型 */
export type MonsterType = 'melee' | 'ranged' | 'caster' | 'support';

/** 怪物攻击性 */
export type AggressionType = 'passive' | 'normal' | 'aggressive' | 'patrol';

/** 怪物技能类型 */
export type MonsterSkillType = 'attack' | 'control' | 'buff' | 'summon' | 'special';

/** 房间类型 */
export type RoomType = 'start' | 'normal' | 'treasure' | 'shop' | 'event' | 'boss';

/** 物品类型 */
export type ItemType = 'equipment' | 'consumable' | 'material' | 'quest' | 'skillbook' | 'other';

/** 背包分类 */
export type InventoryCategory = 'equipment' | 'consumable' | 'material' | 'other';

/** Buff来源 */
export type BuffSource = 'skill' | 'item' | 'equipment' | 'potion' | 'monster' | 'environment';

/** 效果值类型 */
export type EffectValueType = 'flat' | 'percent';

/** Debuff类型 */
export type DebuffType =
  | 'poison' | 'freeze' | 'stun' | 'knockback' | 'slow'
  | 'curse' | 'taunt' | 'silence' | 'bleed' | 'burn' | 'paralyze';

/** 仇恨行为类型 */
export type AggroAction = 'damage' | 'heal' | 'taunt' | 'enterRange';

/** 金币获取来源 */
export type GoldSource =
  | 'monster_drop' | 'boss_drop' | 'sell_item'
  | 'quest_reward' | 'achievement' | 'daily_reward';

/** 金币消耗来源 */
export type GoldSink =
  | 'buy_item' | 'repair_equipment' | 'enhance_equipment'
  | 'learn_skill' | 'forget_skill' | 'expand_storage' | 'craft_item';

/** 符文类型 */
export type RuneType = 'attack' | 'defense' | 'element' | 'function' | 'skill';

/** NPC类型 */
export type NPCType =
  | 'blacksmith' | 'merchant' | 'skill_trainer' | 'class_trainer'
  | 'banker' | 'fortune_teller' | 'alchemist' | 'teleporter';

/** 城镇区域 */
export type TownArea = 'military' | 'commercial' | 'adventurer' | 'teleport';

/** 掉落物类型 */
export type DropType = 'experience' | 'gold' | 'equipment' | 'potion' | 'material' | 'skillbook' | 'rune';

/** 武器精通类型 */
export type WeaponMasteryType =
  | 'blade_mastery' | 'sword_mastery' | 'axe_mastery'           // 战士
  | 'long_staff_mastery' | 'short_staff_mastery' | 'wand_mastery'; // 法师

// ==================== 数据结构 ====================

/** 二维坐标 */
export interface Vector2 {
  x: number;
  y: number;
}

/** 矩形区域 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 属性加成 */
export interface StatBonus {
  stat: string;
  type: EffectValueType;
  value: number;
}

/** 角色属性 */
export interface CharacterStats {
  // 基础属性
  strength: number;
  intelligence: number;
  stamina: number;
  spirit: number;
  // 战斗属性
  hp: number;
  mp: number;
  maxHp: number;
  maxMp: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicDefense: number;
  criticalRate: number;
  criticalDamage: number;
  dodgeRate: number;
  attackSpeed: number;
  castSpeed: number;
  moveSpeed: number;
  // 被动技能加成属性
  lifesteal: number;       // 生命偷取%
  swordDamage: number;     // 剑类伤害%
  iceDamage: number;       // 冰系伤害%
  fireDamage: number;      // 火系伤害%
}

/** 已分配的属性点 (通过加点面板分配) */
export interface AllocatedStats {
  strength: number;
  intelligence: number;
  stamina: number;
  spirit: number;
}

/** 装备栏 */
export type EquipmentSlots = Record<EquipmentSlot, Equipment | null>;

/** 装备 */
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  level: number;
  stats: StatBonus[];
  requirement: { level: number };
  enhancementLevel: number;
  durability: number;
  maxDurability: number;
  setBonus: SetBonus | null;
  isBound: boolean;
  specialEffect: string | null;
  icon: string;
}

/** 套装效果 */
export interface SetBonus {
  setId: string;
  setName: string;
  pieces: number;
  bonuses: SetBonusEffect[];
}

/** 套装效果项 */
export interface SetBonusEffect {
  requiredPieces: number;
  effects: StatBonus[];
}

/** 物品基类 */
export interface Item {
  id: string;
  name: string;
  type: ItemType;
  icon: string;
  description: string;
  isStackable: boolean;
  maxStack: number;
}

/** 背包槽位 */
export interface InventorySlot {
  item: Item | null;
  equipmentData?: Equipment;
  count: number;
}

/** 背包 */
export interface Inventory {
  categories: Record<InventoryCategory, InventorySlot[]>;
  maxSlotsPerCategory: number;
  gold: number;
}

/** 技能槽位 */
export interface SkillSlot {
  skillId: string;
  level: number;
  cooldownRemaining: number;
}

/** 技能 */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  type: SkillType;
  description: string;
  manaCost: number | null;
  cooldown: number | null;
  maxLevel: number;
  currentLevel: number;
  damage: DamageCalculation | null;
  effects: StatusEffect[] | null;
  unlockLevel: number;
  classRequirement: CharacterClass | null;
  specialization: string | null;
  enhancements: SkillEnhancement[] | null;
}

/** 伤害计算 */
export interface DamageCalculation {
  type: DamageType;
  baseValue: number;
  scalingStat: string;
  scalingFactor: number;
  aoeRadius: number | null;
}

/** 状态效果 */
export interface StatusEffect {
  type: DebuffType;
  duration: number;
  value: number;
  stackable: boolean;
  maxStack: number;
}

/** 技能强化 */
export interface SkillEnhancement {
  id: string;
  name: string;
  description: string;
  type: SkillEnhancementType;
  value: number;
  source: 'equipment' | 'item';
}

/** 武器精通 */
export interface WeaponMastery {
  id: string;
  name: string;
  weaponType: string;
  maxLevel: number;
  currentLevel: number;
  currentExp: number;
  expPerLevel: number;
  bonuses: MasteryBonus[];
}

/** 精通加成 */
export interface MasteryBonus {
  level: number;
  stat: string;
  value: number;
  description: string;
}

/** Buff/Debuff */
export interface Buff {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
  maxDuration: number;
  effects: BuffEffect[];
  source: BuffSource;
  stackCount: number;
  maxStack: number;
}

/** Buff效果 */
export interface BuffEffect {
  stat: string;
  type: EffectValueType;
  value: number;
}

/** 怪物数据 */
export interface MonsterData {
  id: string;
  name: string;
  level: number;
  type: MonsterType;
  aggression: AggressionType;
  stats: MonsterStats;
  skills: MonsterSkill[];
  lootTable: LootEntry[];
  sprite: string;
  isBoss: boolean;
  isElite: boolean;
  aggroRange: number;
  expReward: number;
  goldReward: [number, number];
}

/** 怪物属性 */
export interface MonsterStats {
  hp: number;
  mp: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicDefense: number;
  attackSpeed: number;
  moveSpeed: number;
  criticalRate: number;
  criticalDamage: number;
}

/** 怪物技能 */
export interface MonsterSkill {
  id: string;
  name: string;
  type: MonsterSkillType;
  damage: DamageCalculation | null;
  effect: StatusEffect | null;
  cooldown: number;
  range: number;
  description: string;
}

/** 掉落条目 */
export interface LootEntry {
  itemId: string;
  dropRate: number;
  minCount: number;
  maxCount: number;
  guaranteed: boolean;
}

/** 精英怪加成 */
export interface EliteModifier {
  hpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  expMultiplier: number;
  goldMultiplier: number;
  guaranteedDrop: boolean;
}

/** 深渊模式加成 */
export interface AbyssModifier {
  hpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  expMultiplier: number;
  goldMultiplier: number;
  pinkDropMultiplier: number;
  orangeDropMultiplier: number;
}

/** 怪物刷新点 */
export interface MonsterSpawn {
  monsterId: string;
  position: Vector2;
  count: number;
}

/** 物品刷新点 */
export interface ItemSpawn {
  itemId: string;
  position: Vector2;
}

/** 房间 */
export interface Room {
  id: string;
  type: RoomType;
  position: Rectangle;
  monsters: MonsterSpawn[];
  items: ItemSpawn[];
  connectedRooms: string[];
}

/** 走廊 */
export interface Corridor {
  startRoomId: string;
  endRoomId: string;
  path: Vector2[];
}

/** 地牢地图 */
export interface DungeonMap {
  rooms: Room[];
  corridors: Corridor[];
  startRoom: Room;
  bossRoom: Room;
  specialRooms: Room[];
}

/** 地牢进度 */
export interface DungeonProgress {
  currentFloor: number;
  highestFloor: number;
  isAbyss: boolean;
  roomsCleared: number;
}

/** 仇恨系统 */
export interface AggroSystem {
  currentTarget: string | null;
  hateTable: Map<string, number>;
  decayRate: number;
}

/** 角色 */
export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  specialization: Specialization | null;
  level: number;
  experience: number;
  skillPoints: number;
  attributePoints: number;          // 可分配属性点
  allocatedStats: AllocatedStats;   // 已分配的属性点
  allocatedStatsSaved: boolean;     // 加点是否已保存（保存后不可调整）
  gold: number;
  stats: CharacterStats;
  equipment: EquipmentSlots;
  inventory: Inventory;
  skills: SkillSlot[];
  weaponMasteries: WeaponMastery[];
  position: Vector2;
}

/** 金币系统 */
export interface GoldSystem {
  current: number;
  earned: number;
  spent: number;
}

/** 金币日志 */
export interface GoldLog {
  timestamp: number;
  source: GoldSource | GoldSink;
  amount: number;
  balance: number;
  description: string;
}

/** NPC对话选项 */
export interface DialogOption {
  text: string;
  nextDialogId: string | null;
  action: string | null;
}

/** NPC对话 */
export interface Dialog {
  id: string;
  text: string;
  options: DialogOption[];
}

/** NPC数据 */
export interface NPCData {
  id: string;
  name: string;
  type: NPCType;
  area: TownArea;
  position: Vector2;
  sprite: string;
  dialogs: Dialog[];
}

/** 游戏设置 */
export interface GameSettings {
  bgmVolume: number;
  sfxVolume: number;
  difficulty: number;
}

/** 存档数据 */
export interface SaveData {
  version: string;
  timestamp: number;
  slot: number;
  player: Character;
  dungeon: DungeonProgress;
  inventory: Inventory;
  settings: GameSettings;
}

/** 音频配置 */
export interface AudioConfig {
  bgm: {
    town: string;
    dungeon: string[];
    battle: string;
    boss: string;
    menu: string;
  };
  sfx: {
    attack: string;
    hit: string;
    skill: string;
    pickup: string;
    ui: string;
    levelup: string;
    enhance: string;
  };
}
