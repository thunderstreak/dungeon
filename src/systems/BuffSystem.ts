// Buff/Debuff系统 - 状态效果管理、叠加、免疫

import type { DebuffType } from '@/config/types';

// ==================== 状态效果定义 ====================

export type BuffType = 'buff' | 'debuff';

export interface ActiveBuff {
  id: string;
  name: string;
  type: BuffType;
  debuffType?: DebuffType;
  duration: number;       // 剩余持续时间(秒)
  maxDuration: number;    // 最大持续时间
  value: number;          // 效果值
  stackCount: number;     // 当前叠加层数
  maxStack: number;       // 最大叠加层数
  source: string;         // 来源ID
  icon: string;
}

// ==================== 减益效果定义 ====================

/** 减益效果配置 */
export interface DebuffConfig {
  type: DebuffType;
  name: string;
  description: string;
  stackable: boolean;
  maxStack: number;
  defaultDuration: number;
  tickInterval: number;  // 每秒触发次数 (0=不持续)
  icon: string;
}

/** 所有减益效果配置 */
export const DEBUFF_CONFIGS: Record<DebuffType, DebuffConfig> = {
  poison: {
    type: 'poison', name: '中毒', description: '每秒损失最大HP的2%~5%',
    stackable: true, maxStack: 5, defaultDuration: 5, tickInterval: 1, icon: 'debuff_poison',
  },
  freeze: {
    type: 'freeze', name: '冰冻', description: '无法移动和攻击',
    stackable: false, maxStack: 1, defaultDuration: 2, tickInterval: 0, icon: 'debuff_freeze',
  },
  stun: {
    type: 'stun', name: '眩晕', description: '无法行动',
    stackable: false, maxStack: 1, defaultDuration: 1.5, tickInterval: 0, icon: 'debuff_stun',
  },
  knockback: {
    type: 'knockback', name: '击退', description: '强制向后位移',
    stackable: false, maxStack: 1, defaultDuration: 0, tickInterval: 0, icon: 'debuff_knockback',
  },
  slow: {
    type: 'slow', name: '减速', description: '移动速度降低30%~50%',
    stackable: true, maxStack: 3, defaultDuration: 5, tickInterval: 0, icon: 'debuff_slow',
  },
  curse: {
    type: 'curse', name: '诅咒', description: '物理/魔法攻击降低15%~25%',
    stackable: true, maxStack: 3, defaultDuration: 8, tickInterval: 0, icon: 'debuff_curse',
  },
  taunt: {
    type: 'taunt', name: '嘲讽', description: '强制攻击施法者',
    stackable: false, maxStack: 1, defaultDuration: 3, tickInterval: 0, icon: 'debuff_taunt',
  },
  silence: {
    type: 'silence', name: '沉默', description: '无法使用技能',
    stackable: false, maxStack: 1, defaultDuration: 5, tickInterval: 0, icon: 'debuff_silence',
  },
  bleed: {
    type: 'bleed', name: '流血', description: '每秒损失当前HP的1%~3%',
    stackable: true, maxStack: 5, defaultDuration: 5, tickInterval: 1, icon: 'debuff_bleed',
  },
  burn: {
    type: 'burn', name: '灼烧', description: '每秒损失最大HP的3%~6%',
    stackable: true, maxStack: 3, defaultDuration: 3, tickInterval: 1, icon: 'debuff_burn',
  },
  paralyze: {
    type: 'paralyze', name: '麻痹', description: '攻击速度降低30%~50%',
    stackable: false, maxStack: 1, defaultDuration: 3, tickInterval: 0, icon: 'debuff_paralyze',
  },
};

// ==================== Buff管理 ====================

/** 管理实体的Buff状态 */
export class BuffManager {
  private buffs: ActiveBuff[] = [];
  private immunities: Set<DebuffType> = new Set();

