// 随机数工具函数

/** 返回 [min, max] 之间的随机整数 (包含两端) */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 返回 [min, max) 之间的随机浮点数 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** 按概率返回 true */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}

/** 从数组中随机选取一个元素 */
export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/** 从数组中随机选取 N 个不重复元素 */
export function pickRandomN<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** 洗牌 (Fisher-Yates) */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 按权重随机选取 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}
