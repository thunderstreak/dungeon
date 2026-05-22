# 地牢探险 - 游戏架构文档

## 1. 技术选型

### 1.1 游戏类型

**2D等距视角像素风RPG (类似星露谷物语)**

- 等距视角: 45度斜向俯视，可看到物体顶部和侧面
- 伪3D效果: 通过等距投影营造立体感
- 像素风格: 复古像素艺术

### 1.2 推荐技术栈

| 技术 | 说明 | 备选 |
|------|------|------|
| 游戏引擎 | **Phaser 3** | PixiJS + 手动搭建 |
| 语言 | TypeScript | JavaScript |
| 构建工具 | Vite | Webpack |
| 包管理 | pnpm | npm/yarn |

### 1.3 为什么选择 Phaser 3?

**Phaser 3 特点**:
- 成熟的2D游戏引擎，专为2D游戏设计
- 内置Arcade物理引擎 (适合2D等距视角)
- 内置Tilemap支持 (适合地牢地图)
- 内置粒子系统 (适合技能特效)
- 优秀的文档和社区
- 原生支持像素风格

**等距视角游戏支持**:
- Camera系统: 支持等距视角跟随玩家
- Tilemap: 支持等距瓦片地图渲染 (Isometric Tilemap)
- Sprite: 支持精灵动画
- Input: 支持键盘/鼠标控制
- Physics: 支持碰撞检测

**适合本项目的原因**:
- 专为2D游戏设计，性能优秀
- 内置功能满足大部分需求
- 社区活跃，插件丰富
- 学习曲线适中

---

## 2. 项目结构

