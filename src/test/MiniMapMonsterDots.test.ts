import { MiniMap, getDungeonMiniMapScale } from '../ui/MiniMap';

type FakeObject = {
  destroy: () => void;
  setOrigin: (...args: unknown[]) => FakeObject;
  setStrokeStyle: (...args: unknown[]) => FakeObject;
  setDepth: (...args: unknown[]) => FakeObject;
  setScrollFactor: (...args: unknown[]) => FakeObject;
  setPosition: (...args: unknown[]) => FakeObject;
  fillColor?: number;
  fillAlpha?: number;
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function createFakeDisplayObject(): FakeObject {
  return {
    destroy: () => {},
    setOrigin: () => createFakeDisplayObject(),
    setStrokeStyle: () => createFakeDisplayObject(),
    setDepth: () => createFakeDisplayObject(),
    setScrollFactor: () => createFakeDisplayObject(),
    setPosition: () => createFakeDisplayObject(),
  };
}

function createFakeScene() {
  const circles: Array<{ x: number; y: number; radius: number; color: number }> = [];
  const rectangles: Array<{ x: number; y: number; width: number; height: number; color: number }> = [];
  const container = {
    list: [] as FakeObject[],
    add(obj: FakeObject) {
      this.list.push(obj);
      return this;
    },
    setDepth: () => container,
    setScrollFactor: () => container,
    destroy: () => {},
  };

  const scene = {
    add: {
      container: () => container,
      rectangle: (x: number, y: number, width: number, height: number, color: number) => {
        rectangles.push({ x, y, width, height, color });
        return createFakeDisplayObject();
      },
      circle: (x: number, y: number, radius: number, color: number) => {
        circles.push({ x, y, radius, color });
        return createFakeDisplayObject();
      },
    },
  };

  return { scene, circles, rectangles };
}

const { scene, circles, rectangles } = createFakeScene();
const miniMap = new MiniMap(scene as never);

miniMap.updateDungeon(
  [{ x: 10, y: 8, w: 12, h: 10, type: 'normal', cleared: false }],
  { x: 12, y: 10 },
  [{ x: 18, y: 14 }],
);

const monsterDots = circles.filter(circle => circle.color === 0xff4444);
assert(monsterDots.length === 1, 'Expected one monster red dot on dungeon minimap');

const playerDots = circles.filter(circle => circle.color === 0x44ff44);
assert(playerDots.length === 1, 'Expected one player green dot on dungeon minimap');

miniMap.updateDungeon(
  [{ x: 20, y: 20, w: 2, h: 2, type: 'normal', cleared: false }],
  { x: 20, y: 20 },
  [{ x: 21, y: 21 }],
);

const dungeonRooms = rectangles.filter(rectangle => rectangle.color === 0x333366 || rectangle.color === 0x336633 || rectangle.color === 0x663333);
const latestRoom = dungeonRooms[dungeonRooms.length - 1];
assert(latestRoom.width >= 8, `Expected zoomed room width >= 8, got ${latestRoom.width}`);
assert(latestRoom.height >= 8, `Expected zoomed room height >= 8, got ${latestRoom.height}`);

const zoomedScale = getDungeonMiniMapScale(140, 100, { minX: 20, minY: 20, maxX: 22, maxY: 22 });
assert(zoomedScale.scale === 4, `Expected minimum cell scale 4, got ${zoomedScale.scale}`);

const fittedScale = getDungeonMiniMapScale(140, 100, { minX: 0, minY: 0, maxX: 60, maxY: 40 });
assert(fittedScale.scale < 4, `Expected oversized dungeon to shrink below 4, got ${fittedScale.scale}`);

console.log('MiniMap monster dot tests passed');
