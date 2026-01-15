/**
 * GET /api/statistics
 * Get teacher's statistics - optimized with parallel queries
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import Lesson from '@/models/Lesson';
import mongoose from 'mongoose';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();

        const token = getTokenFromHeader(request);
        if (!token) {
            return unauthorizedResponse('Token topilmadi');
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return unauthorizedResponse('Token yaroqsiz');
        }

        const teacherId = new mongoose.Types.ObjectId(decoded.userId);

        // Parallel queries for better performance
        const [students, totalLessons] = await Promise.all([
            Student.find({ teacher: teacherId }).select('_id name stars').lean(),
            Lesson.countDocuments({ isActive: true })
        ]);

        const studentIds = students.map(s => s._id);

        // Get progress with lesson info
        const progress = studentIds.length > 0
            ? await Progress.find({ student: { $in: studentIds } })
                .select('student lesson starsEarned completedAt')
                .populate('lesson', 'title category')
                .lean()
            : [];

        // Calculate statistics
        const totalStudents = students.length;
        const totalStars = students.reduce((sum, s) => sum + (s.stars || 0), 0);
        const completedLessons = progress.length;

        // Weekly activity (last 7 days)
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyProgress = progress.filter(p => new Date(p.completedAt) >= weekAgo);

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
                value: dayProgress.length * 20, // Scale for chart
                count: dayProgress.length,
                stars: dayProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0)
            });
        }



        // Top students
        const topStudents = [...students]
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .slice(0, 5)
            .map(s => ({ name: s.name, stars: s.stars || 0 }));

        // Recent activity
        const recentProgress = await Progress.find({ student: { $in: studentIds } })
            .sort({ completedAt: -1 })
            .limit(10)
            .populate('student', 'name')
            .populate('lesson', 'title')
            .lean();

        return successResponse({
            stats: {
                totalStudents,
                totalStars,
                completedLessons,
                totalLessons,
                averageStars: totalStudents > 0 ? Math.round(totalStars / totalStudents) : 0
            },
            weeklyData,
            topStudents,
            recentActivity: recentProgress.map(p => ({
                studentName: p.student?.name || 'Noma\'lum',
                lessonTitle: p.lesson?.title || 'Noma\'lum dars',
                stars: p.starsEarned,
                date: p.completedAt
            }))
        });

    } catch (error) {
        console.error('Statistics error:', error);
        return errorResponse('Statistikani olishda xatolik', 500);
    }
}
