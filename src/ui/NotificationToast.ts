// 顶部通知消息

import Phaser from 'phaser';
import { CANVAS_WIDTH } from '@/config';

export function showNotification(
  scene: Phaser.Scene,
  message: string,
  color = '#ffffff',
): void {
  const text = scene.add.text(CANVAS_WIDTH / 2, 50, message, {
    fontSize: '15px',
    color,
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2,
  }).setOrigin(0.5).setDepth(3000).setAlpha(0);

  scene.tweens.add({
    targets: text,
    alpha: 1,
    duration: 200,
    yoyo: true,
    hold: 1500,
    onComplete: () => text.destroy(),
  });
}
