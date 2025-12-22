/**
 * Subscription Activate API (Admin only)
 * POST /api/subscription/activate - Activate subscription for a user
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const { userId, days = 30 } = await request.json();

        if (!userId) {
            return errorResponse('User ID kerak');
        }

        // Validate days (minimum 1)
        const subscriptionDays = Math.max(1, parseInt(days) || 30);

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('Foydalanuvchi topilmadi', 404);
        }

        if (user.role === 'admin') {
            return errorResponse('Admin uchun obuna kerak emas');
        }

        // Set subscription end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + subscriptionDays);

        user.subscriptionStatus = 'active';
        user.subscriptionEndDate = endDate;
        user.lastPaymentDate = new Date();
        await user.save();

        return successResponse({
            message: `${subscriptionDays} kunlik obuna faollashtirildi`,
            subscriptionEndDate: endDate,
            days: subscriptionDays
        });
    } catch (error) {
        console.error('Activate subscription error:', error);
        return serverError('Obunani faollashtirishda xatolik');
    }
}
