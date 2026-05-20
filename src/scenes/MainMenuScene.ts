import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { loadFromSlot } from '@/utils/SaveUtils';
import { gameState } from '@/state/GameState';
import type { Character } from '@/config/types';

/** 主菜单场景 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // 标题
    this.add.text(centerX, centerY - 150, '地牢探险', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 90, 'Dungeon RPG', {
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5);

    // 新游戏按钮
    const newGameBtn = this.add.text(centerX, centerY, '[ 新游戏 ]', {
      fontSize: '24px',
      color: '#5599ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    newGameBtn.on('pointerover', () => newGameBtn.setColor('#88bbff'));
    newGameBtn.on('pointerout', () => newGameBtn.setColor('#5599ff'));
    newGameBtn.on('pointerdown', () => {
      this.scene.start('CharacterSelectScene');
    });

    // 继续游戏按钮
    const continueBtn = this.add.text(centerX, centerY + 60, '[ 继续游戏 ]', {
      fontSize: '24px',
      color: '#5599ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => continueBtn.setColor('#88bbff'));
    continueBtn.on('pointerout', () => continueBtn.setColor('#5599ff'));
    continueBtn.on('pointerdown', () => {
      const data = loadFromSlot(0) as { character?: Character } | null;
      if (data?.character) {
        gameState.currentSaveSlot = 0;
        gameState.setCharacter(data.character);
        this.scene.stop('UIScene');
        this.scene.start('TownScene');
      } else {
        // 无存档提示
        const hint = this.add.text(centerX, centerY + 120, '没有存档，请先创建新角色', {
          fontSize: '14px',
          color: '#ff8888',
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => hint.destroy());
      }
    });

    // 版本号
    this.add.text(centerX, CANVAS_HEIGHT - 30, 'v1.0.0', {
      fontSize: '12px',
      color: '#555555',
    }).setOrigin(0.5);
  }
}
