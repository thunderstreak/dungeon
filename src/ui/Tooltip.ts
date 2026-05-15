// 统一提示框 - 跟随鼠标显示装备/物品详情

import Phaser from 'phaser';
import type { Equipment, Item } from '@/config/types';
import type { SkillData } from '@/data/skills';

const RARITY_NAMES: Record<string, string> = {
  white: '普通', blue: '稀有', purple: '史诗', pink: '传说', orange: '远古',
};
const RARITY_COLORS: Record<string, string> = {
  white: '#cccccc', blue: '#4488ff', purple: '#aa44ff', pink: '#ff44aa', orange: '#ff8800',
};
const STAT_NAMES: Record<string, string> = {
  strength: '力量', intelligence: '智力', stamina: '体力',
  spirit: '精神', agility: '敏捷',
  physicalAttack: '物攻', magicAttack: '魔攻',
  physicalDefense: '物防', magicDefense: '魔防',
  criticalRate: '暴击', dodgeRate: '闪避',
  attackSpeed: '攻速', moveSpeed: '移速',
  hp: '生命', mp: '魔力',
};

export class Tooltip {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(8000);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // 背景（大小自适应）
    this.bg = scene.add.rectangle(0, 0, 10, 10, 0x0a0a18, 0.95);
    this.bg.setOrigin(0, 0);
    this.bg.setStrokeStyle(1, 0x444466);
    this.container.add(this.bg);

    // 文本
    this.text = scene.add.text(8, 6, '', {
      fontSize: '11px',
      color: '#cccccc',
      lineSpacing: 4,
      wordWrap: { width: 220 },
    });
    this.container.add(this.text);

    // 跟随鼠标
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.setPosition(pointer.x, pointer.y);
    });
  }

  /** 显示装备详情 */
  showEquipment(equip: Equipment, x: number, y: number): void {
    const lines: string[] = [];

    // 名称 + 稀有度
    const rarityColor = RARITY_COLORS[equip.rarity] ?? '#cccccc';
    const rarityName = RARITY_NAMES[equip.rarity] ?? equip.rarity;
    lines.push(`{color:${rarityColor}}${equip.name}{/color}`);
    lines.push(`${rarityName}  Lv.${equip.level}`);

    // 部位
    lines.push(`部位: ${equip.slot}`);

    // 属性加成
    if (equip.stats.length > 0) {
      for (const s of equip.stats) {
        const name = STAT_NAMES[s.stat] ?? s.stat;
        const sign = s.value > 0 ? '+' : '';
        lines.push(`${name} ${sign}${s.value}`);
      }
    }

    // 耐久
    lines.push(`耐久: ${equip.durability}/${equip.maxDurability}`);

    // 强化等级
    if (equip.enhancementLevel > 0) {
      lines.push(`强化: +${equip.enhancementLevel}`);
    }

    // 特殊效果
    if (equip.specialEffect) {
      lines.push(`特效: ${equip.specialEffect}`);
    }

    // 套装
    if (equip.setBonus) {
      lines.push(`套装: ${equip.setBonus.setName} (${equip.setBonus.pieces}件)`);
    }

    // 绑定
    if (equip.isBound) {
      lines.push('已绑定');
    }

    this.showText(lines.join('\n'), x, y);
  }

  /** 显示物品详情 */
  showItem(item: Item, count: number, x: number, y: number): void {
    const lines: string[] = [];

    lines.push(item.name);
    if (count > 1) lines.push(`数量: ${count}`);

    // 物品类型
    const typeNames: Record<string, string> = {
      equipment: '装备', consumable: '消耗品', material: '材料',
      quest: '任务物品', skillbook: '技能书', other: '其他',
    };
    lines.push(typeNames[item.type] ?? item.type);

    // 描述
    if (item.description) {
      lines.push('');
      lines.push(item.description);
    }

    // 可堆叠
    if (item.isStackable) {
      lines.push(`最大堆叠: ${item.maxStack}`);
    }

    this.showText(lines.join('\n'), x, y);
  }

  /** 显示技能详情 */
  showSkill(skill: SkillData, x: number, y: number): void {
    const lines: string[] = [];
    const catNames: Record<string, string> = { active: '主动', passive: '被动', buff: '增益' };
    lines.push(skill.name);
    lines.push(`类型: ${catNames[skill.category] ?? skill.category}`);
    lines.push(`等级需求: Lv.${skill.unlockLevel}`);
    if (skill.manaCost) lines.push(`魔力消耗: ${skill.manaCost}`);
    if (skill.cooldown) lines.push(`冷却: ${skill.cooldown}秒`);
    if (skill.damage) {
      const dmgType = skill.damage.type === 'physical' ? '物理' : '魔法';
      lines.push(`${dmgType}伤害: ${skill.damage.baseValue}%`);
    }
    if (skill.effects) {
      for (const e of skill.effects) {
        lines.push(`效果: +${e.value}% ${e.type} (${e.duration}秒)`);
      }
    }
    lines.push('');
    lines.push(skill.description);
    this.showText(lines.join('\n'), x, y);
  }

  private showText(content: string, x: number, y: number): void {
    this.text.setText(content);
    this.text.setFixedSize(0, 0);

    // 自适应背景大小
    const w = this.text.width + 16;
    const h = this.text.height + 12;
    this.bg.setSize(w, h);

    this.setPosition(x, y);
    this.container.setVisible(true);
    this.visible = true;
  }

  private setPosition(x: number, y: number): void {
    const padding = 16;
    const w = this.bg.width;
    const h = this.bg.height;

    // 防止超出画布
    let tx = x + padding;
    let ty = y + padding;
    if (tx + w > 960) tx = x - w - padding;
    if (ty + h > 640) ty = y - h - padding;

    this.container.setPosition(tx, ty);
  }

  hide(): void {
    this.container.setVisible(false);
    this.visible = false;
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
