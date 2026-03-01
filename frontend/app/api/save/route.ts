export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-dev');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, credits, inventory, machines, unlockedWeapons, highestLevelCompleted, net_worth, kills } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({
            where: { username }
        });

        const saveDataJSON = JSON.stringify({
            credits: credits || 0,
            inventory: inventory || {},
            machines: machines || [],
            unlockedWeapons: unlockedWeapons || [],
            highestLevelCompleted: highestLevelCompleted || 0
        });

        if (user) {
            // Existing user: verify password
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
            }

            // Update save data
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    saveData: saveDataJSON,
                    netWorth: net_worth !== undefined ? net_worth : user.netWorth,
                    kills: kills !== undefined ? kills : user.kills,
                }
            });
        } else {
            // New user: create account
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            user = await prisma.user.create({
                data: {
                    username,
                    passwordHash,
                    saveData: saveDataJSON,
                    netWorth: net_worth || 0,
                    kills: kills || 0,
                }
            });
        }

        // Set JWT Cookie
        const token = await new SignJWT({ id: user.id, username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return NextResponse.json({ success: true, message: 'Saved successfully', saveData: JSON.parse(user.saveData) });
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

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
