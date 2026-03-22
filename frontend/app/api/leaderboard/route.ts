export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BACKEND_CONFIG } from '@/config/backend/server.config';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                netWorth: true,
                kills: true,
            },
            orderBy: [
                { netWorth: 'desc' },
                { kills: 'desc' },
            ],
            take: BACKEND_CONFIG.LEADERBOARD.LIMIT,
        });

        return NextResponse.json({ success: true, leaderboard: users }, { status: 200 });
    } catch (error) {
        console.error('[Internal Error] Leaderboard fetch:', error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
