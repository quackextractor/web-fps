export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { BACKEND_CONFIG } from '@/config/backend/server.config';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode(secret || 'dev-secret-fallback-only-for-local');
}

export async function POST(req: Request) {
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

        const body = await req.json();
        const { credits, inventory, machines, unlockedWeapons, highestLevelCompleted, net_worth, kills } = body;

        const userId = payload.id as string;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // SERVER-SIDE VALIDATION
        // 1. Prevent score/kills from decreasing
        if (net_worth !== undefined && net_worth < user.netWorth) {
            return NextResponse.json({ error: 'Invalid netWorth update' }, { status: 400 });
        }
        if (kills !== undefined && kills < user.kills) {
            return NextResponse.json({ error: 'Invalid kills update' }, { status: 400 });
        }

        // 2. Prevent massive suspicious jumps (e.g., > 50,000 per save)
        // Adjust these thresholds based on true game balance
        const MAX_NET_WORTH_JUMP = 50000;
        const MAX_KILLS_JUMP = 1000;

        if (net_worth !== undefined && (net_worth - user.netWorth) > MAX_NET_WORTH_JUMP) {
            return NextResponse.json({ error: 'Suspicious netWorth jump detected' }, { status: 403 });
        }
        if (kills !== undefined && (kills - user.kills) > MAX_KILLS_JUMP) {
            return NextResponse.json({ error: 'Suspicious kills jump detected' }, { status: 403 });
        }

        const currentSaveData = JSON.parse(user.saveData);
        const nextSaveDataJSON = JSON.stringify({
            credits: credits !== undefined ? credits : currentSaveData.credits,
            inventory: inventory || currentSaveData.inventory,
            machines: machines || currentSaveData.machines,
            unlockedWeapons: unlockedWeapons || currentSaveData.unlockedWeapons,
            highestLevelCompleted: highestLevelCompleted !== undefined ? highestLevelCompleted : currentSaveData.highestLevelCompleted
        });

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                saveData: nextSaveDataJSON,
                netWorth: net_worth !== undefined ? net_worth : user.netWorth,
                kills: kills !== undefined ? kills : user.kills,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Saved successfully',
            saveData: JSON.parse(updatedUser.saveData),
            net_worth: updatedUser.netWorth,
            kills: updatedUser.kills
        });
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const JWT_SECRET = getJwtSecret();
        const cookieStore = await cookies();
        const token = cookieStore.get(BACKEND_CONFIG.AUTH.COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: payload.id as string }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            saveData: JSON.parse(user.saveData),
            net_worth: user.netWorth,
            kills: user.kills,
            username: user.username
        });
    } catch (error) {
        console.error('Load error:', error);
        return NextResponse.json({ error: 'Unauthorized or token expired' }, { status: 401 });
    }
}
