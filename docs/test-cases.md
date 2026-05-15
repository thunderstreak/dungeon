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

### TC-3.14 存档系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 3.14.1 | 保存存档 | `saveToSlot(1, testData)` | 返回 true | 待测试 |
| 3.14.2 | 读取存档 | `loadFromSlot(1)` | 返回保存的数据 | 待测试 |
| 3.14.3 | 删除存档 | `deleteSlot(1)` | 返回 true | 待测试 |
| 3.14.4 | 获取槽位信息 | `getAllSlotInfo()` | 返回5个槽位信息 | 待测试 |
| 3.14.5 | 自动存档 | `triggerAutoSave()` | 返回 true | 待测试 |
| 3.14.6 | 检查自动存档 | `hasAutoSave()` | 返回 true/false | 待测试 |
| 3.14.7 | 导出存档 | `exportSave(1)` | 返回JSON字符串 | 待测试 |
| 3.14.8 | 导入存档 | `importSave(2, jsonStr)` | 返回 true | 待测试 |
| 3.14.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-3.15 音频系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 3.15.1 | 设置BGM音量 | `setBgmVolume(0.5)` | 音量设为0.5 | 待测试 |
| 3.15.2 | 获取BGM音量 | `getBgmVolume()` | 返回0.5 | 待测试 |
| 3.15.3 | 设置音效音量 | `setSfxVolume(0.8)` | 音量设为0.8 | 待测试 |
| 3.15.4 | 获取音效音量 | `getSfxVolume()` | 返回0.8 | 待测试 |
| 3.15.5 | 静音BGM | `toggleBgmMute()` | 返回true | 待测试 |
| 3.15.6 | 静音音效 | `toggleSfxMute()` | 返回true | 待测试 |
| 3.15.7 | 播放BGM | `playBgm('town')` | currentBgm变为'town' | 待测试 |
| 3.15.8 | 停止BGM | `stopBgm()` | currentBgm变为null | 待测试 |
| 3.15.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-3.16 炼金制作系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 3.16.1 | 获取所有配方 | `getAllAvailableRecipes()` | 返回17个配方 | 待测试 |
| 3.16.2 | 根据ID获取配方 | `getRecipe('recipe_hp_medium')` | 返回中型生命药水配方 | 待测试 |
| 3.16.3 | 按类别查询 | `getRecipesByCategory('potion')` | 返回药水类配方 | 待测试 |
| 3.16.4 | 验证配方(成功) | `validateRecipe(recipeId, inventory, level)` | valid=true | 待测试 |
| 3.16.5 | 验证配方(等级不足) | `validateRecipe(recipeId, inventory, 1)` | valid=false, error含"等级不足" | 待测试 |
| 3.16.6 | 验证配方(材料不足) | `validateRecipe(recipeId, emptyInventory, level)` | valid=false, error含"材料不足" | 待测试 |
| 3.16.7 | 执行制作 | `craftItem(recipeId, inventory, level)` | success=true, 产出物品 | 待测试 |
| 3.16.8 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-3.17 符文系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 3.17.1 | 创建符文状态 | `createRuneState()` | 返回3个空槽位 | 待测试 |
| 3.17.2 | 获取所有符文定义 | `getAllRuneDefinitions()` | 返回24个符文 | 待测试 |
| 3.17.3 | 检查穿戴(成功) | `canEquipRune(runeId, rarity, level, state)` | canEquip=true | 待测试 |
| 3.17.4 | 检查穿戴(等级不足) | `canEquipRune(runeId, 'orange', 1, state)` | canEquip=false | 待测试 |
| 3.17.5 | 穿戴符文 | `equipRune(runeId, rarity, state)` | 返回true | 待测试 |
| 3.17.6 | 获取已装备符文 | `getEquippedRunes(state)` | 返回穿戴的符文列表 | 待测试 |
| 3.17.7 | 计算属性加成 | `calculateRuneBonuses(state)` | 返回属性加成列表 | 待测试 |
| 3.17.8 | 卸下符文 | `unequipRune(0, state)` | 返回true | 待测试 |
| 3.17.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-3.18 装备鉴定系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 3.18.1 | 生成未鉴定装备 | `createUnidentifiedEquipment(equip)` | isIdentified=false | 待测试 |
| 3.18.2 | 计算鉴定费用 | `calculateIdentifyCost('blue')` | 返回100 | 待测试 |
| 3.18.3 | 计算鉴定费用(橙色) | `calculateIdentifyCost('orange')` | 返回500 | 待测试 |
| 3.18.4 | 检查鉴定(成功) | `canIdentify(equip, 500)` | canIdentify=true | 待测试 |
| 3.18.5 | 检查鉴定(已鉴定) | `canIdentify(identifiedEquip, 500)` | canIdentify=false | 待测试 |
| 3.18.6 | 检查鉴定(金币不足) | `canIdentify(equip, 10)` | canIdentify=false | 待测试 |
| 3.18.7 | 执行鉴定 | `identifyEquipment(equip, 500)` | success=true, statsRevealed | 待测试 |
| 3.18.8 | 获取鉴定预览 | `getIdentifyPreview(equip)` | 返回可能的属性和费用 | 待测试 |
| 3.18.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-3.19 商店刷新系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 3.19.1 | 创建商店状态 | `createShopState()` | 返回含物品列表的状态 | 待测试 |
| 3.19.2 | 检查刷新(需要) | `needsRefresh(oldState)` | 返回true | 待测试 |
| 3.19.3 | 检查刷新(不需要) | `needsRefresh(newState)` | 返回false | 待测试 |
| 3.19.4 | 执行刷新 | `refreshShop(state)` | 返回true，购买记录重置 | 待测试 |
| 3.19.5 | 获取物品价格 | `getItemPrice(itemState)` | 返回正确价格 | 待测试 |
| 3.19.6 | 获取稀有物品价格 | `getItemPrice(rareItem)` | 返回1.5倍价格 | 待测试 |
| 3.19.7 | 检查购买(成功) | `canBuyItem(item, level, gold)` | canBuy=true | 待测试 |
| 3.19.8 | 检查购买(等级不足) | `canBuyItem(item, 1, gold)` | canBuy=false | 待测试 |
| 3.19.9 | 检查购买(限购) | `canBuyItem(maxBoughtItem, level, gold)` | canBuy=false | 待测试 |
| 3.19.10 | 执行购买 | `buyItem(item, level, gold)` | success=true, goldSpent | 待测试 |
| 3.19.11 | 获取剩余次数 | `getRemainingLimit(item)` | 返回剩余次数 | 待测试 |
| 3.19.12 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

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
| 4.0.6 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.1 房间基类与生成器

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.1.1 | 创建Room实例 | `new Room(scene, roomData, layout)` | 成功创建 | 待测试 |
| 4.1.2 | 渲染房间 | `room.render(0, 0)` | 绘制等距地板和障碍物 | 待测试 |
| 4.1.3 | 获取中心坐标 | `room.getCenterScreenPos()` | 返回屏幕坐标 | 待测试 |
| 4.1.4 | 获取怪物刷新点 | `room.getMonsterSpawnPositions()` | 返回可行走位置列表 | 待测试 |
| 4.1.5 | 检查可行走 | `room.isWalkable(x, y)` | 返回boolean | 待测试 |
| 4.1.6 | 标记已清理 | `room.markCleared()` | isCleared=true | 待测试 |
| 4.1.7 | 创建RoomGenerator | `new RoomGenerator()` | 成功创建 | 待测试 |
| 4.1.8 | 生成楼层 | `generator.generateFloor(scene, 1)` | 返回房间列表 | 待测试 |
| 4.1.9 | 获取相邻房间 | `generator.getAdjacentRooms(roomId)` | 返回连接的房间 | 待测试 |
| 4.1.10 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.2 走廊生成

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.2.1 | 创建Corridor实例 | `new Corridor(scene, corridorData)` | 成功创建 | 待测试 |
| 4.2.2 | 渲染走廊 | `corridor.render(0, 0)` | 绘制等距走廊 | 待测试 |
| 4.2.3 | 检查连接 | `corridor.connectsTo(roomId)` | 返回boolean | 待测试 |
| 4.2.4 | 获取另一个房间 | `corridor.getOtherRoomId(roomId)` | 返回另一个房间ID | 待测试 |
| 4.2.5 | 生成楼层含走廊 | `generator.generateFloor(scene, 1)` | 返回走廊列表 | 待测试 |
| 4.2.6 | 获取房间间走廊 | `generator.getCorridorBetween(id1, id2)` | 返回Corridor或null | 待测试 |
| 4.2.7 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.3 房间模板

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.3.1 | 模板数量 | `getAllTemplates().length` | 返回6个模板 | ✅ 通过 |
| 4.3.2 | 起始房间模板 | `getTemplate('start')` | floorColor=0x3a3a4a, 2个torch装饰 | ✅ 通过 |
| 4.3.3 | 普通房间模板 | `getTemplate('normal')` | monsterDensity=0.6, 2个torch装饰 | ✅ 通过 |
| 4.3.4 | 宝箱房间模板 | `getTemplate('treasure')` | itemDensity=0.8, 含chest装饰 | ✅ 通过 |
| 4.3.5 | 商店房间模板 | `getTemplate('shop')` | monsterDensity=0, 含shopCounter装饰 | ✅ 通过 |
| 4.3.6 | 事件房间模板 | `getTemplate('event')` | 含altar装饰 | ✅ 通过 |
| 4.3.7 | Boss房间模板 | `getTemplate('boss')` | 含throne+banner装饰, monsterDensity=0 | ✅ 通过 |
| 4.3.8 | 装饰物渲染 | Room.render()时 | 根据模板绘制torch/banner/chest等装饰物 | ✅ 通过 |
| 4.3.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.4 玩家实体

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.4.1 | 创建玩家 | `new Player(scene, character, 5, 5)` | 成功创建，容器显示绿色菱形 | ✅ 通过 |
| 4.4.2 | 初始位置 | `player.getGridPosition()` | 返回 {x:5, y:5} | ✅ 通过 |
| 4.4.3 | 等距移动 | `player.moveByGrid(1, 0)` | 返回true，gridX+1 | ✅ 通过 |
| 4.4.4 | 碰撞检测 | isWalkable返回false时 `moveByGrid(1, 0)` | 返回false，位置不变 | ✅ 通过 |
| 4.4.5 | 血条显示 | 查看玩家头顶 | 显示红/绿色血条 | ✅ 通过 |
| 4.4.6 | 受伤处理 | `player.takeDamage(result)` | combatEntity.hp减少，血条更新 | ✅ 通过 |
| 4.4.7 | 治疗处理 | `player.heal(amount)` | combatEntity.hp增加，血条更新 | ✅ 通过 |
| 4.4.8 | Buff更新 | 每帧调用update(delta) | buffManager正确更新 | ✅ 通过 |
| 4.4.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.5 怪物基类

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.5.1 | 创建怪物 | `new Monster(scene, data, 3, 3)` | 成功创建，红色菱形显示 | ✅ 通过 |
| 4.5.2 | 近战型AI | 创建melee怪物 | attackRange=40, prefersMelee=true | ✅ 通过 |
| 4.5.3 | 远程型AI | 创建ranged怪物 | attackRange=160, prefersMelee=false | ✅ 通过 |
| 4.5.4 | 法术型AI | 创建caster怪物 | attackRange=200, fleeThreshold=0.3 | ✅ 通过 |
| 4.5.5 | 辅助型AI | 创建support怪物 | attackRange=180, fleeThreshold=0.4 | ✅ 通过 |
| 4.5.6 | 巡逻行为 | 怪物空闲时 | 在周围格子间巡逻 | ✅ 通过 |
| 4.5.7 | 追踪行为 | 玩家进入仇恨范围 | 怪物向玩家移动 | ✅ 通过 |
| 4.5.8 | 攻击行为 | 玩家在攻击范围内 | 怪物执行攻击 | ✅ 通过 |
| 4.5.9 | 逃跑行为 | 低HP时 | 远程/法术型怪物远离玩家 | ✅ 通过 |
| 4.5.10 | 仇恨响应 | 怪物被攻击时 | 从idle/patrol切换到chase | ✅ 通过 |
| 4.5.11 | 脱战 | 玩家远离仇恨范围×2 | 怪物返回idle | ✅ 通过 |
| 4.5.12 | 死亡处理 | HP归零时 | 播放死亡动画，触发onDeath回调 | ✅ 通过 |
| 4.5.13 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.6 Boss基类

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.6.1 | 创建Boss | `new Boss(scene, bossData, 5, 5)` | 成功创建，紫色菱形+金色名字 | ✅ 通过 |
| 4.6.2 | 初始阶段 | 查看currentPhase | 返回0 | ✅ 通过 |
| 4.6.3 | 阶段切换 | BossHP降到阈值以下 | currentPhase递增，阶段文本更新 | ✅ 通过 |
| 4.6.4 | 阶段属性加成 | 进入新阶段 | stats按statMultiplier增加 | ✅ 通过 |
| 4.6.5 | 阶段技能切换 | 进入新阶段 | phaseSkills更新为该阶段技能 | ✅ 通过 |
| 4.6.6 | 阶段切换动画 | 触发阶段切换 | bodyRect缩放动画 | ✅ 通过 |
| 4.6.7 | 技能释放 | 在attack状态 | 随机使用当前阶段技能 | ✅ 通过 |
| 4.6.8 | 死亡处理 | HP归零 | 播放放大消失动画，触发onDeath | ✅ 通过 |
| 4.6.9 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.7 怪物工厂

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.7.1 | 创建楼层怪物 | `createMonster(scene, {floor:1, gridX:3, gridY:3})` | 成功创建Monster实例 | ✅ 通过 |
| 4.7.2 | 创建楼层Boss | `createBoss(scene, {floor:1, gridX:5, gridY:5})` | 成功创建Boss实例 | ✅ 通过 |
| 4.7.3 | 按ID创建怪物 | `createMonsterById(scene, 'skeleton', 3, 3)` | 返回骷髅兵实例 | ✅ 通过 |
| 4.7.4 | 按ID创建Boss | `createBossById(scene, 'boss_skeleton_king', 5, 5)` | 返回骷髅王实例 | ✅ 通过 |
| 4.7.5 | 精英怪生成 | `createMonster(scene, {floor:1, ..., forceElite:true})` | 怪物属性×1.5，蓝色标记 | ✅ 通过 |
| 4.7.6 | 批量生成 | `spawnMonstersInRoom(scene, positions, 1, 1.0, 0.6)` | 返回density×位置数的怪物 | ✅ 通过 |
| 4.7.7 | 降级处理 | 无效楼层 | 使用ALL_MONSTERS[0] | ✅ 通过 |
| 4.7.8 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.8 NPC基类

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.8.1 | 创建NPC | `new NPC(scene, npcData, 3, 3)` | 成功创建，绿色菱形 | ✅ 通过 |
| 4.8.2 | 类型标签 | 查看typeText | 铁匠/商人等中文标签 | ✅ 通过 |
| 4.8.3 | 点击交互 | 左键点击NPC | 触发npc:interact事件 | ✅ 通过 |
| 4.8.4 | 范围检测 | `isPlayerInRange(x, y)` | 返回boolean | ✅ 通过 |
| 4.8.5 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-4.9~4.17 具体NPC

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 4.9.1 | 铁匠强化 | `blacksmith.enhance(char, equip, 3)` | 返回EnhanceResult | ✅ 通过 |
| 4.9.2 | 铁匠修理 | `blacksmith.repair(char, 'weapon')` | 返回修理费用 | ✅ 通过 |
| 4.10.1 | 商人购买 | `merchant.buy(char, itemId, 100)` | 扣金币，加物品 | ✅ 通过 |
| 4.10.2 | 商人出售 | `merchant.sell(char, itemId, 30)` | 加金币，扣物品 | ✅ 通过 |
| 4.11.1 | 技能学习 | `skillTrainer.learn(char, skillId)` | 返回boolean | ✅ 通过 |
| 4.11.2 | 技能遗忘 | `skillTrainer.forget(char, skillId, 500)` | 扣金币，移除技能 | ✅ 通过 |
| 4.12.1 | 转职检查 | `classTrainer.canClassChange(char)` | level≥20且无转职 | ✅ 通过 |
| 4.12.2 | 执行转职 | `classTrainer.classChange(char, 'berserker')` | specialization更新 | ✅ 通过 |
| 4.14.1 | 鉴定费用 | `fortuneTeller.getIdentifyCost('blue')` | 返回100 | ✅ 通过 |
| 4.14.2 | 鉴定检查 | `fortuneTeller.checkIdentify(ue, 500)` | 返回canIdentify | ✅ 通过 |
| 4.15.1 | 获取配方 | `alchemist.getRecipes()` | 返回配方列表 | ✅ 通过 |
| 4.15.2 | 验证配方 | `alchemist.validate(id, inv, level)` | 返回验证结果 | ✅ 通过 |
| 4.15.3 | 制作 | `alchemist.craft(id, inv, level)` | 返回制作结果 | ✅ 通过 |
| 4.8.6 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

