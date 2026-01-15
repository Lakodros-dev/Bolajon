/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
    const auth = await authenticate(request);

    if (!auth.success) {
        return errorResponse(auth.error, auth.status);
    }

    // Get fresh user data from database
    await dbConnect();
    const user = await User.findById(auth.user._id);

    if (!user) {
        return errorResponse('Foydalanuvchi topilmadi', 404);
    }

    // Calculate days remaining directly
    let daysRemaining = 0;

    if (user.role === 'admin') {
        daysRemaining = 999;
    } else {
        const now = new Date();
        let endDate = null;

        if (user.subscriptionStatus === 'trial' && user.trialStartDate) {
            endDate = new Date(user.trialStartDate);
            endDate.setDate(endDate.getDate() + 7);
        } else if (user.subscriptionStatus === 'active' && user.subscriptionEndDate) {
            endDate = new Date(user.subscriptionEndDate);
        }

        if (endDate) {
            const diff = endDate.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
    }

    return successResponse({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            createdAt: user.createdAt,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEndDate: user.subscriptionEndDate,
            trialStartDate: user.trialStartDate,
            daysRemaining
        }
    });
}
