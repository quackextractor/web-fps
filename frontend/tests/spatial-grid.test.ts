import { describe, it, expect } from 'vitest';
import { SpatialGrid } from '../lib/enemy-ai';
import { Enemy, EnemyType } from '../lib/fps-engine';
import { GAME_CONFIG } from '../lib/game-config';

describe('SpatialGrid', () => {
    const cellSize = GAME_CONFIG.AI.SPATIAL_GRID_SIZE; // 5
    const grid = new SpatialGrid(cellSize);

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
        const e1 = createEnemy(1, 1.5, 1.5); // Cell 0,0
        const e2 = createEnemy(2, 6.5, 6.5); // Cell 1,1
        const e3 = createEnemy(3, 10.5, 10.5); // Cell 2,2

        grid.update([e1, e2, e3]);

        // Search near 1,1 (cell 0,0)
        // e2 is in cell 1,1 which IS a neighbor, so it will be included in broadphase
        const nearby1 = grid.getNearby(1, 1);
        expect(nearby1).toContain(e1);
        expect(nearby1).toContain(e2);
        expect(nearby1).not.toContain(e3);

        // Search near 4,4 (cell 0,0)
        // Should find e1 (0,0) and e2 (1,1)
        const nearby2 = grid.getNearby(4, 4);
        expect(nearby2).toContain(e1);
        expect(nearby2).toContain(e2);
        expect(nearby2).not.toContain(e3);
    });

    it('handles no enemies', () => {
        grid.update([]);
        expect(grid.getNearby(0, 0)).toEqual([]);
    });

    it('ignores dead enemies', () => {
        grid.clear();
        const e1 = createEnemy(1, 1, 1);
        const e2 = createEnemy(2, 1, 1);
        e2.state = 'dead';

        grid.update([e1, e2]);
        const nearby = grid.getNearby(1, 1);
        expect(nearby).toContain(e1);
        expect(nearby).not.toContain(e2);
    });
});
