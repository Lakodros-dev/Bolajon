/**
 * GET /api/dashboard
 * Get dashboard summary for teacher - optimized with aggregation
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import mongoose from 'mongoose';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverError } from '@/lib/apiResponse';

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

        // Single aggregation pipeline for all stats
        const [stats] = await Student.aggregate([
            { $match: { teacher: teacherId } },
            {
                $facet: {
                    studentStats: [
                        {
                            $group: {
                                _id: null,
                                totalStudents: { $sum: 1 },
                                totalStars: { $sum: '$stars' },
                                studentIds: { $push: '$_id' }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    totalStudents: { $ifNull: [{ $arrayElemAt: ['$studentStats.totalStudents', 0] }, 0] },
                    totalStars: { $ifNull: [{ $arrayElemAt: ['$studentStats.totalStars', 0] }, 0] },
                    studentIds: { $ifNull: [{ $arrayElemAt: ['$studentStats.studentIds', 0] }, []] }
                }
            }
        ]);

        // Count completed lessons in parallel
        const completedLessons = stats?.studentIds?.length > 0
            ? await Progress.countDocuments({ student: { $in: stats.studentIds } })
            : 0;

        return successResponse({
            totalStudents: stats?.totalStudents || 0,
            totalStars: stats?.totalStars || 0,
            completedLessons
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        return serverError('Dashboard ma\'lumotlarini olishda xatolik');
    }
}
