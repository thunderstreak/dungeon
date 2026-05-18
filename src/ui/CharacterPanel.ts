// 角色属性面板 - 显示角色属性、战斗属性、属性点分配（支持滚动）

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import { BasePanel } from './BasePanel';
import { gameState } from '@/state/GameState';
import { allocateStat, recalculateStats } from '@/systems/LevelSystem';
import { recalculateEquipmentStats } from '@/systems/EquipmentSystem';

export class CharacterPanel extends BasePanel {
  private statTexts: Record<string, Phaser.GameObjects.Text> = {};
  private combatValueTexts: Record<string, Phaser.GameObjects.Text> = {};
  private combatBonusTexts: Record<string, Phaser.GameObjects.Text> = {};
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

    // 计算滚动范围
    this.contentTop = cy - 160;
    this.contentBottom = cy + 260;
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

    // 基础属性（职业基础 + 分配点数）
    const baseStats = [
      { key: 'strength', label: '力量', stat: char.stats.strength },
      { key: 'intelligence', label: '智力', stat: char.stats.intelligence },
      { key: 'stamina', label: '体力', stat: char.stats.stamina },
      { key: 'spirit', label: '精神', stat: char.stats.spirit },
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

    // 战斗属性（两列布局）- 基础值 + 装备加成
    // baseline: 有基准值的属性，为0表示不隐藏基准
    const combatStats = [
      { key: 'maxHp', label: '生命值', baseValue: char.stats.maxHp, baseline: 0 },
      { key: 'maxMp', label: '魔力值', baseValue: char.stats.maxMp, baseline: 0 },
      { key: 'physicalAttack', label: '物理攻击', baseValue: char.stats.physicalAttack, baseline: 0 },
      { key: 'magicAttack', label: '魔法攻击', baseValue: char.stats.magicAttack, baseline: 0 },
      { key: 'physicalDefense', label: '物理防御', baseValue: char.stats.physicalDefense, baseline: 0 },
      { key: 'magicDefense', label: '魔法防御', baseValue: char.stats.magicDefense, baseline: 0 },
      { key: 'criticalRate', label: '暴击率', baseValue: char.stats.criticalRate, suffix: '%', baseline: 0 },
      { key: 'criticalDamage', label: '暴伤', baseValue: char.stats.criticalDamage, suffix: '%', baseline: 150 },
      { key: 'dodgeRate', label: '闪避率', baseValue: char.stats.dodgeRate, suffix: '%', baseline: 0 },
      { key: 'attackSpeed', label: '攻速', baseValue: char.stats.attackSpeed, baseline: 100 },
      { key: 'castSpeed', label: '施法', baseValue: char.stats.castSpeed, baseline: 100 },
      { key: 'moveSpeed', label: '移速', baseValue: char.stats.moveSpeed, baseline: 100 },
    ];

    const combatStartY = div2Y + 16;
    const combatColL = cx - 170;  // 左列标签
    const combatValL = cx - 90;   // 左列数值
    const combatColR = cx + 10;   // 右列标签
    const combatValR = cx + 90;   // 右列数值

    let rowIdx = 0;
    for (const s of combatStats) {
      const isRight = rowIdx % 2 === 1;
      const y = combatStartY + Math.floor(rowIdx / 2) * 22;
      const labelX = isRight ? combatColR : combatColL;
      const valueX = isRight ? combatValR : combatValL;

      const label = this.scene.add.text(labelX, y, `${s.label}:`, {
        fontSize: '11px', color: '#8888aa',
      });
      this.scrollContainer.add(label);

      // 基准值：有基准的属性默认不显示具体数值，只显示加成
      const suffix = (s as any).suffix ?? '';
      const hasBaseline = (s as any).baseline > 0;
      const value = this.scene.add.text(valueX, y, hasBaseline ? '' : `${Math.floor(s.baseValue)}${suffix}`, {
        fontSize: '11px', color: '#ffffff',
      });
      this.scrollContainer.add(value);
      this.combatValueTexts[s.key] = value;

      // 装备加成文本（绿色/红色）
      const bonus = this.scene.add.text(valueX + 60, y, '', {
        fontSize: '10px', color: '#88ff88',
      });
      this.scrollContainer.add(bonus);
      this.combatBonusTexts[s.key] = bonus;

      rowIdx++;
    }
  }

