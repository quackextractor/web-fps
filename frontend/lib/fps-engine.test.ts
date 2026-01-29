
import { describe, it, expect } from 'vitest';
import { getDistance, normalizeAngle, checkCollision, hasLineOfSight } from './fps-engine';

describe('Doom Engine Utils', () => {
    describe('getDistance', () => {
        it('calculates distance correctly', () => {
            expect(getDistance(0, 0, 3, 4)).toBe(5);
            expect(getDistance(1, 1, 1, 1)).toBe(0);
        });
    });

    describe('normalizeAngle', () => {
        it('normalizes angle to -PI to PI', () => {
            expect(normalizeAngle(Math.PI)).toBe(Math.PI);
            expect(normalizeAngle(-Math.PI)).toBe(-Math.PI); // Actually implementation might shift -PI to PI
            expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(-Math.PI);
            expect(normalizeAngle(0)).toBe(0);
        });
    });

    describe('checkCollision', () => {
        const map = [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ];

        it('detects collision with wall', () => {
            expect(checkCollision(map, 0.5, 0.5)).toBe(true);
        });

        it('detects no collision in empty space', () => {
            expect(checkCollision(map, 1.5, 1.5)).toBe(false);
        });

        it('detects collision with radius', () => {
            // 1.5, 1.1 is close to wall at 1.5, 0 (y=0) if radius > 0.1
            expect(checkCollision(map, 1.5, 1.1, 0.2)).toBe(true);
        });
    });

    describe('hasLineOfSight', () => {
        const map = [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1], // Wall in middle
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1],
        ];

        it('has line of sight in empty straight line', () => {
            expect(hasLineOfSight(map, 1.5, 1.5, 3.5, 1.5)).toBe(true);
        });

        it('blocked by wall', () => {
            // From (1.5, 1.5) to (1.5, 3.5) crossing (1.5, 2.5) which is a wall [2][1] -> 0 (Wait, map[2][1] is 0 in my example? No wait)
            // map[2][1] is 0?
            // map[0] = 1,1,1,1,1
            // map[1] = 1,0,0,0,1
            // map[2] = 1,0,1,0,1 -> middle is 1! Index 2 is 1. (1,0,1,0,1) -> 0,1,2,3,4
            // map[2][2] is 1.
            // So checking (1.5, 1.5) to (3.5, 3.5) crossing (2.5, 2.5) which is inside map[2][2]
            expect(hasLineOfSight(map, 1.5, 1.5, 3.5, 3.5)).toBe(false);
        });
    });
});
