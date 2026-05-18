// 角色职业与转职数据

import type { CharacterClass, Specialization } from '@/config/types';

/** 职业基础属性 */
export interface ClassBaseStats {
  strength: number;
  intelligence: number;
  stamina: number;
  spirit: number;
}

/** 职业数据 */
export interface ClassData {
  id: CharacterClass;
  name: string;
  description: string;
  baseStats: ClassBaseStats;
  specializations: Specialization[];
}

/** 转职方向数据 */
export interface SpecializationData {
  id: Specialization;
  name: string;
  className: CharacterClass;
  description: string;
  playstyle: string;
}

// ==================== 职业数据 ====================

export const CLASSES: Record<CharacterClass, ClassData> = {
  warrior: {
    id: 'warrior',
    name: '战士',
    description: '近战物理职业，拥有高生命值和防御力',
    baseStats: {
      strength: 15,
      intelligence: 5,
      stamina: 12,
      spirit: 5,
    },
    specializations: ['berserker', 'swordsman', 'blademaster'],
  },
  mage: {
    id: 'mage',
    name: '法师',
    description: '远程魔法职业，拥有高魔法攻击和魔法值',
    baseStats: {
      strength: 5,
      intelligence: 15,
      stamina: 8,
      spirit: 12,
    },
    specializations: ['ice_mage', 'thunder_mage', 'fire_mage'],
  },
};

// ==================== 转职方向数据 ====================

export const SPECIALIZATIONS: Record<Specialization, SpecializationData> = {
  // 战士转职
  berserker: {
    id: 'berserker',
    name: '狂战士',
    className: 'warrior',
    description: '牺牲防御换取极致攻击力的力量型战士',
    playstyle: '高风险高回报，生命值越低攻击力越高',
  },
  swordsman: {
    id: 'swordsman',
    name: '剑士',
    className: 'warrior',
    description: '攻守兼备的均衡型战士',
    playstyle: '稳定输出，兼具伤害和生存能力',
  },
  blademaster: {
    id: 'blademaster',
    name: '刀客',
    className: 'warrior',
    description: '以速度见长的敏捷型战士',
    playstyle: '高攻速高暴击，擅长连击和闪避',
  },
  // 法师转职
  ice_mage: {
    id: 'ice_mage',
    name: '冰法',
    className: 'mage',
    description: '擅长控制和减速的冰系法师',
    playstyle: '控制战场，冻结和减速敌人',
  },
  thunder_mage: {
    id: 'thunder_mage',
    name: '雷法',
    className: 'mage',
    description: '拥有极高爆发伤害的雷系法师',
    playstyle: '瞬间高伤害，暴击和连锁闪电',
  },
  fire_mage: {
    id: 'fire_mage',
    name: '火法',
    className: 'mage',
    description: '擅长范围伤害的火系法师',
    playstyle: '大范围AOE，持续灼烧敌人',
  },
};
