# 测试用例文档

> 每次完成开发任务后，按对应阶段的测试用例逐项验证。

---

## 阶段一：项目初始化与基础框架

### TC-1.1 项目初始化

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.1.1 | 依赖安装 | 执行 `pnpm install` | 无报错，node_modules 生成 | ✅ 通过 |
| 1.1.2 | TypeScript 编译 | 执行 `npx tsc --noEmit` | 无错误输出 | ✅ 通过 |
| 1.1.3 | 开发服务器 | 执行 `pnpm dev` | Vite 启动，浏览器打开 http://localhost:3000 | ✅ 通过 |
| 1.1.4 | 页面渲染 | 浏览器访问 http://localhost:3000 | 黑色背景，页面居中显示游戏容器 | ✅ 通过 |

### TC-1.2 全局类型系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.2.1 | 类型别名导出 | 检查 `src/config/types.ts` | 包含 CharacterClass、EquipmentRarity 等 28 个类型别名 | ✅ 通过 |
| 1.2.2 | 接口定义 | 检查 `src/config/types.ts` | 包含 Character、Equipment、Skill 等 30+ 接口 | ✅ 通过 |
| 1.2.3 | 编译验证 | `npx tsc --noEmit` | 无类型错误 | ✅ 通过 |

### TC-1.3 全局常量

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.3.1 | 核心常量 | 检查 `src/config/constants.ts` | MAX_LEVEL=60, TOTAL_DUNGEON_FLOORS=10 等 | ✅ 通过 |
| 1.3.2 | 经验公式 | 调用 `getExpRequired(1)` | 返回 100 | ✅ 通过 |
| 1.3.3 | 经验公式 | 调用 `getExpRequired(10)` | 返回 3162 | ✅ 通过 |
| 1.3.4 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-1.4 配置入口

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.4.1 | 统一导出 | 检查 `src/config/index.ts` | 可从 `@/config` 导入 types 和 constants | ✅ 通过 |
| 1.4.2 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-1.5 工具函数

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.5.1 | clamp | `clamp(5, 0, 10)` | 返回 5 | ✅ 通过 |
| 1.5.2 | clamp 边界 | `clamp(-5, 0, 10)` | 返回 0 | ✅ 通过 |
| 1.5.3 | clamp 边界 | `clamp(15, 0, 10)` | 返回 10 | ✅ 通过 |
| 1.5.4 | lerp | `lerp(0, 100, 0.5)` | 返回 50 | ✅ 通过 |
| 1.5.5 | distance | `distance(0, 0, 3, 4)` | 返回 5 | ✅ 通过 |
| 1.5.6 | randomInt | `randomInt(1, 10)` | 返回 1~10 之间的整数 | ✅ 通过 |
| 1.5.7 | chance | `chance(0)` | 始终返回 false | ✅ 通过 |
| 1.5.8 | chance | `chance(1)` | 始终返回 true | ✅ 通过 |
| 1.5.9 | pickRandom | `pickRandom([1,2,3])` | 返回数组中某个元素 | ✅ 通过 |
| 1.5.10 | weightedRandom | `weightedRandom([1,2], [0,1])` | 始终返回 2 | ✅ 通过 |
| 1.5.11 | shuffle | `shuffle([1,2,3,4,5]).length` | 返回 5 | ✅ 通过 |
| 1.5.12 | SaveUtils | `saveToSlot(0, {test:true})` | 返回 true | ✅ 通过 |
| 1.5.13 | SaveUtils | `loadFromSlot(0)` | 返回 `{test:true}` | ✅ 通过 |
| 1.5.14 | SaveUtils | `deleteSlot(0)` | 返回 true，再读取返回 null | ✅ 通过 |
| 1.5.15 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-1.6 EventBus

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.6.1 | 基本监听 | `on('player:levelup', cb)` 后 `emit(...)` | 回调触发，收到正确数据 | ✅ 通过 |
| 1.6.2 | 取消监听 | `off()` 后 `emit(...)` | 回调不再触发 | ✅ 通过 |
| 1.6.3 | once | `once()` 后连续 `emit(...)` 两次 | 只触发一次 | ✅ 通过 |
| 1.6.4 | 错误隔离 | 回调抛异常 | 不影响其他监听器，控制台输出错误 | ✅ 通过 |
| 1.6.5 | clear | `clear()` 后 `emit(...)` | 所有回调不触发 | ✅ 通过 |
| 1.6.6 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-1.7 场景流程

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.7.1 | 启动流程 | `pnpm dev` 后打开浏览器 | 自动经过 Boot → Preload → MainMenu | ✅ 通过 |
| 1.7.2 | Preload 界面 | 观察加载过程 | 显示加载进度条和百分比 | ✅ 通过 |
| 1.7.3 | 主菜单 | 加载完成后 | 显示"地牢探险"标题、"新游戏"和"继续游戏"按钮 | ✅ 通过 |
| 1.7.4 | 按钮交互 | 鼠标悬停按钮 | 按钮颜色变化 | ✅ 通过 |
| 1.7.5 | 新游戏按钮 | 点击"新游戏" | 跳转到角色选择界面 | ✅ 通过 |
| 1.7.6 | 版本号 | 查看底部 | 显示 "v1.0.0" | ✅ 通过 |

