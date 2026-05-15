import Phaser from 'phaser';

export type AttackAnimationActor = 'player' | 'monster' | 'boss';

export interface AttackAnimationConfig {
  windupDuration: number;
  strikeDuration: number;
  recoverDuration: number;
  lungeDistance: number;
  scaleBoost: number;
}

const ATTACK_ANIMATION_CONFIG: Record<AttackAnimationActor, AttackAnimationConfig> = {
  player: {
    windupDuration: 60,
    strikeDuration: 70,
    recoverDuration: 90,
    lungeDistance: 10,
    scaleBoost: 0.08,
  },
  monster: {
    windupDuration: 70,
    strikeDuration: 75,
    recoverDuration: 95,
    lungeDistance: 8,
    scaleBoost: 0.06,
  },
  boss: {
    windupDuration: 90,
    strikeDuration: 90,
    recoverDuration: 120,
    lungeDistance: 14,
    scaleBoost: 0.12,
  },
};

export function getAttackAnimationConfig(actor: AttackAnimationActor): AttackAnimationConfig {
  return ATTACK_ANIMATION_CONFIG[actor];
}

export function playAttackAnimation(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  actor: AttackAnimationActor,
  direction: { x: number; y: number },
  onStrike?: () => void,
): void {
  const config = getAttackAnimationConfig(actor);
  const originX = container.x;
  const originY = container.y;
  const lungeX = originX + direction.x * config.lungeDistance;
  const lungeY = originY + direction.y * config.lungeDistance;

  scene.tweens.killTweensOf(container);
  container.setScale(1);

  scene.tweens.add({
    targets: container,
    x: originX - direction.x * (config.lungeDistance * 0.35),
    y: originY - direction.y * (config.lungeDistance * 0.35),
    scaleX: 1 - config.scaleBoost * 0.5,
    scaleY: 1 - config.scaleBoost * 0.5,
    duration: config.windupDuration,
    onComplete: () => {
      scene.tweens.add({
        targets: container,
        x: lungeX,
        y: lungeY,
        scaleX: 1 + config.scaleBoost,
        scaleY: 1 + config.scaleBoost,
        duration: config.strikeDuration,
        onStart: () => onStrike?.(),
        onComplete: () => {
          scene.tweens.add({
            targets: container,
            x: originX,
            y: originY,
            scaleX: 1,
            scaleY: 1,
            duration: config.recoverDuration,
          });
        },
      });
    },
  });
}