```
2dgame/
├── docs/                        # 文档
│   ├── game-design.md           # 游戏设计文档
│   ├── game-architecture.md     # 架构文档
│   ├── equipment-system.md      # 装备系统详细设定
│   ├── potion-system.md         # 药水系统详细设定
│   ├── enhancement-materials.md # 强化材料详细设定
│   ├── npc-system.md            # NPC系统详细设定
│   ├── monster-system.md        # 怪物系统详细设定
│   └── gold-system.md           # 金币系统详细设定
├── src/
│   ├── main.ts              # 入口文件
│   ├── config/
│   │   ├── index.ts         # 全局配置
│   │   ├── constants.ts     # 常量定义
│   │   └── types.ts         # 类型定义
│   ├── scenes/
│   │   ├── BootScene.ts            # 启动场景
│   │   ├── PreloadScene.ts         # 资源加载
│   │   ├── MainMenuScene.ts        # 主菜单
│   │   ├── CharacterSelectScene.ts # 角色选择/创建
│   │   ├── TownScene.ts            # 城镇场景
│   │   ├── DungeonScene.ts         # 地牢场景
│   │   ├── BattleScene.ts          # 战斗场景
│   │   └── UIScene.ts              # UI层
│   ├── systems/
│   │   ├── BattleSystem.ts  # 战斗系统
│   │   ├── DungeonSystem.ts # 地牢系统
│   │   ├── MapGenerator.ts  # 随机地图生成
│   │   ├── InventorySystem.ts # 背包系统
│   │   ├── SkillSystem.ts   # 技能系统
│   │   ├── EquipmentSystem.ts # 装备系统 (含强化/修理/分解)
│   │   ├── LevelSystem.ts   # 等级系统
│   │   ├── AudioSystem.ts   # 音频系统
│   │   ├── SaveSystem.ts    # 存档系统
│   │   ├── BuffSystem.ts    # Buff/Debuff系统
│   │   ├── EliteSystem.ts   # 精英怪系统
│   │   ├── DropSystem.ts    # 掉落系统 (含保底机制)
│   │   ├── CraftSystem.ts   # 炼金制作系统
│   │   ├── RuneSystem.ts    # 符文系统
│   │   ├── IdentifySystem.ts # 装备鉴定系统
│   │   ├── ShopSystem.ts    # 商店刷新系统
│   │   ├── DailyRewardSystem.ts # 每日登录奖励
│   │   ├── DeathSystem.ts   # 死亡惩罚系统
│   │   ├── DungeonContext.ts # 地牢上下文接口（模块间共享状态）
│   │   ├── CombatManager.ts # 战斗管理（普攻/技能/弹道/怪物死亡）
│   │   ├── RoomManager.ts   # 房间管理（切换/怪物生成/Boss/通关）
│   │   └── EventBus.ts      # 事件总线
│   ├── entities/
│   │   ├── Player.ts        # 玩家
│   │   ├── Monster.ts       # 怪物基类
│   │   ├── Boss.ts          # Boss基类
│   │   ├── NPC.ts           # NPC基类
│   │   ├── npcs/            # 具体NPC
│   │   │   ├── Blacksmith.ts    # 铁匠 (强化/修理/分解)
│   │   │   ├── Merchant.ts      # 商人 (买卖/每日刷新)
│   │   │   ├── SkillTrainer.ts  # 技能导师 (学习/遗忘)
│   │   │   ├── ClassTrainer.ts  # 转职导师 (20级转职)
│   │   │   ├── Banker.ts        # 银行家 (仓库)
│   │   │   ├── FortuneTeller.ts # 占卜师 (装备鉴定)
│   │   │   ├── Alchemist.ts     # 炼金师 (制作)
│   │   │   ├── Teleporter.ts    # 传送师 (楼层传送)
│   │   │   └── QuestGiver.ts    # 任务发布者
│   │   └── monsters/        # 具体怪物
│   ├── data/
│   │   ├── monsters.ts      # 怪物数据 (含精英怪变体)
│   │   ├── bosses.ts        # Boss数据 (普通+深渊)
│   │   ├── equipment.ts     # 装备数据 (含套装/深渊装备)
│   │   ├── skills.ts        # 技能数据 (~50技能)
│   │   ├── items.ts         # 物品数据
│   │   ├── potions.ts       # 药水数据 (31种)
│   │   ├── materials.ts     # 强化材料数据 (10种)
│   │   ├── runes.ts         # 符文数据 (5品质)
│   │   ├── recipes.ts       # 炼金配方数据
│   │   ├── classes.ts       # 职业数据 (2职业+6转职)
│   │   └── npcs.ts          # NPC数据 (对话/商店)
│   ├── ui/
│   │   ├── HUD.ts           # 血条/蓝条/金币显示
│   │   ├── MiniMap.ts       # 小地图 (右上角)
│   │   ├── ExpBar.ts        # 经验栏 (最底部)
│   │   ├── InventoryPanel.ts # 背包界面 (含金币显示)
│   │   ├── EquipmentPanel.ts # 装备界面 (含符文槽)
│   │   ├── BuffBar.ts       # Buff状态栏 (左上角)
│   │   ├── SkillBar.ts      # 技能栏 (底部左侧)
│   │   ├── HotBar.ts        # 物品快捷栏 (底部右侧)
│   │   ├── ShopPanel.ts     # 商店界面
│   │   ├── DialogBox.ts     # 对话框
│   │   ├── EnhancePanel.ts  # 装备强化界面
│   │   ├── RepairPanel.ts   # 装备修理界面
│   │   ├── DecomposePanel.ts # 装备分解界面
│   │   ├── CraftPanel.ts    # 炼金制作界面
│   │   ├── IdentifyPanel.ts # 装备鉴定界面
│   │   ├── WarehousePanel.ts # 仓库界面
│   │   ├── SaveSlotPanel.ts # 存档管理界面
│   │   ├── DeathPanel.ts    # 死亡界面
│   │   └── AbyssChoicePanel.ts # 深渊模式选择界面
│   ├── map/
│   │   ├── Room.ts          # 房间基类
│   │   ├── RoomGenerator.ts # 房间生成器
│   │   ├── Corridor.ts      # 走廊
│   │   └── templates/       # 房间模板
│   ├── utils/
│   │   ├── MathUtils.ts     # 数学工具
│   │   ├── RandomUtils.ts   # 随机数工具
│   │   └── SaveUtils.ts     # 存档工具
│   └── assets/
│       ├── sprites/         # 精灵图
│       ├── tilemaps/        # 地图数据
│       ├── audio/           # 音效音乐
│       └── fonts/           # 字体
├── public/
│   └── assets/              # 静态资源
├── package.json
└── tsconfig.json
```

