import { getAttackAnimationConfig } from '../ui/AttackAnimation';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const playerConfig = getAttackAnimationConfig('player');
const monsterConfig = getAttackAnimationConfig('monster');
const bossConfig = getAttackAnimationConfig('boss');

assert(playerConfig.windupDuration > 0, 'Expected player attack animation to have windup');
assert(monsterConfig.strikeDuration > 0, 'Expected monster attack animation to have strike duration');
assert(bossConfig.recoverDuration >= monsterConfig.recoverDuration, 'Expected boss recovery to be at least as long as monster recovery');
assert(bossConfig.lungeDistance > monsterConfig.lungeDistance, 'Expected boss lunge distance to exceed monster lunge distance');

console.log('Attack animation hook tests passed');
