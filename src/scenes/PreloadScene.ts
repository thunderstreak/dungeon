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

    // 章鱼精灵表
    const octopusBase = 'octopus';
    this.load.spritesheet('octopus_idle', `${octopusBase}/spr_green_octopus_idle_strip13.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('octopus_walk', `${octopusBase}/spr_green_octopus_walk_strip13.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('octopus_attack', `${octopusBase}/spr_green_octopus_attack_strip13.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('octopus_dmg', `${octopusBase}/spr_green_octopus_dmg_strip13.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('octopus_death_1', `${octopusBase}/spr_green_octopus_death_1_strip13.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('octopus_death_2', `${octopusBase}/spr_green_octopus_death_2_strip13.png`, { frameWidth: 64, frameHeight: 64 });

    // 老鼠精灵表（棕/灰/白三色）
    const ratColors = ['Brown', 'Gray', 'White'] as const;
    const ratAnims = [
      { name: 'Attack', frames: 6, w: 64, h: 64 },
      { name: 'Dead', frames: 6, w: 64, h: 64 },
      { name: 'Hurt', frames: 6, w: 64, h: 64 },
      { name: 'Idle', frames: 6, w: 64, h: 64 },
      { name: 'Run', frames: 6, w: 64, h: 64 },
      { name: 'Stand', frames: 6, w: 64, h: 64 },
      { name: 'Walk', frames: 4, w: 64, h: 64 },
    ];
    for (const color of ratColors) {
      for (const anim of ratAnims) {
        const key = `rat_${color.toLowerCase()}_${anim.name.toLowerCase()}`;
        this.load.spritesheet(key, `rat/Rat_${color}_${anim.name}.png`, { frameWidth: anim.w, frameHeight: anim.h });
      }
    }

    // 法杖icon精灵图 (16帧，一排6个，每帧32x32)
    this.load.spritesheet('staff_icons', 'sprites/weapons/staff-icons.png', { frameWidth: 32, frameHeight: 32 });

    // 法师角色精灵表 (128x128每帧)
    this.load.spritesheet('wizard', 'sprites/Wizard-Sheet.png', { frameWidth: 128, frameHeight: 128 });

    // 战士角色精灵表 (32x32每帧，15排)
    this.load.spritesheet('warrior', 'sprites/Adventurer-Sprite-Sheet.png', { frameWidth: 32, frameHeight: 32 });
  }

  create(): void {
    // 资源加载完成，进入主菜单
    this.scene.start('MainMenuScene');
  }
}
