/**
 * Create Payme Payment
 * Generates Payme checkout URL for user
 */

import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/authMiddleware';
import { generatePaymeUrl, PAYME_CONFIG } from '@/lib/payme';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        // Authenticate user
        const authResult = await authenticate(request);
        if (!authResult.success) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status || 401 }
            );
        }

        const user = authResult.user;
        const body = await request.json();
        const { amount } = body;

        // Validate amount
        if (!amount || amount < PAYME_CONFIG.minAmount) {
            return NextResponse.json({
                success: false,
                error: `Minimal to'lov summasi ${PAYME_CONFIG.minAmount} so'm`
            }, { status: 400 });
        }

        // Generate unique order ID
        const orderId = uuidv4();

        // Generate Payme URL
        const paymeUrl = generatePaymeUrl(orderId, amount, {
            userId: user._id.toString()
        });

        return NextResponse.json({
            success: true,
            paymeUrl,
            orderId,
            amount
        });

    } catch (error) {
        console.error('Create payment error:', error);
        return NextResponse.json({
            success: false,
            error: 'To\'lov yaratishda xatolik'
        }, { status: 500 });
    }
}
