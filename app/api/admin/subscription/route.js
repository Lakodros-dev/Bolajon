/**
 * Admin Subscription Management API
 * POST /api/admin/subscription - Activate subscription for a user (add days)
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// POST - Add days to user subscription
export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { userId, days = 1 } = body;

        if (!userId) {
            return errorResponse('Foydalanuvchi ID kerak');
        }

        if (!days || days < 1) {
            return errorResponse('Kunlar soni 1 dan kam bo\'lmasligi kerak');
        }

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('Foydalanuvchi topilmadi', 404);
        }

        if (user.role === 'admin') {
            return errorResponse('Admin uchun obuna kerak emas');
        }

        // Calculate new end date
        const now = new Date();
        let endDate;

        // If user has active subscription that hasn't expired, extend it
        if (user.subscriptionStatus === 'active' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
            endDate = new Date(user.subscriptionEndDate);
        } else {
            // Start new subscription from now
            endDate = new Date(now);
        }

        // Add days
        endDate.setDate(endDate.getDate() + days);

        // Update user
        user.subscriptionStatus = 'active';
        user.subscriptionEndDate = endDate;
        user.lastPaymentDate = now;
        await user.save();

        // Calculate days remaining
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return successResponse({
            message: `${user.name} uchun ${days} kunlik obuna qo'shildi`,
            subscriptionEndDate: endDate,
            daysRemaining
        });
    } catch (error) {
        console.error('Activate subscription error:', error);
        return serverError('Failed to activate subscription');
    }
}
