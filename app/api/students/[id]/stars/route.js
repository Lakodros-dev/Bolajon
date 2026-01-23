/**
 * POST /api/students/:id/stars
 * Add or remove stars from a student (quick star adjustment)
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';
import { clearCache } from '@/lib/cache';

export async function POST(request, { params }) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const student = await Student.findById(params.id);

        if (!student) {
            return notFoundResponse('Student');
        }

        // Check ownership (use 'teacher' field)
        if (auth.user.role !== 'admin' && student.teacher.toString() !== auth.user._id.toString()) {
            return errorResponse('Access denied', 403);
        }

        const body = await request.json();
        const { amount, reason } = body;

        // Validation
        if (amount === undefined || amount === 0) {
            return errorResponse('Amount is required and cannot be zero');
        }

        // Calculate new stars (don't go below 0)
        const newStars = Math.max(0, student.stars + amount);
        student.stars = newStars;
        await student.save();

        // Clear cache for this teacher's students
        clearCache(`students:${student.teacher}`);
        clearCache(`students:${student.teacher}:false`);
        clearCache(`students:${student.teacher}:true`);

        return successResponse({
            message: amount > 0 ? 'Stars added successfully' : 'Stars removed successfully',
            student: {
                _id: student._id,
                name: student.name,
                stars: student.stars
            },
            change: {
                amount,
                reason: reason || (amount > 0 ? 'Bonus stars' : 'Stars deducted')
            }
        });

    } catch (error) {
        console.error('Update stars error:', error);
        return serverError('Failed to update stars');
    }
}
