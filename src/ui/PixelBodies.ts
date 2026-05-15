import Phaser from 'phaser';

export type PixelBodyRole = 'head' | 'torso' | 'arm' | 'leg';

export interface PixelBodyPart {
  role: PixelBodyRole;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

export type MoveDirection = 'left' | 'right' | 'up' | 'down';

export interface PlayerMoveAnimationPose {
  torsoOffsetX: number;
  torsoOffsetY: number;
  bobOffsetY: number;
  armSwing: number;
  legSwing: number;
}

export function getPlayerMoveAnimationPose(direction: MoveDirection, phase: number): PlayerMoveAnimationPose {
  const swing = Math.sin(phase * Math.PI * 2);

  switch (direction) {
    case 'left':
      return { torsoOffsetX: -1.5, torsoOffsetY: 0, bobOffsetY: Math.abs(swing) * 1.2, armSwing: -swing * 2.2, legSwing: swing * 2.4 };
    case 'right':
      return { torsoOffsetX: 1.5, torsoOffsetY: 0, bobOffsetY: Math.abs(swing) * 1.2, armSwing: swing * 2.2, legSwing: -swing * 2.4 };
    case 'up':
      return { torsoOffsetX: 0, torsoOffsetY: -0.8, bobOffsetY: -Math.abs(swing) * 0.8, armSwing: swing * 1.2, legSwing: swing * 1.5 };
    case 'down':
    default:
      return { torsoOffsetX: 0, torsoOffsetY: 0.8, bobOffsetY: Math.abs(swing) * 1.4, armSwing: swing * 1.6, legSwing: swing * 1.8 };
  }
}

export function getPlayerPixelBodyParts(): PixelBodyPart[] {
  return [
    { role: 'head', x: 0, y: -10, width: 10, height: 10, color: 0xf2c59d },
    { role: 'torso', x: 0, y: 1, width: 12, height: 14, color: 0x44aa44 },
    { role: 'arm', x: -8, y: 0, width: 4, height: 12, color: 0x2e7d32 },
    { role: 'arm', x: 8, y: 0, width: 4, height: 12, color: 0x2e7d32 },
    { role: 'leg', x: -3, y: 13, width: 4, height: 10, color: 0x224c28 },
    { role: 'leg', x: 3, y: 13, width: 4, height: 10, color: 0x224c28 },
  ];
}

export function createPlayerPixelBody(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);

  for (const part of getPlayerPixelBodyParts()) {
    const rect = scene.add.rectangle(part.x, part.y, part.width, part.height, part.color);
    rect.setOrigin(0.5, 0.5);
    if (part.role === 'torso') {
      rect.setStrokeStyle(2, 0x66dd66);
    }
    container.add(rect);
  }

  return container;
}
