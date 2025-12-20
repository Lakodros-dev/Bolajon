/**
 * Settings API
 * GET /api/settings - Get public settings
 * PUT /api/settings - Update settings (Admin only)
 */
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// GET - Get public settings (payment info)
export async function GET(request) {
    try {
        await dbConnect();

        const adminPhone = await Settings.get('adminPhone', '+998900000000');
        const cardNumber = await Settings.get('cardNumber', '8600 0000 0000 0000');
        const cardHolder = await Settings.get('cardHolder', 'Admin');
        const subscriptionPrice = await Settings.get('subscriptionPrice', 15000);

        return successResponse({
            adminPhone,
            cardNumber,
            cardHolder,
            subscriptionPrice
        });
    } catch (error) {
        console.error('Get settings error:', error);
        return serverError('Sozlamalarni olishda xatolik');
    }
}

// PUT - Update settings (Admin only)
export async function PUT(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { adminPhone, cardNumber, cardHolder, subscriptionPrice } = body;

        if (adminPhone) await Settings.set('adminPhone', adminPhone);
        if (cardNumber) await Settings.set('cardNumber', cardNumber);
        if (cardHolder) await Settings.set('cardHolder', cardHolder);
        if (subscriptionPrice) await Settings.set('subscriptionPrice', subscriptionPrice);

        return successResponse({ message: 'Sozlamalar saqlandi' });
    } catch (error) {
        console.error('Update settings error:', error);
        return serverError('Sozlamalarni saqlashda xatolik');
    }
}
