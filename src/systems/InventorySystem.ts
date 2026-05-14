// 背包系统 - 物品管理、堆叠、金币

import type { Character, Inventory, InventorySlot, InventoryCategory, Item } from '@/config/types';
import { MAX_POTION_STACK } from '@/config/constants';
import { eventBus } from './EventBus';

// ==================== 物品查询 ====================

/** 获取背包分类对应的ItemType */
function categoryToItemType(category: InventoryCategory): string {
  return category; // 'equipment' | 'consumable' | 'material' | 'other'
}

/** 获取物品所属的背包分类 */
export function getItemCategory(item: Item): InventoryCategory {
  if (item.type === 'equipment') return 'equipment';
  if (item.type === 'consumable') return 'consumable';
  if (item.type === 'material') return 'material';
  return 'other';
}

// ==================== 添加物品 ====================

/**
 * 向背包添加物品
 * 自动堆叠到已有相同物品的槽位，满了则放到空槽位
 * 返回实际添加的数量（可能少于请求数量）
 */
export function addItem(character: Character, item: Item, count: number): number {
  const category = getItemCategory(item);
  const slots = character.inventory.categories[category];
  let remaining = count;

  // 第一轮: 尝试堆叠到已有相同物品的槽位
  if (item.isStackable) {
    for (const slot of slots) {
      if (remaining <= 0) break;
      if (slot.item?.id === item.id && slot.count < item.maxStack) {
        const canAdd = item.maxStack - slot.count;
        const toAdd = Math.min(remaining, canAdd);
        slot.count += toAdd;
        remaining -= toAdd;
      }
    }
  }

  // 第二轮: 放到空槽位
  for (const slot of slots) {
    if (remaining <= 0) break;
    if (slot.item === null) {
      const toAdd = item.isStackable ? Math.min(remaining, item.maxStack) : 1;
      slot.item = item;
      slot.count = toAdd;
      remaining -= toAdd;
    }
  }

  const added = count - remaining;
  if (added > 0) {
    eventBus.emit('inventory:add', { itemId: item.id, count: added });
  }
  if (remaining > 0) {
    eventBus.emit('inventory:full', undefined as never);
  }

  return added;
}

/**
 * 向背包添加装备（装备不可堆叠）
 * 装备以Item形式存储，实际装备数据通过itemId关联
 */
export function addEquipment(character: Character, equipmentItem: Item): boolean {
  const slots = character.inventory.categories.equipment;
  const emptySlot = slots.find(s => s.item === null);
  if (!emptySlot) {
    eventBus.emit('inventory:full', undefined as never);
    return false;
  }

  emptySlot.item = equipmentItem;
  emptySlot.count = 1;
  eventBus.emit('inventory:add', { itemId: equipmentItem.id, count: 1 });
  return true;
}

// ==================== 移除物品 ====================

/**
 * 从背包移除物品
 * 返回是否成功移除
 */
export function removeItem(character: Character, itemId: string, count: number): boolean {
  const category = getItemCategoryById(itemId);
  if (!category) return false;

  const slots = character.inventory.categories[category];
  let remaining = count;

  for (const slot of slots) {
    if (remaining <= 0) break;
    if (slot.item?.id === itemId) {
      const toRemove = Math.min(remaining, slot.count);
      slot.count -= toRemove;
      remaining -= toRemove;

      if (slot.count <= 0) {
        slot.item = null;
        slot.count = 0;
      }
    }
  }

  if (remaining === 0) {
    eventBus.emit('inventory:remove', { itemId, count });
    return true;
  }
  return false;
}

// ==================== 查询物品 ====================

/** 计算背包中某物品的总数量 */
export function getItemCount(character: Character, itemId: string): number {
  let total = 0;
  for (const category of Object.values(character.inventory.categories)) {
    for (const slot of category) {
      if (slot.item?.id === itemId) {
        total += slot.count;
      }
    }
  }
  return total;
}

