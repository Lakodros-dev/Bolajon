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

        const teacher = await User.findOne({ _id: params.id, role: 'teacher' });
        if (!teacher) {
            return notFoundResponse('Teacher');
        }

        const body = await request.json();
        const { name, email, phone, isActive } = body;

        if (name) teacher.name = name;
        if (email) teacher.email = email.toLowerCase();
        if (phone !== undefined) teacher.phone = phone;
        if (isActive !== undefined) teacher.isActive = isActive;

        await teacher.save();

        return successResponse({
            message: 'Teacher updated successfully',
            teacher: {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone,
                isActive: teacher.isActive
            }
        });
    } catch (error) {
        console.error('Update teacher error:', error);
        return serverError('Failed to update teacher');
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

        const teacher = await User.findOne({ _id: params.id, role: 'teacher' });
        if (!teacher) {
            return notFoundResponse('Teacher');
        }

        // Get all students of this teacher
        const students = await Student.find({ teacherId: params.id });
        const studentIds = students.map(s => s._id);

        // Delete all progress records for these students
        await Progress.deleteMany({ studentId: { $in: studentIds } });

        // Delete all students
        await Student.deleteMany({ teacherId: params.id });

        // Delete teacher
        await User.findByIdAndDelete(params.id);

        return successResponse({
            message: 'Teacher and all related data deleted successfully'
        });
    } catch (error) {
        console.error('Delete teacher error:', error);
        return serverError('Failed to delete teacher');
    }
}
