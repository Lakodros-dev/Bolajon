/**
 * Teachers API Routes (Admin only)
 * GET /api/teachers - Get all teachers
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

// GET - Get all teachers with student counts and subscription info
export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const teachers = await User.find({ role: { $in: ['teacher', 'admin'] } })
            .select('-password +plainPassword')
            .sort({ createdAt: -1 })
            .lean();

        // Get student counts and subscription info for each teacher
        const teachersWithInfo = await Promise.all(
            teachers.map(async (teacher) => {
                const studentCount = await Student.countDocuments({ teacher: teacher._id });
                console.log(`Teacher ${teacher.name} (${teacher._id}): ${studentCount} students`);

                // Calculate subscription status
                const user = await User.findById(teacher._id);
                const isSubscriptionValid = user ? user.isSubscriptionValid() : false;
                const daysRemaining = user ? user.getDaysRemaining() : 0;

                return {
                    ...teacher,
                    studentCount,
                    isSubscriptionValid,
                    daysRemaining
                };
            })
        );

        return successResponse({ teachers: teachersWithInfo });
    } catch (error) {
        console.error('Get teachers error:', error);
        return serverError('Failed to fetch teachers');
    }
}
