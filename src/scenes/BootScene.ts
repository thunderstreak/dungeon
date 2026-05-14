import Phaser from 'phaser';

/** 启动场景 - 初始化游戏基础配置 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // 设置像素渲染模式
    this.game.canvas.style.imageRendering = 'pixelated';

    // 进入预加载场景
    this.scene.start('PreloadScene');
  }
}
