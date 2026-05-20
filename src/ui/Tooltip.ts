// 统一提示框 - 跟随鼠标显示装备/物品详情

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config';
import type { Equipment, Item } from '@/config/types';
import type { SkillData } from '@/data/skills';
import { gameState } from '@/state/GameState';

const RARITY_NAMES: Record<string, string> = {
  white: '普通', blue: '稀有', purple: '史诗', pink: '传说', orange: '远古',
};
const RARITY_COLORS: Record<string, string> = {
  white: '#cccccc', blue: '#4488ff', purple: '#aa44ff', pink: '#ff44aa', orange: '#ff8800',
};
const STAT_NAMES: Record<string, string> = {
  strength: '力量', intelligence: '智力', stamina: '体力',
  spirit: '精神',
  physicalAttack: '物攻', magicAttack: '魔攻',
  physicalDefense: '物防', magicDefense: '魔防',
  criticalRate: '暴击', criticalDamage: '暴伤',
  dodgeRate: '闪避', attackSpeed: '攻速', moveSpeed: '移速',
  castSpeed: '施法', hp: '生命', mp: '魔力',
};
const EFFECT_NAMES: Record<string, string> = {
  damage_reduction: '减伤', physicalAttack_percent: '物攻',
  knockback: '击退', maxHp_percent: '最大生命',
  taunt: '嘲讽', lifesteal_percent: '生命偷取',
  lowHp_attack_bonus: '低血量攻击加成', low_hp_damage_reduction: '低血量减伤',
  rage_crit_rate: '怒气暴击', criticalDamage_percent: '暴击伤害',
  bleed_chance: '流血几率', dodgeRate_percent: '闪避率',
  sword_damage_percent: '剑类伤害', attackSpeed_percent: '攻击速度',
  dodge_crit: '闪避暴击', true_damage_next_3: '真实伤害',
  moveSpeed_percent: '移动速度', maxHp: '最大生命',
  physicalAttack: '物理攻击', magicAttack: '魔法攻击',
  physicalDefense: '物理防御', magicDefense: '魔法防御',
  criticalRate: '暴击率', attackSpeed: '攻击速度',
  slow_percent: '减速效果', freeze_chance: '冰冻几率',
  freeze: '冰冻', burn: '灼烧', burn_on_hit: '攻击灼烧',
  chain_lightning_chance: '闪电链几率', chain_chance: '连锁几率',
  chain_count: '连锁数量', aoe_burn_chance: '范围灼烧',
  thunder_crit_rate: '雷电暴击', thunder_double_damage_chance: '雷电双倍伤害',
  ice_damage_percent: '冰系伤害', ice_cooldown_percent: '冰系冷却',
  fire_damage_percent: '火系伤害', magicDamage_percent: '魔法伤害',
  physicalDefense_percent: '物理防御', mp_regen_percent: '魔力回复',
  mp_shield_ratio: '魔力护盾', stun_chance: '眩晕几率',
  instant_kill_chance: '即死几率', on_kill_explode: '击杀爆炸',
  aura_slow: '光环减速', aura_thunder_damage: '光环雷电伤害',
  teleport: '传送', invincible: '无敌', freeze_all: '冰冻全体',
};
const SLOT_NAMES: Record<string, string> = {
  weapon: '武器', helmet: '头盔', armor: '胸甲', shield: '盾牌',
  belt: '腰带', boots: '鞋子', necklace: '项链',
  ring1: '戒指1', ring2: '戒指2',
  bracelet1: '手镯1', bracelet2: '手镯2', rune: '符文',
};
const WEAPON_TYPE_NAMES: Record<string, string> = {
  long_staff: '长杖', short_staff: '短杖', wand: '法杖',
  sword: '剑', blade: '刀', axe: '斧',
};

export class Tooltip {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private detailLines: Phaser.GameObjects.Text[] = [];
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

    // 名称文本（品质颜色）
    this.nameText = scene.add.text(8, 6, '', {
      fontSize: '12px',
      fontStyle: 'bold',
      lineSpacing: 4,
      wordWrap: { width: 220 },
    });
    this.container.add(this.nameText);

