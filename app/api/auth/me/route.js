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

    // Get fresh user data with methods
    await dbConnect();
    const user = await User.findById(auth.user._id);

    // Use model method for consistent calculation
    const daysRemaining = user ? user.getDaysRemaining() : 0;

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
            subscriptionEndDate: auth.user.subscriptionEndDate,
            trialStartDate: auth.user.trialStartDate,
            daysRemaining
        }
    });
}
