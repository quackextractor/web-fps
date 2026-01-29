import { describe, it, expect } from 'vitest';
import { SpatialGrid } from '../lib/enemy-ai';
import { Enemy, EnemyType } from '../lib/fps-engine';
import { GAME_CONFIG } from '../lib/game-config';

describe('SpatialGrid', () => {
    const cellSize = GAME_CONFIG.AI.SPATIAL_GRID_SIZE; // Should be 2 or similar
    const grid = new SpatialGrid(cellSize); // 2

    const createEnemy = (id: number, x: number, y: number): Enemy => ({
        id,
        type: EnemyType.IMP,
        x,
        y,
        state: 'idle',
        health: 100,
        maxHealth: 100,
        damage: 10,
        speed: 1,
        path: [],
        lastPathTime: 0,
        lastAttack: 0,
        animFrame: 0,
        sightRange: 10,
        attackRange: 5,
        meleeRange: 1,
        attackCooldown: 1000,
        isMelee: false,
        stuckFrameCount: 0,
        lastX: x,
        lastY: y,
    });

    it('adds and retrieves enemies', () => {
        grid.clear();
        const e1 = createEnemy(1, 1.5, 1.5); // Cell 0,0 (if size=2)
        const e2 = createEnemy(2, 6.5, 6.5); // Cell 1,1 (since size=5)
        const e3 = createEnemy(3, 10.5, 10.5); // Cell 5,5

        grid.update([e1, e2, e3]);

        // Search near 1,1 radius 1 (should find e1)
        const nearby1 = grid.getNearby(1, 1, 1);
        expect(nearby1).toContain(e1);
        expect(nearby1).not.toContain(e2);

        // Search near 4,4 radius 2 (should find e1 and e2)
        // 4,4 radius 2 covers [2, 6], crossing cell boundary at 5.
        const nearby2 = grid.getNearby(4, 4, 2);
        expect(nearby2).toContain(e1);
        expect(nearby2).toContain(e2);
        expect(nearby2).not.toContain(e3);
    });

    it('handles no enemies', () => {
        grid.update([]);
        expect(grid.getNearby(0, 0, 10)).toEqual([]);
    });

    it('ignores dead enemies', () => {
        grid.clear();
        const e1 = createEnemy(1, 1, 1);
        const e2 = createEnemy(2, 1, 1);
        e2.state = 'dead';

        grid.update([e1, e2]);
        const nearby = grid.getNearby(1, 1, 1);
        expect(nearby).toContain(e1);
        expect(nearby).not.toContain(e2);
    });
});
