import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');

        if (!host) {
            return NextResponse.json({ error: 'CSRF validation failed: Missing Host header' }, { status: 403 });
        }

        let isSafeOrigin = false;

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
        else if (referer) {
            try {
                const refererUrl = new URL(referer);
                if (refererUrl.host === host) {
                    isSafeOrigin = true;
                }
            } catch (e) {
                // Malformed referer
            }
        }

        if (!isSafeOrigin) {
            return NextResponse.json(
                { error: 'CSRF validation failed: Origin or Referer mismatch' },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
