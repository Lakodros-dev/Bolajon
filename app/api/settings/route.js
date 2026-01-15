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
export async function GET() {
    try {
        await dbConnect();

        const adminPhone = await Settings.get('adminPhone', '+998900000000');
        const cardNumber = await Settings.get('cardNumber', '8600 0000 0000 0000');
        const cardHolder = await Settings.get('cardHolder', 'Admin');
        const dailyPrice = await Settings.get('dailyPrice', 200);
        const bookPrice = await Settings.get('bookPrice', 50000);

        return successResponse({
            adminPhone,
            cardNumber,
            cardHolder,
            dailyPrice,
            bookPrice
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
        const { adminPhone, cardNumber, cardHolder, dailyPrice, bookPrice } = body;

        // Update each setting if provided
        if (adminPhone !== undefined) {
            await Settings.set('adminPhone', adminPhone);
        }
        if (cardNumber !== undefined) {
            await Settings.set('cardNumber', cardNumber);
        }
        if (cardHolder !== undefined) {
            await Settings.set('cardHolder', cardHolder);
        }
        if (dailyPrice !== undefined) {
            await Settings.set('dailyPrice', dailyPrice);
        }
        if (bookPrice !== undefined) {
            await Settings.set('bookPrice', bookPrice);
        }

        return successResponse({
            success: true,
            message: 'Sozlamalar saqlandi'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        return serverError('Sozlamalarni saqlashda xatolik');
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Allow': 'GET, PUT, OPTIONS'
        }
    });
}