---

## 3. 核心架构设计

### 3.1 场景管理

```typescript
// 场景流程
BootScene → PreloadScene → MainMenuScene → CharacterSelectScene → TownScene (城镇)
                                              ↓
                                        DungeonScene (地牢探索)
                                              ↓
                                        BattleScene (战斗)
```

### 3.2 实体组件系统 (ECS)

采用简化的ECS模式:

```typescript
// 组件示例
interface HealthComponent {
  current: number;
  max: number;
}

interface EquipmentComponent {
  slots: EquipmentSlots;
  enhancement: EnhancementData;
}

interface SkillComponent {
  learned: Skill[];
  cooldowns: Map<string, number>;
}
```

### 3.3 事件系统

```typescript
// 使用发布-订阅模式解耦系统
class EventBus {
  emit(event: string, data: any): void;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}

// 事件示例
// 'damage:dealt' - 造成伤害
// 'item:pickup' - 拾取物品
// 'level:up' - 升级
// 'equipment:enhance' - 装备强化
```

---

## 4. 数据结构设计

### 4.1 角色数据

```typescript
interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  skillPoints: number;  // 技能点
  attributePoints: number;  // 可分配属性点 (每级+5)
  allocatedStats: AllocatedStats;  // 已分配的属性点
  allocatedStatsSaved: boolean;  // 加点是否已保存 (保存后不可调整)
  gold: number;  // 金币
  stats: CharacterStats;
  equipment: EquipmentSlots;
  inventory: Inventory;
  skills: SkillSlot[];
  weaponMasteries: WeaponMastery[];  // 武器精通
  position: Vector2;
}

// 已分配的属性点 (通过加点面板分配)
interface AllocatedStats {
  strength: number;
  intelligence: number;
  stamina: number;
  spirit: number;
  agility: number;
}

interface CharacterStats {
  // 基础属性
  strength: number;   // 力量
  intelligence: number; // 智力
  stamina: number;    // 体力
  spirit: number;     // 精神
  agility: number;    // 敏捷

  // 战斗属性
  hp: number;
  mp: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicDefense: number;
  criticalRate: number;
  criticalDamage: number;
  dodgeRate: number;
  attackSpeed: number;  // 攻击速度 (普通攻击间隔)
  castSpeed: number;    // 施法速度 (技能施法时间)
  moveSpeed: number;    // 移动速度
}

// 属性点转换公式 (每点属性对应提升)
// 力量: 物理攻击力+2, 物理伤害加成+0.5%
// 智力: 魔法攻击力+2, 魔法伤害加成+0.5%
// 体力: 生命值+20, 物理防御+1
// 精神: 魔法值+15, 魔法防御+1
// 敏捷: 闪避率+0.3%, 攻击速度+0.5%, 暴击率+0.2%
//
// 最终属性计算:
// 物理攻击力 = 基础值 + 力量×2 + 装备加成 + Buff加成
// 魔法攻击力 = 基础值 + 智力×2 + 装备加成 + Buff加成
// 物理防御力 = 基础值 + 体力×1 + 装备加成 + Buff加成
// 魔法防御力 = 基础值 + 精神×1 + 装备加成 + Buff加成
// 生命值上限 = 基础值 + 体力×20 + 装备加成 + Buff加成
// 魔法值上限 = 基础值 + 精神×15 + 装备加成 + Buff加成
// 暴击率 = 基础值 + 敏捷×0.2% + 装备加成 + Buff加成
// 闪避率 = 基础值 + 敏捷×0.3% + 装备加成 + Buff加成
// 攻击速度 = 100% + 敏捷×0.5% + 装备加成 + Buff加成

// Buff状态
interface Buff {
  id: string;
  name: string;
  description: string;  // 鼠标悬浮显示的效果描述
  icon: string;         // Buff图标
  duration: number;     // 剩余持续时间 (秒)
  maxDuration: number;  // 最大持续时间
  effects: BuffEffect[];  // Buff效果列表
  source: BuffSource;   // Buff来源
  stackCount: number;   // 叠加层数
  maxStack: number;     // 最大叠加层数
}

interface BuffEffect {
  stat: string;         // 影响的属性
  type: 'flat' | 'percent';  // 固定值 or 百分比
  value: number;        // 效果值 (正数为增益，负数为减益)
}

type BuffSource = 'skill' | 'item' | 'equipment' | 'potion' | 'monster' | 'environment';

// 角色Buff列表
interface CharacterBuffs {
  buffs: Buff[];        // 当前生效的Buff列表
  maxBuffs: number;     // 最大Buff数量 (预留)
}
```

