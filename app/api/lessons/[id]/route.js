/**
 * Lesson API Routes by ID
 * GET /api/lessons/:id - Get single lesson
 * PUT /api/lessons/:id - Update lesson (admin)
 * DELETE /api/lessons/:id - Delete lesson (admin)
 */
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';
import { clearCache } from '@/lib/cache';

// GET - Get single lesson
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const lesson = await Lesson.findById(params.id).lean();
        if (!lesson) {
            return notFoundResponse('Lesson');
        }

        // Get completion count
        const completionCount = await Progress.countDocuments({ lessonId: params.id });

        return successResponse({
            lesson: {
                ...lesson,
                completionCount
            }
        });
    } catch (error) {
        console.error('Get lesson error:', error);
        return serverError('Failed to fetch lesson');
    }
}

// PUT - Update lesson (admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const lesson = await Lesson.findById(params.id);
        if (!lesson) {
            return notFoundResponse('Lesson');
        }

        const body = await request.json();
        const { title, description, videoUrl, thumbnail, level, duration, order, isActive, vocabulary, gameType } = body;

        if (title) lesson.title = title;
        if (description) lesson.description = description;
        if (videoUrl) lesson.videoUrl = videoUrl;
        if (thumbnail !== undefined) lesson.thumbnail = thumbnail;
        if (level) lesson.level = level;
        if (duration !== undefined) lesson.duration = duration;
        if (order !== undefined) lesson.order = order;
        if (isActive !== undefined) lesson.isActive = isActive;
        if (vocabulary !== undefined) lesson.vocabulary = vocabulary;
        if (gameType !== undefined) lesson.gameType = gameType;

        await lesson.save();

        // Clear lessons cache so changes are reflected immediately
        clearCache('lessons');

        return successResponse({
            message: 'Lesson updated successfully',
            lesson
        });
    } catch (error) {
        console.error('Update lesson error:', error);
        return serverError('Failed to update lesson');
    }
}

// DELETE - Delete lesson (admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const lesson = await Lesson.findById(params.id);
        if (!lesson) {
            return notFoundResponse('Lesson');
        }

        // Delete all progress records for this lesson
        await Progress.deleteMany({ lessonId: params.id });

        // Delete lesson
        await Lesson.findByIdAndDelete(params.id);

        // Clear lessons cache
        clearCache('lessons');

        return successResponse({
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Delete lesson error:', error);
        return serverError('Failed to delete lesson');
    }
}
