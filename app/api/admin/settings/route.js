/**
 * Admin Settings API
 * GET /api/admin/settings - Get settings
 * PUT /api/admin/settings - Update settings
 */
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { authenticate, requireAdmin } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// GET - Get all settings
export async function GET(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const adminPhone = await Settings.get('adminPhone', '');
        const cardNumber = await Settings.get('cardNumber', '');
        const cardHolder = await Settings.get('cardHolder', '');
        const subscriptionPrice = await Settings.get('subscriptionPrice', 15000);
        const trialDays = await Settings.get('trialDays', 7);

        return successResponse({
            adminPhone,
            cardNumber,
            cardHolder,
            subscriptionPrice,
            trialDays
        });
    } catch (error) {
        console.error('Get settings error:', error);
        return serverError('Failed to fetch settings');
    }
}

// PUT - Update settings (admin only)
export async function PUT(request) {
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
        const { adminPhone, cardNumber, cardHolder, subscriptionPrice, trialDays } = body;

        if (adminPhone !== undefined) await Settings.set('adminPhone', adminPhone);
        if (cardNumber !== undefined) await Settings.set('cardNumber', cardNumber);
        if (cardHolder !== undefined) await Settings.set('cardHolder', cardHolder);
        if (subscriptionPrice !== undefined) await Settings.set('subscriptionPrice', subscriptionPrice);
        if (trialDays !== undefined) await Settings.set('trialDays', trialDays);

        return successResponse({ message: 'Sozlamalar saqlandi' });
    } catch (error) {
        console.error('Update settings error:', error);
        return serverError('Failed to update settings');
    }
}
