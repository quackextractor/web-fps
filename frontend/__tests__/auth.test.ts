import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import bcrypt from 'bcryptjs';

// Mock cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        set: vi.fn(),
        get: vi.fn(),
    })),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => {
    return {
        default: {
            user: {
                findUnique: vi.fn(),
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
    };
});

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should create a new user if not found', async () => {
        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue(null);
        // @ts-expect-error mock
        prisma.user.create.mockResolvedValue({
            id: 'new-id',
            username: 'newuser',
            passwordHash: 'hashed',
            saveData: '{}',
            netWorth: 0,
            kills: 0
        });

        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'newuser', password: 'password' }),
        });

        const response = await loginRoute(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.username).toBe('newuser');
        expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should return 401 for invalid password', async () => {
        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue({
            username: 'test',
            passwordHash: 'correct-hash'
        });
        vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'test', password: 'wrong' }),
        });

        const response = await loginRoute(req);
        expect(response.status).toBe(401);
    });

    it('should return 400 for missing credentials', async () => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'test' }), // missing password
        });

        const response = await loginRoute(req);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid or incomplete data');
    });

    it('should return 400 for too long username', async () => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: 'a'.repeat(33),
                password: 'password'
            }),
        });

        const response = await loginRoute(req);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid or incomplete data');
    });

    it('should return 400 for malformed JSON', async () => {
        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            body: '{ "username": "test", "password": "pa ', // malformed
        });

        const response = await loginRoute(req);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid JSON payload');
    });
});