  /** 计算无装备时的基础属性 */
  private calcBaseStatsWithoutEquipment(): void {
    const char = gameState.getCharacter();
    if (!char) return;

    // 先重置为基础值（不含装备）
    recalculateStats(char);
  }

  private allocatePoint(stat: string): void {
    const char = gameState.getCharacter();
    if (char.attributePoints <= 0) return;

    if (allocateStat(char, stat as 'strength' | 'intelligence' | 'stamina' | 'spirit', 1)) {
      // allocateStat 只调用了 recalculateStats，需要重新叠加装备属性
      recalculateEquipmentStats(char);
      this.refreshStats();
    }
  }

  refreshStats(): void {
    const char = gameState.getCharacter();
    if (!char) return;

    // 更新属性点（职业基础 + 分配点数）
    this.statTexts.strength?.setText(`${char.stats.strength}`);
    this.statTexts.intelligence?.setText(`${char.stats.intelligence}`);
    this.statTexts.stamina?.setText(`${char.stats.stamina}`);
    this.statTexts.spirit?.setText(`${char.stats.spirit}`);
    this.pointsText?.setText(`可用点数: ${char.attributePoints}`);

    // 保存当前完整属性（含装备）
    const finalStats = { ...char.stats };

    // 重置为基础值（不含装备）
    recalculateStats(char);
    const baseStats = { ...char.stats };

    // 恢复完整属性
    Object.assign(char.stats, finalStats);

    // 更新战斗属性和装备加成
    const statKeys = ['maxHp', 'maxMp', 'physicalAttack', 'magicAttack', 'physicalDefense', 'magicDefense',
      'criticalRate', 'criticalDamage', 'dodgeRate', 'attackSpeed', 'castSpeed', 'moveSpeed'] as const;

    // 只显示加成的属性：有基准值，低于等于基准不显示加成
    const showBonusOnly = new Set(['criticalDamage', 'attackSpeed', 'castSpeed', 'moveSpeed']);

    for (const key of statKeys) {
      const valueText = this.combatValueTexts[key];
      const bonusText = this.combatBonusTexts[key];
      if (!valueText || !bonusText) continue;

      const final = finalStats[key];
      const base = baseStats[key];
      const equipDiff = final - base; // 装备带来的实际加成

      bonusText.setText('');

      if (showBonusOnly.has(key)) {
        // 只显示装备加成，无加成时显示0
        if (equipDiff > 0) {
          const suffix = (key === 'maxHp' || key === 'maxMp') ? '' : '%';
          valueText.setText(`+${Math.floor(equipDiff)}${suffix}`);
          valueText.setColor('#88ff88');
        } else {
          valueText.setText('0');
          valueText.setColor('#ffffff');
        }
      } else {
        // 显示最终值（含基准），有加成时绿色
        const isPercent = key === 'criticalRate' || key === 'dodgeRate';
        const suffix = isPercent ? '%' : '';
        valueText.setText(`${Math.floor(final)}${suffix}`);
        valueText.setColor(Math.abs(equipDiff) > 0.01 ? '#88ff88' : '#ffffff');
      }
    }
  }

  show(): void {
    this.scrollY = 0;
    if (this.scrollContainer) this.scrollContainer.y = 0;
    // 确保属性已计算
    const char = gameState.getCharacter();
    if (char) {
      recalculateStats(char);
      recalculateEquipmentStats(char);
    }
    this.refreshStats();
    super.show();
  }
}
