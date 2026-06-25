import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE as deleteProfileRoute } from '@/app/api/profile/route';

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => {
    return {
        default: {
            user: {
                findUnique: vi.fn(),
                delete: vi.fn(),
            },
        },
    };
});
import prisma from '@/lib/prisma';

vi.mock('jose', () => ({
    jwtVerify: vi.fn(),
}));
import { jwtVerify } from 'jose';

describe('DELETE /api/profile', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should delete the user account and clear session cookie when authorized', async () => {
        const mockCookieStore = {
            get: vi.fn((name) => {
                if (name === 'auth_token') return { value: 'valid-token' };
                return null;
            }),
            delete: vi.fn(),
        };
        (cookies as any).mockReturnValue(mockCookieStore);

        (jwtVerify as any).mockResolvedValue({
            payload: { id: 'user-123', username: 'testuser' }
        });

        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue({ id: 'user-123', username: 'testuser' });
        // @ts-expect-error mock
        prisma.user.delete.mockResolvedValue({ id: 'user-123' });

        const req = new Request('http://localhost/api/profile', {
            method: 'DELETE',
        });

        const response = await deleteProfileRoute(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: 'user-123' }
        });
        expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token');
    });

    it('should return 401 when auth token is missing', async () => {
        const mockCookieStore = {
            get: vi.fn().mockReturnValue(null),
            delete: vi.fn(),
        };
        (cookies as any).mockReturnValue(mockCookieStore);

        const req = new Request('http://localhost/api/profile', {
            method: 'DELETE',
        });

        const response = await deleteProfileRoute(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Unauthorized: No session found');
    });

    it('should return 401 when token verification fails', async () => {
        const mockCookieStore = {
            get: vi.fn((name) => {
                if (name === 'auth_token') return { value: 'invalid-token' };
                return null;
            }),
            delete: vi.fn(),
        };
        (cookies as any).mockReturnValue(mockCookieStore);

        (jwtVerify as any).mockRejectedValue(new Error('Invalid token'));

        const req = new Request('http://localhost/api/profile', {
            method: 'DELETE',
        });

        const response = await deleteProfileRoute(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Unauthorized: Invalid session');
    });

    it('should return 404 when user is not found in database', async () => {
        const mockCookieStore = {
            get: vi.fn((name) => {
                if (name === 'auth_token') return { value: 'valid-token' };
                return null;
            }),
            delete: vi.fn(),
        };
        (cookies as any).mockReturnValue(mockCookieStore);

        (jwtVerify as any).mockResolvedValue({
            payload: { id: 'user-999', username: 'nonexistent' }
        });

        // @ts-expect-error mock
        prisma.user.findUnique.mockResolvedValue(null);

        const req = new Request('http://localhost/api/profile', {
            method: 'DELETE',
        });

        const response = await deleteProfileRoute(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toContain('User not found');
    });
});