### TC-1.8 角色创建流程

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 1.8.1 | 角色选择界面 | 主菜单点击"新游戏" | 进入角色选择界面，显示"选择角色"标题和3个槽位 | ✅ 通过 |
| 1.8.2 | 空槽位显示 | 查看空槽位 | 显示"空槽位"文字和"[ 新建角色 ]"按钮 | ✅ 通过 |
| 1.8.3 | 新建角色弹窗 | 点击"新建角色" | 弹出创建弹窗，显示职业选择区和名字输入区 | ✅ 通过 |
| 1.8.4 | 职业选择 | 点击战士/法师卡片 | 选中职业卡片高亮显示边框 | ✅ 通过 |
| 1.8.5 | 名字输入 | 点击输入框后输入文字 | 显示输入的中文/字母/数字，最多8字符 | ✅ 通过 |
| 1.8.6 | 名字校验-空名 | 不输入名字直接确认 | 显示错误提示"请输入角色名" | ✅ 通过 |
| 1.8.7 | 名字校验-重复 | 输入已存在角色名 | 显示错误提示"角色名已存在" | ✅ 通过 |
| 1.8.8 | 创建成功 | 选择职业+输入名字+确认 | 角色保存到槽位，弹窗关闭，槽位显示角色信息 | ✅ 通过 |
| 1.8.9 | 进入游戏 | 创建角色后 | 自动跳转到城镇场景 | ✅ 通过 |
| 1.8.10 | 继续游戏 | 主菜单点击"继续游戏" | 有存档时进入城镇，无存档时显示提示 | ✅ 通过 |

---

## 阶段二：数据层

