/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request) {
    const auth = await authenticate(request);

    if (!auth.success) {
        return errorResponse(auth.error, auth.status);
    }

    // Calculate days remaining
    let daysRemaining = 999;
    if (auth.user.role !== 'admin') {
        const now = new Date();
        let endDate;

        if (auth.user.subscriptionStatus === 'trial') {
            endDate = new Date(auth.user.trialStartDate);
            endDate.setDate(endDate.getDate() + 7);
        } else if (auth.user.subscriptionStatus === 'active' && auth.user.subscriptionEndDate) {
            endDate = new Date(auth.user.subscriptionEndDate);
        } else {
            daysRemaining = 0;
        }

        if (endDate) {
            const diff = endDate - now;
            daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
    }

    return successResponse({
        user: {
            _id: auth.user._id,
            name: auth.user.name,
            email: auth.user.email,
            role: auth.user.role,
            avatar: auth.user.avatar,
            phone: auth.user.phone,
            createdAt: auth.user.createdAt,
            subscriptionStatus: auth.user.subscriptionStatus,
            daysRemaining
        }
    });
}
