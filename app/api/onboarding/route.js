/**
 * Onboarding API
 * GET - Check if user completed onboarding for a page
 * POST - Mark page onboarding as completed
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// GET - Get user's onboarding status
export async function GET(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, 401);
        }

        await dbConnect();

        const user = await User.findById(auth.user._id).select('onboardingCompleted');

        return successResponse({
            completedPages: user?.onboardingCompleted || []
        });
    } catch (error) {
        console.error('Get onboarding error:', error);
        return serverError('Xatolik yuz berdi');
    }
}

// POST - Mark page as completed
export async function POST(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, 401);
        }

        await dbConnect();

        const { page } = await request.json();

        if (!page) {
            return errorResponse('Sahifa nomi kerak', 400);
        }

        await User.findByIdAndUpdate(
            auth.user._id,
            { $addToSet: { onboardingCompleted: page } }
        );

        return successResponse({
            message: 'Onboarding completed',
            page
        });
    } catch (error) {
        console.error('Complete onboarding error:', error);
        return serverError('Xatolik yuz berdi');
    }
}
