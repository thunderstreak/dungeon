import { getPlayerPixelBodyParts, type PixelBodyPart } from '../ui/PixelBodies';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const parts = getPlayerPixelBodyParts();

assert(parts.length >= 6, `Expected player pixel body to contain multiple parts, got ${parts.length}`);
assert(parts.some((part: PixelBodyPart) => part.role === 'head'), 'Expected player pixel body to include a head part');
assert(parts.some((part: PixelBodyPart) => part.role === 'torso'), 'Expected player pixel body to include a torso part');
assert(parts.filter((part: PixelBodyPart) => part.role === 'leg').length >= 2, 'Expected player pixel body to include two leg parts');

console.log('Player pixel body tests passed');
