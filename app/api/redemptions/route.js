/**
 * Redemptions API
 * POST /api/redemptions - Redeem rewards for a student
 */
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Reward from '@/models/Reward';
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
        const { studentId, items } = body;

        if (!studentId || !items || !Array.isArray(items) || items.length === 0) {
            return errorResponse("O'quvchi va sovg'alar kerak");
        }

        // Get student
        const student = await Student.findOne({
            _id: studentId,
            teacher: auth.user._id
        });

        if (!student) {
            return errorResponse("O'quvchi topilmadi");
        }

        // Get all rewards
        const rewardIds = items.map(item => item.rewardId);
        const rewards = await Reward.find({
            _id: { $in: rewardIds },
            isActive: true
        });

        if (rewards.length !== rewardIds.length) {
            return errorResponse("Ba'zi sovg'alar topilmadi");
        }

        // Calculate total cost and validate stock
        let totalCost = 0;
        const rewardMap = {};

        for (const reward of rewards) {
            rewardMap[reward._id.toString()] = reward;
        }

        for (const item of items) {
            const reward = rewardMap[item.rewardId];
            if (!reward) {
                return errorResponse(`Sovg'a topilmadi: ${item.rewardId}`);
            }

            // Check stock
            if (reward.stock !== -1 && reward.stock < item.quantity) {
                return errorResponse(`"${reward.title}" dan faqat ${reward.stock} ta qolgan`);
            }

            totalCost += reward.cost * item.quantity;
        }

        // Check if student has enough stars
        if (student.stars < totalCost) {
            return errorResponse(`Yetarli yulduz yo'q. Kerak: ${totalCost}, Mavjud: ${student.stars}`);
        }

        // Create redemption records and update stock
        const redemptions = [];

        for (const item of items) {
            const reward = rewardMap[item.rewardId];

            // Create redemption
            const redemption = await Redemption.create({
                student: studentId,
                reward: item.rewardId,
                teacher: auth.user._id,
                quantity: item.quantity,
                starsCost: reward.cost * item.quantity
            });
            redemptions.push(redemption);

            // Update stock if not unlimited
            if (reward.stock !== -1) {
                await Reward.findByIdAndUpdate(item.rewardId, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // Deduct stars from student
        student.stars -= totalCost;
        await student.save();

        return successResponse({
            message: "Sovg'alar muvaffaqiyatli berildi",
            redemptions,
            newStars: student.stars,
            totalCost
        });

    } catch (error) {
        console.error('Redemption error:', error);
        return serverError("Sovg'a berishda xatolik");
    }
}
