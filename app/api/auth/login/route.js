/**
 * POST /api/auth/login
 * Authenticate user with phone number and password
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { phone, password } = body;

        // Validation
        if (!phone || !password) {
            return errorResponse('Telefon raqam va parol kiritilishi shart');
        }

        // Normalize phone number
        const normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');

        // Find user with password field
        const user = await User.findOne({ phone: normalizedPhone }).select('+password');

        if (!user) {
            return errorResponse('Telefon raqam yoki parol noto\'g\'ri', 401);
        }

        // Check if account is active
        if (!user.isActive) {
            return errorResponse('Hisob bloklangan. Admin bilan bog\'laning.', 403);
        }

        // Verify password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return errorResponse('Telefon raqam yoki parol noto\'g\'ri', 401);
        }

        // Generate token
        const token = generateToken(user);

        return successResponse({
            message: 'Kirish muvaffaqiyatli',
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return serverError('Kirishda xatolik');
    }
}
