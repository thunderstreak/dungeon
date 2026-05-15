// 房间模板基类 - 定义房间类型的特殊装饰和功能

import type { RoomType } from '@/config/types';

// ==================== 模板配置 ====================

/** 模板装饰类型 */
export type DecorationType = 'torch' | 'banner' | 'chest' | 'shopCounter' | 'altar' | 'throne';

/** 模板装饰 */
export interface RoomDecoration {
  type: DecorationType;
  offsetX: number; // 相对于房间中心的偏移
  offsetY: number;
}

/** 房间模板配置 */
export interface RoomTemplateConfig {
  type: RoomType;
  floorColor: number;
  wallColor: number;
  decorations: RoomDecoration[];
  monsterDensity: number; // 0~1
  itemDensity: number;    // 0~1
}

// ==================== 模板注册 ====================

const templates = new Map<RoomType, RoomTemplateConfig>();

/** 注册模板 */
export function registerTemplate(config: RoomTemplateConfig): void {
  templates.set(config.type, config);
}

/** 获取模板 */
export function getTemplate(type: RoomType): RoomTemplateConfig | null {
  return templates.get(type) ?? null;
}

/** 获取所有模板 */
export function getAllTemplates(): RoomTemplateConfig[] {
  return Array.from(templates.values());
}

// ==================== 内置模板 ====================

/** 起始房间模板 */
registerTemplate({
  type: 'start',
  floorColor: 0x3a3a4a,
  wallColor: 0x2a2a3a,
  decorations: [
    { type: 'torch', offsetX: -2, offsetY: -1 },
    { type: 'torch', offsetX: 2, offsetY: -1 },
  ],
  monsterDensity: 0,
  itemDensity: 0.1,
});

/** 普通房间模板 */
registerTemplate({
  type: 'normal',
  floorColor: 0x2a2a3a,
  wallColor: 0x1a1a2a,
  decorations: [
    { type: 'torch', offsetX: -3, offsetY: 0 },
    { type: 'torch', offsetX: 3, offsetY: 0 },
  ],
  monsterDensity: 0.6,
  itemDensity: 0.2,
});

/** 宝箱房间模板 */
registerTemplate({
  type: 'treasure',
  floorColor: 0x3a3520,
  wallColor: 0x2a2510,
  decorations: [
    { type: 'chest', offsetX: 0, offsetY: 0 },
    { type: 'torch', offsetX: -2, offsetY: -1 },
    { type: 'torch', offsetX: 2, offsetY: -1 },
  ],
  monsterDensity: 0.3,
  itemDensity: 0.8,
});

/** 商店房间模板 */
registerTemplate({
  type: 'shop',
  floorColor: 0x3a2a2a,
  wallColor: 0x2a1a1a,
  decorations: [
    { type: 'shopCounter', offsetX: 0, offsetY: -2 },
    { type: 'torch', offsetX: -3, offsetY: -1 },
    { type: 'torch', offsetX: 3, offsetY: -1 },
  ],
  monsterDensity: 0,
  itemDensity: 0,
});

/** 事件房间模板 */
registerTemplate({
  type: 'event',
  floorColor: 0x2a3a3a,
  wallColor: 0x1a2a2a,
  decorations: [
    { type: 'altar', offsetX: 0, offsetY: -1 },
    { type: 'torch', offsetX: -2, offsetY: 0 },
    { type: 'torch', offsetX: 2, offsetY: 0 },
  ],
  monsterDensity: 0.2,
  itemDensity: 0.5,
});

/** Boss房间模板 */
registerTemplate({
  type: 'boss',
  floorColor: 0x1a1a2a,
  wallColor: 0x0a0a1a,
  decorations: [
    { type: 'throne', offsetX: 0, offsetY: -3 },
    { type: 'banner', offsetX: -3, offsetY: -2 },
    { type: 'banner', offsetX: 3, offsetY: -2 },
    { type: 'torch', offsetX: -4, offsetY: 0 },
    { type: 'torch', offsetX: 4, offsetY: 0 },
  ],
  monsterDensity: 0,
  itemDensity: 0.3,
});