### 4.2 装备数据

```typescript
interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;  // 装备品质
  level: number;  // 装备等级
  stats: StatBonus[];
  requirement: LevelRequirement;
  enhancementLevel: number;
  setBonus?: SetBonus;  // 套装效果
  isBound: boolean;  // 是否绑定 (橙色装备)
  specialEffect?: string;  // 特殊效果描述
  icon: string;
}

// 装备品质
type EquipmentRarity = 'white' | 'blue' | 'purple' | 'pink' | 'orange';
// white: 普通, blue: 优秀, purple: 稀有, pink: 神器, orange: 史诗

// 套装效果
interface SetBonus {
  setId: string;
  setName: string;
  pieces: number;  // 套装件数
  bonuses: SetBonusEffect[];
}

interface SetBonusEffect {
  requiredPieces: number;  // 需要件数
  effects: StatBonus[];
}

type EquipmentSlot = 
  | 'weapon' | 'helmet' | 'armor' | 'shield'
  | 'belt' | 'boots' | 'necklace' 
  | 'ring1' | 'ring2' | 'bracelet1' | 'bracelet2'
  | 'rune';  // 符文槽 (初始1个，后续可扩展为符文盒)

// 符文系统: 初始1个槽位，后续扩展为符文盒
interface RuneEquipment extends Equipment {
  slot: 'rune';
  expandable: boolean;  // 是否可扩展槽位
}
```

### 4.3 背包数据

```typescript
// 背包分类
type InventoryCategory = 'equipment' | 'consumable' | 'material' | 'other';

// 背包槽位
interface InventorySlot {
  item: Item | null;  // 物品为空表示空槽位
  count: number;      // 物品数量 (装备为1，消耗品/材料可堆叠)
}

// 背包数据
interface Inventory {
  categories: {
    equipment: InventorySlot[];   // 装备标签页
    consumable: InventorySlot[];  // 消耗标签页
    material: InventorySlot[];    // 材料标签页
    other: InventorySlot[];       // 其他标签页
  };
  maxSlotsPerCategory: number;  // 每类最大槽位数 (初始20，转职后25)
  gold: number;  // 金币数量 (显示在背包界面)
}

// 物品基类
interface Item {
  id: string;
  name: string;
  type: ItemType;
  icon: string;
  description: string;
  isStackable: boolean;  // 是否可堆叠
  maxStack: number;      // 最大堆叠数
}

type ItemType = 'equipment' | 'consumable' | 'material' | 'quest' | 'skillbook' | 'other';

// 物品自动分类规则
const ITEM_CATEGORY_MAP: Record<ItemType, InventoryCategory> = {
  'equipment': 'equipment',     // 武器、防具、饰品、符文
  'consumable': 'consumable',   // 药水、卷轴、增益道具
  'material': 'material',       // 矿石、精华、碎片、强化材料
  'quest': 'other',             // 任务物品
  'skillbook': 'other',         // 技能书
  'other': 'other',             // 其他特殊道具
};

// 金币系统
interface GoldSystem {
  current: number;  // 当前金币
  earned: number;   // 本日获得
  spent: number;    // 本日消耗
}

// 金币获取来源
type GoldSource = 
  | 'monster_drop'    // 怪物掉落
  | 'boss_drop'       // Boss掉落
  | 'sell_item'       // 出售物品
  | 'quest_reward'    // 任务奖励
  | 'achievement'     // 成就奖励
  | 'daily_reward';   // 每日奖励

// 金币消耗来源
type GoldSink = 
  | 'buy_item'        // 购买物品
  | 'repair_equipment' // 修理装备
  | 'enhance_equipment' // 强化装备
  | 'learn_skill'     // 学习技能
  | 'forget_skill'    // 遗忘技能
  | 'expand_storage'  // 扩展仓库
  | 'craft_item';     // 制作物品

// 金币日志
interface GoldLog {
  timestamp: number;
  source: GoldSource | GoldSink;
  amount: number;  // 正数为获取，负数为消耗
  balance: number; // 操作后余额
  description: string;
}
```

