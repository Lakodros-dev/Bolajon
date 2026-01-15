/**
 * Admin Lessons API
 * GET /api/admin/lessons - Get ALL lessons (active and inactive)
 */
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        // Get ALL lessons (not just active ones)
        const lessons = await Lesson.find({})
            .sort({ level: 1, order: 1 })
            .lean();

        // Get completion counts for each lesson
        const lessonsWithStats = await Promise.all(
            lessons.map(async (lesson) => {
                const completionCount = await Progress.countDocuments({ lesson: lesson._id });
                return {
                    ...lesson,
                    completionCount
                };
            })
        );

        return successResponse({ lessons: lessonsWithStats });
    } catch (error) {
        console.error('Admin get lessons error:', error);
        return serverError('Failed to fetch lessons');
    }
}
