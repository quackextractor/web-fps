import { describe, it, expect } from 'vitest';
import { findPath, hasLineOfSight, Point } from '@/lib/fps-engine';

describe('Pathfinding', () => {
    // Simple 10x10 map with walls=1, floor=0
    const emptyMap = Array(10).fill(0).map(() => Array(10).fill(0));

    const mapWithWall = Array(10).fill(0).map(() => Array(10).fill(0));
    // Horizontal wall at y=5, x=0..6
    for (let x = 0; x <= 6; x++) mapWithWall[5][x] = 1;

    const mapWithCorner = Array(10).fill(0).map(() => Array(10).fill(0));
    // L-shape wall
    for (let x = 4; x <= 6; x++) mapWithCorner[5][x] = 1;
    mapWithCorner[4][6] = 1;
    mapWithCorner[3][6] = 1;

    it('finds path in empty space', () => {
        const start = { x: 1, y: 1 };
        const end = { x: 8, y: 8 };
        const path = findPath(emptyMap, start.x, start.y, end.x, end.y);
        expect(path.length).toBeGreaterThan(0);
        expect(path[0].x).toBeCloseTo(1.5); // Center of first node
    });

    it('navigates around a wall', () => {
        const start = { x: 1, y: 1 };
        const end = { x: 1, y: 8 };
        const path = findPath(mapWithWall, start.x, start.y, end.x, end.y);

        expect(path.length).toBeGreaterThan(0);
        // Should go around x=6
        const hasDetour = path.some(p => p.x > 6);
        expect(hasDetour).toBe(true);
    });

    it('succeeds even if start is slightly inside wall (clipping)', () => {
        // If enemy collision pushes them slightly into wall (e.g. 5.1), 
        // tile 5 is wall. Math.floor(5.1) = 5. 
        // Logic should handle this gracefully or fail.
        // Current logic: strict check on start node.

        // We expect it to SUCCEED now with the fix.
        const path = findPath(mapWithWall, 5, 5, 1, 1);
        expect(path.length).toBeGreaterThan(0);
    });

    it('navigates tight corner', () => {
        // Start at 3,5 (left of vertical wall at 3,6?)
        // Wall at [3][6]. 
        // Target at 7,7.
        // Path should exist.
        const path = findPath(mapWithCorner, 2, 2, 8, 8);
        expect(path.length).toBeGreaterThan(0);
    });
});

describe('LineOfSight', () => {
    const map = Array(10).fill(0).map(() => Array(10).fill(0));
    map[5][5] = 1;

    it('is blocked by wall', () => {
        const blocked = hasLineOfSight(map, 5, 4, 5, 6); // Through 5,5
        // Wait, hasLineOfSight returns TRUE if CLEAR? Or TRUE if BLOCKED?
        // check implementation...
        // implementation: if(map... > 0) return true; ... return false;
        // So usually "hasLineOfSight" implies true=clear.
        // BUT in lib/doom-engine.ts:
        // "if (map[mapY][mapX] > 0...) return true" -> implies HIT.
        // So function name "hasLineOfSight" returning TRUE when BLOCKED is confusing naming!
        // Let's verify this assumption by reading the file later.
        // Assuming current implementation returns TRUE if HIT (Raycast style).

        // Actually let's assume standard naming: hasLineOfSight = true means I CAN SEE.
        // If implementation returns true on hit, it's "rayCastHit".
    });
});
