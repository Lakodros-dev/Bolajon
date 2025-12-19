/**
 * POST /api/rewards/redeem
 * Redeem a reward for a student using their stars
 */
import dbConnect from '@/lib/mongodb';
import Reward from '@/models/Reward';
import Student from '@/models/Student';
import Redemption from '@/models/Redemption';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { studentId, rewardId } = body;

        // Validation
        if (!studentId || !rewardId) {
            return errorResponse('studentId and rewardId are required');
        }

        // Verify student exists and belongs to teacher
        const student = await Student.findById(studentId);
        if (!student) {
            return errorResponse('Student not found', 404);
        }

        if (auth.user.role !== 'admin' && student.teacherId.toString() !== auth.user._id.toString()) {
            return errorResponse('You can only redeem rewards for your own students', 403);
        }

        // Verify reward exists and is active
        const reward = await Reward.findById(rewardId);
        if (!reward || !reward.isActive) {
            return errorResponse('Reward not found or not available', 404);
        }

        // Check if student has enough stars
        if (student.stars < reward.cost) {
            return errorResponse(`Not enough stars. Need ${reward.cost}, have ${student.stars}`, 400);
        }

        // Check stock (if not unlimited)
        if (reward.stock !== -1 && reward.stock <= 0) {
            return errorResponse('This reward is out of stock', 400);
        }

        // Deduct stars from student
        student.stars -= reward.cost;
        await student.save();

        // Reduce stock if not unlimited
        if (reward.stock !== -1) {
            reward.stock -= 1;
            await reward.save();
        }

        // Create redemption record
        const redemption = await Redemption.create({
            studentId,
            rewardId,
            teacherId: auth.user._id,
            starsCost: reward.cost,
            status: 'pending'
        });

        return successResponse({
            message: 'Reward redeemed successfully',
            redemption: {
                _id: redemption._id,
                reward: {
                    title: reward.title,
                    cost: reward.cost
                },
                status: redemption.status
            },
            student: {
                _id: student._id,
                name: student.name,
                stars: student.stars
            }
        }, 201);

    } catch (error) {
        console.error('Redeem reward error:', error);
        return serverError('Failed to redeem reward');
    }
}
