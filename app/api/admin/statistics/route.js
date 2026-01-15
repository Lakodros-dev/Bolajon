/**
 * Admin Statistics API
 * GET /api/admin/statistics - Get platform-wide statistics
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import Reward from '@/models/Reward';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        // Get all counts in parallel
        const [
            totalTeachers,
            totalStudents,
            totalLessons,
            activeLessons,
            totalRewards,
            totalProgress,
            students
        ] = await Promise.all([
            User.countDocuments({ role: 'teacher' }),
            Student.countDocuments({}),
            Lesson.countDocuments({}),
            Lesson.countDocuments({ isActive: true }),
            Reward.countDocuments({}),
            Progress.countDocuments({}),
            Student.find({}).select('stars').lean()
        ]);

        // Calculate total stars
        const totalStars = students.reduce((sum, s) => sum + (s.stars || 0), 0);

        // Get weekly activity (last 7 days)
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weeklyProgress = await Progress.find({
            completedAt: { $gte: weekAgo }
        }).select('completedAt starsEarned').lean();

        // Group by day
        const days = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayProgress = weeklyProgress.filter(p => {
                const pDate = new Date(p.completedAt);
                return pDate.toDateString() === date.toDateString();
            });
            weeklyData.push({
                day: days[date.getDay()],
                count: dayProgress.length,
                stars: dayProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0)
            });
        }

        // Get top teachers by student count
        const teachers = await User.find({ role: 'teacher' }).select('name').lean();
        const teacherStats = await Promise.all(
            teachers.map(async (teacher) => {
                const studentCount = await Student.countDocuments({ teacher: teacher._id });
                const teacherStudents = await Student.find({ teacher: teacher._id }).select('stars').lean();
                const totalTeacherStars = teacherStudents.reduce((sum, s) => sum + (s.stars || 0), 0);
                return {
                    name: teacher.name,
                    studentCount,
                    totalStars: totalTeacherStars
                };
            })
        );

        const topTeachers = teacherStats
            .sort((a, b) => b.studentCount - a.studentCount)
            .slice(0, 5);

        // Recent registrations
        const recentTeachers = await User.find({ role: 'teacher' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name createdAt')
            .lean();

        return successResponse({
            stats: {
                totalTeachers,
                totalStudents,
                totalLessons,
                activeLessons,
                totalRewards,
                totalProgress,
                totalStars,
                averageStudentsPerTeacher: totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : 0
            },
            weeklyData,
            topTeachers,
            recentTeachers: recentTeachers.map(t => ({
                name: t.name,
                date: t.createdAt
            }))
        });
    } catch (error) {
        console.error('Admin statistics error:', error);
        return serverError('Failed to fetch statistics');
    }
}