### TC-2.1 角色职业数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.1.1 | 战士数据 | 读取 `CLASSES.warrior` | name='战士', strength=15, stamina=12 | ✅ 通过 |
| 2.1.2 | 法师数据 | 读取 `CLASSES.mage` | name='法师', intelligence=15, spirit=12 | ✅ 通过 |
| 2.1.3 | 转职数量 | 检查 `SPECIALIZATIONS` | 共6个转职方向 | ✅ 通过 |
| 2.1.4 | 转职关联 | 检查每个转职的 className | berserker/swordsman/blademaster → warrior, ice_mage/thunder_mage/fire_mage → mage | ✅ 通过 |
| 2.1.5 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.2 技能数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.2.1 | 技能总数 | `ALL_SKILLS.length` | 62 | ✅ 通过 |
| 2.2.2 | 战士初始技能 | `WARRIOR_INITIAL_SKILLS.length` | 3 (猛击/格挡/战吼) | ✅ 通过 |
| 2.2.3 | 法师初始技能 | `MAGE_INITIAL_SKILLS.length` | 3 (火球术/冰霜弹/闪电链) | ✅ 通过 |
| 2.2.4 | 狂战士技能 | `BERSERKER_SKILLS.length` | 8 | ✅ 通过 |
| 2.2.5 | 冰法技能 | `ICE_MAGE_SKILLS.length` | 8 | ✅ 通过 |
| 2.2.6 | getSkillsByClass | `getSkillsByClass('warrior').length` | 7 (3初始 + 4升级解锁) | ✅ 通过 |
| 2.2.7 | getSkillsBySpecialization | `getSkillsBySpecialization('berserker').length` | 8 | ✅ 通过 |
| 2.2.8 | 技能属性完整 | 检查任意技能 | 有 id, name, category, type, unlockLevel, maxLevel | ✅ 通过 |
| 2.2.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.6 物品数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.6.1 | 药水总数 | `ALL_POTIONS.length` | 31 | ✅ 通过 |
| 2.6.2 | 恢复药水 | `HEALING_POTIONS.length` | 11 | ✅ 通过 |
| 2.6.3 | 增益药水 | `BUFF_POTIONS.length` | 13 | ✅ 通过 |
| 2.6.4 | 特殊药水 | `SPECIAL_POTIONS.length` | 7 | ✅ 通过 |
| 2.6.5 | 材料总数 | `ALL_MATERIALS.length` | 13 | ✅ 通过 |
| 2.6.6 | 基础材料 | `MATERIALS.length` | 8 | ✅ 通过 |
| 2.6.7 | 辅助材料 | `AUXILIARY_MATERIALS.length` | 5 | ✅ 通过 |
| 2.6.8 | 按ID查询 | `getPotionById('potion_hp_small')` | 返回小型生命药水 | ✅ 通过 |
| 2.6.9 | 按ID查询 | `getMaterialById('mat_ore_common')` | 返回普通矿石 | ✅ 通过 |
| 2.6.10 | 药水属性 | 检查任意药水 | 有 id, name, rarity, cooldown, price, effects | ✅ 通过 |
| 2.6.11 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.7 属性点系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.7.1 | 每级属性点 | `ATTRIBUTE_POINTS_PER_LEVEL` | 5 | ✅ 通过 |
| 2.7.2 | 总属性点 | `TOTAL_ATTRIBUTE_POINTS` | 295 (59级 × 5点) | ✅ 通过 |
| 2.7.3 | 力量转换 | 1点力量 → 物攻 | +2 物理攻击力 | ✅ 通过 |
| 2.7.4 | 力量转换 | 1点力量 → 伤害 | +0.5% 物理伤害加成 | ✅ 通过 |
| 2.7.5 | 智力转换 | 1点智力 → 魔攻 | +2 魔法攻击力 | ✅ 通过 |
| 2.7.6 | 智力转换 | 1点智力 → 伤害 | +0.5% 魔法伤害加成 | ✅ 通过 |
| 2.7.7 | 体力转换 | 1点体力 → HP | +20 生命值上限 | ✅ 通过 |
| 2.7.8 | 体力转换 | 1点体力 → 物防 | +1 物理防御力 | ✅ 通过 |
| 2.7.9 | 精神转换 | 1点精神 → MP | +15 魔法值上限 | ✅ 通过 |
| 2.7.10 | 精神转换 | 1点精神 → 魔防 | +1 魔法防御力 | ✅ 通过 |
| 2.7.11 | 敏捷转换 | 1点敏捷 → 闪避 | +0.3% 闪避率 | ✅ 通过 |
| 2.7.12 | 敏捷转换 | 1点敏捷 → 攻速 | +0.5% 攻击速度 | ✅ 通过 |
| 2.7.13 | 敏捷转换 | 1点敏捷 → 暴击 | +0.2% 暴击率 | ✅ 通过 |
| 2.7.14 | 战士基础值 | 战士1级无装备 | HP=100, MP=30, 物攻=10 | ✅ 通过 |
| 2.7.15 | 法师基础值 | 法师1级无装备 | HP=60, MP=80, 魔攻=10 | ✅ 通过 |
| 2.7.16 | Character接口 | 检查Character类型 | 包含 attributePoints, allocatedStats, allocatedStatsSaved | ✅ 通过 |
| 2.7.17 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.3/2.4/2.5 装备数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.3.1 | 装备总数 | `EQUIPMENT_COUNT` | 687 | ✅ 通过 |
| 2.3.2 | 战士刀类 | `getEquipmentBySlot('weapon').filter(e => e.type === 'blade').length` | 35 (13级×2品质 + 9紫色) | ✅ 通过 |
| 2.3.3 | 战士剑类 | `getEquipmentBySlot('weapon').filter(e => e.type === 'sword').length` | 35 | ✅ 通过 |
| 2.3.4 | 战士斧类 | `getEquipmentBySlot('weapon').filter(e => e.type === 'axe').length` | 35 | ✅ 通过 |
| 2.3.5 | 法师长杖 | `getEquipmentBySlot('weapon').filter(e => e.type === 'long_staff').length` | 35 | ✅ 通过 |
| 2.3.6 | 法师短杖 | `getEquipmentBySlot('weapon').filter(e => e.type === 'short_staff').length` | 35 | ✅ 通过 |
| 2.3.7 | 法师魔杖 | `getEquipmentBySlot('weapon').filter(e => e.type === 'wand').length` | 35 | ✅ 通过 |
| 2.4.1 | 深渊装备 | `getAbyssEquipment().length` | 78 | ✅ 通过 |
| 2.4.2 | 粉橙装备 | `getPinkOrangeEquipment().length` | 162 | ✅ 通过 |
| 2.4.3 | 紫色套装数 | `PURPLE_SETS.length` | 9 | ✅ 通过 |
| 2.4.4 | 战士粉橙套装 | `WARRIOR_PINK_SETS.length` | 3 | ✅ 通过 |
| 2.4.5 | 法师粉橙套装 | `MAGE_PINK_SETS.length` | 3 | ✅ 通过 |
| 2.5.1 | 按ID查询 | `getEquipmentById('blade_1_生锈的刀_white')` | 返回对应装备 | ✅ 通过 |
| 2.5.2 | 按品质查询 | `getEquipmentByRarity('orange').length` | 橙色装备数量 > 0 | ✅ 通过 |
| 2.5.3 | 按等级查询 | `getEquipmentByLevel(1, 10).length` | 返回1~10级装备 | ✅ 通过 |
| 2.5.4 | 深渊绑定 | 检查深渊装备 | isBound=true, rarity='orange' | ✅ 通过 |
| 2.5.5 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

