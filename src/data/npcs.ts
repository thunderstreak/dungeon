// NPC数据 - 8个城镇NPC

import type { NPCData, NPCType, TownArea, Dialog, DialogOption } from '@/config/types';

// ==================== 商店物品 ====================

/** 商店物品条目 */
export interface ShopItem {
  itemId: string;
  price: number;
  levelReq: number;
  dailyLimit: number; // 0=无限
  category: 'potion' | 'material' | 'scroll' | 'other';
}

// ==================== 商人库存 ====================

/** 商人商店库存 (根据玩家等级解锁) */
export const MERCHANT_SHOP: ShopItem[] = [
  // 药水
  { itemId: 'potion_hp_small', price: 10, levelReq: 1, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_hp_medium', price: 30, levelReq: 10, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_hp_large', price: 80, levelReq: 20, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_mp_small', price: 15, levelReq: 1, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_mp_medium', price: 45, levelReq: 10, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_mp_large', price: 120, levelReq: 20, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_antidote', price: 5, levelReq: 1, dailyLimit: 0, category: 'potion' },
  { itemId: 'potion_purify', price: 30, levelReq: 15, dailyLimit: 0, category: 'potion' },
  // 卷轴
  { itemId: 'potion_teleport', price: 50, levelReq: 10, dailyLimit: 5, category: 'scroll' },
  { itemId: 'potion_repairs_scroll', price: 100, levelReq: 1, dailyLimit: 10, category: 'scroll' },
  { itemId: 'potion_full_repair_scroll', price: 300, levelReq: 20, dailyLimit: 5, category: 'scroll' },
  // 材料
  { itemId: 'mat_ore', price: 50, levelReq: 1, dailyLimit: 20, category: 'material' },
  { itemId: 'mat_refined_iron', price: 200, levelReq: 15, dailyLimit: 10, category: 'material' },
];

/** 出售价格倍率 (购买价 × 此倍率) */
export const SELL_PRICE_RATIO = 0.3;

// ==================== 铁匠强化费用 ====================

/** 强化费用表: +1~+20 */
export const ENHANCE_COST: Record<number, { gold: number; materials: number }> = {
  1: { gold: 50, materials: 1 },
  2: { gold: 100, materials: 1 },
  3: { gold: 150, materials: 2 },
  4: { gold: 200, materials: 2 },
  5: { gold: 300, materials: 3 },
  6: { gold: 400, materials: 3 },
  7: { gold: 500, materials: 4 },
  8: { gold: 650, materials: 4 },
  9: { gold: 800, materials: 5 },
  10: { gold: 1000, materials: 5 },
  11: { gold: 1500, materials: 6 },
  12: { gold: 2000, materials: 6 },
  13: { gold: 2500, materials: 7 },
  14: { gold: 3000, materials: 7 },
  15: { gold: 4000, materials: 8 },
  16: { gold: 5000, materials: 8 },
  17: { gold: 6500, materials: 9 },
  18: { gold: 8000, materials: 9 },
  19: { gold: 10000, materials: 10 },
  20: { gold: 15000, materials: 10 },
};

/** 强化成功率 */
export const ENHANCE_SUCCESS_RATE: Record<number, number> = {
  1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 0.95,
  6: 0.90, 7: 0.85, 8: 0.80, 9: 0.75, 10: 0.70,
  11: 0.60, 12: 0.50, 13: 0.40, 14: 0.30, 15: 0.25,
  16: 0.20, 17: 0.15, 18: 0.10, 19: 0.05, 20: 0.03,
};

/** 修理费用倍率 (装备价格 × 此倍率 × (1 - 耐久百分比)) */
export const REPAIR_COST_RATIO = 0.2;

// ==================== 转职数据 ====================

/** 转职要求等级 */
export const CLASS_CHANGE_LEVEL = 20;

/** 转职奖励格数 */
export const CLASS_CHANGE_BAG_BONUS = 5;

// ==================== 鉴定费用 ====================

/** 鉴定费用: 装备等级 × 此值 */
export const IDENTIFY_COST_PER_LEVEL = 5;

// ==================== 传送数据 ====================

/** 传送冷却时间(秒) */
export const TELEPORT_COOLDOWN = 30;

// ==================== 对话辅助 ====================

function dialogOption(text: string, nextDialogId: string | null = null, action: string | null = null): DialogOption {
  return { text, nextDialogId, action };
}

