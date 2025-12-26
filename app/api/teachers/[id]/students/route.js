/**
 * GET /api/teachers/:id/students
 * Get all students of a specific teacher with their progress
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import GameProgress from '@/models/GameProgress';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        // Get all students of this teacher
        const students = await Student.find({ teacher: params.id })
            .sort({ createdAt: -1 })
            .lean();

        // Get progress for each student
        const studentsWithProgress = await Promise.all(
            students.map(async (student) => {
                // Get lesson progress
                const lessonProgress = await Progress.find({ studentId: student._id }).lean();
                const completedLessons = lessonProgress.filter(p => p.completed).length;
                const totalStarsEarned = lessonProgress.reduce((sum, p) => sum + (p.stars || 0), 0);

                // Get game progress
                const gameProgress = await GameProgress.find({ studentId: student._id }).lean();
                const gamesWon = gameProgress.filter(g => g.won).length;

                return {
                    ...student,
                    completedLessons,
                    totalStarsEarned,
                    gamesWon,
                    totalGamesPlayed: gameProgress.length
                };
            })
        );

        return successResponse({ students: studentsWithProgress });
    } catch (error) {
        console.error('Get teacher students error:', error);
        return serverError('Failed to fetch students');
    }
}
