/**
 * Rewards API Routes
 * GET /api/rewards - Get all rewards (cached)
 * POST /api/rewards - Create new reward (admin only)
 */
import dbConnect from '@/lib/mongodb';
import Reward from '@/models/Reward';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { getCached, setCache, clearCache } from '@/lib/cache';

const REWARDS_CACHE_KEY = 'rewards:active';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET - Get all active rewards with caching
export async function GET() {
    try {
        // Check cache first
        const cached = getCached(REWARDS_CACHE_KEY);
        if (cached) {
            return successResponse({ rewards: cached, cached: true });
        }

        await dbConnect();

        const rewards = await Reward.find({ isActive: true })
            .select('title description cost image category stock starsCost name')
            .sort({ cost: 1 })
            .lean();

        // Cache the result
        setCache(REWARDS_CACHE_KEY, rewards, CACHE_TTL);

        return successResponse({ rewards });
    } catch (error) {
        console.error('Get rewards error:', error);
        return serverError('Failed to fetch rewards');
    }
}

// POST - Create new reward (admin only)
export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { title, description, cost, image, category, stock } = body;

        // Validation
        if (!title || !cost) {
            return errorResponse('Title and cost are required');
        }

        const reward = await Reward.create({
            title,
            description: description || '',
            cost,
            image: image || '',
            category: category || 'other',
            stock: stock !== undefined ? stock : -1
        });

        // Clear rewards cache
        clearCache('rewards');

        return successResponse({
            message: 'Reward created successfully',
            reward
        }, 201);

    } catch (error) {
        console.error('Create reward error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        return serverError('Failed to create reward');
    }
}
