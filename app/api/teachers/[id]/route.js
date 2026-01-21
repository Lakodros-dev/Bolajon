/**
 * Teacher API Routes by ID (Admin only)
 * GET /api/teachers/:id - Get single teacher
 * PUT /api/teachers/:id - Update teacher
 * DELETE /api/teachers/:id - Delete teacher
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';

// GET - Get single teacher with details
export async function GET(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const teacher = await User.findOne({ _id: params.id, role: 'teacher' })
            .select('-password')
            .lean();

        if (!teacher) {
            return notFoundResponse('Teacher');
        }

        // Get student count and total stars given
        const students = await Student.find({ teacherId: params.id }).lean();
        const studentCount = students.length;
        const totalStarsGiven = students.reduce((sum, s) => sum + (s.stars || 0), 0);

        return successResponse({
            teacher: {
                ...teacher,
                studentCount,
                totalStarsGiven
            }
        });
    } catch (error) {
        console.error('Get teacher error:', error);
        return serverError('Failed to fetch teacher');
    }
}

// PUT - Update teacher
export async function PUT(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const teacher = await User.findById(params.id);
        if (!teacher) {
            return notFoundResponse('User');
        }

        const body = await request.json();
        const { name, phone, password, role } = body;

        if (name) teacher.name = name;
        if (phone !== undefined) teacher.phone = phone;
        if (role) teacher.role = role;
        if (password) {
            teacher.plainPassword = password; // Save plain password
            teacher.password = password; // This will be hashed by pre-save hook
        }

        await teacher.save();

        return successResponse({
            message: 'User updated successfully',
            user: {
                _id: teacher._id,
                name: teacher.name,
                phone: teacher.phone,
                role: teacher.role,
                plainPassword: teacher.plainPassword
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        return serverError('Failed to update user');
    }
}

// DELETE - Delete teacher and their data
export async function DELETE(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const user = await User.findById(params.id);
        if (!user) {
            return notFoundResponse('User');
        }

        // Get all students of this user if they are a teacher
        if (user.role === 'teacher') {
            const students = await Student.find({ teacherId: params.id });
            const studentIds = students.map(s => s._id);

            // Delete all progress records for these students
            await Progress.deleteMany({ studentId: { $in: studentIds } });

            // Delete all students
            await Student.deleteMany({ teacherId: params.id });
        }

        // Delete user
        await User.findByIdAndDelete(params.id);

        return successResponse({
            message: 'User and all related data deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return serverError('Failed to delete user');
    }
}
