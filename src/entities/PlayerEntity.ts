// 玩家实体 - 蓝色矩形 + 右键点击移动 + WASD备用

import Phaser from 'phaser';

export class PlayerEntity {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  private speed = 200;
  private moveTarget: { x: number; y: number } | null = null;
  private moveThreshold = 8; // 到达目标的容差距离

  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    this.container = scene.add.container(x, y);
    this.container.setDepth(10);

    // 玩家身体
    this.body = scene.add.rectangle(0, 0, 32, 40, 0x4488ff, 0.9)
      .setStrokeStyle(2, 0x66aaff);
    this.container.add(this.body);

    // 名字
    this.nameText = scene.add.text(0, -28, name, {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 启用物理
    scene.physics.add.existing(this.container);
    const physBody = this.container.body as Phaser.Physics.Arcade.Body;
    physBody.setSize(32, 40);
    physBody.setCollideWorldBounds(true);
  }

  /** 设置右键移动目标 */
  moveTo(targetX: number, targetY: number): void {
    this.moveTarget = { x: targetX, y: targetY };
  }

  /** 取消移动 */
  stopMoving(): void {
    this.moveTarget = null;
    const physBody = this.container.body as Phaser.Physics.Arcade.Body;
    physBody.setVelocity(0, 0);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: Record<string, Phaser.Input.Keyboard.Key>): void {
    const physBody = this.container.body as Phaser.Physics.Arcade.Body;

    // 优先使用 WASD/方向键（如果按下）
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || wasd.A?.isDown) vx = -this.speed;
    else if (cursors.right.isDown || wasd.D?.isDown) vx = this.speed;

    if (cursors.up.isDown || wasd.W?.isDown) vy = -this.speed;
    else if (cursors.down.isDown || wasd.S?.isDown) vy = this.speed;

    // 如果有键盘输入，清除点击移动目标
    if (vx !== 0 || vy !== 0) {
      this.moveTarget = null;
      if (vx !== 0 && vy !== 0) {
        const norm = 1 / Math.SQRT2;
        vx *= norm;
        vy *= norm;
      }
      physBody.setVelocity(vx, vy);
      return;
    }

    // 否则使用点击移动
    if (this.moveTarget) {
      const dist = Phaser.Math.Distance.Between(
        this.container.x, this.container.y,
        this.moveTarget.x, this.moveTarget.y,
      );

      if (dist < this.moveThreshold) {
        // 到达目标
        this.moveTarget = null;
        physBody.setVelocity(0, 0);
      } else {
        // 向目标移动
        const angle = Phaser.Math.Angle.Between(
          this.container.x, this.container.y,
          this.moveTarget.x, this.moveTarget.y,
        );
        physBody.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed,
        );
      }
    } else {
      physBody.setVelocity(0, 0);
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y };
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
