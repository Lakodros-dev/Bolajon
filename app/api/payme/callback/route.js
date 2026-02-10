/**
 * Payme Callback Handler
 * Handles all Payme RPC requests
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyPaymeSignature, generatePaymeError, PaymeRPC } from '@/lib/payme';

export async function POST(request) {
    try {
        // Verify Payme signature
        const authorization = request.headers.get('authorization');
        
        if (!verifyPaymeSignature(authorization)) {
            // Payme requires HTTP 200 with error in body
            return NextResponse.json(
                {
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32504,
                        message: 'Insufficient privileges',
                        data: null
                    }
                },
                { status: 200 } // Changed from 401 to 200
            );
        }

        // Parse request body
        const body = await request.json();
        const { method, params, id } = body;

        if (!method || !params) {
            return NextResponse.json(
                {
                    jsonrpc: '2.0',
                    id: id || null,
                    error: {
                        code: -32600,
                        message: 'Invalid Request',
                        data: null
                    }
                },
                { status: 200 } // Changed from 400 to 200
            );
        }

        // Connect to database
        await dbConnect();
        const db = (await dbConnect()).connection.db;

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
            return NextResponse.json(
                {
                    jsonrpc: '2.0',
                    id: null,
                    ...error
                },
                { status: 200 } // Always return 200
            );
        }

        // Generic error
        return NextResponse.json(
            {
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: error.message
                }
            },
            { status: 200 } // Changed from 500 to 200
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
