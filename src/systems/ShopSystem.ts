// 商店刷新系统 - 每日00:00刷新、每日限购重置、5%几率稀有物品

import type { ShopItem } from '@/data/npcs';
import { MERCHANT_SHOP } from '@/data/npcs';
import { eventBus } from './EventBus';

// ==================== 商店状态 ====================

/** 商店物品状态 (含购买记录) */
export interface ShopItemState {
  item: ShopItem;
  boughtToday: number;
  isRare: boolean; // 5%几率稀有物品
}

/** 商店状态 */
export interface ShopState {
  lastRefreshTime: number;
  items: ShopItemState[];
}

// ==================== 配置 ====================

/** 稀有物品几率 */
const RARE_ITEM_CHANCE = 0.05;

/** 稀有物品价格倍率 */
const RARE_ITEM_PRICE_MULTIPLIER = 1.5;

// ==================== 初始化 ====================

/** 创建初始商店状态 */
export function createShopState(): ShopState {
  return {
    lastRefreshTime: Date.now(),
    items: generateShopItems(),
  };
}

/** 生成商店物品 (含稀有几率) */
function generateShopItems(): ShopItemState[] {
  return MERCHANT_SHOP.map(item => ({
    item,
    boughtToday: 0,
    isRare: Math.random() < RARE_ITEM_CHANCE,
  }));
}

// ==================== 刷新逻辑 ====================

/** 获取今日零点时间戳 */
function getTodayMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return midnight.getTime();
}

/** 检查是否需要刷新 */
export function needsRefresh(state: ShopState): boolean {
  const todayMidnight = getTodayMidnight();
  return state.lastRefreshTime < todayMidnight;
}

/** 执行每日刷新 */
export function refreshShop(state: ShopState): boolean {
  if (!needsRefresh(state)) return false;

  // 重置购买记录
  for (const item of state.items) {
    item.boughtToday = 0;
    // 重新随机稀有状态
    item.isRare = Math.random() < RARE_ITEM_CHANCE;
  }

  state.lastRefreshTime = Date.now();

  eventBus.emit('shop:refresh', undefined as never);
  return true;
}

// ==================== 购买逻辑 ====================

/** 获取物品价格 (含稀有加成) */
export function getItemPrice(itemState: ShopItemState): number {
  const basePrice = itemState.item.price;
  return itemState.isRare ? Math.floor(basePrice * RARE_ITEM_PRICE_MULTIPLIER) : basePrice;
}

/** 检查是否可以购买 */
export function canBuyItem(
  itemState: ShopItemState,
  playerLevel: number,
  playerGold: number,
): { canBuy: boolean; error?: string } {
  // 等级检查
  if (playerLevel < itemState.item.levelReq) {
    return { canBuy: false, error: `等级不足，需要${itemState.item.levelReq}级` };
  }

  // 金币检查
  const price = getItemPrice(itemState);
  if (playerGold < price) {
    return { canBuy: false, error: `金币不足，需要${price}金币` };
  }

  // 限购检查
  if (itemState.item.dailyLimit > 0 && itemState.boughtToday >= itemState.item.dailyLimit) {
    return { canBuy: false, error: '今日已达购买上限' };
  }

  return { canBuy: true };
}

/** 执行购买 */
export function buyItem(
  itemState: ShopItemState,
  playerLevel: number,
  playerGold: number,
): { success: boolean; goldSpent: number; error?: string } {
  const validation = canBuyItem(itemState, playerLevel, playerGold);
  if (!validation.canBuy) {
    return { success: false, goldSpent: 0, error: validation.error };
  }

  const price = getItemPrice(itemState);
  itemState.boughtToday++;

  eventBus.emit('shop:buy', {
    itemId: itemState.item.itemId,
    price,
    isRare: itemState.isRare,
  });

  return { success: true, goldSpent: price };
}

/** 获取剩余购买次数 */
export function getRemainingLimit(itemState: ShopItemState): number {
  if (itemState.item.dailyLimit === 0) return Infinity;
  return Math.max(0, itemState.item.dailyLimit - itemState.boughtToday);
}

// ==================== 查询 ====================

/** 获取所有可购买物品 (根据玩家等级筛选) */
export function getAvailableItems(state: ShopState, playerLevel: number): ShopItemState[] {
  return state.items.filter(item => playerLevel >= item.item.levelReq);
}

/** 获取稀有物品列表 */
export function getRareItems(state: ShopState): ShopItemState[] {
  return state.items.filter(item => item.isRare);
}

// ==================== 事件声明 ====================

declare module './EventBus' {
  interface GameEvents {
    'shop:refresh': void;
    'shop:buy': { itemId: string; price: number; isRare: boolean };
  }
}
