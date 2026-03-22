export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { BACKEND_CONFIG } from '@/config/backend/server.config';
import { z } from 'zod';
import { createHash } from 'crypto';

const LOGIN_FORM_TOKEN_COOKIE = 'industrialist_login_form_token';

const loginSchema = z.object({
    username: z.string().min(1, "Username is required").max(32, "Username is too long"),
    password: z.string().min(1, "Password is required"),
    loginToken: z.string().min(32, "Missing login token"),
});

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

        const parseResult = loginSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid or incomplete data' }, { status: 400 });
        }

        const { username, password, loginToken } = parseResult.data;

        const cookieStore = await cookies();
        const tokenHashFromCookie = cookieStore.get(LOGIN_FORM_TOKEN_COOKIE)?.value;
        const tokenHashFromRequest = createHash('sha256').update(loginToken).digest('hex');

        if (!tokenHashFromCookie || tokenHashFromCookie !== tokenHashFromRequest) {
            return NextResponse.json({ error: 'Invalid or expired login token' }, { status: 403 });
        }

        // One-time token: consume immediately after successful validation.
        cookieStore.delete(LOGIN_FORM_TOKEN_COOKIE);

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

        // CSRF & XSS Protection: Ensure cookies are explicitly HttpOnly and Secure
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
        }, { status: 200 });
    } catch (error) {
        console.error('[Internal Error] Login:', error instanceof Error ? error.stack : error);
        // Fallback for local testing without DB
        if (process.env.NODE_ENV !== 'production') {
            return NextResponse.json({
                success: true,
                message: 'Offline mode login',
                saveData: BACKEND_CONFIG.PLAYER_DEFAULTS,
                netWorth: 0,
                kills: 0,
                username: 'offline_user'
            }, { status: 200 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
