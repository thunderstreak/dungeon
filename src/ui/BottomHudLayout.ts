import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config/constants';

export interface RectBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const BOTTOM_HUD_LAYOUT = {
  panelY: CANVAS_HEIGHT - 94,
  panelHeight: 86,
  orbSize: 60,
  orbY: CANVAS_HEIGHT - 51,
  hpOrbX: 90,
  mpOrbX: CANVAS_WIDTH - 90,
  slotSize: 28,
  slotGap: 4,
  itemStartX: 208,
  skillStartX: 528,
  slotY: CANVAS_HEIGHT - 51,
  classTextX: 480,
  classTextY: CANVAS_HEIGHT - 51,
  expY: CANVAS_HEIGHT - 8,
  hotBarKeyLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
  skillBarKeyLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
} as const;

export function getHotBarSlotPosition(index: number): { x: number; y: number } {
  return {
    x: BOTTOM_HUD_LAYOUT.itemStartX + index * (BOTTOM_HUD_LAYOUT.slotSize + BOTTOM_HUD_LAYOUT.slotGap),
    y: BOTTOM_HUD_LAYOUT.slotY,
  };
}

export function getSkillBarSlotPosition(index: number): { x: number; y: number } {
  return {
    x: BOTTOM_HUD_LAYOUT.skillStartX + index * (BOTTOM_HUD_LAYOUT.slotSize + BOTTOM_HUD_LAYOUT.slotGap),
    y: BOTTOM_HUD_LAYOUT.slotY,
  };
}

export function getSlotBounds(centerX: number, centerY: number): RectBounds {
  const half = BOTTOM_HUD_LAYOUT.slotSize / 2;
  return {
    left: centerX - half,
    right: centerX + half,
    top: centerY - half,
    bottom: centerY + half,
  };
}

export function getOrbBounds(centerX: number): RectBounds {
  const half = BOTTOM_HUD_LAYOUT.orbSize / 2;
  return {
    left: centerX - half,
    right: centerX + half,
    top: BOTTOM_HUD_LAYOUT.orbY - half,
    bottom: BOTTOM_HUD_LAYOUT.orbY + half,
  };
}

export function boundsOverlap(a: RectBounds, b: RectBounds): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
