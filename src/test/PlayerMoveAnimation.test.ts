import { getPlayerMoveAnimationPose } from '../ui/PixelBodies';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const leftPose = getPlayerMoveAnimationPose('left', 0.5);
const rightPose = getPlayerMoveAnimationPose('right', 0.5);
const upPose = getPlayerMoveAnimationPose('up', 0.5);
const downPose = getPlayerMoveAnimationPose('down', 0.5);

assert(leftPose.torsoOffsetX < 0, 'Expected left move pose to lean torso left');
assert(rightPose.torsoOffsetX > 0, 'Expected right move pose to lean torso right');
assert(upPose.bobOffsetY < downPose.bobOffsetY, 'Expected up move pose to bob differently from down pose');
assert(leftPose.armSwing !== upPose.armSwing, 'Expected horizontal and vertical movement to use different arm swing');

console.log('Player move animation tests passed');
