import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ detail: 'Auth handled by external backend' }, { status: 404 })
}

export function POST() {
  return NextResponse.json({ detail: 'Auth handled by external backend' }, { status: 404 })
}
