// 事件总线 - 发布/订阅模式

type EventCallback<T = unknown> = (data: T) => void;

/** 所有游戏事件类型 */
export interface GameEvents {
  // 角色事件
  'player:levelup': { level: number };
  'player:death': void;
  'player:move': { x: number; y: number };
  'player:hpChange': { current: number; max: number };
  'player:mpChange': { current: number; max: number };

  // 战斗事件
  'battle:start': { targetId: string };
  'battle:end': { targetId: string; victory: boolean };
  'battle:damage': { targetId: string; amount: number; type: string; isCritical: boolean };
  'battle:heal': { targetId: string; amount: number };

  // 技能事件
  'skill:cast': { skillId: string; targetId: string | null };
  'skill:hit': { skillId: string; targetId: string; damage: number };
  'skill:cooldownEnd': { skillId: string };

  // 装备事件
  'equipment:equip': { slot: string; itemId: string };
  'equipment:unequip': { slot: string; itemId: string };
  'equipment:enhance': { itemId: string; level: number; success: boolean };

  // 背包事件
  'inventory:add': { itemId: string; count: number };
  'inventory:remove': { itemId: string; count: number };
  'inventory:full': void;

  // 地牢事件
  'dungeon:enterFloor': { floor: number };
  'dungeon:clearRoom': { roomId: string };
  'dungeon:bossDefeated': { floor: number };
  'dungeon:abyssTriggered': void;

  // NPC事件
  'npc:interact': { npcId: string };
  'npc:dialog': { npcId: string; dialogId: string };

  // UI事件
  'ui:openPanel': { panel: string };
  'ui:closePanel': { panel: string };

  // 游戏事件
  'game:save': void;
  'game:load': void;
  'game:pause': void;
  'game:resume': void;
}

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  /** 监听事件 */
  on<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // 返回取消监听函数
    return () => this.off(event, callback);
  }

  /** 取消监听 */
  off<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>,
  ): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  /** 触发事件 */
  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        console.error(`EventBus error in "${event}":`, e);
      }
    });
  }

  /** 监听一次 */
  once<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>,
  ): () => void {
    const wrapper = (data: GameEvents[K]) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  /** 清除所有监听 */
  clear(): void {
    this.listeners.clear();
  }
}

/** 全局事件总线单例 */
export const eventBus = new EventBus();
