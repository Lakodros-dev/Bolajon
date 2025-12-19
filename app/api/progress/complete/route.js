/**
 * POST /api/progress/complete
 * Mark a lesson as completed and award stars to student
 */
import dbConnect from '@/lib/mongodb';
import Progress from '@/models/Progress';
import Student from '@/models/Student';
import Lesson from '@/models/Lesson';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { studentId, lessonId, stars, notes } = body;

        // Validation
        if (!studentId || !lessonId || !stars) {
            return errorResponse('studentId, lessonId and stars are required');
        }

        if (stars < 1 || stars > 5) {
            return errorResponse('Stars must be between 1 and 5');
        }

        // Verify student belongs to teacher
        const student = await Student.findById(studentId);
        if (!student) {
            return errorResponse('Student not found', 404);
        }

        if (auth.user.role !== 'admin' && student.teacher.toString() !== auth.user._id.toString()) {
            return errorResponse('You can only mark progress for your own students', 403);
        }

        // Verify lesson exists
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return errorResponse('Lesson not found', 404);
        }

        // Check if already completed (use 'student' and 'lesson' fields)
        const existingProgress = await Progress.findOne({ student: studentId, lesson: lessonId });
        if (existingProgress) {
            return errorResponse('This lesson is already completed by this student', 409);
        }

        // Create progress record (use correct field names: student, lesson, teacher, starsEarned)
        const progress = await Progress.create({
            student: studentId,
            lesson: lessonId,
            teacher: auth.user._id,
            starsEarned: stars,
            notes: notes || '',
            completedAt: new Date()
        });

        // Update student's total stars
        student.stars += stars;
        await student.save();

        return successResponse({
            message: 'Lesson completed successfully',
            progress,
            student: {
                _id: student._id,
                name: student.name,
                stars: student.stars
            }
        }, 201);

    } catch (error) {
        console.error('Complete lesson error:', error);

        // Handle duplicate key error (lesson already completed)
        if (error.code === 11000) {
            return errorResponse('This lesson is already completed by this student', 409);
        }

        return serverError('Failed to complete lesson');
    }
}
