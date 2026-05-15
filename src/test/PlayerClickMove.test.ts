import { Player } from '../entities/Player';
import type { Character } from '../config/types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

type ChainableShape = {
  x: number;
  y: number;
  setOrigin: () => ChainableShape;
  setPosition: (x: number, y: number) => ChainableShape;
};

type FakeContainer = {
  x: number;
  y: number;
  setDepth: () => FakeContainer;
  setPosition: (x: number, y: number) => FakeContainer;
  add: () => FakeContainer;
  destroy: () => FakeContainer;
};

type FakeScene = {
  add: {
    container: (x: number, y: number) => FakeContainer;
    rectangle: (x: number, y: number, width: number, height: number, fillColor: number) => ChainableShape & { width: number; height: number; fillColor: number; displayWidth: number };
    text: (x: number, y: number, text: string, style?: object) => ChainableShape & { text: string; style?: object };
  };
  input: {
    keyboard: {
      createCursorKeys: () => {
        left: { isDown: boolean };
        right: { isDown: boolean };
        up: { isDown: boolean };
        down: { isDown: boolean };
      };
      addKeys: () => Record<string, { isDown: boolean }>;
    };
  };
};

function createFakeScene(): FakeScene {
  return {
    add: {
      container: (x: number, y: number) => ({
        x,
        y,
        setDepth() { return this; },
        setPosition(nx: number, ny: number) { this.x = nx; this.y = ny; return this; },
        add() { return this; },
        destroy() { return this; },
      }),
      rectangle: (x: number, y: number, width: number, height: number, fillColor: number) => ({
        x, y, width, height, fillColor, displayWidth: width,
        setOrigin() { return this; },
        setPosition(nx: number, ny: number) { this.x = nx; this.y = ny; return this; },
      }),
      text: (x: number, y: number, text: string, style?: object) => ({
        x, y, text,
        style,
        setOrigin() { return this; },
        setPosition(nx: number, ny: number) { this.x = nx; this.y = ny; return this; },
      }),
    },
    input: {
      keyboard: {
        createCursorKeys: () => ({
          left: { isDown: true },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false },
        }),
        addKeys: () => ({
          W: { isDown: false },
          A: { isDown: false },
          S: { isDown: false },
          D: { isDown: false },
        }),
      },
    },
  };
}

const character: Character = {
  id: 'tester',
  name: 'Tester',
  class: 'warrior',
  specialization: null,
  level: 1,
  experience: 0,
  skillPoints: 0,
  attributePoints: 0,
  allocatedStats: { strength: 0, intelligence: 0, stamina: 0, spirit: 0, agility: 0 },
  allocatedStatsSaved: false,
  gold: 0,
  stats: {
    strength: 10,
    intelligence: 10,
    stamina: 10,
    spirit: 10,
    agility: 10,
    hp: 100,
    mp: 20,
    physicalAttack: 10,
    magicAttack: 5,
    physicalDefense: 5,
    magicDefense: 5,
    criticalRate: 0,
    criticalDamage: 150,
    dodgeRate: 0,
    attackSpeed: 100,
    castSpeed: 100,
    moveSpeed: 100,
  },
  equipment: {
    weapon: null, helmet: null, armor: null, shield: null, belt: null, boots: null,
    necklace: null, ring1: null, ring2: null, bracelet1: null, bracelet2: null, rune: null,
  },
  inventory: { categories: { equipment: [], consumable: [], material: [], other: [] }, maxSlotsPerCategory: 0, gold: 0 },
  skills: [],
  weaponMasteries: [],
  position: { x: 10, y: 10 },
};

const scene = createFakeScene();
const player = new Player(scene as unknown as Player['scene'], character, 10, 10);
player.isWalkable = () => true;

const startGrid = player.getGridPosition();
player.update(200);
const afterKeyboardGrid = player.getGridPosition();

assert(
  afterKeyboardGrid.x === startGrid.x && afterKeyboardGrid.y === startGrid.y,
  'Expected keyboard state to no longer move player',
);

player.moveToScreen(200, 200);
player.moveToScreen(320, 200);

player.update(200);

assert(player.getGridPosition().x > startGrid.x, 'Expected later click target to drive movement');
assert(player.facingDirection === 'right', 'Expected click movement to update facing direction');

const cameraOffsetScene = createFakeScene();
const cameraOffsetPlayer = new Player(cameraOffsetScene as unknown as Player['scene'], character, 10, 10);
cameraOffsetPlayer.isWalkable = () => true;
const cameraOffsetStart = cameraOffsetPlayer.getGridPosition();

cameraOffsetPlayer.moveToScreen(20, 200, 320, 0);
cameraOffsetPlayer.update(200);

assert(
  cameraOffsetPlayer.getGridPosition().x > cameraOffsetStart.x,
  'Expected camera scroll offset to be applied when converting click target to world position',
);
assert(
  cameraOffsetPlayer.facingDirection === 'right',
  'Expected camera-adjusted click movement to face right instead of drifting left',
);

console.log('Player click move tests passed');
