import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';

/** 预加载场景 - 加载资源并显示加载进度 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // 显示加载进度条
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x333333, 0.8);
    progressBox.fillRect(centerX - 160, centerY - 15, 320, 30);

    const loadingText = this.add.text(centerX, centerY - 40, '加载中...', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const percentText = this.add.text(centerX, centerY, '0%', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x5599ff, 1);
      progressBar.fillRect(centerX - 155, centerY - 10, 310 * value, 20);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // TODO: 在此处加载游戏资源
    // this.load.image('player', 'assets/sprites/player.png');
    // this.load.tilemapTiledJSON('dungeon', 'assets/tilemaps/dungeon.json');
  }

  create(): void {
    // 资源加载完成，进入主菜单
    this.scene.start('MainMenuScene');
  }
}