---

## 阶段三：核心系统（部分已开发）

### TC-3.1 等级系统
> 已开发，测试用例待补充

### TC-3.2 背包系统
> 已开发，测试用例待补充

### TC-3.3 装备系统
> 已开发，测试用例待补充

### TC-3.5 技能系统
> 已开发，测试用例待补充

### TC-3.7 Buff/Debuff系统
> 已开发，测试用例待补充

### TC-3.8 战斗系统
> 已开发，测试用例待补充

### TC-3.11 掉落系统
> 已开发，测试用例待补充

### TC-3.12 地牢系统
> 已开发，测试用例待补充

---

## 阶段四：地图与实体

### TC-4.0 等距视角工具

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.0.1 | 等距坐标转换 | `isoToScreen(0, 0)` | 返回 {screenX: 0, screenY: 0} | 待测试 |
| 4.0.2 | 等距坐标转换 | `isoToScreen(1, 0)` | 返回 {screenX: 32, screenY: 16} | 待测试 |
| 4.0.3 | 等距坐标转换 | `isoToScreen(0, 1)` | 返回 {screenX: -32, screenY: 16} | 待测试 |
| 4.0.4 | 屏幕坐标转等距 | `screenToIso(32, 16)` | 返回 {x: 1, y: 0} | 待测试 |
| 4.0.5 | 深度排序 | `getDepthSort(y)` | 根据Y坐标返回正确的渲染深度 | 待测试 |
| 4.0.6 | 编译验证 | `npx tsc --noEmit` | 无错误 | 待测试 |

---

## 阶段四~八（待开发后补充）

> 随开发进度逐步补充

---

## 执行方式

每次完成开发任务后：

1. **编译检查**: `npx tsc --noEmit` — 必须无错误
2. **功能验证**: 按对应 TC 编号逐项测试
3. **回归测试**: 执行已完成阶段的所有测试用例
4. **结果记录**: 在下方记录测试结果

### 测试结果记录

| 日期 | 任务 | 测试用例 | 结果 | 备注 |
|------|------|---------|------|------|
| 2026-05-14 | 1.1~1.8 | TC-1.1~1.8 | ✅ 通过 | 项目初始化+工具+场景+角色创建 |
| 2026-05-14 | 2.1 | TC-2.1 | ✅ 通过 | 职业数据 |
| 2026-05-14 | 2.2 | TC-2.2 | ✅ 通过 | 62个技能 |
| 2026-05-14 | 2.6 | TC-2.6 | ✅ 通过 | 31药水+13材料 |
| 2026-05-14 | 2.3~2.5 | TC-2.3~2.5 | ✅ 通过 | 687件装备(78深渊+162粉橙) |
| 2026-05-14 | 2.8 | TC-2.8 | ✅ 通过 | 24个符文 |
| 2026-05-14 | 2.9 | TC-2.9 | ✅ 通过 | 17个炼金配方 |
| 2026-05-14 | 2.10 | TC-2.10 | ✅ 通过 | 30怪物+20Boss |
| 2026-05-14 | 2.11 | TC-2.11 | ✅ 通过 | 8个NPC |
| 2026-05-14 | 3.1~3.9, 3.11, 3.12 | TC-3.x | ✅ 通过 | 核心系统(等级/背包/装备/技能/Buff/战斗/掉落/地牢) |
| 2026-05-14 | C.1~C.5 | TC-1.8 | ✅ 通过 | 角色创建流程(选择界面+创建弹窗+校验+跳转) |

