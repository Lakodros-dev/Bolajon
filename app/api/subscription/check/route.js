/**
 * Subscription Check API
 * GET /api/subscription/check - Check current user's subscription status
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

        // Get payment info if subscription expired
        let paymentInfo = null;
        if (!isValid) {
            const adminPhone = await Settings.get('adminPhone', '+998900000000');
            const cardNumber = await Settings.get('cardNumber', '8600 0000 0000 0000');
            const cardHolder = await Settings.get('cardHolder', 'Admin');
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
            subscriptionEndDate: user.subscriptionEndDate,
            trialStartDate: user.trialStartDate,
            paymentInfo
        });
    } catch (error) {
        console.error('Check subscription error:', error);
        return serverError('Obunani tekshirishda xatolik');
    }
}
