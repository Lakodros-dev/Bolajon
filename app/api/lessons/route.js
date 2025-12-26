/**
 * Lessons API Routes
 * GET /api/lessons - Get all lessons (cached)
 * POST /api/lessons - Create new lesson (admin only)
 */
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import { authenticate, adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { getCached, setCache, clearCache } from '@/lib/cache';

const LESSONS_CACHE_KEY = 'lessons:active';
const CACHE_TTL = 1 * 60 * 1000; // 1 minute (shorter for faster updates)

// GET - Get all active lessons with caching
export async function GET() {
    try {
        // Check cache first
        const cached = getCached(LESSONS_CACHE_KEY);
        if (cached) {
            return successResponse({ lessons: cached, cached: true });
        }

        await dbConnect();

        const lessons = await Lesson.find({ isActive: true })
            .select('title description videoUrl thumbnail level duration order vocabulary gameType')
            .sort({ level: 1, order: 1 })
            .lean();

        // Cache the result
        setCache(LESSONS_CACHE_KEY, lessons, CACHE_TTL);

        return successResponse({ lessons });
    } catch (error) {
        console.error('Get lessons error:', error);
        return serverError('Failed to fetch lessons');
    }
}

// POST - Create new lesson (admin only)
export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { title, description, videoUrl, thumbnail, level, duration, order, vocabulary, gameType } = body;

        // Validation
        if (!title || !description || !videoUrl || !level) {
            return errorResponse('Title, description, videoUrl and level are required');
        }

        const lesson = await Lesson.create({
            title,
            description,
            videoUrl,
            thumbnail: thumbnail || '',
            level,
            duration: duration || 0,
            order: order || 0,
            vocabulary: vocabulary || [],
            gameType: gameType || 'vocabulary'
        });

        // Clear lessons cache
        clearCache('lessons');

        return successResponse({
            message: 'Lesson created successfully',
            lesson
        }, 201);

    } catch (error) {
        console.error('Create lesson error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        return serverError('Failed to create lesson');
    }
}
