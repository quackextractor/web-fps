export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
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
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
        }

        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({
            where: { username }
        });

        if (user) {
            // Existing user: verify password
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }
        } else {
            // New user: create account
            const salt = await bcrypt.genSalt(BACKEND_CONFIG.AUTH.SALT_ROUNDS);
            const passwordHash = await bcrypt.hash(password, salt);

            user = await prisma.user.create({
                data: {
                    username,
                    passwordHash,
                    saveData: JSON.stringify(BACKEND_CONFIG.PLAYER_DEFAULTS),
                    netWorth: BACKEND_CONFIG.PLAYER_DEFAULTS.NET_WORTH,
                    kills: BACKEND_CONFIG.PLAYER_DEFAULTS.KILLS,
                }
            });
        }

        // Set JWT Cookie
        const token = await new SignJWT({ id: user.id, username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(BACKEND_CONFIG.AUTH.JWT_EXPIRATION)
            .sign(JWT_SECRET);

        const cookieStore = await cookies();
        cookieStore.set(BACKEND_CONFIG.AUTH.COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: BACKEND_CONFIG.AUTH.COOKIE_MAX_AGE,
            path: '/',
        });

        return NextResponse.json({
            success: true,
            message: 'Logged in successfully',
            saveData: JSON.parse(user.saveData),
            netWorth: user.netWorth,
            kills: user.kills,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        // Fallback for local testing without DB
        if (process.env.NODE_ENV !== 'production') {
            return NextResponse.json({
                success: true,
                message: 'Offline mode login',
                saveData: BACKEND_CONFIG.PLAYER_DEFAULTS,
                netWorth: 0,
                kills: 0,
                username: 'offline_user'
            });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