/** 检查是否拥有足够数量的物品 */
export function hasItem(character: Character, itemId: string, count: number): boolean {
  return getItemCount(character, itemId) >= count;
}

/** 查找包含指定物品的所有槽位 */
export function findItemSlots(character: Character, itemId: string): InventorySlot[] {
  const result: InventorySlot[] = [];
  for (const category of Object.values(character.inventory.categories)) {
    for (const slot of category) {
      if (slot.item?.id === itemId) {
        result.push(slot);
      }
    }
  }
  return result;
}

/** 获取指定分类的所有非空槽位 */
export function getCategorySlots(character: Character, category: InventoryCategory): InventorySlot[] {
  return character.inventory.categories[category].filter(s => s.item !== null);
}

/** 获取指定分类的已用槽位数 */
export function getCategoryUsedCount(character: Character, category: InventoryCategory): number {
  return character.inventory.categories[category].filter(s => s.item !== null).length;
}

/** 获取指定分类的空槽位数 */
export function getCategoryFreeCount(character: Character, category: InventoryCategory): number {
  return character.inventory.categories[category].filter(s => s.item === null).length;
}

// ==================== 整理背包 ====================

/** 整理指定分类: 合并可堆叠物品、压缩空槽位 */
export function sortCategory(character: Character, category: InventoryCategory): void {
  const slots = character.inventory.categories[category];

  // 合并可堆叠物品
  for (let i = 0; i < slots.length; i++) {
    const slotA = slots[i];
    if (!slotA.item || !slotA.item.isStackable) continue;

    for (let j = i + 1; j < slots.length; j++) {
      const slotB = slots[j];
      if (!slotB.item || slotB.item.id !== slotA.item.id) continue;

      const maxStack = slotA.item.maxStack;
      const canAdd = maxStack - slotA.count;
      if (canAdd <= 0) break;

      const toMove = Math.min(slotB.count, canAdd);
      slotA.count += toMove;
      slotB.count -= toMove;

      if (slotB.count <= 0) {
        slotB.item = null;
        slotB.count = 0;
      }
    }
  }

  // 压缩: 将物品移到前面，空槽位移到后面
  const items = slots.filter(s => s.item !== null);
  const emptyCount = slots.length - items.length;

  for (let i = 0; i < items.length; i++) {
    slots[i] = items[i];
  }
  for (let i = items.length; i < slots.length; i++) {
    slots[i] = { item: null, count: 0 };
  }
}

// ==================== 金币管理 ====================

/** 添加金币 */
export function addGold(character: Character, amount: number): void {
  if (amount <= 0) return;
  character.gold += amount;
  character.inventory.gold = character.gold;
}

/** 消费金币，返回是否成功 */
export function spendGold(character: Character, amount: number): boolean {
  if (amount <= 0 || character.gold < amount) return false;
  character.gold -= amount;
  character.inventory.gold = character.gold;
  return true;
}

/** 检查金币是否足够 */
export function hasGold(character: Character, amount: number): boolean {
  return character.gold >= amount;
}

// ==================== 内部辅助 ====================

/** 根据物品ID推断背包分类（临时方案，实际应有物品数据库） */
function getItemCategoryById(_itemId: string): InventoryCategory | null {
  // 药水类物品前缀
  if (_itemId.startsWith('potion_')) return 'consumable';
  // 材料类物品前缀
  if (_itemId.startsWith('mat_')) return 'material';
  // 装备类物品前缀（武器/防具类型）
  if (_itemId.includes('blade_') || _itemId.includes('sword_') || _itemId.includes('axe_')
    || _itemId.includes('staff_') || _itemId.includes('wand_')
    || _itemId.includes('helmet_') || _itemId.includes('armor_')
    || _itemId.includes('boots_') || _itemId.includes('belt_')
    || _itemId.includes('necklace_') || _itemId.includes('ring_')
    || _itemId.includes('bracelet_') || _itemId.includes('shield_')
    || _itemId.startsWith('abyss_')) {
    return 'equipment';
  }
  return 'other';
}