### 4.3 技能数据

```typescript
interface Skill {
  id: string;
  name: string;
  category: SkillCategory;  // 主动/被动
  type: SkillType;  // 攻击/防御/辅助/功能
  description: string;
  manaCost?: number;  // 被动技能无消耗
  cooldown?: number;  // 被动技能无冷却
  maxLevel: number;  // 最高等级 (默认10)
  currentLevel: number;  // 当前等级
  damage?: DamageCalculation;
  effects?: StatusEffect[];
  unlockLevel: number;
  classRequirement?: CharacterClass;  // 职业要求
  specialization?: string;  // 转职方向要求
  enhancements?: SkillEnhancement[];  // 技能强化选项
}

type SkillCategory = 'active' | 'passive';
type SkillType = 'attack' | 'defense' | 'support' | 'utility';

// 技能强化
interface SkillEnhancement {
  id: string;
  name: string;
  description: string;
  type: 'damage' | 'range' | 'form' | 'effect';
  value: number;
  source: 'equipment' | 'item';  // 来源: 装备或道具
}

// 武器精通
interface WeaponMastery {
  id: string;
  name: string;
  weaponType: string;  // 武器类型
  maxLevel: number;  // 最高等级 (20)
  currentLevel: number;  // 当前等级
  currentExp: number;  // 当前熟练度
  expPerLevel: number;  // 每级所需熟练度 (100)
  bonuses: MasteryBonus[];  // 各等级加成
}

interface MasteryBonus {
  level: number;
  stat: string;
  value: number;
  description: string;
}
```

### 4.4 怪物数据

```typescript
interface MonsterData {
  id: string;
  name: string;
  level: number;
  type: MonsterType;  // 近战/远程/法术/辅助
  aggression: AggressionType;  // 攻击性
  stats: MonsterStats;
  skills: MonsterSkill[];
  lootTable: LootEntry[];
  sprite: string;
  isBoss: boolean;
  isElite: boolean;
  aggroRange: number;  // 警戒范围 (格数)
  expReward: number;
  goldReward: [number, number];  // 金币掉落范围
}

type MonsterType = 'melee' | 'ranged' | 'caster' | 'support';
type AggressionType = 'passive' | 'normal' | 'aggressive' | 'patrol';

interface MonsterStats {
  hp: number;
  mp: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicDefense: number;
  attackSpeed: number;  // 攻击速度 (100% = 标准)
  moveSpeed: number;    // 移动速度 (100% = 标准)
  criticalRate: number;
  criticalDamage: number;
}

interface MonsterSkill {
  id: string;
  name: string;
  type: 'attack' | 'control' | 'buff' | 'summon' | 'special';
  damage?: DamageCalculation;
  effect?: StatusEffect;
  cooldown: number;
  range: number;
  description: string;
}

interface LootEntry {
  itemId: string;
  dropRate: number;  // 掉落率 (0~1)
  minCount: number;
  maxCount: number;
  guaranteed: boolean;  // 是否必定掉落
}

// 精英怪加成
interface EliteModifier {
  hpMultiplier: number;    // 默认1.5
  attackMultiplier: number; // 默认1.5
  defenseMultiplier: number; // 默认1.5
  expMultiplier: number;    // 默认2
  goldMultiplier: number;   // 默认3
  guaranteedDrop: boolean;  // 必定掉落蓝色以上
}

// 深渊模式加成
interface AbyssModifier {
  hpMultiplier: number;    // 2.0~2.5
  attackMultiplier: number; // 2.0~2.5
  defenseMultiplier: number; // 2.0~2.5
  expMultiplier: number;    // 默认2
  goldMultiplier: number;   // 默认2
  pinkDropMultiplier: number; // 默认3
  orangeDropMultiplier: number; // 默认3
}

// 仇恨系统
interface AggroSystem {
  currentTarget: string | null;  // 当前目标ID
  hateTable: Map<string, number>;  // 仇恨表
  decayRate: number;  // 仇恨衰减率 (每秒5%)
}

// 计算仇恨值
function calculateHate(action: AggroAction, value: number): number {
  switch (action) {
    case 'damage': return value;  // 造成伤害
    case 'heal': return value * 0.5;  // 治疗队友
    case 'taunt': return 500;  // 嘲讽技能
    case 'enterRange': return 100;  // 进入警戒范围
  }
}
```