function dialog(id: string, text: string, options: DialogOption[] = []): Dialog {
  return { id, text, options };
}

// ==================== NPC数据 ====================

const BLACKSMITH: NPCData = {
  id: 'npc_blacksmith',
  name: '格雷格',
  type: 'blacksmith',
  area: 'military',
  position: { x: 200, y: 300 },
  sprite: 'npc_blacksmith',
  dialogs: [
    dialog('greeting', '欢迎来到铁匠铺！我是铁匠格雷格，需要强化或修理装备吗？', [
      dialogOption('我要强化装备', null, 'open_enhance'),
      dialogOption('我要修理装备', null, 'open_repair'),
      dialogOption('我要分解装备', null, 'open_disenchant'),
      dialogOption('再见', null, null),
    ]),
    dialog('enhance_success', '干得漂亮！装备已经强化到+%d了！'),
    dialog('enhance_fail', '很遗憾，强化失败了...不过别担心，装备只是没有变化。'),
    dialog('enhance_fail_high', '啊...装备降级了。下次用保护券会更安全。'),
    dialog('repair_done', '装备已经修好了，和新的一样！'),
    dialog('disenchant_done', '分解完成，这是你的材料。'),
    dialog('no_gold', '你的金币不够呢。再去打几只怪物吧！'),
  ],
};

const MERCHANT: NPCData = {
  id: 'npc_merchant',
  name: '丽莎',
  type: 'merchant',
  area: 'commercial',
  position: { x: 500, y: 300 },
  sprite: 'npc_merchant',
  dialogs: [
    dialog('greeting', '嗨！欢迎光临我的商店！我有各种好东西，来看看吧！', [
      dialogOption('我要买东西', null, 'open_shop_buy'),
      dialogOption('我要卖东西', null, 'open_shop_sell'),
      dialogOption('再见', null, null),
    ]),
    dialog('buy_success', '成交！谢谢惠顾！'),
    dialog('sell_success', '好的，这些东西我收下了。'),
    dialog('no_gold', '哎呀，你的金币不够呢。再去打几只怪物吧！'),
    dialog('inventory_full', '你的背包满了！先去整理一下吧。'),
    dialog('rare_item', '嘿，我刚到了一批稀货，要不要看看？'),
  ],
};

const SKILL_TRAINER: NPCData = {
  id: 'npc_skill_trainer',
  name: '艾琳',
  type: 'skill_trainer',
  area: 'military',
  position: { x: 300, y: 300 },
  sprite: 'npc_skill_trainer',
  dialogs: [
    dialog('greeting', '我是技能导师艾琳。想要学习新的战斗技巧吗？', [
      dialogOption('查看可学习技能', null, 'open_skill_list'),
      dialogOption('遗忘技能', null, 'open_skill_forget'),
      dialogOption('再见', null, null),
    ]),
    dialog('learn_success', '很好！你已经掌握了这项技能。'),
    dialog('no_skill_points', '你的技能点不够。继续冒险吧。'),
    dialog('forget_confirm', '确定要遗忘这个技能吗？所有投入的技能点都会返还。', [
      dialogOption('确定遗忘', null, 'confirm_forget'),
      dialogOption('再想想', null, null),
    ]),
    dialog('forget_done', '技能已遗忘。你可以重新学习其他技能了。'),
  ],
};

const CLASS_TRAINER: NPCData = {
  id: 'npc_class_trainer',
  name: '阿尔弗雷德',
  type: 'class_trainer',
  area: 'military',
  position: { x: 250, y: 250 },
  sprite: 'npc_class_trainer',
  dialogs: [
    dialog('too_low_level', '你还需要更多历练。当你达到20级时，再来找我吧。'),
    dialog('ready', '你已经准备好了！选择你的道路吧。', [
      dialogOption('狂战士 (力量型)', null, 'choose_berserker'),
      dialogOption('剑士 (均衡型)', null, 'choose_swordsman'),
      dialogOption('刀客 (速度型)', null, 'choose_blademaster'),
      dialogOption('冰法师 (控制型)', null, 'choose_ice_mage'),
      dialogOption('雷法师 (爆发型)', null, 'choose_thunder_mage'),
      dialogOption('火法师 (范围型)', null, 'choose_fire_mage'),
      dialogOption('再想想', null, null),
    ]),
    dialog('change_success', '从今天起，你就是一名%s了！愿你的道路充满荣耀！'),
    dialog('already_changed', '你已经是一名%s了。继续磨练你的技艺吧。'),
  ],
};

