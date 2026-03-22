import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getLeaderboard } from '@/app/api/leaderboard/route';

// Mocking Prisma
vi.mock('@/lib/prisma', () => {
    return {
        default: {
            user: {
                findMany: vi.fn(),
            },
        },
    };
});

import prisma from '@/lib/prisma';

describe('GET /api/leaderboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return top 10 users sorted by netWorth and kills', async () => {
        const mockUsers = [
            { username: 'Player1', netWorth: 1000, kills: 50 },
            { username: 'Player2', netWorth: 800, kills: 60 },
        ];

        prisma.user.findMany.mockResolvedValue(mockUsers);

        const response = await getLeaderboard();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.leaderboard).toEqual(mockUsers);

        expect(prisma.user.findMany).toHaveBeenCalledWith({
            select: { username: true, netWorth: true, kills: true },
            orderBy: [{ netWorth: 'desc' }, { kills: 'desc' }],
            take: 10,
        });
    });

    it('should handle database errors gracefully', async () => {
        // @ts-expect-error mock
        // @ts-expect-error mock
        prisma.user.findMany.mockRejectedValue(new Error('DB Error'));

        const response = await getLeaderboard();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
    });
});
