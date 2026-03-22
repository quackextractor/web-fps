export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { BACKEND_CONFIG } from '@/config/backend/server.config';

const EASTER_EGG_CREDITS = 1000;

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode(secret || 'dev-secret-fallback-only-for-local');
}

async function authenticate(): Promise<string | null> {
    const JWT_SECRET = getJwtSecret();
    const cookieStore = await cookies();
    const token = cookieStore.get(BACKEND_CONFIG.AUTH.COOKIE_NAME)?.value;
    if (!token) {
        return null;
    }
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload.id as string;
    } catch {
        return null;
    }
}

export async function GET() {
    const userId = await authenticate();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let saveData: Record<string, unknown> = {};
    try {
        saveData = JSON.parse(user.saveData) as Record<string, unknown>;
    } catch {
        // saveData defaults to empty object
    }

    return NextResponse.json({ claimed: saveData.easterEggClaimed === true });
}

export async function POST() {
    const userId = await authenticate();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let saveData: Record<string, unknown> = {};
    try {
        saveData = JSON.parse(user.saveData) as Record<string, unknown>;
    } catch {
        // saveData defaults to empty object
    }

    if (saveData.easterEggClaimed === true) {
        return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
    }

    const currentCredits = typeof saveData.credits === 'number' ? saveData.credits : 0;
    saveData.credits = currentCredits + EASTER_EGG_CREDITS;
    saveData.easterEggClaimed = true;

    await prisma.user.update({
        where: { id: userId },
        data: {
            saveData: JSON.stringify(saveData),
            netWorth: { increment: EASTER_EGG_CREDITS },
        },
    });

    return NextResponse.json({ credits: EASTER_EGG_CREDITS });
}
