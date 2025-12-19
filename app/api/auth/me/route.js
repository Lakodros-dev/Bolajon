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

    return successResponse({
        user: {
            _id: auth.user._id,
            name: auth.user.name,
            email: auth.user.email,
            role: auth.user.role,
            avatar: auth.user.avatar,
            phone: auth.user.phone,
            createdAt: auth.user.createdAt
        }
    });
}
