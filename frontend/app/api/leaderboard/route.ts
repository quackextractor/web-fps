import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
            take: 10,
        });

        return NextResponse.json({ success: true, leaderboard: users });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