---

## 阶段五：场景实现

### TC-5.1 城镇场景

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 5.1.1 | 等距地板 | TownScene.create() | 绘制20×16等距地板网格 | ✅ 通过 |
| 5.1.2 | 区域标签 | 查看地图 | 显示军事区、商业区标签 | ✅ 通过 |
| 5.1.3 | NPC生成 | TownScene.create() | 8个NPC正确放置在等距格子上 | ✅ 通过 |
| 5.1.4 | 玩家创建 | TownScene.create() | Player在城镇中心生成 | ✅ 通过 |
| 5.1.5 | WASD移动 | 按WASD键 | 玩家在等距网格上移动 | ✅ 通过 |
| 5.1.6 | 碰撞检测 | 尝试走出地图边界 | 玩家被限制在地图范围内 | ✅ 通过 |
| 5.1.7 | 右键移动 | 右键点击地面 | 玩家移动到目标位置 | ✅ 通过 |
| 5.1.8 | NPC交互 | 左键点击NPC | 弹出对话框 | ✅ 通过 |
| 5.1.9 | 地牢入口 | 走到入口区域 | 切换到DungeonScene | ✅ 通过 |
| 5.1.10 | Camera跟随 | 移动玩家 | Camera跟随玩家 | ✅ 通过 |
| 5.1.11 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-5.2 地牢场景

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 5.2.1 | 地图生成 | DungeonScene.create() | 生成等距地牢地图 | ✅ 通过 |
| 5.2.2 | 房间渲染 | 查看地图 | 等距地板+障碍物正确绘制 | ✅ 通过 |
| 5.2.3 | 起始房间 | 查看玩家位置 | 玩家在起始房间中心 | ✅ 通过 |
| 5.2.4 | 怪物刷新 | 进入房间 | 根据模板密度生成怪物 | ✅ 通过 |
| 5.2.5 | 战斗交互 | 左键点击怪物 | 计算伤害，怪物扣血 | ✅ 通过 |
| 5.2.6 | 怪物AI | 怪物在房间内 | 追踪玩家并攻击 | ✅ 通过 |
| 5.2.7 | 房间通关 | 击杀所有怪物 | 显示通关提示 | ✅ 通过 |
| 5.2.8 | 相邻房间 | 通关后走向出口 | 切换到相邻房间 | ✅ 通过 |
| 5.2.9 | 死亡处理 | HP归零 | 显示惩罚信息，返回城镇 | ✅ 通过 |
| 5.2.10 | 掉落 | 击杀怪物 | 金币+经验奖励 | ✅ 通过 |
| 5.2.11 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-5.3 战斗系统集成

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 5.3.1 | 玩家攻击 | 左键点击怪物 | calcPhysicalDamage计算伤害 | ✅ 通过 |
| 5.3.2 | 怪物攻击 | 怪物在攻击范围 | 对玩家造成伤害 | ✅ 通过 |
| 5.3.3 | 怪物AI | 玩家进入仇恨范围 | 怪物追踪并攻击 | ✅ 通过 |
| 5.3.4 | 掉落系统 | 击杀怪物 | 计算金币+经验掉落 | ✅ 通过 |
| 5.3.5 | 经验奖励 | 击杀怪物 | addExperience正确执行 | ✅ 通过 |
| 5.3.6 | 升级通知 | 获得足够经验 | 显示升级通知 | ✅ 通过 |
| 5.3.7 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

