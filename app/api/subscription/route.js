/**
 * Subscription API
 * GET /api/subscription - Get current user subscription status
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const user = await User.findById(auth.user._id);
        if (!user) {
            return errorResponse('Foydalanuvchi topilmadi', 404);
        }

        // Admin always has access
        if (user.role === 'admin') {
            return successResponse({
                isValid: true,
                status: 'admin',
                daysRemaining: 999
            });
        }

        const isValid = user.isSubscriptionValid();
        const daysRemaining = user.getDaysRemaining();

        // Get payment info for blocked users
        let paymentInfo = null;
        if (!isValid) {
            const adminPhone = await Settings.get('adminPhone', '');
            const cardNumber = await Settings.get('cardNumber', '');
            const cardHolder = await Settings.get('cardHolder', '');
            const subscriptionPrice = await Settings.get('subscriptionPrice', 15000);

            paymentInfo = {
                adminPhone,
                cardNumber,
                cardHolder,
                price: subscriptionPrice
            };
        }

        return successResponse({
            isValid,
            status: user.subscriptionStatus,
            daysRemaining,
            trialStartDate: user.trialStartDate,
            subscriptionEndDate: user.subscriptionEndDate,
            paymentInfo
        });
    } catch (error) {
        console.error('Subscription check error:', error);
        return serverError('Failed to check subscription');
    }
}
