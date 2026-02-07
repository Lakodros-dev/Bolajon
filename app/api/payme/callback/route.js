/**
 * Payme Callback Handler
 * Handles all Payme RPC requests
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyPaymeSignature, generatePaymeError, PaymeRPC } from '@/lib/payme';

export async function POST(request) {
    try {
        // Verify Payme signature
        const authorization = request.headers.get('authorization');
        
        if (!verifyPaymeSignature(authorization)) {
            return NextResponse.json(
                generatePaymeError(-32504, 'Insufficient privileges'),
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { method, params, id } = body;

        if (!method || !params) {
            return NextResponse.json(
                generatePaymeError(-32600, 'Invalid Request'),
                { status: 400 }
            );
        }

        // Connect to database
        const { db } = await connectDB();

        // Handle RPC request
        const rpc = new PaymeRPC(db);
        const result = await rpc.handleRequest(method, params);

        return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result
        });

    } catch (error) {
        console.error('Payme callback error:', error);

        // If error is already formatted
        if (error.error) {
            return NextResponse.json({
                jsonrpc: '2.0',
                id: null,
                ...error
            });
        }

        // Generic error
        return NextResponse.json(
            generatePaymeError(-32603, 'Internal error', error.message),
            { status: 500 }
        );
    }
}

// Payme only uses POST
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
