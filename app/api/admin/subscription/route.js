/**
 * Admin Subscription Management API
 * POST /api/admin/subscription - Activate subscription for a user
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate, requireAdmin } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// POST - Activate subscription for a user (1 month)
export async function POST(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        const adminCheck = requireAdmin(auth.user);
        if (!adminCheck.success) {
            return errorResponse(adminCheck.error, adminCheck.status);
        }

        await dbConnect();

        const body = await request.json();
        const { userId, months = 1 } = body;

        if (!userId) {
            return errorResponse('Foydalanuvchi ID kerak');
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

        if (user.subscriptionStatus === 'active' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
            // Extend existing subscription
            endDate = new Date(user.subscriptionEndDate);
        } else {
            // Start new subscription
            endDate = now;
        }

        endDate.setMonth(endDate.getMonth() + months);

        // Update user
        user.subscriptionStatus = 'active';
        user.subscriptionEndDate = endDate;
        user.lastPaymentDate = now;
        await user.save();

        return successResponse({
            message: `${user.name} uchun ${months} oylik obuna faollashtirildi`,
            subscriptionEndDate: endDate
        });
    } catch (error) {
        console.error('Activate subscription error:', error);
        return serverError('Failed to activate subscription');
    }
}
