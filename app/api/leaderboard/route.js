/**
 * Leaderboard API
 * GET /api/leaderboard - Get all students ranked by stars
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit')) || 100;

        // Build query
        const query = { isActive: true };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Get all students sorted by stars (descending)
        const students = await Student.find(query)
            .select('name age stars teacher')
            .populate('teacher', 'name')
            .sort({ stars: -1, createdAt: 1 })
            .limit(limit)
            .lean();

        // Add rank to each student
        const rankedStudents = students.map((student, index) => ({
            ...student,
            rank: index + 1,
            isOwn: student.teacher?._id?.toString() === auth.user._id.toString()
        }));

        return successResponse({ students: rankedStudents });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return serverError('Failed to fetch leaderboard');
    }
}
