export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { BACKEND_CONFIG } from '@/config/backend/server.config';
import { logger } from '@/lib/logger';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode(secret || 'dev-secret-fallback-only-for-local');
}

export async function DELETE(req: Request) {
    try {
        const JWT_SECRET = getJwtSecret();
        const cookieStore = await cookies();
        const token = cookieStore.get(BACKEND_CONFIG.AUTH.COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
        }

        let payload;
        try {
            const verified = await jwtVerify(token, JWT_SECRET);
            payload = verified.payload;
        } catch (e) {
            return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
        }

        const userId = payload.id as string;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        cookieStore.delete(BACKEND_CONFIG.AUTH.COOKIE_NAME);

        return NextResponse.json({
            success: true,
            message: 'Account deleted successfully'
        }, { status: 200 });
    } catch (error) {
        logger.error('[Internal Error] Profile Delete API:', error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