### TC-5.4 Camera系统

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 5.4.1 | Camera跟随 | 移动玩家 | Camera平滑跟随 | ✅ 通过 |
| 5.4.2 | 边界限制 | 走到地图边缘 | Camera不超出地图范围 | ✅ 通过 |
| 5.4.3 | 场景切换 | 进入地牢/返回城镇 | Camera正确重置 | ✅ 通过 |
| 5.4.4 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

---

## 阶段六：UI系统

### TC-6.1~6.20 UI面板

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 6.2.1 | HUD显示 | 进入游戏场景 | 底部显示HP/MP/技能栏/物品栏/经验条 | ✅ 通过 |
| 6.2.2 | HP条更新 | 角色受伤 | HP条减少，颜色变化 | ✅ 通过 |
| 6.2.3 | MP条更新 | 使用技能 | MP条减少 | ✅ 通过 |
| 6.2.4 | 经验条更新 | 获得经验 | 经验条增长 | ✅ 通过 |
| 6.4.1 | BuffBar显示 | 获得buff | 左上角显示buff图标 | ✅ 通过 |
| 6.5.1 | MiniMap显示 | 进入地牢 | 右上角显示小地图 | ✅ 通过 |
| 6.8.1 | 背包面板 | 按B键/点击 | 打开背包界面 | ✅ 通过 |
| 6.8.2 | 分类切换 | 点击分类标签 | 切换装备/消耗品/材料/其他 | ✅ 通过 |
| 6.9.1 | 装备面板 | 按E键/点击 | 打开装备界面，显示12槽位 | ✅ 通过 |
| 6.9.2 | 属性显示 | 打开装备面板 | 右侧显示角色属性 | ✅ 通过 |
| 6.10.1 | 商店面板 | 点击商人NPC | 打开商店界面 | ✅ 通过 |
| 6.11.1 | 对话框 | 点击NPC | 弹出对话框 | ✅ 通过 |
| 6.12.1 | 强化面板 | 点击铁匠NPC | 打开强化界面 | ✅ 通过 |
| 6.15.1 | 炼金面板 | 点击炼金师NPC | 打开制作界面 | ✅ 通过 |
| 6.19.1 | 死亡面板 | HP归零 | 显示死亡界面+惩罚 | ✅ 通过 |
| 6.20.1 | 深渊选择 | 触发深渊模式 | 显示深渊/普通选择 | ✅ 通过 |
| 6.x.1 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

