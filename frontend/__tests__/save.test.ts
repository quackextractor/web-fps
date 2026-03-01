import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as saveRoute, GET as getSaveRoute } from '@/app/api/save/route';
import bcrypt from 'bcryptjs';

// Mock cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
    })),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => {
    return {
        default: {
            user: {
                findUnique: vi.fn(),
                update: vi.fn(),
                create: vi.fn(),
            },
        },
    };
});
import prisma from '@/lib/prisma';

// Mock jose
vi.mock('jose', () => {
    return {
        SignJWT: class {
            setProtectedHeader = vi.fn().mockReturnThis();
            setExpirationTime = vi.fn().mockReturnThis();
            sign = vi.fn().mockResolvedValue('mocked-token');
        },
        jwtVerify: vi.fn(),
    };
});

describe('POST /api/save', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 400 if username or password is missing', async () => {
        const req = new Request('http://localhost/api/save', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await saveRoute(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Username and password are required');
    });

    it('should authenticate and update an existing user', async () => {
        const mockUser = {
            id: 'abc-123',
            username: 'test',
            passwordHash: 'hashed-pwd',
            saveData: '{"credits":0}',
            netWorth: 10,
            kills: 5
        };

        // @ts-ignore
        prisma.user.findUnique.mockResolvedValue(mockUser);
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

        // @ts-ignore
        prisma.user.update.mockResolvedValue({
            ...mockUser,
            saveData: JSON.stringify({
                credits: 50,
                inventory: {},
                machines: [],
                unlockedWeapons: [],
                highestLevelCompleted: 0
            }),
            netWorth: 20,
            kills: 10
        });

        const req = new Request('http://localhost/api/save', {
            method: 'POST',
            body: JSON.stringify({
                username: 'test',
                password: 'password123',
                credits: 50,
                net_worth: 20,
                kills: 10
            }),
        });

        const response = await saveRoute(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        // @ts-ignore
        expect(prisma.user.update).toHaveBeenCalled();
    });
});
