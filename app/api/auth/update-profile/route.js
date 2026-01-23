/**
 * Update Profile API
 * PUT /api/auth/update-profile - Update user profile
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const { name, currentPassword, newPassword } = await request.json();
        const user = await User.findById(auth.user._id);

        if (!user) {
            return errorResponse('Foydalanuvchi topilmadi', 404);
        }

        // Update name
        if (name && name.trim()) {
            user.name = name.trim();
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return errorResponse('Joriy parol noto\'g\'ri');
            }

            if (newPassword.length < 6) {
                return errorResponse('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak');
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        return successResponse({
            message: 'Profil yangilandi',
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return serverError('Profilni yangilashda xatolik');
    }
}
