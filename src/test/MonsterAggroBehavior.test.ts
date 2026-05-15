import { Monster, getAggroDecayConfig, getMonsterMoveInterval } from '../entities/Monster';
import { Boss, getBossMoveInterval } from '../entities/Boss';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const monsterInterval = getMonsterMoveInterval(90);
const bossInterval = getBossMoveInterval(110);

assert(monsterInterval > bossInterval, `Expected normal monster to move slower than boss, got ${monsterInterval} <= ${bossInterval}`);

const normalAggro = getAggroDecayConfig(false);
const bossAggro = getAggroDecayConfig(true);

assert(normalAggro.decayPerGrid > bossAggro.decayPerGrid, 'Expected normal monster aggro to decay faster than boss');
assert(normalAggro.minChaseAggro > 0, 'Expected normal monster to have minimum chase aggro threshold');
assert(bossAggro.minChaseAggro > normalAggro.minChaseAggro, 'Expected boss to keep chasing longer than normal monster');

console.log('Monster aggro behavior tests passed');
