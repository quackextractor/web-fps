import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getMetrics } from '@/app/api/admin/metrics/route';

// Mocking Prisma
vi.mock('@/lib/prisma', () => {
    return {
        default: {
            user: {
                count: vi.fn(),
                aggregate: vi.fn(),
            },
        },
    };
});

import prisma from '@/lib/prisma';

describe('GET /api/admin/metrics', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return aggregated metrics with status 200', async () => {
        // @ts-expect-error mock
        prisma.user.count.mockResolvedValueOnce(100); // totalPlayers
        // @ts-expect-error mock
        prisma.user.aggregate.mockResolvedValueOnce({
            _sum: { kills: 500, netWorth: 10000 }
        });
        // @ts-expect-error mock
        prisma.user.count.mockResolvedValueOnce(10); // activeToday

        const response = await getMetrics();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.metrics.totalPlayers).toBe(100);
        expect(data.metrics.totalKills).toBe(500);
        expect(data.metrics.activePlayersLast24h).toBe(10);
    });

    it('should handle aggregation errors gracefully', async () => {
        // @ts-expect-error mock
        prisma.user.count.mockRejectedValue(new Error('Aggregation Failure'));

        const response = await getMetrics();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to aggregate metrics');
    });
});
