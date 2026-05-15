// 通用对象池 - 减少频繁创建/销毁对象的GC压力

export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /** 获取对象 */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /** 归还对象 */
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  /** 清空池 */
  clear(): void {
    this.pool = [];
  }

  /** 当前池大小 */
  get size(): number {
    return this.pool.length;
  }
}
