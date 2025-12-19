/**
 * Teachers API Routes (Admin only)
 * GET /api/teachers - Get all teachers
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// GET - Get all teachers with student counts
export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const teachers = await User.find({ role: 'teacher' })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        // Get student counts for each teacher
        const teachersWithCounts = await Promise.all(
            teachers.map(async (teacher) => {
                const studentCount = await Student.countDocuments({ teacherId: teacher._id });
                return {
                    ...teacher,
                    studentCount
                };
            })
        );

        return successResponse({ teachers: teachersWithCounts });
    } catch (error) {
        console.error('Get teachers error:', error);
        return serverError('Failed to fetch teachers');
    }
}