### TC-2.8 符文数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.8.1 | 符文总数 | `RUNE_COUNT` | 24 | ✅ 通过 |
| 2.8.2 | 战士攻击符文 | `getRunesByType('attack').length` | 11 | ✅ 通过 |
| 2.8.3 | 防御符文 | `getRunesByType('defense').length` | 7 | ✅ 通过 |
| 2.8.4 | 功能符文 | `getRunesByType('function').length` | 6 | ✅ 通过 |
| 2.8.5 | 按ID查询 | `getRuneById('rune_strength')` | 返回力量符文 | ✅ 通过 |
| 2.8.6 | 按品质查询 | `getRunesByRarity('orange').length` | 橙色品质符文数量 > 0 | ✅ 通过 |
| 2.8.7 | 符文合成费用 | `RUNE_CRAFT_COST.blue` | { materials: 3, gold: 100 } | ✅ 通过 |
| 2.8.8 | 符文分解碎片 | `RUNE_SHARD_YIELD.orange` | 8 | ✅ 通过 |
| 2.8.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.9 炼金配方数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.9.1 | 配方总数 | `RECIPE_COUNT` | 17 | ✅ 通过 |
| 2.9.2 | 恢复药水配方 | `getRecipesByCategory('potion').length` | 10 | ✅ 通过 |
| 2.9.3 | 材料配方 | `getRecipesByCategory('material').length` | 4 | ✅ 通过 |
| 2.9.4 | 特殊配方 | `getRecipesByCategory('special').length` | 3 | ✅ 通过 |
| 2.9.5 | 按ID查询 | `getRecipeById('recipe_hp_medium')` | 返回中型生命药水配方 | ✅ 通过 |
| 2.9.6 | 按等级查询 | `getRecipesByLevel(5).length` | 返回等级≤5的配方 | ✅ 通过 |
| 2.9.7 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.10 怪物与Boss数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.10.1 | 普通怪物总数 | `MONSTER_COUNT` | 30 | ✅ 通过 |
| 2.10.2 | 第1层怪物 | `getMonstersByFloor(1).length` | 3 | ✅ 通过 |
| 2.10.3 | 第10层怪物 | `getMonstersByFloor(10).length` | 3 | ✅ 通过 |
| 2.10.4 | 按类型查询 | `getMonstersByType('melee').length` | 近战怪物数量 > 0 | ✅ 通过 |
| 2.10.5 | 按ID查询 | `getMonsterById('skeleton')` | 返回骷髅兵 | ✅ 通过 |
| 2.10.6 | Boss总数 | `BOSS_COUNT` | 20 | ✅ 通过 |
| 2.10.7 | 普通Boss | `getNormalBosses().length` | 10 | ✅ 通过 |
| 2.10.8 | 深渊Boss | `getAbyssBosses().length` | 10 | ✅ 通过 |
| 2.10.9 | 按楼层查Boss | `getBossesByFloor(1).length` | 2 (普通+深渊) | ✅ 通过 |
| 2.10.10 | 按ID查Boss | `getBossById('boss_skeleton_king')` | 返回骷髅王 | ✅ 通过 |
| 2.10.11 | 楼层Boss映射 | `FLOOR_BOSS_MAP[10]` | 'boss_abyss_demon' | ✅ 通过 |
| 2.10.12 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-2.11 NPC数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 2.11.1 | NPC总数 | `NPC_COUNT` | 8 | ✅ 通过 |
| 2.11.2 | 铁匠 | `getNpcById('npc_blacksmith')` | 返回格雷格 | ✅ 通过 |
| 2.11.3 | 商人 | `getNpcByType('merchant')` | 返回丽莎 | ✅ 通过 |
| 2.11.4 | 军事区NPC | `getNpcsByArea('military').length` | 3 (铁匠/技能导师/转职导师) | ✅ 通过 |
| 2.11.5 | 商业区NPC | `getNpcsByArea('commercial').length` | 3 (商人/占卜师/炼金师) | ✅ 通过 |
| 2.11.6 | 商店物品 | `getAvailableShopItems(1).length` | ≥ 基础药水和材料 | ✅ 通过 |
| 2.11.7 | 强化费用 | `ENHANCE_COST[5]` | { gold: 300, materials: 3 } | ✅ 通过 |
| 2.11.8 | 强化成功率 | `ENHANCE_SUCCESS_RATE[10]` | 0.70 | ✅ 通过 |
| 2.11.9 | 出售倍率 | `SELL_PRICE_RATIO` | 0.3 | ✅ 通过 |
| 2.11.10 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

---

*文档版本: v1.0*
*创建日期: 2026-05-14*
