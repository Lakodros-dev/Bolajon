/**
 * Admin Balance Management API
 * POST /api/admin/balance - Add balance to user
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// POST - Add balance to user
export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { userId, amount } = body;

        if (!userId) {
            return errorResponse('Foydalanuvchi ID kerak');
        }

        if (!amount || amount <= 0) {
            return errorResponse('Summa 0 dan katta bo\'lishi kerak');
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('Foydalanuvchi topilmadi', 404);
        }

        if (user.role === 'admin') {
            return errorResponse('Admin uchun balans kerak emas');
        }

        // Add balance
        user.balance = (user.balance || 0) + amount;
        await user.save();

        return successResponse({
            message: `${user.name} ga ${amount.toLocaleString()} so'm qo'shildi`,
            newBalance: user.balance
        });
    } catch (error) {
        console.error('Add balance error:', error);
        return serverError('Failed to add balance');
    }
}
