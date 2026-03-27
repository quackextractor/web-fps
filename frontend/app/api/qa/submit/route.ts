export const dynamic = 'force-dynamic'; // Prevents Vercel SSG crashes

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Strict payload validation
const qaPayloadSchema = z.object({
  testerName: z.string().min(1, "Name required"),
  testDate: z.string().optional(),
  durationMin: z.number().min(1, "Duration required"),
  observations: z.string().optional(),
  scenarios: z.array(z.object({
    id: z.string(),
    issueLog: z.string().optional(),
    steps: z.array(z.object({
      number: z.number(),
      status: z.string()
    }))
  }))
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = qaPayloadSchema.safeParse(body);
    
    if (!parsed.success) {
      logger.error('Invalid QA submission payload:', parsed.error);
      return NextResponse.json({ error: 'Invalid or incomplete data', details: parsed.error.format() }, { status: 400 });
    }

    const { testerName, testDate, durationMin, observations, scenarios } = parsed.data;

    const testSession = await prisma.testSession.create({
      data: {
        testerName,
        testDate: testDate ? new Date(testDate) : new Date(),
        durationMin,
        observations,
        scenarios: {
          create: scenarios.map((scenario) => ({
            scenarioId: scenario.id,
            issueLog: scenario.issueLog,
            steps: {
              create: scenario.steps.map((step) => ({
                stepNumber: step.number,
                status: step.status,
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({ success: true, sessionId: testSession.id }, { status: 200 });
  } catch (error) {
    // Mask internal details while logging error for the team
    logger.error('QA Submission failed:', error);
    return NextResponse.json({ error: 'Failed to save test results' }, { status: 500 });
  }
}
