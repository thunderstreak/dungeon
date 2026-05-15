// 角色属性面板 - 显示角色属性、战斗属性、属性点分配（支持滚动）

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import { gameState } from '@/state/GameState';
import { allocateStat } from '@/systems/LevelSystem';

export class CharacterPanel extends BasePanel {
  private statTexts: Record<string, Phaser.GameObjects.Text> = {};
  private pointsText!: Phaser.GameObjects.Text;
  private scrollContainer!: Phaser.GameObjects.Container;
  private scrollY = 0;
  private maxScroll = 0;

  // 面板区域
  private panelX = 0;
  private panelY = 0;
  private panelW = 380;
  private panelH = 420;
  private contentTop = 0;
  private contentBottom = 0;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.createContent();
  }

  private createContent(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    this.panelX = cx - this.panelW / 2;
    this.panelY = cy - this.panelH / 2;

    // 面板背景
    const bg = this.scene.add.rectangle(cx, cy, this.panelW, this.panelH, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x4444aa);
    this.container.add(bg);

    // 关闭按钮
    const closeBtn = this.scene.add.rectangle(cx + 175, cy - 190, 24, 24, 0x663333, 0.8);
    closeBtn.setStrokeStyle(1, 0xaa5555);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x884444));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x663333));
    this.container.add(closeBtn);

    const closeText = this.scene.add.text(cx + 175, cy - 190, 'X', {
      fontSize: '14px', color: '#ff8888', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(closeText);

    // 标题
    const title = this.scene.add.text(cx, cy - 190, '角色属性', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // 可滚动内容容器
    this.scrollContainer = this.scene.add.container(0, 0);
    this.container.add(this.scrollContainer);

    // 创建遮罩，裁剪超出面板的内容
    const maskShape = this.scene.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.panelX + 5, this.panelY + 30, this.panelW - 10, this.panelH - 40);
    const mask = maskShape.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // 填充内容
    this.populateContent(cx, cy);

    // 计算滚动范围（基于实际内容）
    // 内容起始: cy-160, 战斗属性最后1项: combatStartY + 4*22 = div2Y+16+88
    // div2Y = (cy-160) + 4*22+20 + 5*26+6 = cy-160+88+20+130+6 = cy+84
    // combatStartY = cy+84+16 = cy+100
    // 最后一项 y = cy+100+4*22 = cy+188
    this.contentTop = cy - 160;
    this.contentBottom = cy + 200;
    const visibleTop = this.panelY + 30;
    const visibleBottom = this.panelY + this.panelH - 10;
    const visibleHeight = visibleBottom - visibleTop;
    this.maxScroll = Math.max(0, (this.contentBottom - this.contentTop) - visibleHeight);

    // 鼠标滚轮滚动
    this.scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (!this.isOpen) return;
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScroll);
      this.scrollContainer.y = -this.scrollY;
    });
  }

  private populateContent(cx: number, cy: number): void {
    const char = gameState.getCharacter();

    // 列对齐常量
    const colLabel = cx - 170;  // 标签列
    const colValue = cx - 60;   // 数值列
    const colBtn = cx + 10;     // 按钮列

    // 基本信息
    const infoY = cy - 160;
    const info = [
      `名称: ${char.name}`,
      `职业: ${char.class === 'warrior' ? '战士' : '法师'}`,
      `等级: Lv.${char.level}`,
      `经验: ${char.experience}`,
    ];
    info.forEach((text, i) => {
      const label = this.scene.add.text(colLabel, infoY + i * 22, text, {
        fontSize: '12px', color: '#cccccc',
      });
      this.scrollContainer.add(label);
    });

    // 可分配点数（经验行右侧）
    this.pointsText = this.scene.add.text(colValue + 80, infoY + 3 * 22, `可用点数: ${char.attributePoints}`, {
      fontSize: '12px', color: '#ffdd44',
    });
    this.scrollContainer.add(this.pointsText);

    // 分隔线
    const div1 = this.scene.add.rectangle(cx, infoY + 4 * 22 + 6, 340, 1, 0x444466);
    this.scrollContainer.add(div1);

    // 基础属性（可分配）
    const baseStats = [
      { key: 'strength', label: '力量', stat: char.allocatedStats.strength },
      { key: 'intelligence', label: '智力', stat: char.allocatedStats.intelligence },
      { key: 'stamina', label: '体力', stat: char.allocatedStats.stamina },
      { key: 'spirit', label: '精神', stat: char.allocatedStats.spirit },
      { key: 'agility', label: '敏捷', stat: char.allocatedStats.agility },
    ];

    const statStartY = infoY + 4 * 22 + 20;
    for (let i = 0; i < baseStats.length; i++) {
      const s = baseStats[i];
      const y = statStartY + i * 26;

      const label = this.scene.add.text(colLabel, y, s.label, {
        fontSize: '12px', color: '#aaaacc',
      });
      this.scrollContainer.add(label);

      this.statTexts[s.key] = this.scene.add.text(colValue, y, `${s.stat}`, {
        fontSize: '12px', color: '#ffffff',
      });
      this.scrollContainer.add(this.statTexts[s.key]);

      // + 按钮（居中对齐）
      const addBtn = this.scene.add.rectangle(colBtn, y + 6, 20, 18, 0x335533);
      addBtn.setOrigin(0.5, 0.5);
      addBtn.setStrokeStyle(1, 0x55aa55);
      addBtn.setInteractive({ useHandCursor: true });
      addBtn.on('pointerdown', () => {
        this.allocatePoint(s.key);
      });
      this.scrollContainer.add(addBtn);

      const addText = this.scene.add.text(colBtn, y + 6, '+', {
        fontSize: '12px', color: '#88ff88',
      }).setOrigin(0.5, 0.5);
      this.scrollContainer.add(addText);
    }

    // 分隔线
    const div2Y = statStartY + baseStats.length * 26 + 6;
    const div2 = this.scene.add.rectangle(cx, div2Y, 340, 1, 0x444466);
    this.scrollContainer.add(div2);

    // 战斗属性（两列布局）
    const combatStats = [
      { label: '生命值', value: `${char.stats.hp}` },
      { label: '魔力值', value: `${char.stats.mp}` },
      { label: '物理攻击', value: `${char.stats.physicalAttack}` },
      { label: '魔法攻击', value: `${char.stats.magicAttack}` },
      { label: '物理防御', value: `${char.stats.physicalDefense}` },
      { label: '魔法防御', value: `${char.stats.magicDefense}` },
      { label: '暴击率', value: `${char.stats.criticalRate}%` },
      { label: '闪避率', value: `${char.stats.dodgeRate}%` },
      { label: '攻击速度', value: `${char.stats.attackSpeed}` },
    ];

    const combatStartY = div2Y + 16;
    const combatColL = cx - 170;  // 左列标签
    const combatValL = cx - 90;   // 左列数值
    const combatColR = cx + 10;   // 右列标签
    const combatValR = cx + 90;   // 右列数值

    for (let i = 0; i < combatStats.length; i++) {
      const s = combatStats[i];
      const row = Math.floor(i / 2);
      const isRight = i % 2 === 1;
      const y = combatStartY + row * 22;
      const labelX = isRight ? combatColR : combatColL;
      const valueX = isRight ? combatValR : combatValL;

      const label = this.scene.add.text(labelX, y, `${s.label}:`, {
        fontSize: '11px', color: '#8888aa',
      });
      this.scrollContainer.add(label);

      const value = this.scene.add.text(valueX, y, s.value, {
        fontSize: '11px', color: '#ffffff',
      });
      this.scrollContainer.add(value);
    }
  }

  private allocatePoint(stat: string): void {
    const char = gameState.getCharacter();
    if (char.attributePoints <= 0) return;

    if (allocateStat(char, stat as 'strength' | 'intelligence' | 'stamina' | 'spirit' | 'agility', 1)) {
      this.refreshStats();
    }
  }

  private refreshStats(): void {
    const char = gameState.getCharacter();
    this.statTexts.strength?.setText(`${char.allocatedStats.strength}`);
    this.statTexts.intelligence?.setText(`${char.allocatedStats.intelligence}`);
    this.statTexts.stamina?.setText(`${char.allocatedStats.stamina}`);
    this.statTexts.spirit?.setText(`${char.allocatedStats.spirit}`);
    this.statTexts.agility?.setText(`${char.allocatedStats.agility}`);
    this.pointsText?.setText(`可用点数: ${char.attributePoints}`);
  }

  show(): void {
    this.scrollY = 0;
    if (this.scrollContainer) this.scrollContainer.y = 0;
    this.refreshStats();
    super.show();
  }
}