---

## 5. 系统交互流程

### 5.1 战斗流程

```
┌─────────────────────────────────────────┐
│  玩家进入战斗 (遭遇怪物/Boss)           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  选择行动: 攻击/技能/道具/逃跑          │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  计算伤害 (考虑属性、装备、技能效果)     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  检查胜负条件                           │
│  - 敌人死亡: 获得经验/掉落物             │
│  - 玩家死亡: 处理死亡惩罚               │
│  - 继续战斗                             │
└─────────────────────────────────────────┘
```

### 5.2 物品获取流程

```
┌─────────────────────────────────────────┐
│  获得物品 (掉落/拾取/购买/制作)          │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  判断物品类型 (ItemType)                │
│  - equipment → 装备标签页               │
│  - consumable → 消耗标签页              │
│  - material → 材料标签页                │
│  - quest/skillbook/other → 其他标签页   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  检查对应标签页是否有空槽位             │
│  - 有空槽: 放入第一个空槽              │
│  - 可堆叠: 尝试与已有物品堆叠          │
│  - 无空槽: 提示背包已满                │
└─────────────────────────────────────────┘
```

### 5.3 装备强化流程

```
选择装备 → 消耗材料 → 计算成功率 → 应用结果
                                      ↓
                              成功: 强化等级+1
                              失败: 降级/损坏
```

### 5.4 地牢探索流程

```
┌─────────────────────────────────────────┐
│  进入地牢层                             │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  随机生成地图 (MapGenerator)            │
│  - 生成房间布局                         │
│  - 连接走廊                             │
│  - 放置怪物/宝箱/NPC                    │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  探索房间                               │
│  - 战斗房间: 与怪物战斗                 │
│  - 宝箱房间: 获取奖励                   │
│  - 商店房间: 交易                       │
│  - 事件房间: 随机事件                   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Boss房间 (最后一间)                    │
│  - 击败Boss后解锁下一层                 │
└─────────────────────────────────────────┘
```

### 5.5 DungeonScene 模块架构

DungeonScene 原始文件超过 800 行，拆分为三个模块：

```
DungeonScene.ts (场景主控 ~560行)
  ├── create() / update() — 场景生命周期
  ├── 玩家移动、UI交互、摄像机控制
  └── 委托到 ↓

CombatManager.ts (~230行)
  ├── attackMonster()    — 普通攻击
  ├── fireProjectile()   — 远程弹道
  ├── castSkillOnTarget() — 技能释放
  └── onMonsterDeath()   — 死亡/掉落/经验处理

RoomManager.ts (~130行)
  ├── checkRoomTransition() — 房间切换检测
  ├── enterRoom()           — 进入房间
  ├── spawnAllRoomMonsters() — 批量生成怪物
  ├── spawnBossInRoom()     — 生成Boss
  └── onRoomCleared()       — 房间通关处理
```

**共享状态：DungeonContext 接口**
```typescript
interface DungeonContext {
  scene: Phaser.Scene;
  player: Player;
  monsters: (Monster | Boss)[];
  roomMonsters: Map<string, (Monster | Boss)[]>;
  currentRoom: Room;
  floorWalkability: FloorWalkability;
  // ... 其他共享字段
}
```

模块通过 `ctx` 传递共享状态，避免直接引用场景属性。场景在每次调用前通过 `syncCtx()` 同步可变字段。

### 5.6 城镇系统流程

