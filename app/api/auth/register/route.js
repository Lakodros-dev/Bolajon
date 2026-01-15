/**
 * POST /api/auth/register
 * Register a new teacher account using phone number
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, phone, password } = body;

        // Validation
        if (!name || !phone || !password) {
            return errorResponse('Ism, telefon raqam va parol kiritilishi shart');
        }

        if (password.length < 6) {
            return errorResponse('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
        }

        // Normalize phone number - remove all spaces, dashes, and non-digit characters except +
        const normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/[^\d+]/g, '');

        // Check if user already exists
        const existingUser = await User.findOne({ phone: normalizedPhone });
        if (existingUser) {
            return errorResponse('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 409);
        }

        // Create new teacher (default role)
        const user = await User.create({
            name,
            phone: normalizedPhone,
            password,
            role: 'teacher',
            subscriptionStatus: 'trial',
            trialStartDate: new Date()
        });

        // Generate token
        const token = generateToken(user);

        // Calculate days remaining (should be 7 for new trial users)
        const daysRemaining = user.getDaysRemaining();

        return successResponse({
            message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus,
                trialStartDate: user.trialStartDate,
                daysRemaining
            }
        }, 201);

    } catch (error) {
        console.error('Register error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        if (error.code === 11000) {
            return errorResponse('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 409);
        }

        return serverError('Ro\'yxatdan o\'tishda xatolik');
    }
}
