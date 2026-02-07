/**
 * Check Payme Payment Status
 * Checks if payment was successful
 */

import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/authMiddleware';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
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
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({
                success: false,
                error: 'Order ID topilmadi'
            }, { status: 400 });
        }

        // Connect to database
        const { db } = await connectDB();

        // Find transaction
        const transaction = await db.collection('payme_transactions').findOne({
            userId: user._id.toString(),
            orderId
        });

        if (!transaction) {
            return NextResponse.json({
                success: false,
                status: 'not_found',
                message: 'To\'lov topilmadi'
            });
        }

        // Check transaction state
        const states = {
            1: { status: 'pending', message: 'To\'lov kutilmoqda' },
            2: { status: 'success', message: 'To\'lov muvaffaqiyatli' },
            '-1': { status: 'cancelled', message: 'To\'lov bekor qilindi' },
            '-2': { status: 'refunded', message: 'To\'lov qaytarildi' }
        };

        const state = states[transaction.state] || { status: 'unknown', message: 'Noma\'lum holat' };

        return NextResponse.json({
            success: true,
            ...state,
            amount: transaction.amount,
            createdAt: transaction.createdAt
        });

    } catch (error) {
        console.error('Check payment error:', error);
        return NextResponse.json({
            success: false,
            error: 'To\'lovni tekshirishda xatolik'
        }, { status: 500 });
    }
}