```
┌─────────────────────────────────────────┐
│  进入城镇                               │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  与NPC交互                              │
│  - 铁匠: 强化/修理装备                 │
│  - 商人: 买卖物品                       │
│  - 技能导师: 学习/遗忘技能             │
│  - 转职导师: 接取转职任务               │
│  - 银行家: 存储物品                     │
│  - 任务发布者: 接取支线任务             │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  选择进入地牢                           │
│  - 选择目标楼层                         │
│  - 10%几率触发深渊模式选择              │
└─────────────────────────────────────────┘
```

---

## 6. 随机地图生成系统

### 6.1 生成算法

采用 **房间+走廊** 算法:

```typescript
interface DungeonMap {
  rooms: Room[];           // 房间列表
  corridors: Corridor[];   // 走廊列表
  startRoom: Room;         // 起始房间
  bossRoom: Room;          // Boss房间
  specialRooms: Room[];    // 特殊房间 (宝箱/商店/事件)
}

interface Room {
  id: string;
  type: RoomType;
  position: Rectangle;
  monsters: MonsterSpawn[];
  items: ItemSpawn[];
  connectedRooms: string[];
}

type RoomType = 'start' | 'normal' | 'treasure' | 'shop' | 'event' | 'boss';
```

### 6.2 生成流程

```
1. 确定房间数量 (根据层数递增)
2. 随机放置房间 (避免重叠)
3. 生成连接走廊
4. 分配房间类型 (起始/Boss/特殊)
5. 填充怪物和物品
6. 验证可达性 (确保所有房间可到达)
```

### 6.3 深渊模式

- 触发几率: 10%
- 怪物难度: 普通模式的 2~2.5 倍
- 掉落: 高级稀有装备、大量经验/金币

---

## 7. 渲染架构

### 7.1 等距视角渲染 (Isometric View)

**视角说明**:
- 等距视角: 45度斜向俯视，类似星露谷物语
- 可看到物体的顶部和侧面，营造伪3D立体感
- Camera跟随: 摄像机跟随玩家移动，保持玩家在屏幕中心
- 等距瓦片地图: 使用Isometric Tilemap渲染地牢地图

**等距投影原理**:
```
屏幕坐标转换:
screenX = (mapX - mapY) * tileWidth / 2
screenY = (mapX + mapY) * tileHeight / 2

其中 tileWidth = 64, tileHeight = 32 (2:1比例)
```

### 7.2 层级结构

```
UI层 (UIScene - 独立场景)
  ├── 左上角: Buff状态栏
  │   ├── Buff图标列表 (水平排列)
  │   ├── 剩余时间显示
  │   └── 鼠标悬浮提示 (名称+效果描述)
  ├── 右上角: 小地图
  │   ├── 地图缩略图
  │   ├── 玩家位置标记
  │   └── 怪物/NPC标记
  ├── 底部栏 (从左到右: HP→技能栏→物品栏→MP)
  │   ├── HP血条 (最左侧)
  │   │   ├── 当前HP/最大HP数值
  │   │   └── 血条进度条
  │   ├── 技能栏 (左半部分)
  │   │   ├── 技能图标 (快捷键1~8)
  │   │   ├── 冷却时间显示
  │   │   └── MP消耗提示
  │   ├── 物品快捷栏 (右半部分)
  │   │   ├── 物品图标 (快捷键1~8)
  │   │   ├── 物品数量显示
  │   │   └── 使用快捷键提示
  │   └── MP蓝条 (最右侧)
  │       ├── 当前MP/最大MP数值
  │       └── 蓝条进度条
  └── 最底部: 经验栏 (全屏宽度)
      ├── 经验条进度
      ├── 当前经验/升级所需经验
      └── 当前等级显示

游戏层 (DungeonScene/TownScene)
  ├── 背景层 (地面、墙壁)
  ├── 地图装饰层 (地毯、装饰物)
  ├── 实体层 (玩家、怪物、NPC)
  ├── 特效层 (粒子、技能特效)
  └── 阴影层
```

### 7.3 像素风格配置

