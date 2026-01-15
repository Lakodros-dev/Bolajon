/**
 * POST /api/progress
 * Record lesson completion for a student
 * Student must complete previous lesson with 5 stars before moving to next
 */
import dbConnect from '@/lib/mongodb';
import Progress from '@/models/Progress';
import Student from '@/models/Student';
import Lesson from '@/models/Lesson';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/apiResponse';

export async function POST(request) {
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

        const body = await request.json();
        const { studentId, lessonId, stars, notes } = body;

        if (!studentId || !lessonId || !stars) {
            return errorResponse('studentId, lessonId va stars majburiy');
        }

        if (stars < 1 || stars > 5) {
            return errorResponse('Yulduzlar 1 dan 5 gacha bo\'lishi kerak');
        }

        // Check if student belongs to this teacher
        const student = await Student.findOne({
            _id: studentId,
            teacher: decoded.userId
        });

        if (!student) {
            return errorResponse('O\'quvchi topilmadi', 404);
        }

        // Get current lesson
        const currentLesson = await Lesson.findById(lessonId);
        if (!currentLesson) {
            return errorResponse('Dars topilmadi', 404);
        }

        // Check if progress already exists for this lesson
        const existingProgress = await Progress.findOne({
            student: studentId,
            lesson: lessonId
        });

        if (existingProgress) {
            // If already completed but not with 5 stars, allow updating
            if (existingProgress.starsEarned >= 5) {
                return errorResponse('Bu dars allaqachon 5 yulduz bilan yakunlangan', 409);
            }

            // Update existing progress
            existingProgress.starsEarned = stars;
            existingProgress.notes = notes || existingProgress.notes;
            existingProgress.completedAt = new Date();
            await existingProgress.save();

            // Update student stars (add difference)
            const starsDiff = stars - existingProgress.starsEarned;
            if (starsDiff > 0) {
                await Student.findByIdAndUpdate(studentId, {
                    $inc: { stars: starsDiff }
                });
            }

            return successResponse({
                message: stars >= 5 ? 'Dars muvaffaqiyatli yakunlandi!' : `Dars baholandi. Yakunlash uchun 5 yulduz kerak.`,
                progress: existingProgress,
                newStars: student.stars + starsDiff,
                isCompleted: stars >= 5
            });
        }

        // Find previous lesson (same level, lower order OR lower level)
        const previousLesson = await Lesson.findOne({
            isActive: true,
            $or: [
                { level: currentLesson.level, order: { $lt: currentLesson.order } },
                { level: { $lt: currentLesson.level } }
            ]
        }).sort({ level: -1, order: -1 });

        // If there's a previous lesson, check if it's completed with 5 stars
        if (previousLesson) {
            const previousProgress = await Progress.findOne({
                student: studentId,
                lesson: previousLesson._id
            });

            if (!previousProgress || previousProgress.starsEarned < 5) {
                return errorResponse(
                    `Avval "${previousLesson.title}" darsini 5 yulduz bilan yakunlang`,
                    400
                );
            }
        }

        // Create progress record
        const progress = await Progress.create({
            student: studentId,
            lesson: lessonId,
            teacher: decoded.userId,
            starsEarned: stars,
            notes: notes || '',
            completedAt: new Date()
        });

        // Update student's total stars
        await Student.findByIdAndUpdate(studentId, {
            $inc: { stars: stars }
        });

        return successResponse({
            message: stars >= 5 ? 'Dars muvaffaqiyatli yakunlandi!' : `Dars baholandi. Yakunlash uchun 5 yulduz kerak.`,
            progress,
            newStars: student.stars + stars,
            isCompleted: stars >= 5
        }, 201);

    } catch (error) {
        console.error('Progress error:', error);

        if (error.code === 11000) {
            return errorResponse('Bu dars allaqachon yakunlangan', 409);
        }

        return errorResponse('Darsni yakunlashda xatolik', 500);
    }
}
