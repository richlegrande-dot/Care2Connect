import { NextResponse } from 'next/server';

/**
 * GET /health/live
 * Simple liveness check for frontend
 * Used by tunnel health checks
 */
export async function GET() {
  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    message: 'Frontend is running'
  });
}

export const dynamic = 'force-dynamic';
