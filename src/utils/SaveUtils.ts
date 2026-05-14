// 存档工具函数

const SAVE_KEY_PREFIX = 'dungeon_rpg_';
const MAX_SAVE_SLOTS = 3;

/** 保存数据到 localStorage */
export function saveToSlot(slot: number, data: unknown): boolean {
  try {
    const key = `${SAVE_KEY_PREFIX}slot_${slot}`;
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    return true;
  } catch {
    return false;
  }
}

/** 从 localStorage 读取数据 */
export function loadFromSlot(slot: number): unknown | null {
  try {
    const key = `${SAVE_KEY_PREFIX}slot_${slot}`;
    const json = localStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** 删除存档 */
export function deleteSlot(slot: number): boolean {
  try {
    const key = `${SAVE_KEY_PREFIX}slot_${slot}`;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** 获取所有存档槽位信息 */
export function getAllSlots(): Array<{ slot: number; exists: boolean; timestamp?: number }> {
  const slots: Array<{ slot: number; exists: boolean; timestamp?: number }> = [];
  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    const data = loadFromSlot(i) as { timestamp?: number } | null;
    slots.push({
      slot: i,
      exists: data !== null,
      timestamp: data?.timestamp,
    });
  }
  return slots;
}

/** 自动存档 (槽位0) */
export function autoSave(data: unknown): boolean {
  return saveToSlot(0, data);
}

/** 自动读档 (槽位0) */
export function autoLoad(): unknown | null {
  return loadFromSlot(0);
}
