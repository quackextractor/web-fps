export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/metrics
 * Returns aggregated game statistics for administrative monitoring.
 * Satisfies Requirement 9.4 (The team monitors the number of players and games).
 */
export async function GET() {
    try {
        const now = new Date();
        const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 1. Core aggregations
        const [
            totalPlayers,
            aggregates,
            activePlayersLast24h
        ] = await Promise.all([
            // Total registered accounts
            prisma.user.count(),

            // Cumulative game activity metrics
            prisma.user.aggregate({
                _sum: {
                    kills: true,
                    netWorth: true
                }
            }),

            // Activity in the last 24 hours (based on last save/update)
            prisma.user.count({
                where: {
                    updatedAt: {
                        gte: past24h
                    }
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            metrics: {
                totalPlayers,
                totalKills: aggregates._sum.kills || 0,
                totalNetWorth: aggregates._sum.netWorth || 0,
                activePlayersLast24h,
                activityRatio: totalPlayers > 0 ? (activePlayersLast24h / totalPlayers) : 0
            }
        }, { status: 200 });

    } catch (error) {
        // Mask internal details while logging error for the team (Point 3.4 & 9.2)
        console.error(`[${new Date().toISOString()}] Metrics aggregation failed:`, error);
        return NextResponse.json(
            { error: 'Failed to aggregate metrics' },
            { status: 500 }
        );
    }
}
