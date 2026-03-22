import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Apply CSRF protection to mutating requests directed at the API
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');

        if (!host) {
            return NextResponse.json({ error: 'CSRF validation failed: Missing Host header' }, { status: 403 });
        }

        let isSafeOrigin = false;

        // Strictly validate Origin against Host
        if (origin) {
            try {
                const originUrl = new URL(origin);
                if (originUrl.host === host) {
                    isSafeOrigin = true;
                }
            } catch (e) {
                // Malformed origin
            }
        }
        // Fallback to strict Referer validation if Origin is missing
        else if (referer) {
            try {
                const refererUrl = new URL(referer);
                // NextJS sometimes uses local IPs so we verify the host directly
                if (refererUrl.host === host) {
                    isSafeOrigin = true;
                }
            } catch (e) {
                // Malformed referer
            }
        }

        if (!isSafeOrigin) {
            // Block request if headers are completely missing or do not securely match the host domain
            return NextResponse.json(
                { error: 'CSRF validation failed: Origin or Referer mismatch' },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to all API routes
    matcher: '/api/:path*',
};