- **等距瓦片尺寸**: 64x32 像素 (宽:高 = 2:1)
- **精灵尺寸**: 32x64 或 64x64 像素 (等距视角需要更高)
- **渲染分辨率**: 保持像素完美 (pixel-perfect rendering)
- **调色板**: 限制颜色数量 (推荐 NES 或自定义调色板)
- **动画帧**: 角色/怪物使用精灵动画 (走路、攻击、受击)
- **阴影**: 使用椭圆形阴影表示物体位置

**等距精灵朝向**:
- 下/左: 默认朝向 (面向玩家)
- 下/右: 镜像翻转
- 上/左: 背面
- 上/右: 背面镜像

### 7.4 Camera配置

```typescript
// Phaser 3 等距视角Camera配置示例
class DungeonScene extends Phaser.Scene {
  create() {
    // 设置Camera跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // 设置Camera边界
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    
    // 等距视角缩放
    this.cameras.main.setZoom(1);
  }
}

// 等距坐标转换工具函数
function isoToScreen(x: number, y: number): { screenX: number; screenY: number } {
  const TILE_WIDTH = 64;
  const TILE_HEIGHT = 32;
  return {
    screenX: (x - y) * (TILE_WIDTH / 2),
    screenY: (x + y) * (TILE_HEIGHT / 2),
  };
}

function screenToIso(screenX: number, screenY: number): { x: number; y: number } {
  const TILE_WIDTH = 64;
  const TILE_HEIGHT = 32;
  return {
    x: (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2,
    y: (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2,
  };
}
```

---

## 8. 存档系统

### 8.1 存档数据

```typescript
interface SaveData {
  version: string;
  timestamp: number;
  slot: number;  // 存档槽位
  player: Character;
  dungeon: DungeonProgress;
  inventory: Inventory;
  settings: GameSettings;
}
```

### 8.2 存储方式

- **保存位置**: 游戏目录/saves/
- **文件格式**: JSON
- **文件命名**: save_slot_1.json, save_slot_2.json, ...
- 支持多存档槽位 (建议3~5个)
- 自动存档 + 手动存档

### 8.3 存档操作

```typescript
class SaveSystem {
  // 保存存档
  static save(slot: number, data: SaveData): void;
  
  // 读取存档
  static load(slot: number): SaveData | null;
  
  // 删除存档
  static delete(slot: number): void;
  
  // 获取所有存档列表
  static getSaveSlots(): SaveSlotInfo[];
}
```

---

## 9. 性能优化

### 9.1 对象池 (Object Pool)

```typescript
// 子弹、粒子等频繁创建的对象使用对象池
class ObjectPool<T> {
  private pool: T[] = [];
  
  get(): T { /* ... */ }
  release(obj: T): void { /* ... */ }
}
```

### 9.2 资源管理

- 精灵图集 (Spritesheet) 合并小图
- 按场景懒加载资源
- 缓存已加载的资源

---

## 10. 音频系统

### 10.1 音乐管理

```typescript
interface AudioConfig {
  bgm: {
    town: string;        // 城镇背景音乐
    dungeon: string[];   // 地牢背景音乐 (每层不同)
    battle: string;      // 战斗背景音乐
    boss: string;        // Boss战背景音乐
    menu: string;        // 菜单背景音乐
  };
  sfx: {
    attack: string;      // 攻击音效
    hit: string;         // 受击音效
    skill: string;       // 技能音效
    pickup: string;      // 拾取音效
    ui: string;          // UI交互音效
    levelup: string;     // 升级音效
    enhance: string;     // 强化音效
  };
}
```

### 10.2 音频系统

```typescript
class AudioSystem {
  // 播放背景音乐
  static playBGM(key: string, loop?: boolean): void;
  
  // 播放音效
  static playSFX(key: string): void;
  
  // 停止背景音乐
  static stopBGM(): void;
  
  // 设置音量
  static setVolume(bgm: number, sfx: number): void;
}
```

---

## 11. 待确认问题

> 请补充或修改以下内容:

1. **特殊装备扩展**: 如何扩展特殊装备栏位?
2. **转职任务**: 每个职业的转职任务内容?
3. **支线任务**: 支线任务的类型和数量?

---

*文档版本: v1.0*
*创建日期: 2026-05-13*
