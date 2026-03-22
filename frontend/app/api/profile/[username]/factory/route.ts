export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                username: true,
                saveData: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only return the factory/machine data, not the whole save
        const parsedSave = JSON.parse(user.saveData);

        return NextResponse.json({
            success: true,
            username: user.username,
            machines: parsedSave.machines || []
        }, { status: 200 });
    } catch (error) {
        logger.error('[Internal Error] Factory profile:', error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
