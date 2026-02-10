/**
 * Socket.IO API Route
 * Handles Socket.IO connections in Next.js
 */
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Socket.IO endpoint',
        status: 'active'
    });
}

// Socket.IO will be initialized in server.js
export const dynamic = 'force-dynamic';