    // 跟随鼠标
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.setPosition(pointer.x, pointer.y);
    });
  }

  /** 清除详情行 */
  private clearDetailLines(): void {
    for (const line of this.detailLines) {
      line.destroy();
    }
    this.detailLines = [];
  }

  /** 添加详情行 */
  private addDetailLine(text: string, color: string = '#cccccc'): void {
    const line = this.scene.add.text(0, 0, text, {
      fontSize: '11px',
      color,
      wordWrap: { width: 220 },
    });
    this.detailLines.push(line);
    this.container.add(line);
  }

  /** 显示装备详情 */
  showEquipment(equip: Equipment, x: number, y: number): void {
    // 名称（品质颜色）
    const rarityColor = RARITY_COLORS[equip.rarity] ?? '#cccccc';
    this.nameText.setColor(rarityColor);
    this.nameText.setText(equip.name);

    // 清除旧的详情行
    this.clearDetailLines();

    // 检查角色等级是否满足需求
    const character = gameState.getCharacter();
    const meetsLevelReq = character ? character.level >= equip.requirement.level : true;

    // 稀有度
    const rarityName = RARITY_NAMES[equip.rarity] ?? equip.rarity;
    this.addDetailLine(rarityName);

    // 武器类型
    if (equip.slot === 'weapon') {
      const typeName = WEAPON_TYPE_NAMES[equip.type] ?? equip.type;
      this.addDetailLine(`类型: ${typeName}`);
      // 使用角色
      const warriorWeapons = ['sword', 'blade', 'axe'];
      const mageWeapons = ['long_staff', 'short_staff', 'wand'];
      if (warriorWeapons.includes(equip.type)) {
        this.addDetailLine('使用角色: 战士');
      } else if (mageWeapons.includes(equip.type)) {
        this.addDetailLine('使用角色: 法师');
      }
    }

    // 部位
    const slotName = SLOT_NAMES[equip.slot] ?? equip.slot;
    this.addDetailLine(`部位: ${slotName}`);

    // 属性加成
    if (equip.stats.length > 0) {
      for (const s of equip.stats) {
        const name = STAT_NAMES[s.stat] ?? s.stat;
        const sign = s.value > 0 ? '+' : '';
        const suffix = s.type === 'percent' ? '%' : '';
        this.addDetailLine(`${name} ${sign}${s.value}${suffix}`);
      }
    }

    // 等级需求（未满足时标红）
    this.addDetailLine(`需求: Lv.${equip.requirement.level}`, meetsLevelReq ? '#cccccc' : '#ff4444');

    // 耐久
    this.addDetailLine(`耐久: ${equip.durability}/${equip.maxDurability}`);

    // 强化等级
    if (equip.enhancementLevel > 0) {
      this.addDetailLine(`强化: +${equip.enhancementLevel}`);
    }

    // 特殊效果
    if (equip.specialEffect) {
      this.addDetailLine(`特效: ${equip.specialEffect}`);
    }

    // 套装效果
    if (equip.setBonus) {
      this.addDetailLine(`套装: ${equip.setBonus.setName}`);
      for (const effect of equip.setBonus.bonuses) {
        const effectTexts = effect.effects.map(e => {
          const name = STAT_NAMES[e.stat] ?? e.stat;
          const sign = e.value > 0 ? '+' : '';
          const suffix = e.type === 'percent' ? '%' : '';
          return `${name} ${sign}${e.value}${suffix}`;
        }).join(', ');
        this.addDetailLine(`  ${effect.requiredPieces}件: ${effectTexts}`);
      }
    }

    // 绑定
    if (equip.isBound) {
      this.addDetailLine('已绑定');
    }

    this.layoutTooltip(x, y);
  }

  /** 显示物品详情 */
  showItem(item: Item, count: number, x: number, y: number): void {
    this.nameText.setColor('#cccccc');
    this.nameText.setText(item.name);

    // 清除旧的详情行
    this.clearDetailLines();

    if (count > 1) this.addDetailLine(`数量: ${count}`);

    const typeNames: Record<string, string> = {
      equipment: '装备', consumable: '消耗品', material: '材料',
      quest: '任务物品', skillbook: '技能书', other: '其他',
    };
    this.addDetailLine(typeNames[item.type] ?? item.type);

    if (item.description) {
      this.addDetailLine('');
      this.addDetailLine(item.description);
    }

    if (item.isStackable) {
      this.addDetailLine(`最大堆叠: ${item.maxStack}`);
    }

    this.layoutTooltip(x, y);
  }

  /** 显示技能详情 */
  showSkill(skill: SkillData, x: number, y: number): void {
    this.nameText.setColor('#cccccc');
    this.nameText.setText(skill.name);

    // 清除旧的详情行
    this.clearDetailLines();

    const catNames: Record<string, string> = { active: '主动', passive: '被动', buff: '增益' };
    this.addDetailLine(`类型: ${catNames[skill.category] ?? skill.category}`);
    this.addDetailLine(`等级需求: Lv.${skill.unlockLevel}`);
    if (skill.manaCost) this.addDetailLine(`魔力消耗: ${skill.manaCost}`);
    if (skill.cooldown) this.addDetailLine(`冷却: ${skill.cooldown}秒`);
    if (skill.damage) {
      const dmgType = skill.damage.type === 'physical' ? '物理' : '魔法';
      this.addDetailLine(`${dmgType}伤害: ${skill.damage.baseValue}%`);
    }
    if (skill.effects) {
      for (const e of skill.effects) {
        const name = EFFECT_NAMES[e.type] ?? STAT_NAMES[e.type] ?? e.type;
        const durationText = e.duration > 0 ? ` (${e.duration}秒)` : '';
        this.addDetailLine(`效果: ${name} +${e.value}%${durationText}`);
      }
    }
    this.addDetailLine('');
    this.addDetailLine(skill.description);

    this.layoutTooltip(x, y);
  }

  /** 布局 tooltip：计算背景大小并定位 */
  private layoutTooltip(x: number, y: number): void {
    this.nameText.setFixedSize(0, 0);

    // 布局详情行
    const nameH = this.nameText.height;
    let currentY = 6 + nameH + 2;
    let maxWidth = this.nameText.width;

    for (const line of this.detailLines) {
      line.setPosition(8, currentY);
      currentY += line.height + 2;
      if (line.width > maxWidth) maxWidth = line.width;
    }

    // 自适应背景大小
    const w = maxWidth + 16;
    const h = 6 + nameH + 2 + (currentY - (6 + nameH + 2)) + 8;
    this.bg.setSize(w, h);

    this.setPosition(x, y);
    this.container.setVisible(true);
    this.visible = true;
  }

  private setPosition(x: number, y: number): void {
    const padding = 16;
    const w = this.bg.width;
    const h = this.bg.height;

    let tx = x + padding;
    let ty = y + padding;
    if (tx + w > CANVAS_WIDTH) tx = x - w - padding;
    if (ty + h > CANVAS_HEIGHT) ty = y - h - padding;

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