const BANKER: NPCData = {
  id: 'npc_banker',
  name: '马库斯',
  type: 'banker',
  area: 'adventurer',
  position: { x: 600, y: 350 },
  sprite: 'npc_banker',
  dialogs: [
    dialog('greeting', '欢迎来到冒险者银行！我可以帮你存储物品。', [
      dialogOption('打开仓库', null, 'open_bank'),
      dialogOption('再见', null, null),
    ]),
    dialog('deposit_success', '物品已经安全存入仓库了。'),
    dialog('withdraw_success', '这是你的物品，请保管好。'),
    dialog('bank_full', '仓库已经满了。需要扩展仓库吗？'),
  ],
};

const FORTUNE_TELLER: NPCData = {
  id: 'npc_fortune_teller',
  name: '塞莱斯特',
  type: 'fortune_teller',
  area: 'commercial',
  position: { x: 450, y: 400 },
  sprite: 'npc_fortune_teller',
  dialogs: [
    dialog('greeting', '我是占卜师塞莱斯特。让我看看你有什么需要鉴定的...', [
      dialogOption('鉴定装备', null, 'open_identify'),
      dialogOption('再见', null, null),
    ]),
    dialog('identify_success_rare', '这件装备...有稀有的潜力！'),
    dialog('identify_success_epic', '这件装备...有史诗级的潜力！'),
    dialog('identify_success_legendary', '这件装备...蕴含着传说级的力量！'),
    dialog('identify_normal', '这件装备...只是普通的货色。'),
    dialog('identify_bad', '这件装备...蕴含着不祥的力量。'),
    dialog('no_unidentified', '你没有需要鉴定的装备。'),
  ],
};

const ALCHEMIST: NPCData = {
  id: 'npc_alchemist',
  name: '费尔南',
  type: 'alchemist',
  area: 'commercial',
  position: { x: 550, y: 400 },
  sprite: 'npc_alchemist',
  dialogs: [
    dialog('greeting', '我是炼金师费尔南。需要我帮你制作什么吗？', [
      dialogOption('查看配方', null, 'open_recipes'),
      dialogOption('合成符文', null, 'open_rune_craft'),
      dialogOption('再见', null, null),
    ]),
    dialog('craft_success', '完成了！这是你的%s。'),
    dialog('material_lack', '你缺少必要的材料。需要我告诉你哪里可以找到吗？'),
    dialog('gold_lack', '制作费用不够呢。再去赚点金币吧。'),
  ],
};

const TELEPORTER: NPCData = {
  id: 'npc_teleporter',
  name: '卡珊德拉',
  type: 'teleporter',
  area: 'teleport',
  position: { x: 400, y: 450 },
  sprite: 'npc_teleporter',
  dialogs: [
    dialog('greeting', '我是传送师卡珊德拉。需要我送你去哪个楼层吗？', [
      dialogOption('打开传送列表', null, 'open_teleport'),
      dialogOption('再见', null, null),
    ]),
    dialog('teleport_success', '祝你一路顺风！'),
    dialog('cooldown', '传送魔法还在恢复中，请稍后再来。'),
    dialog('no_unlocked_floor', '你还没有解锁任何楼层。先去探索吧。'),
  ],
};

// ==================== 主数组与查询 ====================

/** 所有NPC */
export const ALL_NPCS: NPCData[] = [
  BLACKSMITH,
  MERCHANT,
  SKILL_TRAINER,
  CLASS_TRAINER,
  BANKER,
  FORTUNE_TELLER,
  ALCHEMIST,
  TELEPORTER,
];

/** 按ID查询NPC */
export function getNpcById(id: string): NPCData | undefined {
  return ALL_NPCS.find(n => n.id === id);
}

/** 按类型查询NPC */
export function getNpcByType(type: NPCType): NPCData | undefined {
  return ALL_NPCS.find(n => n.type === type);
}

/** 按区域查询NPC */
export function getNpcsByArea(area: TownArea): NPCData[] {
  return ALL_NPCS.filter(n => n.area === area);
}

/** 获取指定等级可购买的商店物品 */
export function getAvailableShopItems(playerLevel: number): ShopItem[] {
  return MERCHANT_SHOP.filter(item => item.levelReq <= playerLevel);
}

/** NPC总数 */
export const NPC_COUNT = ALL_NPCS.length;