  /** 添加Buff/Debuff */
  addBuff(buff: Omit<ActiveBuff, 'stackCount'>): boolean {
    // 检查免疫
    if (buff.type === 'debuff' && buff.debuffType && this.immunities.has(buff.debuffType)) {
      return false;
    }

    // 检查是否已有同类buff
    const existing = this.buffs.find(b => b.id === buff.id);
    if (existing) {
      const config = buff.debuffType ? DEBUFF_CONFIGS[buff.debuffType] : null;

      if (config?.stackable && existing.stackCount < config.maxStack) {
        // 叠加
        existing.stackCount++;
        existing.duration = buff.maxDuration; // 刷新持续时间
        return true;
      }

      // 不可叠加，刷新持续时间
      existing.duration = Math.max(existing.duration, buff.maxDuration);
      existing.value = Math.max(existing.value, buff.value);
      return true;
    }

    // 新buff
    this.buffs.push({ ...buff, stackCount: 1 });
    return true;
  }

  /** 移除Buff */
  removeBuff(buffId: string): boolean {
    const index = this.buffs.findIndex(b => b.id === buffId);
    if (index === -1) return false;
    this.buffs.splice(index, 1);
    return true;
  }

  /** 按类型移除Debuff */
  removeDebuffByType(debuffType: DebuffType): void {
    this.buffs = this.buffs.filter(b => b.debuffType !== debuffType);
  }

  /** 清除所有Debuff */
  clearAllDebuffs(): void {
    this.buffs = this.buffs.filter(b => b.type === 'buff');
  }

  /** 清除所有Buff */
  clearAllBuffs(): void {
    this.buffs = this.buffs.filter(b => b.type === 'debuff');
  }

  /** 检查是否有某个Debuff */
  hasDebuff(debuffType: DebuffType): boolean {
    return this.buffs.some(b => b.type === 'debuff' && b.debuffType === debuffType);
  }

  /** 获取某个Debuff的叠加层数 */
  getDebuffStacks(debuffType: DebuffType): number {
    return this.buffs
      .filter(b => b.type === 'debuff' && b.debuffType === debuffType)
      .reduce((sum, b) => sum + b.stackCount, 0);
  }

  /** 获取所有活跃的Buff */
  getActiveBuffs(): ActiveBuff[] {
    return [...this.buffs];
  }

  /** 获取所有Debuff */
  getActiveDebuffs(): ActiveBuff[] {
    return this.buffs.filter(b => b.type === 'debuff');
  }

  /** 设置免疫 */
  setImmunity(debuffType: DebuffType, immune: boolean): void {
    if (immune) {
      this.immunities.add(debuffType);
    } else {
      this.immunities.delete(debuffType);
    }
  }

  /** 检查是否免疫某个Debuff */
  isImmune(debuffType: DebuffType): boolean {
    return this.immunities.has(debuffType);
  }

  /** 更新所有Buff持续时间 (每秒调用) */
  update(deltaSeconds: number): ActiveBuff[] {
    const expired: ActiveBuff[] = [];

    this.buffs = this.buffs.filter(buff => {
      buff.duration -= deltaSeconds;
      if (buff.duration <= 0) {
        expired.push(buff);
        return false;
      }
      return true;
    });

    return expired;
  }

  /** 获取减速效果总值 (叠加) */
  getSlowAmount(): number {
    const stacks = this.getDebuffStacks('slow');
    // 每层-15%，最多3层=-45%
    return Math.min(stacks * 15, 45);
  }

  /** 获取诅咒减攻效果 */
  getCurseAttackReduction(): number {
    const stacks = this.getDebuffStacks('curse');
    // 每层-8%，最多3层=-24%
    return Math.min(stacks * 8, 24);
  }

  /** 获取麻痹减速效果 */
  getParalyzeSlowAmount(): number {
    return this.hasDebuff('paralyze') ? 40 : 0;
  }
}

// ==================== 持续伤害计算 ====================

/** 计算中毒每秒伤害 (最大HP × 层数 × 2%) */
export function calcPoisonDamage(maxHp: number, stacks: number): number {
  return Math.floor(maxHp * stacks * 0.02);
}

/** 计算流血每秒伤害 (当前HP × 层数 × 1%) */
export function calcBleedDamage(currentHp: number, stacks: number): number {
  return Math.floor(currentHp * stacks * 0.01);
}

/** 计算灼烧每秒伤害 (最大HP × 层数 × 3%) */
export function calcBurnDamage(maxHp: number, stacks: number): number {
  return Math.floor(maxHp * stacks * 0.03);
}
