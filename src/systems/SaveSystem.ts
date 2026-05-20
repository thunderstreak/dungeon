// 存档系统 - JSON存读、多槽位、自动存档

import type { Character, DungeonProgress, Inventory, GameSettings } from '@/config/types';
import { GAME_VERSION } from '@/config/constants';
import { eventBus } from './EventBus';

// ==================== 存档数据结构 ====================

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

/** 存档槽位信息 */
export interface SaveSlotInfo {
  slot: number;
  exists: boolean;
  timestamp?: number;
  playerName?: string;
  playerLevel?: number;
  playerClass?: string;
}

// ==================== 配置 ====================

const SAVE_KEY_PREFIX = 'dungeon_save_';
const MAX_SAVE_SLOTS = 5;
const AUTO_SAVE_SLOT = 0;
const AUTO_SAVE_INTERVAL = 300000; // 5分钟自动存档

// ==================== 存档操作 ====================

/** 保存游戏数据到指定槽位 */
export function saveToSlot(slot: number, data: SaveData): boolean {
  try {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
      console.error(`无效的存档槽位: ${slot}`);
      return false;
    }

    data.version = GAME_VERSION;
    data.timestamp = Date.now();
    data.slot = slot;

    const key = `${SAVE_KEY_PREFIX}${slot}`;
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);

    eventBus.emit('save:complete', { slot, timestamp: data.timestamp });
    return true;
  } catch (error) {
    console.error('存档失败:', error);
    return false;
  }
}

/** 从指定槽位读取游戏数据 */
export function loadFromSlot(slot: number): SaveData | null {
  try {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
      console.error(`无效的存档槽位: ${slot}`);
      return null;
    }

    const key = `${SAVE_KEY_PREFIX}${slot}`;
    const json = localStorage.getItem(key);
    if (!json) return null;

    const data = JSON.parse(json) as SaveData;

    // 版本兼容性检查
    if (data.version !== GAME_VERSION) {
      console.warn(`存档版本不匹配: ${data.version} vs ${GAME_VERSION}`);
    }

    // 存档迁移：清理已废弃的 physicalAttackMax 属性
    migrateRemovePhysicalAttackMax(data);

    return data;
  } catch (error) {
    console.error('读档失败:', error);
    return null;
  }
}

/** 删除指定槽位的存档 */
export function deleteSlot(slot: number): boolean {
  try {
    if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
      return false;
    }

    const key = `${SAVE_KEY_PREFIX}${slot}`;
    localStorage.removeItem(key);

    eventBus.emit('save:deleted', { slot });
    return true;
  } catch (error) {
    console.error('删除存档失败:', error);
    return false;
  }
}

/** 获取所有存档槽位信息 */
export function getAllSlotInfo(): SaveSlotInfo[] {
  const slots: SaveSlotInfo[] = [];

  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    const data = loadFromSlot(i);
    slots.push({
      slot: i,
      exists: data !== null,
      timestamp: data?.timestamp,
      playerName: data?.player?.name,
      playerLevel: data?.player?.level,
      playerClass: data?.player?.class,
    });
  }

  return slots;
}

/** 检查槽位是否有存档 */
export function hasSlotData(slot: number): boolean {
  const key = `${SAVE_KEY_PREFIX}${slot}`;
  return localStorage.getItem(key) !== null;
}

/** 获取存档槽位数量 */
export function getMaxSlots(): number {
  return MAX_SAVE_SLOTS;
}

// ==================== 自动存档 ====================

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;
let autoSaveDataGetter: (() => SaveData) | null = null;

/** 设置自动存档数据获取函数 */
export function setAutoSaveDataGetter(getter: () => SaveData): void {
  autoSaveDataGetter = getter;
}

/** 启动自动存档 */
export function startAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }

  autoSaveTimer = setInterval(() => {
    if (autoSaveDataGetter) {
      const data = autoSaveDataGetter();
      const success = saveToSlot(AUTO_SAVE_SLOT, data);
      if (success) {
        eventBus.emit('save:autoSave', { slot: AUTO_SAVE_SLOT });
      }
    }
  }, AUTO_SAVE_INTERVAL);
}

/** 停止自动存档 */
export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

/** 手动触发自动存档槽位的存档 */
export function triggerAutoSave(): boolean {
  if (autoSaveDataGetter) {
    const data = autoSaveDataGetter();
    return saveToSlot(AUTO_SAVE_SLOT, data);
  }
  return false;
}

/** 加载自动存档 */
export function loadAutoSave(): SaveData | null {
  return loadFromSlot(AUTO_SAVE_SLOT);
}

/** 是否有自动存档 */
export function hasAutoSave(): boolean {
  return hasSlotData(AUTO_SAVE_SLOT);
}

// ==================== 存档工具 ====================

/** 格式化存档时间戳 */
export function formatSaveTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/** 获取存档大小 (字节) */
export function getSaveSize(slot: number): number {
  const key = `${SAVE_KEY_PREFIX}${slot}`;
  const data = localStorage.getItem(key);
  return data ? new Blob([data]).size : 0;
}

/** 导出存档为JSON字符串 */
export function exportSave(slot: number): string | null {
  const data = loadFromSlot(slot);
  if (!data) return null;
  return JSON.stringify(data, null, 2);
}

/** 从JSON字符串导入存档 */
export function importSave(slot: number, jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as SaveData;
    return saveToSlot(slot, data);
  } catch (error) {
    console.error('导入存档失败:', error);
    return false;
  }
}

// ==================== 存档迁移 ====================

/** 清理装备中已废弃的 physicalAttackMax 属性 */
function migrateRemovePhysicalAttackMax(data: SaveData): void {
  const cleanStats = (equipment: { stats?: Array<{ stat: string }> } | null | undefined) => {
    if (equipment?.stats) {
      equipment.stats = equipment.stats.filter(s => s.stat !== 'physicalAttackMax');
    }
  };

  // 清理已穿戴装备
  for (const slot of Object.values(data.player.equipment)) {
    cleanStats(slot);
  }

  // 清理背包中的装备
  for (const category of Object.values(data.inventory.categories)) {
    for (const invSlot of category) {
      cleanStats(invSlot.equipmentData);
    }
  }
}
