/**
 * GET /api/progress/:studentId
 * Get all progress records for a student
 */
import dbConnect from '@/lib/mongodb';
import Progress from '@/models/Progress';
import Student from '@/models/Student';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request, { params }) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const { studentId } = params;

        // Verify student exists and belongs to teacher
        const student = await Student.findById(studentId);
        if (!student) {
            return errorResponse('Student not found', 404);
        }

        if (auth.user.role !== 'admin' && student.teacher.toString() !== auth.user._id.toString()) {
            return errorResponse('You can only view progress for your own students', 403);
        }

        // Get all progress records with lesson details (use 'student' and 'lesson' fields)
        const progress = await Progress.find({ student: studentId })
            .populate('lesson', 'title level duration')
            .sort({ completedAt: -1 })
            .lean();

        // Calculate statistics (use 'starsEarned' field)
        const totalLessons = progress.length;
        const totalStars = progress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
        const averageStars = totalLessons > 0 ? (totalStars / totalLessons).toFixed(1) : 0;

        return successResponse({
            student: {
                _id: student._id,
                name: student.name,
                stars: student.stars,
                age: student.age
            },
            progress,
            statistics: {
                totalLessons,
                totalStars,
                averageStars: parseFloat(averageStars)
            }
        });

    } catch (error) {
        console.error('Get progress error:', error);
        return serverError('Failed to fetch progress');
    }
}
