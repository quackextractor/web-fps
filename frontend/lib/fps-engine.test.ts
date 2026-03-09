import { describe, it, expect } from 'vitest';
import { ENEMY_CONFIG, EnemyType } from './fps-engine';

describe('FPS Engine Configuration', () => {
  it('should have reward values configured for all enemy types', () => {
    Object.values(EnemyType)
      .filter((v): v is EnemyType => typeof v === 'number')
      .forEach((type) => {
        const config = ENEMY_CONFIG[type];
        expect(config).toBeDefined();
        expect(config.reward).toBeDefined();
        expect(typeof config.reward).toBe('number');
        expect(config.reward).toBeGreaterThan(0);
      });
  });

  it('should assign higher rewards to stronger enemies', () => {
    // Example check: Cyberdemon (boss) > Imp (basic)
    expect(ENEMY_CONFIG[EnemyType.CYBERDEMON].reward).toBeGreaterThan(ENEMY_CONFIG[EnemyType.IMP].reward);
    expect(ENEMY_CONFIG[EnemyType.BARON].reward).toBeGreaterThan(ENEMY_CONFIG[EnemyType.IMP].reward);
  });
});
