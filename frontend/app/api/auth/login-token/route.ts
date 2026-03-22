export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

const LOGIN_FORM_TOKEN_COOKIE = 'industrialist_login_form_token';
const LOGIN_FORM_TOKEN_MAX_AGE_SECONDS = 300;

export async function GET() {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const cookieStore = await cookies();
    cookieStore.set(LOGIN_FORM_TOKEN_COOKIE, tokenHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: LOGIN_FORM_TOKEN_MAX_AGE_SECONDS,
        path: '/',
    });

    return NextResponse.json({
        loginToken: token,
        expiresIn: LOGIN_FORM_TOKEN_MAX_AGE_SECONDS,
    }, { status: 200 });
}
