import {
  BOTTOM_HUD_LAYOUT,
  boundsOverlap,
  getHotBarSlotPosition,
  getOrbBounds,
  getSkillBarSlotPosition,
  getSlotBounds,
} from '../ui/BottomHudLayout';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const hpBounds = getOrbBounds(BOTTOM_HUD_LAYOUT.hpOrbX);
const mpBounds = getOrbBounds(BOTTOM_HUD_LAYOUT.mpOrbX);

for (let i = 0; i < 8; i++) {
  const hot = getSlotBounds(getHotBarSlotPosition(i).x, getHotBarSlotPosition(i).y);
  const skill = getSlotBounds(getSkillBarSlotPosition(i).x, getSkillBarSlotPosition(i).y);

  assert(!boundsOverlap(hpBounds, hot), `HP overlaps hotbar slot ${i}`);
  assert(!boundsOverlap(mpBounds, skill), `MP overlaps skillbar slot ${i}`);
  assert(!boundsOverlap(hot, skill), `Hotbar slot ${i} overlaps skillbar slot ${i}`);
}

const lastHot = getSlotBounds(getHotBarSlotPosition(7).x, getHotBarSlotPosition(7).y);
const firstSkill = getSlotBounds(getSkillBarSlotPosition(0).x, getSkillBarSlotPosition(0).y);
assert(lastHot.right + 56 <= firstSkill.left, 'Hotbar and skillbar need a readable class crest gap');

const classBounds = getSlotBounds(BOTTOM_HUD_LAYOUT.classTextX, BOTTOM_HUD_LAYOUT.classTextY);
assert(!boundsOverlap(classBounds, lastHot), 'Class text overlaps hotbar');
assert(!boundsOverlap(classBounds, firstSkill), 'Class text overlaps skillbar');

assert(BOTTOM_HUD_LAYOUT.hotBarKeyLabels.join(',') === '1,2,3,4,5,6,7,8', 'Hotbar keys must be 1-8');
assert(BOTTOM_HUD_LAYOUT.skillBarKeyLabels.join(',') === '1,2,3,4,5,6,7,8', 'Skillbar keys must be 1-8');

assert(BOTTOM_HUD_LAYOUT.orbY === BOTTOM_HUD_LAYOUT.slotY, 'Orbs and slots must be on the same horizontal center line');
assert(
  BOTTOM_HUD_LAYOUT.orbY === BOTTOM_HUD_LAYOUT.panelY + BOTTOM_HUD_LAYOUT.panelHeight / 2,
  'Orbs must be vertically centered inside bottom panel',
);

console.log('BottomHudLayout tests passed');
