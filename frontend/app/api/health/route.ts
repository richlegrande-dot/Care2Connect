import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    service: 'frontend'
  })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
