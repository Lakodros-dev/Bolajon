/**
 * Reward API Routes by ID
 * GET /api/rewards/:id - Get single reward
 * PUT /api/rewards/:id - Update reward (admin)
 * DELETE /api/rewards/:id - Delete reward (admin)
 */
import dbConnect from '@/lib/mongodb';
import Reward from '@/models/Reward';
import Redemption from '@/models/Redemption';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';

// GET - Get single reward
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const reward = await Reward.findById(params.id).lean();
        if (!reward) {
            return notFoundResponse('Reward');
        }

        // Get redemption count
        const redemptionCount = await Redemption.countDocuments({ rewardId: params.id });

        return successResponse({
            reward: {
                ...reward,
                redemptionCount
            }
        });
    } catch (error) {
        console.error('Get reward error:', error);
        return serverError('Failed to fetch reward');
    }
}

// PUT - Update reward (admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const reward = await Reward.findById(params.id);
        if (!reward) {
            return notFoundResponse('Reward');
        }

        const body = await request.json();
        const { title, description, cost, image, category, stock, isActive } = body;

        if (title) reward.title = title;
        if (description !== undefined) reward.description = description;
        if (cost) reward.cost = cost;
        if (image !== undefined) reward.image = image;
        if (category) reward.category = category;
        if (stock !== undefined) reward.stock = stock;
        if (isActive !== undefined) reward.isActive = isActive;

        await reward.save();

        return successResponse({
            message: 'Reward updated successfully',
            reward
        });
    } catch (error) {
        console.error('Update reward error:', error);
        return serverError('Failed to update reward');
    }
}

// DELETE - Delete reward (admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const reward = await Reward.findById(params.id);
        if (!reward) {
            return notFoundResponse('Reward');
        }

        // Delete reward (keep redemption history)
        await Reward.findByIdAndDelete(params.id);

        return successResponse({
            message: 'Reward deleted successfully'
        });
    } catch (error) {
        console.error('Delete reward error:', error);
        return serverError('Failed to delete reward');
    }
}
