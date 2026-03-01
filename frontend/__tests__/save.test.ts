import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as saveRoute, GET as getSaveRoute } from '@/app/api/save/route';

// Mock cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));
import { cookies } from 'next/headers';

// Mock prisma
vi.mock('@/lib/prisma', () => {
    return {
        default: {
            user: {
                findUnique: vi.fn(),
                update: vi.fn(),
            },
        },
    };
});
import prisma from '@/lib/prisma';

// Mock jose
vi.mock('jose', () => ({
    jwtVerify: vi.fn(),
}));
import { jwtVerify } from 'jose';

describe('POST /api/save', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Re-setup mocks that should be common
        (cookies as any).mockReturnValue({
            get: vi.fn((name) => {
                if (name === 'auth_token') return { value: 'mocked-token' };
                return null;
            }),
            set: vi.fn(),
        });

        (jwtVerify as any).mockResolvedValue({
            payload: { id: 'user-123', username: 'testuser' }
        });
    });

    it('should update user if values are valid', async () => {
        const mockUser = {
            id: 'user-123',
            netWorth: 100,
            kills: 10,
            saveData: '{}'
        };
        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue(mockUser);
        // @ts-expect-error mock
        prisma.user.update.mockResolvedValue({ ...mockUser, netWorth: 200, kills: 20 });

        const req = new Request('http://localhost/api/save', {
            method: 'POST',
            body: JSON.stringify({ net_worth: 200, kills: 20 }),
        });

        const response = await saveRoute(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should reject if netWorth decreases', async () => {
        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue({ id: 'user-123', netWorth: 500, kills: 10, saveData: '{}' });

        const req = new Request('http://localhost/api/save', {
            method: 'POST',
            body: JSON.stringify({ net_worth: 400 }),
        });

        const response = await saveRoute(req);
        expect(response.status).toBe(400);
    });

    it('should reject if netWorth jump is too suspicious', async () => {
        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue({ id: 'user-123', netWorth: 100, kills: 10, saveData: '{}' });

        const req = new Request('http://localhost/api/save', {
            method: 'POST',
            body: JSON.stringify({ net_worth: 1000000 }), // Massive jump
        });

        const response = await saveRoute(req);
        expect(response.status).toBe(403);
    });
});