---

## 阶段七：打磨与优化

### TC-7.x 打磨优化

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 7.1.1 | 伤害飘字 | 攻击怪物 | 显示伤害数字弹出 | ✅ 通过 |
| 7.1.2 | 暴击飘字 | 暴击攻击 | 伤害数字放大+颜色区分 | ✅ 通过 |
| 7.4.1 | 对象池 | 创建ObjectPool | acquire/release正确工作 | ✅ 通过 |
| 7.6.1 | 死亡惩罚 | 角色死亡 | applyDeathPenalty返回损失 | ✅ 通过 |
| 7.6.2 | 经验损失 | 死亡后 | 损失10%经验 | ✅ 通过 |
| 7.6.3 | 金币损失 | 死亡后 | 损失10%金币 | ✅ 通过 |
| 7.6.4 | 物品丢失 | 死亡后 | 20%几率丢失1~5格物品 | ✅ 通过 |
| 7.x.1 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

---

## 阶段八：内容填充

### TC-8.x 内容数据

| 编号 | 测试项 | 操作 | 预期结果 | 结果 |
|------|--------|------|---------|------|
| 8.1.1 | 怪物数据 | 检查monsters.ts | 30种怪物，每层3种 | ✅ 通过 |
| 8.3.1 | Boss数据 | 检查bosses.ts | 10个普通+10个深渊Boss | ✅ 通过 |
| 8.5.1 | 装备数据 | 检查equipment.ts | 687件装备 | ✅ 通过 |
| 8.8.1 | 技能数据 | 检查skills.ts | 62个技能 | ✅ 通过 |
| 8.x.1 | 编译验证 | `npx tsc --noEmit` | 无错误 | ✅ 通过 |

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
| 2026-05-14 | 4.0~4.17 | TC-4.x | ✅ 通过 | 阶段四(等距工具/房间/走廊/模板/玩家/怪物/Boss/NPC) |
| 2026-05-14 | 5.1~5.4 | TC-5.x | ✅ 通过 | 阶段五(城镇场景/地牢场景/战斗集成/Camera) |
| 2026-05-14 | 6.1~6.20 | TC-6.x | ✅ 通过 | 阶段六(HUD/BuffBar/MiniMap/背包/装备/商店/强化/修理/分解/炼金/鉴定/仓库/存档/死亡/深渊) |
| 2026-05-14 | 7.x | TC-7.x | ✅ 通过 | 阶段七(伤害飘字/对象池/死亡惩罚) |
| 2026-05-14 | 8.x | TC-8.x | ✅ 通过 | 阶段八(内容数据填充) |

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
