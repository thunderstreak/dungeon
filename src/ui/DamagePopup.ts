// 浮动伤害数字

import Phaser from 'phaser';

export function showDamagePopup(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number,
  type: 'normal' | 'critical' | 'heal' = 'normal',
): void {
  const color = type === 'critical' ? '#ffff00' : type === 'heal' ? '#55ff55' : '#ffffff';
  const fontSize = type === 'critical' ? '18px' : '14px';
  const text = type === 'critical' ? `${amount}!` : `${amount}`;

  const popup = scene.add.text(x, y - 10, text, {
    fontSize,
    color,
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2,
  }).setOrigin(0.5).setDepth(2500);

  scene.tweens.add({
    targets: popup,
    y: y - 50,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => popup.destroy(),
  });
}
